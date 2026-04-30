require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);
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
      edu TEXT,
      exp TEXT,
      work_content TEXT,
      work_env TEXT,
      risk_score TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Safely add new columns if they don't exist
    db.run(`ALTER TABLE consultations ADD COLUMN edu TEXT`, () => {});
    db.run(`ALTER TABLE consultations ADD COLUMN exp TEXT`, () => {});

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
  const { customer_name, customer_contact, industry, role, edu, exp, work_content, work_env } = req.body;
  
  let aiReport = {
    riskPct: '系统保底评估模式',
    riskDesc: '检测到项目未配置 AI 大模型密钥。请在项目根目录 .env 文件中填入 API_KEY 即可体验由底层大模型（如 DeepSeek、OpenAI）提供的千人千面、深挖到痛点的专属实时 AI 诊断！',
    pathDesc: '联系您的专属咨询师获取超越系统模型的深度转型规划。',
    actionDesc: '1. 联系网站管理员配置好 AI 平台 API_KEY\n2. 重新填写您的现状并按回车提交\n3. 继续您的真实破局之旅！'
  };

  const apiKey = process.env.AI_API_KEY;
  let apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const modelName = process.env.AI_MODEL_NAME || 'gpt-4o';

  // 自动补全接口路径（如果用户只填了基础地址）
  if (apiUrl && !apiUrl.endsWith('/chat/completions')) {
    apiUrl = apiUrl.replace(/\/$/, '') + '/chat/completions';
  }

  if (apiKey && apiKey.trim() !== '') {
    try {
      const prompt = `你是一位顶尖的【AI时代职业发展规划资深专家】与【商业变现教练】。
客户档案：
- 所在行业：${industry}
- 当前岗位：${role}
- 最高学历：${edu || '未提供'}
- 工作年限：${exp || '未提供'}
- 核心工作内容：${work_content || '未提供，请根据行业岗位推测其核心日常工作'}
- 职场环境与痛点：${work_env || '未提供，请结合当前宏观经济与AI冲击进行推测'}

请为该客户生成一份极度详尽、极其专业、且【每个人绝对不重样】的“AI时代专属职业诊断与转型落地报告”。
你的语气必须极具专业深度、充满洞察力（带有一点让人清醒的危机感，但最终给出极其清晰的破局希望）。不要说废话，不要讲大道理，直接切中要害。

请必须以纯 JSON 格式返回，包含以下结构，**且每个字段的内容必须非常详实（每部分要求输出400-600字左右的深度长文分析），以确保最终生成的报告有3-5页的内容厚度**：

{
  "riskPct": "仅回复风险极值数字百分比范围（如 85%-90%）",
  "riskDesc": "【现状与危机深度剖析】结合客户的学历、年限、工作内容和痛点，进行长篇深度分析：1. 当前岗位在未来1-3年内被大模型自动化工具取代的具体环节与推演路径；2. 客户现有经验的贬值风险；3. 行业洗牌趋势下，哪些“伪能力”将失去溢价。要求分段落、有条理，深度剖析（500字左右）。",
  "pathDesc": "【转型方向与高薪职位推荐】为他量身定制未来3-5年的转型蓝图：1. 核心破局思路是什么（不要泛泛而谈，结合他的过往优势和AI做加法）；2. 推荐3个极具前景的“AI+”具体新岗位（如AI产品架构师/AI业务增长黑客/AI智能体全栈开发等），并详细说明这些岗位为什么适合他、薪资前景及所需的新核心壁垒。（500字左右）。",
  "actionDesc": "【30天高能破局落地计划】给出直接可以照做的执行清单：第一周（认知破局与工具武装）、第二周（结合现有业务线的小范围AI提效实验）、第三周（重构个人核心资产与知识库）、第四周（副业或内部转型的最小MVP验证）。必须极其具体，包含推荐的AI工具及具体怎么用。（500字左右）。"
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

  const sql = `INSERT INTO consultations (customer_name, customer_contact, industry, role, edu, exp, work_content, work_env, risk_score)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
               
  db.run(sql, [customer_name, customer_contact, industry, role, edu, exp, work_content, work_env, serializedScore], function(err) {
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

// API endpoint to send report via email (Real implementation)
app.post('/api/send-report-email', async (req, res) => {
  const { email, report, pdfBase64 } = req.body;
  
  if (!email || !report) {
    return res.status(400).json({ error: 'Missing email or report data' });
  }

  // Check if SMTP is configured
  if (process.env.SMTP_USER === 'your_qq_number@qq.com' || !process.env.SMTP_PASS) {
    console.log(`[SMTP INFO] Sending simulated email to: ${email} (SMTP not configured)`);
    return res.status(200).json({ message: 'Simulated: SMTP not configured in .env. Please fill in your real credentials!' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.qq.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'AI 职业导航'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `您的 AI 专属职业诊断报告 - ${report.role}`,
      text: `您好！
感谢您使用 AI 职业导航服务。附件为您生成的专属职业诊断报告。
      
您的风险评估极值：${report.riskPct}
行业建议：${report.pathDesc}
      
祝您职业发展顺利！`,
      attachments: []
    };

    // If PDF is provided from frontend
    if (pdfBase64) {
      mailOptions.attachments.push({
        filename: `AI职业诊断报告_${report.role}.pdf`,
        content: pdfBase64.split('base64,')[1],
        encoding: 'base64'
      });
    }

    await transporter.sendMail(mailOptions);
    console.log(`[SUCCESS] Email sent to: ${email}`);
    res.json({ message: 'Email sent successfully with PDF attachment' });
  } catch (err) {
    console.error('[ERROR] Failed to send email:', err.message);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
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
