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
});

/* ===========================
   Particles Background
   =========================== */
function initParticles() {
  const container = document.getElementById('particles');
  const count = 40;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = 6 + Math.random() * 6 + 's';
    const colors = ['#6c5ce7', '#00cec9', '#fd79a8', '#a29bfe', '#81ecec'];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
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
          animateCounter(el, target);
          observer.unobserve(el);
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
    // ease-out cubic
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

  // Field definitions: id suffix → { prefix for display, default value }
  const fields = {
    name:          { prefix: '',       defaultVal: '职业发展咨询师' },
    title:         { prefix: '',       defaultVal: 'AI时代 · 一人企业 · 职业导航' },
    email:         { prefix: '',       defaultVal: 'your.email@example.com' },
    wechat:        { prefix: '微信：', defaultVal: 'your_wechat_id' },
    xiaohongshu:   { prefix: '小红书：@', defaultVal: '你的账号名' },
    gongzhonghao:  { prefix: '公众号：', defaultVal: 'AI职业导航' }
  };

  const editBtn = document.getElementById('edit-contact-btn');
  const saveBtn = document.getElementById('save-contact-btn');
  const contactBtn = document.getElementById('contact-btn');
  const cardInner = document.querySelector('.contact-card-inner');
  let isEditing = false;

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'save-toast';
  toast.textContent = '✅ 信息已保存';
  document.body.appendChild(toast);

  // Load saved data
  loadData();

  // Edit button
  editBtn.addEventListener('click', () => {
    isEditing = true;
    enterEditMode();
  });

  // Save button
  saveBtn.addEventListener('click', () => {
    isEditing = false;
    saveData();
    exitEditMode();
    showToast();
  });

  function enterEditMode() {
    cardInner.classList.add('editing');
    Object.keys(fields).forEach(key => {
      const display = document.getElementById('display-' + key);
      const input = document.getElementById('input-' + key);
      if (display && input) {
        // Populate input with raw value (strip prefix)
        const raw = display.textContent.replace(fields[key].prefix, '');
        input.value = raw;
        display.style.display = 'none';
        input.style.display = '';
      }
    });
    editBtn.style.display = 'none';
    saveBtn.style.display = '';
    saveBtn.classList.add('btn-save-pulse');
    contactBtn.style.display = 'none';
  }

  function exitEditMode() {
    cardInner.classList.remove('editing');
    Object.keys(fields).forEach(key => {
      const display = document.getElementById('display-' + key);
      const input = document.getElementById('input-' + key);
      if (display && input) {
        const val = input.value.trim() || fields[key].defaultVal;
        display.textContent = fields[key].prefix + val;
        display.style.display = '';
        input.style.display = 'none';
      }
    });
    editBtn.style.display = '';
    saveBtn.style.display = 'none';
    saveBtn.classList.remove('btn-save-pulse');
    contactBtn.style.display = '';

    // Update mailto link
    const emailVal = document.getElementById('display-email').textContent;
    contactBtn.href = 'mailto:' + emailVal;
  }

  function saveData() {
    const data = {};
    Object.keys(fields).forEach(key => {
      const input = document.getElementById('input-' + key);
      data[key] = input ? input.value.trim() : '';
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      Object.keys(fields).forEach(key => {
        if (data[key]) {
          const display = document.getElementById('display-' + key);
          if (display) {
            display.textContent = fields[key].prefix + data[key];
          }
        }
      });
      // Update mailto
      if (data.email) {
        contactBtn.href = 'mailto:' + data.email;
      }
      // Update avatar with first char of name
      if (data.name) {
        const avatarText = document.getElementById('avatar-text');
        if (avatarText) {
          avatarText.textContent = data.name.charAt(0).toUpperCase();
        }
      }
    } catch (e) { /* ignore parse errors */ }
  }

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}
