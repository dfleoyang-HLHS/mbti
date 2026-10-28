// 簡易結果頁：類型代碼、四向度長條圖、簡易引導與完整報告入口
'use strict';

(async () => {
  const app = document.getElementById('app');
  const { el } = MBTI;

  const raw = MBTI.parseRaw(location.search);
  if (!raw) {
    MBTI.showError(app, '找不到有效的測驗結果，請先完成測驗。');
    return;
  }

  let questionsData, typesData;
  try {
    [questionsData, typesData] = await Promise.all([
      MBTI.loadJSON('data/questions.json'),
      MBTI.loadJSON('data/types.json'),
    ]);
  } catch (e) {
    MBTI.showError(app, '資料載入失敗，請重新整理頁面再試一次。');
    return;
  }

  const result = MBTI.analyze(raw, questionsData);
  // 已完成 Holland 測驗時，可直接查看整合報告
  let hollandResult = null;
  try {
    hollandResult = localStorage.getItem('holland-last-result');
  } catch (e) {
    /* 忽略 */
  }
  const type = typesData.types.find((t) => t.code === result.code);
  const common = typesData.common;
  const query = MBTI.encodeRaw(raw);
  document.title = `${result.code} ${type.name}｜16型MBTI性格探索`;

  const dimsBox = el('div');
  MBTI.renderDimensions(dimsBox, result, typesData, false);

  app.replaceChildren(...[
    el('section', { class: 'card type-hero' }, [
      el('div', { class: 'type-label', text: '你的類型代碼' }),
      el('div', { class: 'type-code', text: result.code }),
      el('div', { class: 'type-name', text: type.name }),
      el('p', { class: 'type-tagline', text: type.tagline }),
    ]),
    el('section', { class: 'card' }, [el('h2', { text: '四個向度的傾向' }), dimsBox]),
    el('section', { class: 'card' }, [
      el('h2', { text: '如何解讀你的結果' }),
      MBTI.list(common.resultGuide),
      el('p', { text: type.overview }),
    ]),
    el('section', { class: 'card center' }, [
      el('h2', { text: '想更深入了解自己？' }),
      el('p', { text: common.reportInvite }),
      el('div', { class: 'btn-row center' }, [
        el('a', { class: 'btn', href: `report.html?${query}`, text: '查看完整報告' }),
        el('a', { class: 'btn btn-outline', href: `report.html?${query}&download=1`, text: '下載完整報告（PDF）' }),
      ]),
      MBTI.inAppNotice(),
      el('p', { class: 'small muted', style: 'margin-top:12px' }, '小提醒：把這個頁面加入書籤，日後即可再次查看你的結果。'),
    ]),
    MBTI.showHollandEntry()
      ? el('section', { class: 'card center' }, [
          el('h2', { text: '下一步：探索你的職業興趣' }),
          el('p', { text: '16 型說明你「習慣怎麼做事」；Holland 職業興趣探索說明你「喜歡做什麼」。兩者搭配，可以更完整地思考職涯方向。' }),
          el('p', { class: 'notice small', text: 'Holland 職業興趣探索目前為研究用版本：中文題目仍在進行效度驗證研究，結果僅供參考。' }),
          el('div', { class: 'btn-row center' }, [
            hollandResult
              ? el('a', { class: 'btn', href: `../holland/combined.html?m=${raw.join(',')}&h=${hollandResult}`, text: '查看整合報告' })
              : null,
            el('a', { class: 'btn btn-outline', href: '../holland/', text: hollandResult ? '前往 Holland 職業興趣探索' : '開始 Holland 職業興趣探索' }),
          ]),
        ])
      : null,
    el('div', { class: 'btn-row center' }, [el('a', { class: 'btn-text', href: 'quiz.html?new=1', text: '重新測驗' })]),
    el('footer', { class: 'site-footer' }, [el('p', { text: common.disclaimer })]),
  ].filter(Boolean));
})();
