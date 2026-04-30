// 统一的 PDF 诊断报告模板渲染器 (供前端 index.html 和后台 admin.html 共享)
// 不要各自生成，保证 100% 同步一致

function generateSharedReportHtml(d) {
  return `
    <div style="padding: 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2c3e50; line-height: 1.8; background-color: #ffffff;">
      <!-- 头部 -->
      <div style="text-align: center; border-bottom: 3px solid #1a237e; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 2.4rem; color: #1a237e; letter-spacing: 2px;">AI 时代职业导航专属诊断报告</h1>
        <p style="margin: 10px 0 0 0; color: #7f8c8d; font-size: 1rem;">报告生成时间: ${new Date().toLocaleString()} | 高级定制版</p>
      </div>
      
      <!-- 用户档案 -->
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin-bottom: 35px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-left: 6px solid #1a237e;">
        <h3 style="margin-top: 0; margin-bottom: 15px; color: #1a237e; font-size: 1.3rem;">👤 专属客户档案</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
          <p style="margin: 0; font-size: 1.1rem; width: 45%;"><strong>评估姓名：</strong>${d.name || d.customer_name || '匿名用户'}</p>
          <p style="margin: 0; font-size: 1.1rem; width: 45%;"><strong>所属行业：</strong>${d.industry || '-'}</p>
          <p style="margin: 0; font-size: 1.1rem; width: 45%;"><strong>当前岗位：</strong>${d.role || '-'}</p>
          <p style="margin: 0; font-size: 1.1rem; width: 45%;"><strong>最高学历：</strong>${d.edu || '-'}</p>
          <p style="margin: 0; font-size: 1.1rem; width: 45%;"><strong>工作年限：</strong>${d.exp || '-'}</p>
        </div>
        <div style="margin-top: 15px; border-top: 1px dashed #ced4da; padding-top: 15px;">
          <p style="margin: 0; font-size: 1.1rem;"><strong>工作内容：</strong>${d.content || d.work_content || '未提供'}</p>
          <p style="margin: 8px 0 0 0; font-size: 1.1rem;"><strong>职场痛点：</strong>${d.env || d.work_env || '未提供'}</p>
        </div>
      </div>
      
      <!-- 一、现状剖析 -->
      <div style="page-break-inside: avoid; margin-bottom: 40px;">
        <h2 style="color: #ffffff; background: #0d47a1; display: inline-block; padding: 8px 20px; border-radius: 6px; margin-bottom: 20px;">一、 现状与危机深度剖析</h2>
        <div style="background: #fff3e0; padding: 25px; border-radius: 12px; border: 1px solid #ffe0b2; box-shadow: 0 4px 15px rgba(255,152,0,0.08);">
          <h3 style="margin-top: 0; color: #d84315; font-size: 1.6rem; text-align: center; margin-bottom: 20px;">⚠️ AI 替代风险极值评估：${d.riskPct}</h3>
          <div style="color: #424242; font-size: 1.15rem; line-height: 1.8; text-align: justify; white-space: pre-wrap;">${d.riskDesc}</div>
        </div>
      </div>
      
      <!-- 二、转型方向 -->
      <div style="page-break-inside: avoid; margin-bottom: 40px;">
        <h2 style="color: #ffffff; background: #0d47a1; display: inline-block; padding: 8px 20px; border-radius: 6px; margin-bottom: 20px;">二、 专属转型蓝图与岗位推荐</h2>
        <div style="background: #e3f2fd; padding: 25px; border-radius: 12px; border: 1px solid #bbdefb; box-shadow: 0 4px 15px rgba(33,150,243,0.08);">
          <div style="color: #1565c0; font-size: 1.15rem; line-height: 1.8; text-align: justify; white-space: pre-wrap;">${d.pathDesc}</div>
        </div>
      </div>
      
      <!-- 三、落地计划 -->
      <div style="page-break-inside: avoid; margin-bottom: 40px;">
        <h2 style="color: #ffffff; background: #0d47a1; display: inline-block; padding: 8px 20px; border-radius: 6px; margin-bottom: 20px;">三、 30天高能破局落地计划</h2>
        <div style="background: #e8f5e9; padding: 25px; border-radius: 12px; border: 1px solid #c8e6c9; box-shadow: 0 4px 15px rgba(76,175,80,0.08);">
          <div style="color: #2e7d32; font-size: 1.15rem; line-height: 1.9; text-align: justify; white-space: pre-wrap;">${d.actionDesc}</div>
        </div>
      </div>
      
      <!-- 尾部营销 -->
      <div style="page-break-inside: avoid; background:#f8f9fe; border: 2px solid #e2e8f0; padding:30px; margin-top:50px; border-radius:12px; text-align: center;">
        <h3 style="color:#4e54c8; margin-top:0; margin-bottom:15px; font-size:1.5rem;">🚀 开启深度破局之旅</h3>
        <p style="font-size:1.15rem; color:#4a5568; margin:0 0 20px 0; line-height:1.7; text-align: justify;">
          本报告由系统基于亿级参数大模型引擎为您实时测算生成。若希望进一步获取结合您真实履历量身定制的<strong>“1对1职业转型图谱”</strong>，或希望专家手把手提供<strong>“副业变现与转型落地陪跑服务”</strong>，请随时联系您的专属咨询师。
        </p>
        <div style="display: inline-block; background: #4e54c8; color: #ffffff; padding: 12px 30px; border-radius: 50px; font-size: 1.2rem; font-weight: bold; box-shadow: 0 4px 15px rgba(78,84,200,0.4);">
          💬 专属咨询师微信：1800227125
        </div>
      </div>

      <div style="margin-top: 50px; text-align: center; font-size: 0.95rem; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        由 AI Career Nav 系统基于生成式大模型自动分析生成 · 版权所有
      </div>
    </div>
  `;
}

// 统一导出 PDF 核心逻辑，通过挂载到不可见的真实 DOM 来保证 html2canvas 完美抓取
function sharedExportPdf(data, filename, btn, origText, html2pdf) {
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '正在生成 PDF...';
  }

  // 1. 创建挂载容器，绝对确保其进入了真实 DOM（不在视口内，不影响用户）
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-15000px'; // 放飞到屏幕极远处
  container.style.left = '0';
  container.style.width = '800px'; // 强制固定宽度，防止版式崩坏
  container.style.padding = '40px';
  container.style.background = '#ffffff';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';
  container.innerHTML = generateSharedReportHtml(data);
  document.body.appendChild(container);

  // 2. 配置 html2pdf
  const opt = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 800 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  };
  // 3. 执行导出
  html2pdf().set(opt).from(container).save(filename).then(() => {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
    document.body.removeChild(container);
  }).catch(err => {
    console.error('PDF Export Error:', err);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
    if (document.body.contains(container)) document.body.removeChild(container);
    alert('❌ PDF 导出失败，请重试或更换浏览器。');
  });
}

// 供后台发送邮件获取 Base64 使用
async function sharedGetPdfBase64(data, html2pdf) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-15000px';
  container.style.left = '0';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.background = '#ffffff';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-9999';
  container.innerHTML = generateSharedReportHtml(data);
  document.body.appendChild(container);

  const opt = {
    margin: 10,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 800 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  try {
    const pdfBase64 = await html2pdf().set(opt).from(container).toPdf().output('datauristring');
    document.body.removeChild(container);
    return pdfBase64;
  } catch(err) {
    if (document.body.contains(container)) document.body.removeChild(container);
    throw err;
  }
}
