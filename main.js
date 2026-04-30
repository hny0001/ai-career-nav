/* ===========================
   Main JavaScript
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavigation();
  initScrollAnimations();
  initStatCounters();
  initMobileMenu();
  initEditableContact();
  initHeatmapMatrix();
  initCareerCases();
  initAIPlanning();
  initPlanManagement();
  initAuth();
});

// Global State
window.currentPlan = 'pro'; 
window.generationCount = 0;
const MAX_BASIC_GENERATIONS = 3;

function initPlanManagement() {
  window.selectPlan = (planId) => {
    window.currentPlan = planId;
    
    // Update UI Cards
    document.querySelectorAll('.pricing-card').forEach(card => card.classList.remove('selected'));
    document.getElementById(`card-${planId}`).classList.add('selected');

    // Show indicator in Planning section
    const indicator = document.getElementById('selected-plan-indicator');
    const dot = document.getElementById('plan-dot');
    const name = document.getElementById('plan-name');
    const status = document.getElementById('plan-status');
    
    if (indicator) {
      indicator.style.display = 'inline-flex';
      if (dot) dot.className = `plan-dot dot-${planId}`;
      if (name) {
        const planNames = { 'basic': '基础版', 'pro': '专业版', 'premium': '旗舰版' };
        name.textContent = planNames[planId];
      }
      if (status) {
        if (planId === 'basic') {
          status.textContent = `额度: ${MAX_BASIC_GENERATIONS - window.generationCount}/${MAX_BASIC_GENERATIONS}`;
        } else {
          status.textContent = '额度: 无限制';
        }
      }
    }

    // Smooth Scroll to Planning section
    const planningSection = document.getElementById('planning');
    if (planningSection) {
      const offset = 80;
      const top = planningSection.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    
    // Reset form if results were shown
    const resetBtn = document.getElementById('qa-reset-btn');
    if (resetBtn) resetBtn.click();
  };
}

/* ===========================
   Particles Background
   =========================== */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDelay = (Math.random() * 8) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    container.appendChild(p);
  }
}

/* ===========================
   Navigation
   =========================== */
function initNavigation() {
  const nav = document.getElementById('main-nav');
  const links = document.querySelectorAll('.nav-link[data-section]');

  // Scroll state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active link
    const sections = ['history', 'heatmap', 'newcareers', 'planning', 'contact'];
    let current = '';
    sections.forEach(id => {
      const section = document.getElementById(id);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200) {
          current = id;
        }
      }
    });

    links.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ===========================
   Scroll Animations (IntersectionObserver)
   =========================== */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
}

/* ===========================
   Stat Counter Animation
   =========================== */
