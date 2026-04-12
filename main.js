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
  initAIPlanning();
});

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
    const sections = ['history', 'heatmap', 'newcareers', 'contact'];
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
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
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
    const content = document.getElementById('ai-content').value.trim();
    const env = document.getElementById('ai-env').value.trim();

    if (!industry || (!role)) {
      alert('请填写你所在的行业和岗位！');
      return;
    }

    planBtn.disabled = true;
    btnText.textContent = '🚀 数据分析并同步至云端...';
    
    try {
      const apiRes = await fetch('http://localhost:5000/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name, customer_contact, industry, role,
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
      
      // 添加少许前置动态语境增强对话感
      let personalizedRisk = `<strong>基于 AI 引擎对您在【${industry}】行业【${role}】岗位的深度运算：</strong><br/>`;
      riskDesc = personalizedRisk + '<br/>' + riskDesc;

      document.getElementById('res-risk').innerHTML = `<p><strong>风险评估极值：${riskPct}</strong><br/><br/>${riskDesc}</p>`;
      document.getElementById('res-path').innerHTML = `<p>${pathDesc}</p>`;
      document.getElementById('res-action').innerHTML = `<p style="white-space: pre-wrap;">${actionDesc}</p>`;

      const ctaHtml = `
        <div style="background:#f5f7ff; border-left:4px solid var(--accent-1); padding:16px; margin-top:24px; border-radius:4px;">
          <h4 style="color:var(--accent-1); margin-top:0; margin-bottom:8px; font-size:1.1em;">👑 获取深度专属方案</h4>
          <p style="font-size:0.95em; color:var(--text-secondary); margin:0 0 16px 0; line-height:1.6;">
            上述是由 AI 引擎根据您的碎片信息分析生成的系统诊断。想要根据您个人完整履历获取更量身定制的<strong>“1对1职业转型图谱”</strong>，或购买完整落地的<strong>“破局实施方案”</strong>？
          </p>
          <a href="#contact" onclick="document.getElementById('qa-reset-btn').click();" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.9em; text-decoration: none;">💬 立即联系职业咨询师</a>
        </div>
      `;
      let existingCta = document.getElementById('ai-cta-box');
      if (!existingCta) {
        let ctaDiv = document.createElement('div');
        ctaDiv.id = 'ai-cta-box';
        ctaDiv.innerHTML = ctaHtml;
        qaResult.appendChild(ctaDiv);
      } else {
        existingCta.innerHTML = ctaHtml;
      }

      planBtn.disabled = false;
      btnText.textContent = '生成我的诊断报告';
      
      window.latestReportData = {
        name: customer_name, industry: industry, role: role, content: content, env: env,
        riskPct: riskPct, riskDesc: riskDesc, pathDesc: pathDesc, actionDesc: actionDesc
      };
      
    } catch(err) {
      console.warn('Backend logging failed', err);
      alert('服务请求失败，请确保后台 5000 端口服务正在运行且允许连接。');
      planBtn.disabled = false;
      btnText.textContent = '生成我的诊断报告';
    }
  });

  const exportBtn = document.getElementById('qa-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (!window.latestReportData) return;
      const d = window.latestReportData;
      const printArea = document.getElementById('frontend-report-print-area');
      printArea.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px;">
          <h1 style="margin: 0; font-size: 2rem; color: #333; font-family: sans-serif;">AI 时代职业导航 - 专属职业诊断报告</h1>
          <p style="margin: 8px 0 0 0; color: #666; font-size: 0.9rem;">生成时间: ${new Date().toLocaleString()}</p>
        </div>
        <p style="font-size: 1.1rem; margin: 10px 0; font-family: sans-serif;"><strong>👉 评估姓名：</strong>${d.name || '匿名用户'}</p>
        <p style="font-size: 1.1rem; margin: 10px 0; font-family: sans-serif;"><strong>👉 所属行业：</strong>${d.industry || '-'}</p>
        <p style="font-size: 1.1rem; margin: 10px 0; font-family: sans-serif;"><strong>👉 当前岗位：</strong>${d.role || '-'}</p>
        
        <div style="background: #fff3e0; padding: 20px; border-left: 6px solid #ff9800; margin: 30px 0; border-radius: 4px; font-family: sans-serif;">
          <h3 style="margin-top: 0; color: #e65100; font-size: 1.4rem;">⚠️ AI 替代风险极值评估：${d.riskPct}</h3>
          <p style="margin: 0; color: #424242; font-size: 1.1rem; line-height: 1.7;">${d.riskDesc}</p>
        </div>
        
        <h3 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 8px; margin-top: 35px; font-size: 1.3rem; font-family: sans-serif;">🚀 推荐转型路径</h3>
        <p style="font-size: 1.1rem; line-height: 1.7; color: #333; font-family: sans-serif;">${d.pathDesc}</p>
        
        <h3 style="color: #388e3c; border-bottom: 2px solid #388e3c; padding-bottom: 8px; margin-top: 35px; font-size: 1.3rem; font-family: sans-serif;">🎯 核心破局行动点</h3>
        <p style="font-size: 1.1rem; line-height: 1.9; color: #333; font-family: sans-serif; white-space: pre-wrap;">${d.actionDesc}</p>
        
        <div style="background:#f5f7ff; border-left:5px solid #4e54c8; padding:20px; margin-top:50px; border-radius:6px; font-family: sans-serif;">
          <h4 style="color:#4e54c8; margin-top:0; margin-bottom:12px; font-size:1.2rem;">👑 获取深度定制实施方案</h4>
          <p style="font-size:1.05rem; color:#444; margin:0 0 20px 0; line-height:1.7;">
            上述仅为平台基础模型的初步分析。若想根据您的真实履历和职场瓶颈获取量身定制的<strong>“1对1职业转型图谱”</strong>，或购买完整落地的<strong>“破局实施方案”</strong>？
          </p>
          <p style="font-weight:bold; color:#d32f2f; margin:0; font-size:1.15rem;">💬 欢迎向下滑动网页，联系您的专属职业发展咨询师开启破局之旅！</p>
        </div>
        <div style="margin-top: 50px; text-align: center; font-size: 0.9rem; color: #999; font-family: sans-serif;">
          -- 报告由 AI Career Nav 自动生成 --
        </div>
      `;
      
      const opt = {
        margin:       15,
        filename:     `职业诊断报告_${d.role || '未命名'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      const btnOrigText = exportBtn.textContent;
      exportBtn.textContent = '稍等片刻...';
      exportBtn.disabled = true;
      
      html2pdf().set(opt).from(printArea).save().then(() => {
        exportBtn.textContent = btnOrigText;
        exportBtn.disabled = false;
      });
    });
  }

  resetBtn.addEventListener('click', () => {
    qaResult.style.display = 'none';
    qaForm.style.display = 'block';
  });
}
