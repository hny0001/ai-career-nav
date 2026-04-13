require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 8080;

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

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wechat_openid TEXT UNIQUE,
      nickname TEXT,
      avatar_url TEXT,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// API endpoint to save a new consultation
app.post('/api/consultations', async (req, res) => {
  const { customer_name, customer_contact, industry, role, work_content, work_env } = req.body;
  
  let aiReport = {
    riskPct: '系统保底评估模式',
    riskDesc: '检测到项目未配置 AI 大模型密钥。请在项目根目录 .env 文件中填入 API_KEY 即可体验由底层大模型（如 DeepSeek、OpenAI）提供的千人千面、深挖到痛点的专属实时 AI 诊断！',
    pathDesc: '联系您的专属咨询师获取超越系统模型的深度转型规划。',
    actionDesc: '1. 联系网站管理员配置好 AI 平台 API_KEY\n2. 重新填写您的现状并按回车提交\n3. 继续您的真实破局之旅！'
  };

  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const modelName = process.env.AI_MODEL_NAME || 'gpt-4o';

  if (apiKey && apiKey.trim() !== '') {
    try {
      const prompt = `你是一位经验丰富、视角犀利的【职业发展咨询师】与【AI转型专家】。
客户当前行业：${industry}
客户当前岗位：${role}
客户描述的工作内容：${work_content || '未提供，请根据行业岗位推测其核心工作'}
客户所处的职场环境或痛点：${work_env || '未提供，请根据行业大环境推测'}

请为该客户诊断“他的工作被 AI（如大语言模型、RPA、自动生成工具等）替代的风险”，并针对他的独有情况给出一份“专属”的职业破局与转型指南。
你的语气应该是专业、有一点压迫感危机感，但同时给出希望的建议。不要说废话。

请必须以纯 JSON 格式直接返回，包含以下严格的结构（没有任何多余标记）：
{
  "riskPct": "仅回复百分百数字范围，如 85%-90%",
  "riskDesc": "结合客户具体工作内容分析为什么是这个风险级别（尽量精准切中要害，100-150字）",
  "pathDesc": "结合他的环境痛点，推荐他的职场转型终极方向是什么（不要泛泛而谈，尽量具体，100字左右）",
  "actionDesc": "直接给出 3 条客户明天上班就能做落地的具体破局行动点，用换行符分隔"
}`;

      const aiResponse = await axios.post(apiUrl, {
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      }, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 30000
      });
      
      let rawJsonText = aiResponse.data.choices[0].message.content.trim();
      if (rawJsonText.startsWith('\`\`\`')) {
        rawJsonText = rawJsonText.replace(/^\`\`\`json/i, '').replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
      }
      aiReport = JSON.parse(rawJsonText);
    } catch(err) {
      console.error('AI API Error:', err.message);
      aiReport.riskDesc = '调用大模型接口失败。原因为: ' + err.message + '。可能由于密钥错误、并发限制或网络原因导致。请检查服务端配置！';
    }
  }

  const serializedScore = JSON.stringify(aiReport);

  const sql = `INSERT INTO consultations (customer_name, customer_contact, industry, role, work_content, work_env, risk_score)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
               
  db.run(sql, [customer_name, customer_contact, industry, role, work_content, work_env, serializedScore], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const billSql = `INSERT INTO billing (customer_name, amount, service_type, status) VALUES (?, ?, ?, ?)`;
    db.run(billSql, [customer_name || '匿名客户', 99.00, 'AI职业诊断(动态生成专属版)', '已支付']);

    res.json({ id: this.lastID, aiReport, message: 'Consultation saved successfully' });
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

// API endpoint to handle WeChat login (Mock implementation)
app.post('/api/auth/wechat', (req, res) => {
  const { openid, nickname, avatar_url } = req.body;
  
  if (!openid) {
    return res.status(400).json({ error: 'Missing OpenID' });
  }

  // Insert or Update user
  const sql = `INSERT INTO users (wechat_openid, nickname, avatar_url, last_login)
               VALUES (?, ?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(wechat_openid) DO UPDATE SET
               nickname = excluded.nickname,
               avatar_url = excluded.avatar_url,
               last_login = CURRENT_TIMESTAMP`;
               
  db.run(sql, [openid, nickname || '微信用户', avatar_url || ''], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'User recorded successfully', userId: this.lastID });
  });
});

// API endpoint to get users (for admin)
app.get('/api/users', (req, res) => {
  db.all(`SELECT * FROM users ORDER BY last_login DESC`, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server API running at http://0.0.0.0:${port}`);
});