function initStatCounters() {
  const statNums = document.querySelectorAll('.stat-number[data-target]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          if (el.dataset.animated === 'true') return;
          el.dataset.animated = 'true';
          animateCounter(el, target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNums.forEach(el => observer.observe(el));
}

function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(easedProgress * target);
    el.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ===========================
   Mobile Menu
   =========================== */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if(!btn || !menu) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ===========================
   Editable Contact Card
   =========================== */
function initEditableContact() {
  const STORAGE_KEY = 'ai-career-contact';

  const fields = {
    name:          { prefix: '',       defaultVal: '职业发展咨询师' },
    title:         { prefix: '',       defaultVal: 'AI时代 · 一人企业 · 职业导航' },
    email:         { prefix: '',       defaultVal: 'hny000000001@gmail.com' },
    wechat:        { prefix: '微信：', defaultVal: '18002237125' },
    xiaohongshu:   { prefix: '小红书：@', defaultVal: '看得见的AI' },
    gongzhonghao:  { prefix: '公众号：', defaultVal: '看得见的AI' }
  };

  const editBtn = document.getElementById('edit-contact-btn');
  const saveBtn = document.getElementById('save-contact-btn');
  const contactBtn = document.getElementById('contact-btn');
  if(!editBtn || !saveBtn || !contactBtn) return;
  const cardInner = document.querySelector('.contact-card-inner');

  const toast = document.createElement('div');
  toast.className = 'save-toast';
  toast.textContent = '✅ 信息已保存';
  toast.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-20px);
    background: #2ed573; color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: bold;
    z-index: 9999; opacity: 0; transition: all 0.3s;
  `;
  document.body.appendChild(toast);

  loadData();

  editBtn.addEventListener('click', () => {
    cardInner.classList.add('editing');
    Object.keys(fields).forEach(key => {
      const display = document.getElementById('display-' + key);
      const input = document.getElementById('input-' + key);
      if (display && input) {
        const raw = display.textContent.replace(fields[key].prefix, '');
        input.value = raw;
        display.style.display = 'none';
        input.style.display = 'inline-block';
      }
    });
    editBtn.style.display = 'none';
    saveBtn.style.display = 'block';
    contactBtn.style.display = 'none';
  });

  saveBtn.addEventListener('click', () => {
    const data = {};
    Object.keys(fields).forEach(key => {
      const input = document.getElementById('input-' + key);
      if(input) data[key] = input.value.trim() || fields[key].defaultVal;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    cardInner.classList.remove('editing');
    Object.keys(fields).forEach(key => {
      const display = document.getElementById('display-' + key);
      const input = document.getElementById('input-' + key);
      if (display && input) {
        display.textContent = fields[key].prefix + data[key];
        display.style.display = 'inline-block';
        input.style.display = 'none';
      }
    });
    editBtn.style.display = 'block';
    saveBtn.style.display = 'none';
    contactBtn.style.display = 'inline-flex';
    
    if (data.wechat) {
      contactBtn.innerHTML = `立即预约咨询 (加微信: ${data.wechat})`;
      contactBtn.href = 'javascript:void(0);';
      contactBtn.onclick = () => {
        navigator.clipboard.writeText(data.wechat);
        toast.textContent = `✅ 微信号 ${data.wechat} 已复制！`;
        toast.style.background = '#0984e3';
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(-50%) translateY(-20px)';
        }, 2500);
      };
    } else if (data.email) {
      contactBtn.innerHTML = `立即预约咨询`;
      contactBtn.href = 'mailto:' + data.email;
      contactBtn.onclick = null;
    }

    if (data.name) {
      const avatarText = document.getElementById('avatar-text');
      if (avatarText) avatarText.textContent = data.name.charAt(0).toUpperCase();
    }

    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
    }, 2500);
  });

  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      Object.keys(fields).forEach(key => {
        if (data[key]) {
          const display = document.getElementById('display-' + key);
          if (display) display.textContent = fields[key].prefix + data[key];
        }
      });
      if (data.wechat) {
        contactBtn.innerHTML = `立即预约咨询 (加微信: ${data.wechat})`;
        contactBtn.href = 'javascript:void(0);';
        contactBtn.onclick = () => {
          navigator.clipboard.writeText(data.wechat);
          toast.textContent = `✅ 微信号 ${data.wechat} 已复制！`;
          toast.style.background = '#0984e3';
          toast.style.opacity = '1';
          toast.style.transform = 'translateX(-50%) translateY(0)';
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
          }, 2500);
        };
      } else if (data.email) {
        contactBtn.innerHTML = `立即预约咨询`;
        contactBtn.href = 'mailto:' + data.email;
        contactBtn.onclick = null;
      }
      if (data.name) {
        const avatarText = document.getElementById('avatar-text');
        if (avatarText) avatarText.textContent = data.name.charAt(0).toUpperCase();
      }
    } catch (e) {}
  }
}

/* ===========================
   Heatmap Matrix
   =========================== */
function initHeatmapMatrix() {
  const container = document.getElementById('heatmap-matrix');
  if (!container) return;

  const roles = [
    { id: 'pm', label: '产品经理', icon: '💡', enLabel: 'PM' },
    { id: 'mgr', label: '项目经理', icon: '📅', enLabel: 'Project Mgr' },
    { id: 'dev', label: '研发开发', icon: '👨‍💻', enLabel: 'Developer' },
    { id: 'qa', label: '软件测试', icon: '🐞', enLabel: 'QA' },
    { id: 'da', label: '数据分析', icon: '📊', enLabel: 'Data Analyst' },
    { id: 'design', label: '产品设计', icon: '🎨', enLabel: 'UI/UX' },
    { id: 'devops', label: '系统运维', icon: '🛠️', enLabel: 'DevOps' },
    { id: 'ops', label: '产品运营', icon: '📈', enLabel: 'Operations' },
    { id: 'mktg', label: '市场营销', icon: '📢', enLabel: 'Marketing' },
    { id: 'sales', label: '销售代表', icon: '💼', enLabel: 'Sales' }
  ];

  const industries = [
    {
      name: 'IT 互联网', icon: '🌐', enName: 'Internet',
      roles: {
        pm: { risk: 50 }, mgr: { risk: 55 }, dev: { risk: 65 }, qa: { risk: 85 }, 
        da: { risk: 60 }, design: { risk: 70 }, devops: { risk: 60 }, ops: { risk: 75 }, mktg: { risk: 65 }, sales: { risk: 45 }
      }
    },
    {
      name: '云计算', icon: '☁️', enName: 'Cloud',
      roles: {
        pm: { risk: 40 }, mgr: { risk: 45 }, dev: { risk: 50 }, qa: { risk: 75 }, 
        da: { risk: 50 }, design: { risk: 60 }, devops: { risk: 45 }, ops: { risk: 60 }, mktg: { risk: 55 }, sales: { risk: 40 }
      }
    },
    {
      name: '电子商务', icon: '🛒', enName: 'E-Commerce',
      roles: {
        pm: { risk: 45 }, mgr: { risk: 50 }, dev: { risk: 55 }, qa: { risk: 80 }, 
        da: { risk: 65 }, design: { risk: 75 }, devops: { risk: 50 }, ops: { risk: 80 }, mktg: { risk: 70 }, sales: { risk: 35 }
      }
    },
    {
      name: '金融科技', icon: '🏦', enName: 'FinTech',
      roles: {
        pm: { risk: 35 }, mgr: { risk: 40 }, dev: { risk: 60 }, qa: { risk: 80 }, 
        da: { risk: 45 }, design: { risk: 50 }, devops: { risk: 40 }, ops: { risk: 55 }, mktg: { risk: 50 }, sales: { risk: 30 }
      }
    },
    {
      name: '智能汽车', icon: '🚗', enName: 'Smart EV',
      roles: {
        pm: { risk: 30 }, mgr: { risk: 35 }, dev: { risk: 40 }, qa: { risk: 60 }, 
        da: { risk: 35 }, design: { risk: 40 }, devops: { risk: 30 }, ops: { risk: 45 }, mktg: { risk: 40 }, sales: { risk: 25 }
      }
    },
    {
      name: '传统 IT', icon: '🖥️', enName: 'Traditional IT',
      roles: {
        pm: { risk: 60 }, mgr: { risk: 65 }, dev: { risk: 75 }, qa: { risk: 90 }, 
        da: { risk: 70 }, design: { risk: 85 }, devops: { risk: 70 }, ops: { risk: 85 }, mktg: { risk: 75 }, sales: { risk: 55 }
      }
    },
    {
      name: 'AI 产业', icon: '🤖', enName: 'AI Core',
      roles: {
        pm: { risk: 20 }, mgr: { risk: 30 }, dev: { risk: 15 }, qa: { risk: 40 }, 
        da: { risk: 10 }, design: { risk: 25 }, devops: { risk: 25 }, ops: { risk: 45 }, mktg: { risk: 30 }, sales: { risk: 20 }
      }
    },
    {
      name: '具身智能', icon: '🦾', enName: 'Embodied AI',
      roles: {
        pm: { risk: 15 }, mgr: { risk: 25 }, dev: { risk: 10 }, qa: { risk: 30 }, 
        da: { risk: 15 }, design: { risk: 20 }, devops: { risk: 20 }, ops: { risk: 35 }, mktg: { risk: 25 }, sales: { risk: 15 }
      }
    }
  ];

  const getRiskClass = (risk) => {
    if (risk <= 20) return 'risk-safe';
    if (risk <= 40) return 'risk-low';
    if (risk <= 60) return 'risk-medium';
    if (risk <= 80) return 'risk-high';
    return 'risk-extreme';
  };

  const getDesc = (roleId, risk) => {
    if (roleId === 'pm') return `<strong>🔴 风险分析：</strong>基础需求整理、原型图线框图绘制和初级竞品分析极易被大模型外挂工具自动化，纯执行型产品面临超 ${risk}% 的被取代压力。<br><br><strong>🧭 转型方向：</strong>向“商业模式操盘手”转型，聚焦于复杂跨域资源整合、深挖真实的人性与商业痛点，或者成为AI能力产品化的核心架构师。`;
    if (roleId === 'mgr') return `<strong>🔴 风险分析：</strong>机械跟进进度催办、周报汇总等工作正快速被智能工程管理工具接管，替代率约 ${risk}%。<br><br><strong>🧭 转型方向：</strong>向敏捷变革教练、团队心智导师转型。AI无法解决棘手的人际关系冲突以及灰色地带的跨部门利益博弈。`;
    if (roleId === 'dev') return `<strong>🔴 风险分析：</strong>海量初中级甚至部分高级人员的CRUD样板代码及重构工作正遭受Copilot大幅提效重置，同等规模下人力需求缩减超 ${risk}%。<br><br><strong>🧭 转型方向：</strong>摆脱框架语言熟练工思维，转型为具身智能或AI全栈独立开发者，独立拉起整个产品MVP，或深钻底层内核性能优化。`;
    if (roleId === 'qa') return `<strong>🔴 风险分析：</strong>重复制式的黑盒手工测试、单元测试补充及基于固定路径的自动化正在被全托管AI质量工程工具侵吞，风险高达 ${risk}%。<br><br><strong>🧭 转型方向：</strong>成为混沌工程专家，或专门负责评估大模型幻觉度、可解释性审查及硬件与模型深度调优的数据安全工程师。`;
    if (roleId === 'da') return `<strong>🔴 风险分析：</strong>基础的取数、清洗、常规BI报表制作极易被智能分析工具取代，风险达 ${risk}%。<br><br><strong>🧭 转型方向：</strong>向“业务增长黑客”或“数据战略顾问”转型。`;
    if (roleId === 'design') return `<strong>🔴 风险分析：</strong>基于标准化组件的设计、图标生成及初级视觉排版正遭受大模型绘画工具的全面冲击，替代风险约 ${risk}%。<br><br><strong>🧭 转型方向：</strong>向“多模态交互设计师”及“人机互动(HCI)专家”转型视角。`;
    if (roleId === 'devops') return `<strong>🔴 风险分析：</strong>传统K8s的常规排障、缩扩容策略调整大多在向AIOps自愈系统收拢，搬砖运维风险达 ${risk}%。<br><br><strong>🧭 转型方向：</strong>系统升级为“大模型算力架构专家”，向极度紧缺的万卡GPU集群算力池调度、高可用底座设计进阶。`;
    if (roleId === 'ops') return `<strong>🔴 风险分析：</strong>公众号洗稿、社群日常客服维系等强人海战术的岗位正面临AI智能体自动化矩阵式打击，风险约 ${risk}%。<br><br><strong>🧭 转型方向：</strong>掌握私域深度变现核心，用AI杠杆将自己的流量裂变与内容产出效能放大十倍，转型做超级个体或用户心智操盘手。`;
    if (roleId === 'mktg') return `<strong>🔴 风险分析：</strong>基础文案撰写、SEO批量铺排及常规投放策略的自动化程度极高，风险达 ${risk}%。<br><br><strong>🧭 转型方向：</strong>向“泛内容操盘手”及掌握AI杠杆做裂变的“超级个体”进阶。`;
    if (roleId === 'sales') return `<strong>🔴 风险分析：</strong>标准的话术催单、售后初级答疑正被AI智能体接管，风险为 ${risk}%。<br><br><strong>🧭 转型方向：</strong>向“大客户(ToB)专家”与“情感维系型销售”发展，人际互信是机器目前难以逾越的鸿沟。`;
    return "岗位受AI波及的基础风险评估。";
  };

  let html = '<table class="heatmap-table"><thead><tr><th>行业 \\ 岗位</th>';
  roles.forEach(r => html += `<th>${r.icon} ${r.label}<span class="th-sub">${r.enLabel}</span></th>`);
  html += '</tr></thead><tbody>';

  industries.forEach(ind => {
    html += `<tr><td>
               <div class="industry-label">
                 <span class="industry-icon">${ind.icon}</span>
                 <div><span class="industry-name">${ind.name}</span>
                      <span class="industry-name-en">${ind.enName}</span></div>
               </div>
             </td>`;
             
    roles.forEach(r => {
      const cell = ind.roles[r.id];
      if (cell) {
         html += `<td class="heat-cell" style="background: var(--${getRiskClass(cell.risk)});" 
                      data-risk="${cell.risk}" data-industry="${ind.name}" data-role="${r.label}"
                      data-desc="${getDesc(r.id, cell.risk)}">
                    <span style="font-weight: bold; color: #fff; font-size: 0.9em;">${cell.risk}%</span>
                  </td>`;
      } else {
         html += `<td class="heat-cell" style="background: rgba(255,255,255,0.02);">-</td>`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;

  const detailPanel = document.getElementById('heatmap-detail');
  container.querySelectorAll('.heat-cell[data-risk]').forEach(cell => {
    cell.addEventListener('click', () => {
      const ind = cell.dataset.industry;
      const role = cell.dataset.role;
      const risk = cell.dataset.risk;
      const desc = cell.dataset.desc;
      
      const panelContent = `
        <div style="background: var(--bg-card); padding: 16px; border: 1px solid var(--border); border-radius: 8px;">
          <h4 style="margin-bottom: 12px; font-size: 1.15em; color: var(--accent-2);">${ind} - ${role} <span style="font-size: 0.85em; opacity: 0.8;">(替代风险: ${risk}%)</span></h4>
          <p style="font-size: 0.95em; line-height: 1.6; color: var(--text-primary); margin: 0;">${desc}</p>
        </div>
      `;
      detailPanel.innerHTML = panelContent;
    });
  });
}

/* ===========================
   AI Career Planning
   =========================== */
function initAIPlanning() {
  const planBtn = document.getElementById('ai-plan-btn');
  const btnText = document.getElementById('btn-text');
  const qaForm = document.getElementById('ai-qa-form');
  const qaResult = document.getElementById('ai-qa-result');
  const resetBtn = document.getElementById('qa-reset-btn');
  if(!planBtn) return;

  planBtn.addEventListener('click', async () => {
    const customer_name = document.getElementById('ai-name') ? document.getElementById('ai-name').value.trim() : '';
    const customer_contact = document.getElementById('ai-contact') ? document.getElementById('ai-contact').value.trim() : '';
    const industry = document.getElementById('ai-industry').value.trim();
    const role = document.getElementById('ai-role').value.trim();
    const edu = document.getElementById('ai-edu') ? document.getElementById('ai-edu').value : '';
    const exp = document.getElementById('ai-exp') ? document.getElementById('ai-exp').value : '';
    const content = document.getElementById('ai-content') ? document.getElementById('ai-content').value.trim() : '';
    const env = document.getElementById('ai-env') ? document.getElementById('ai-env').value.trim() : '';

    if (!industry || (!role)) {
      alert('请填写你所在的行业和岗位！');
      return;
    }

    if (window.currentPlan === 'basic' && window.generationCount >= MAX_BASIC_GENERATIONS) {
      alert('基础版生成的报告次数已达上限（3次）。请升级至专业版或旗舰版以获取更多报告！');
      return;
    }

    if (window.currentPlan === 'pro' && !customer_contact.includes('@')) {
      alert('专业版排队人数较多，请在“联系方式”中填写正确的邮箱地址，我们将把 PDF 报告发送至您的邮箱！');
      return;
    }

    planBtn.disabled = true;
    btnText.textContent = '🚀 数据分析并同步至云端...';
    
    if (window.currentPlan === 'basic') {
      window.generationCount++;
      const status = document.getElementById('plan-status');
      if (status) status.textContent = `额度: ${MAX_BASIC_GENERATIONS - window.generationCount}/${MAX_BASIC_GENERATIONS}`;
    }
    
    try {
      const apiRes = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name, customer_contact, industry, role, edu, exp,
          work_content: content, work_env: env
        })
      });
      const resData = await apiRes.json();
      
      qaForm.style.display = 'none';
      qaResult.style.display = 'block';

      let riskPct = '未知';
      let riskDesc = '暂无明确诊断';
      let pathDesc = '请联系咨询师';
      let actionDesc = '无行动点建议';

      if (resData.aiReport) {
        riskPct = resData.aiReport.riskPct || riskPct;
        riskDesc = resData.aiReport.riskDesc || riskDesc;
        pathDesc = resData.aiReport.pathDesc || pathDesc;
        actionDesc = resData.aiReport.actionDesc || actionDesc;
      }
      
      window.latestReportData = {
        name: customer_name, industry: industry, role: role, edu: edu, exp: exp, content: content, env: env,
        riskPct: riskPct, riskDesc: riskDesc, pathDesc: pathDesc, actionDesc: actionDesc
      };

      const resultBody = document.querySelector('.qa-result-body');
      if (resultBody) {
        // 渲染与后台 100% 同步的高级定制版报告模板到前台页面
        resultBody.innerHTML = `
          <div style="width: 100%; overflow-x: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-top: 20px;">
            <div style="min-width: 600px; padding-bottom: 20px;">
              ${generateSharedReportHtml(window.latestReportData)}
            </div>
          </div>
        `;
      }
      
      let existingCta = document.getElementById('ai-cta-box');
      if (existingCta) existingCta.remove();

      planBtn.disabled = false;
      btnText.textContent = '生成我的诊断报告';
      
      const exportBtn = document.getElementById('qa-export-btn');
      const emailGroup = document.getElementById('qa-email-group');
      const emailInput = document.getElementById('qa-email-input');
      const emailBtn = document.getElementById('qa-email-btn');

      if (emailGroup) {
        if (window.currentPlan === 'pro') {
          emailGroup.style.display = 'flex';
          if (customer_contact.includes('@')) {
            emailInput.value = customer_contact;
          }
          emailBtn.onclick = async () => {
            const email = emailInput.value.trim();
            if (!email.includes('@')) {
              alert('请输入正确的邮箱地址！');
              return;
            }
            emailBtn.disabled = true;
            emailBtn.textContent = '⏳ 生成 PDF 并发送...';
            
            try {
              // Generate PDF as base64 using shared logic
              const pdfBase64 = await sharedGetPdfBase64(window.latestReportData, html2pdf);

              // Send to backend
              const res = await fetch('/api/send-report-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email,
                  report: window.latestReportData,
                  pdfBase64: pdfBase64
                })
              });
              const resData = await res.json();
              
              if (res.ok) {
                if (resData.message.includes('Simulated')) {
                  alert('⚠️ 您现在的 .env 未配置真实 SMTP，请根据说明填好后重启服务才能真实发送！');
                } else {
                  alert('✅ 诊断报告 PDF 已成功发送至您的邮箱！');
                }
              } else {
                throw new Error(resData.error || '发送失败');
              }
            } catch (err) {
              console.error('Email PDF Error:', err);
              alert('❌ 邮件发送失败: ' + err.message);
            } finally {
              emailBtn.disabled = false;
              emailBtn.textContent = '📧 发送到邮箱';
            }
          };
        } else {
          emailGroup.style.display = 'none';
        }
      }

      if (exportBtn) {
        if (window.currentPlan === 'basic') {
          exportBtn.style.display = 'none';
        } else {
          exportBtn.style.display = 'inline-block';
          if (window.currentPlan === 'premium') {
            exportBtn.innerHTML = '💬 微信发给专家审核';
            exportBtn.onclick = (e) => {
              e.stopPropagation();
              navigator.clipboard.writeText('1800227125');
              alert('✅ 您已选择旗舰版。报告 PDF 将在生成后自动开启下载，请同时添加专家微信 1800227125（已复制），并将 PDF 文件发送给专家进行深度人工审核。');
              const filename = 'AI_Career_Report_' + (window.latestReportData.role || 'Plan').replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_') + '.pdf';
              sharedExportPdf(window.latestReportData, filename, exportBtn, exportBtn.innerHTML, html2pdf);
            };
          } else {
            exportBtn.innerHTML = '📥 导出 PDF';
            exportBtn.onclick = () => {
              const filename = 'AI_Career_Report_' + (window.latestReportData.role || 'Plan').replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_') + '.pdf';
              sharedExportPdf(window.latestReportData, filename, exportBtn, exportBtn.innerHTML, html2pdf);
            };
          }
        }
      }
      
    } catch(err) {
      console.warn('Backend logging failed', err);
      alert('服务请求失败，请确保后台服务正在运行且允许连接。');
      planBtn.disabled = false;
      btnText.textContent = '生成我的诊断报告';
    }
  });

  const exportBtn = document.getElementById('qa-export-btn');
  if (exportBtn) {
    // Initial assignment will be handled by logic inside initAIPlanning results area
  }

  resetBtn.addEventListener('click', () => {
    qaResult.style.display = 'none';
    qaForm.style.display = 'block';
  });
}
/* ===========================
   Career Cases Modal Logic
   =========================== */
function initCareerCases() {
  const modal = document.getElementById('case-modal');
  const closeBtn = document.getElementById('modal-close');
  const overlay = modal ? modal.querySelector('.modal-overlay') : null;
  const cards = document.querySelectorAll('.career-card');

  if (!modal || !closeBtn) return;

  const caseData = {
    'prompt-engineer': {
      emoji: '🎯',
      title: 'AI提示词工程师',
      tag: '🔥 高需求',
      tagClass: 'tag-hot',
      income: '月入 ¥20K-80K',
      detail: '某原本做文案策划的自由职业者，在2023年开始研究提示词工程。他在Upwork和Fiverr上提供Prompt优化服务，不仅帮企业写复杂的营销模板，还帮律所优化法律文书生成的提示词，通过标准化Prompt库实现了惊人的被动收入。',
      business: '1. 计件收费：单个复杂Prompt $50-$200；<br>2. 顾问咨询：按小时收费或由企业月度续费；<br>3. 数字化资产：打包行业专用Prompt集在平台售卖。',
      advice: ['学习基础大模型（LLM）底层逻辑与Tokens概念', '在主流Agent平台（如扣子/Dify）搭建并公开自己的智能体', '选择一个你熟悉的垂类行业（如医疗、法律、电商）深耕Prompt'],
      boss: 'https://www.zhipin.com/web/geek/job?query=提示词工程师&city=101010100'
    },
    'ai-developer': {
      emoji: '🤖',
      title: 'AI应用开发者',
      tag: '🔥 高需求',
      tagClass: 'tag-hot',
      income: '月入 ¥30K-120K',
      detail: '一名前英语教师通过自学，利用Vercel + Next.js + OpenAI API，在一周内搭建了一款AI口语陪练App。通过抖音短视频引流，上线首月就积累了大量种子用户，并将API能力包装为会员制订阅服务。',
      business: '1. 订阅制(SaaS)：按月度/年度会员收费；<br>2. 私有化部署：为中小企业通过低代码平台快速定制行业工具；<br>3. 流量转化：通过免费工具积累用户，导流至后端课程。',
      advice: ['掌握Cursor、Replit等AI辅助编程神器，大幅降低开发门槛', '深入理解主流模型（GPT-4、Claude、DeepSeek）的API调用规范', '从解决身边的一个具体小痛点（如自动写总结、自动搜券）入手开发MVP'],
      boss: 'https://www.zhipin.com/web/geek/job?query=AI开发工程师&city=101010100'
    },
    'ai-content': {
      emoji: '📹',
      title: 'AI内容创作者',
      tag: '📈 快速增长',
      tagClass: 'tag-growing',
      income: '月入 ¥10K-50K',
      detail: '一位95后创作者利用Midjourney生成配图，ChatGPT生成脚本，Sora/Runway生成分镜，一个人在半年内运营起5个矩阵号。每月接商业软文和佣金收入稳定在8万左右，效率是传统团队的10倍。',
      business: '1. 平台流量分成与创作奖金；<br>2. 品牌定向短视频/文案营销推广；<br>3. AI数字人直播：低成本实现24小时不间断带货。',
      advice: ['熟练掌握Midjourney/Stable Diffusion等头部绘图引擎', '建立一套属于自己的“AI+工作流”，实现多平台内容高频自动分发', '保持对各平台（小红书/抖音）最新算法与审美趋势的高度敏感'],
      boss: 'https://www.zhipin.com/web/geek/job?query=AI内容运营&city=101010100'
    },
    'ai-trainer': {
      emoji: '🎓',
      title: 'AI培训讲师',
      tag: '📈 快速增长',
      tagClass: 'tag-growing',
      income: '月入 ¥15K-60K',
      detail: '前互联网公司运营经理，洞察到传统企业主对AI的焦虑。他在某知识付费平台推出『企业主AI减负实操课』，通过线下沙龙+线上督导的模式，半年创收200万以上。',
      business: '1. 线上录播/直播课程售卖；<br>2. 线下高端转型集训营、私董会；<br>3. 为传统企业提供员工AI技能整体提升内训计划。',
      advice: ['整理并打磨出至少10套跨行业、真实可提效的实战案例', '练习向“外行”讲解AI逻辑，将技术黑话转化为商业收益语言', '在公域平台（如视频号）建立自己的专家IP形象'],
      boss: 'https://www.zhipin.com/web/geek/job?query=AI培训&city=101010100'
    },
    'ai-ethics': {
      emoji: '🛡️',
      title: 'AI伦理与合规顾问',
      tag: '🏢 企业刚需',
      tagClass: 'tag-stable',
      income: '年薪 ¥40W-100W',
      detail: '某顶尖律师事务所成立专门的AI合规中心。他们为大型企业提供AI生成内容的著作权风险判定、AI算法审计以及个人隐私协议合规性审查。首年业务量极其饱满。',
      business: '1. 专项法律合规审计；<br>2. 担任科技企业常年法律/伦理顾问；<br>3. 合规培训服务：帮助企业避开AI侵权雷区。',
      advice: ['深度研究全球主流AI监管政策（如欧盟AI法案、中国生成式AI条例）', '学习基础的数据安全、算法偏见与模型可解释性知识', '建议法律专业或信息安全相关背景的人士跨界深耕'],
      boss: 'https://www.zhipin.com/web/geek/job?query=AI合规&city=101010100'
    },
    'personal-ai-consultant': {
      emoji: '🧬',
      title: '个人AI顾问/OPC',
      tag: '🔥 蓝海赛道',
      tagClass: 'tag-hot',
      income: '月入 ¥20K-100K',
      detail: '一位前麦肯锡资深顾问，现在担任多家高成长中小企业的『虚拟首席AI官』。他为企业重构HR、财会及法务流程。他不仅收取咨询费，还参与企业“提效部分”的利润分成。',
      business: '1. 企业AI架构梳理费/入场费；<br>2. 价值分成：按节省的人力成本比例或效率提升收益提成；<br>3. 长期战略合伙：获得企业期权或原始股。',
      advice: ['练就深刻的行业洞察力，能一眼看透传统流程中的低效环节', '熟练掌握Agent部署、RAG（知识库）搭建等企业级AI落地技术', '练就极强的商业沟通与PPT方案交付能力'],
      boss: 'https://www.zhipin.com/web/geek/job?query=AI开发工程师&city=101010100'
    }
  };

  const openModal = (caseId) => {
    const data = caseData[caseId];
    if (!data) return;

    document.getElementById('modal-emoji').textContent = data.emoji;
    document.getElementById('modal-title').textContent = data.title;
    const tagEl = document.getElementById('modal-tag');
    tagEl.textContent = data.tag;
    tagEl.className = 'career-tag ' + data.tagClass;
    document.getElementById('modal-income').textContent = data.income;
    document.getElementById('modal-case-detail').textContent = data.detail;
    document.getElementById('modal-business-model').innerHTML = data.business;
    
    const adviceList = document.getElementById('modal-startup-advice');
    adviceList.innerHTML = '';
    data.advice.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      adviceList.appendChild(li);
    });

    document.getElementById('modal-boss-link').href = data.boss;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const caseId = card.getAttribute('data-case-id');
      if (caseId) openModal(caseId);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);

  // Esc key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ===========================
   Authentication Logic
   =========================== */
function initAuth() {
  const modal = document.getElementById('login-modal');
  const trigger = document.getElementById('login-trigger-btn');
  const close = document.getElementById('login-close');
  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');

  if (!modal || !trigger || !close) return;

  // Toggle Modal
  trigger.addEventListener('click', () => {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  });

  const closeModal = () => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  };

  close.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Tab Switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      forms.forEach(f => f.classList.remove('active'));
      document.getElementById(`${target}-form`).classList.add('active');
    });
  });

  // Form Submission (Simulated)
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const wechatBtn = document.querySelector('.wechat-btn');
  const qrContainer = document.getElementById('wechat-qr-container');
  const formContainer = document.querySelector('.auth-form-container');
  const backBtn = document.getElementById('back-to-login-btn');
  const authTabs = document.querySelector('.auth-tabs');
  const authDivider = document.querySelector('.auth-divider');
  const authSocial = document.querySelector('.auth-social');

  if (wechatBtn && qrContainer) {
    wechatBtn.addEventListener('click', () => {
      // Hide other forms and tabs
      forms.forEach(f => f.classList.remove('active'));
      authTabs.style.display = 'none';
      authDivider.style.display = 'none';
      authSocial.style.display = 'none';
      qrContainer.classList.add('active');
      
      // Simulate scan success after 5 seconds
      setTimeout(async () => {
        if (qrContainer.classList.contains('active')) {
          qrContainer.querySelector('.qr-status-msg').innerHTML = '<strong>已扫描，等待确认...</strong>';
          
          setTimeout(async () => {
            // Mock WeChat user data
            const mockUser = {
              openid: 'wx_mock_' + Math.random().toString(36).substr(2, 9),
              nickname: '微信访客_' + Math.floor(Math.random() * 1000),
              avatar_url: ''
            };

            try {
              const res = await fetch('/api/auth/wechat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mockUser)
              });
              
              if (res.ok) {
                closeModal();
                const toast = document.createElement('div');
                toast.className = 'save-toast show';
                toast.style.background = '#2ed573';
                toast.innerHTML = `✅ 微信登录成功！欢迎，${mockUser.nickname}`;
                document.body.appendChild(toast);
                
                trigger.innerHTML = `<span class="user-avatar-mini" style="width:24px; height:24px; font-size: 0.7rem; margin-right:8px; background:var(--accent-2); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; color:#fff;">${mockUser.nickname.charAt(0)}</span> ${mockUser.nickname}`;
                
                setTimeout(() => {
                  toast.classList.remove('show');
                  setTimeout(() => toast.remove(), 500);
                }, 3000);

                // Reset modal for next time
                resetAuthModal();
              }
            } catch (err) {
              console.error('WeChat Login Error:', err);
            }
          }, 2000);
        }
      }, 3000);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      resetAuthModal();
      document.querySelector('.auth-tab[data-tab="login"]').click();
    });
  }

  function resetAuthModal() {
    qrContainer.classList.remove('active');
    qrContainer.querySelector('.qr-status-msg').innerHTML = '使用微信扫一扫登录<br><strong>AI 职业导航</strong>';
    authTabs.style.display = 'flex';
    authDivider.style.display = 'block';
    authSocial.style.display = 'flex';
    forms.forEach(f => f.classList.remove('active'));
    document.getElementById('login-form').classList.add('active');
  }

  const handleAuthSubmit = (e, type) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const origText = btn.textContent;
    btn.textContent = type === 'login' ? '正在登录...' : '正在注册...';
    btn.disabled = true;

    setTimeout(() => {
      closeModal();
      btn.textContent = origText;
      btn.disabled = false;
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'save-toast show';
      toast.style.background = '#2ed573';
      toast.innerHTML = `✅ ${type === 'login' ? '登录成功！欢迎回来' : '注册成功！'}`;
      document.body.appendChild(toast);
      
      // Update Nav for logged in state
      trigger.innerHTML = `<span class="user-avatar-mini" style="width:24px; height:24px; font-size: 0.7rem; margin-right:8px; background:var(--accent-2); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; color:#fff;">U</span> 我的账号`;

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
      }, 3000);
    }, 1500);
  };

  if (loginForm) loginForm.addEventListener('submit', (e) => handleAuthSubmit(e, 'login'));
  if (registerForm) registerForm.addEventListener('submit', (e) => handleAuthSubmit(e, 'register'));
}
