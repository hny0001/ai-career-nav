const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
// Serve static files to access index.html and admin.html
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
const db = new sqlite3.Database('./biz.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      customer_contact TEXT,
      industry TEXT,
      role TEXT,
      work_content TEXT,
      work_env TEXT,
      risk_score TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS billing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      amount REAL,
      service_type TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// API endpoint to save a new consultation
app.post('/api/consultations', (req, res) => {
  const { customer_name, customer_contact, industry, role, work_content, work_env, risk_score } = req.body;
  
  const sql = `INSERT INTO consultations (customer_name, customer_contact, industry, role, work_content, work_env, risk_score)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
               
  db.run(sql, [customer_name, customer_contact, industry, role, work_content, work_env, risk_score], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    // Automatically generate a billing record for demonstration
    const billSql = `INSERT INTO billing (customer_name, amount, service_type, status) VALUES (?, ?, ?, ?)`;
    db.run(billSql, [customer_name || '匿名客户', 99.00, 'AI职业诊断评估报告', '已支付']);

    res.json({ id: this.lastID, message: 'Consultation saved successfully' });
  });
});

// API endpoint to get all consultations (customer info + consultation info)
app.get('/api/consultations', (req, res) => {
  db.all(`SELECT * FROM consultations ORDER BY id DESC`, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API endpoint to get all bills
app.get('/api/billing', (req, res) => {
  db.all(`SELECT * FROM billing ORDER BY id DESC`, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get dashboard summary stats
app.get('/api/summary', (req, res) => {
  db.get(`SELECT COUNT(*) as total_customers FROM consultations`, [], (err, row1) => {
    db.get(`SELECT SUM(amount) as total_revenue FROM billing WHERE status='已支付'`, [], (err, row2) => {
      res.json({
        totalCustomers: row1 ? row1.total_customers : 0,
        totalRevenue: row2 && row2.total_revenue ? row2.total_revenue : 0
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Backend server API running at http://localhost:${port}`);
});
