// 完整報告頁：線上閱讀、下載 PDF（html2pdf.js）、列印／另存 PDF
'use strict';

(async () => {
  const report = document.getElementById('report');
  const toolbar = document.getElementById('toolbar');
  const { el, list } = MBTI;
  const params = new URLSearchParams(location.search);

  const raw = MBTI.parseRaw(location.search);
  if (!raw) {
    MBTI.showError(report, '找不到有效的測驗結果，請先完成測驗。');
    return;
  }

  let questionsData, typesData;
  try {
    [questionsData, typesData] = await Promise.all([
      MBTI.loadJSON('data/questions.json'),
      MBTI.loadJSON('data/types.json'),
    ]);
  } catch (e) {
    MBTI.showError(report, '資料載入失敗，請重新整理頁面再試一次。');
    return;
  }

  const result = MBTI.analyze(raw, questionsData);
  const type = typesData.types.find((t) => t.code === result.code);
  const common = typesData.common;
  const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  document.title = `${result.code} 完整報告｜16型MBTI性格探索`;

  const section = (title, children) =>
    el('section', { class: 'card avoid-break' }, [el('h2', { text: title }), ...[].concat(children)]);

  const dimsBox = el('div');
  MBTI.renderDimensions(dimsBox, result, typesData, true);

  report.replaceChildren(
    el('section', { class: 'card avoid-break' }, [
      el('div', { class: 'report-meta' }, [
        el('span', { text: '16型MBTI性格探索｜完整報告' }),
        el('span', { text: `產生日期：${today}` }),
      ]),
      el('div', { class: 'type-hero', style: 'padding:8px 0 4px' }, [
        el('div', { class: 'type-label', text: '你的類型代碼' }),
        el('div', { class: 'type-code', text: result.code }),
        el('div', { class: 'type-name', text: type.name }),
        el('p', { class: 'type-tagline', text: type.tagline }),
      ]),
    ]),
    section('四個向度的傾向', dimsBox),
    section('類型概述', el('p', { text: type.overview })),
    section('你的優勢', list(type.strengths)),
    section('可能的盲點', list(type.blindSpots)),
    section('成長建議', list(type.growthTips)),
    section('工作風格', el('dl', { class: 'kv' }, [
      el('dt', { text: '工作節奏' }), el('dd', { text: type.workStyle.pace }),
      el('dt', { text: '決策方式' }), el('dd', { text: type.workStyle.decision }),
      el('dt', { text: '團隊角色' }), el('dd', { text: type.workStyle.teamRole }),
    ])),
    section('溝通與合作', el('dl', { class: 'kv' }, [
      el('dt', { text: '溝通風格' }), el('dd', { text: type.communication.style }),
      el('dt', { text: '與你共事的建議' }), el('dd', { text: type.communication.workingWithThem }),
    ])),
    section('適合的工作環境', list(type.workEnvironments)),
    section('職涯方向參考', [list(type.careerFields, 'tags'), el('p', { class: 'small muted', text: common.careerNote })]),
    section('延伸建議', list(common.nextSteps)),
    el('footer', { class: 'site-footer avoid-break' }, [el('p', { text: common.disclaimer })])
  );

  // 工具列
  const status = el('p', { class: 'small muted center', role: 'status', 'aria-live': 'polite' });
  const downloadBtn = el('button', { class: 'btn', type: 'button', text: '下載 PDF' });
  const printBtn = el('button', { class: 'btn btn-outline', type: 'button', text: '列印／另存 PDF' });
  downloadBtn.addEventListener('click', downloadPdf);
  printBtn.addEventListener('click', () => window.print());
  toolbar.replaceChildren(
    el('div', { class: 'card' }, [
      el('div', { class: 'btn-row center', style: 'margin-top:0' }, [
        downloadBtn,
        printBtn,
        el('a', { class: 'btn btn-outline', href: `result.html?${MBTI.encodeRaw(raw)}`, text: '返回結果' }),
      ]),
      status,
    ])
  );

  // 列印與匯出一律使用淺色版面
  const root = document.documentElement;
  let savedTheme = null;
  function useLightTheme() {
    savedTheme = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'light');
  }
  function restoreTheme() {
    if (savedTheme === null) root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', savedTheme);
  }
  window.addEventListener('beforeprint', useLightTheme);
  window.addEventListener('afterprint', restoreTheme);

  async function downloadPdf() {
    if (typeof window.html2pdf !== 'function') {
      status.textContent = '無法使用一鍵下載，已改為開啟列印視窗，請選擇「另存為 PDF」。';
      window.print();
      return;
    }
    downloadBtn.disabled = true;
    status.textContent = 'PDF 產生中，請稍候…';
    useLightTheme();
    document.body.classList.add('pdf-export');
    // iOS Safari 的 canvas 面積上限約 1,670 萬像素；依報告高度調降解析度（換頁留白另估 30%）
    const estHeight = report.offsetHeight * 1.3;
    const scale = Math.max(1, Math.min(2, Math.sqrt(14e6 / (720 * estHeight))));
    try {
      await window.html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          // 使用英數檔名，避免部分瀏覽器無法處理中文檔名
          filename: `MBTI16-${result.code}-report.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale, windowWidth: 800, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], avoid: '.avoid-break' },
        })
        .from(report)
        .save();
      status.textContent = 'PDF 已下載。若沒有看到檔案，請檢查瀏覽器的下載項目，或改用「列印／另存 PDF」。';
    } catch (e) {
      status.textContent = 'PDF 產生失敗，請改用「列印／另存 PDF」。';
    } finally {
      document.body.classList.remove('pdf-export');
      restoreTheme();
      downloadBtn.disabled = false;
    }
  }

  if (params.get('download') === '1') downloadPdf();
})();
