// 16型MBTI性格探索 — 共用功能：載入資料、計分、結果網址、長條圖
'use strict';

const MBTI = (() => {
  const RAW_MIN = 15;
  const RAW_MAX = 75;
  const PROGRESS_KEY = 'mbti-progress-v1';

  async function loadJSON(path) {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`無法載入 ${path}（HTTP ${res.status}）`);
    return res.json();
  }

  // 依題庫把作答（題號 → 1～5）換算為各向度原始分數（朝向第一端 E/S/T/J）
  function rawScores(questionsData, answers) {
    return questionsData.dimensions.map((dim) => {
      const first = dim.poles[0].letter;
      return questionsData.questions
        .filter((q) => q.dimension === dim.id)
        .reduce((sum, q) => {
          const v = answers[q.id];
          if (!(v >= 1 && v <= 5)) throw new Error(`第 ${q.id} 題尚未作答`);
          return sum + (q.pole === first ? v : 6 - v);
        }, 0);
    });
  }

  // 原始分數 → 傾向值、字母與類型代碼
  function analyze(raw, questionsData) {
    const [lo, hi] = questionsData.scoring.unclearRange;
    const dims = questionsData.dimensions.map((dim, i) => {
      const firstPct = ((raw[i] - RAW_MIN) / (RAW_MAX - RAW_MIN)) * 100;
      const [first, second] = dim.poles;
      let letter;
      if (firstPct > 50) letter = first.letter;
      else if (firstPct < 50) letter = second.letter;
      else letter = dim.tieBreaker;
      return {
        id: dim.id,
        name: dim.name,
        first,
        second,
        firstPct,
        secondPct: 100 - firstPct,
        letter,
        unclear: firstPct >= lo && firstPct <= hi,
      };
    });
    return { code: dims.map((d) => d.letter).join(''), dims };
  }

  // 結果網址參數：?r=EI,SN,TF,JP 四個原始分數（15～75 的整數）
  function encodeRaw(raw) {
    return 'r=' + raw.join(',');
  }

  function parseRaw(search) {
    const value = new URLSearchParams(search).get('r');
    if (!value) return null;
    const parts = value.split(',');
    if (parts.length !== 4) return null;
    const nums = parts.map((p) => (/^\d{1,2}$/.test(p) ? Number(p) : NaN));
    if (nums.some((n) => !(n >= RAW_MIN && n <= RAW_MAX))) return null;
    return nums;
  }

  // 瀏覽器儲存僅用於暫存作答進度；無法使用時不影響作答
  const progress = {
    load() {
      try {
        const data = JSON.parse(localStorage.getItem(PROGRESS_KEY));
        return data && typeof data.answers === 'object' ? data : null;
      } catch (e) {
        return null;
      }
    },
    save(data) {
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
      } catch (e) {
        /* 忽略 */
      }
    },
    clear() {
      try {
        localStorage.removeItem(PROGRESS_KEY);
      } catch (e) {
        /* 忽略 */
      }
    },
  };

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    }
    for (const child of [].concat(children)) {
      if (child == null) continue;
      node.append(child instanceof Node ? child : document.createTextNode(child));
    }
    return node;
  }

  function list(items, className) {
    return el('ul', className ? { class: className } : {}, items.map((t) => el('li', { text: t })));
  }

  // 四向度長條圖
  function renderDimensions(container, result, typesData, withDescriptions) {
    container.replaceChildren();
    for (const d of result.dims) {
      const firstPct = Math.round(d.firstPct);
      const secondPct = 100 - firstPct;
      const firstChosen = d.letter === d.first.letter;
      const label = `${d.name}：${d.first.name} ${d.first.letter} ${firstPct}%，${d.second.name} ${d.second.letter} ${secondPct}%`;
      const row = el('div', { class: 'dim-row avoid-break' }, [
        el('div', { class: 'dim-title' }, [el('span', { text: d.name })]),
        el('div', { class: 'dim-ends' }, [
          el('span', { class: firstChosen ? 'chosen' : '', text: `${d.first.letter} ${d.first.name} ${firstPct}%` }),
          el('span', { class: firstChosen ? '' : 'chosen', text: `${secondPct}% ${d.second.name} ${d.second.letter}` }),
        ]),
        el('div', { class: 'bar', role: 'img', 'aria-label': label }, [
          el('div', { class: 'bar-first', style: `width:${firstPct}%` }),
          el('div', { class: 'bar-second', style: `width:${secondPct}%` }),
        ]),
      ]);
      if (withDescriptions) {
        const pole = typesData.poles[d.letter];
        row.append(el('p', { class: 'small muted', style: 'margin:6px 0 0' }, `${d.letter}（${pole.name}）：${pole.description}`));
      }
      if (d.unclear) row.append(el('div', { class: 'dim-unclear', text: typesData.common.unclearNote }));
      container.append(row);
    }
  }

  function showError(container, message) {
    container.replaceChildren(
      el('div', { class: 'card error-box' }, [
        el('p', { text: message }),
        el('div', { class: 'btn-row center' }, [el('a', { class: 'btn', href: 'index.html', text: '回到首頁' })]),
      ])
    );
  }

  // App 內建瀏覽器（LINE、Facebook 等）常無法下載檔案，提示改用一般瀏覽器開啟
  function inAppBrowserName() {
    const ua = navigator.userAgent;
    if (/\bLine\//i.test(ua)) return 'LINE';
    if (/FBAN|FBAV/.test(ua)) return 'Facebook';
    if (/Instagram/.test(ua)) return 'Instagram';
    if (/MicroMessenger/i.test(ua)) return '微信';
    return null;
  }

  function inAppNotice() {
    const name = inAppBrowserName();
    if (!name) return null;
    const box = el('p', { class: 'notice small' }, [
      `你目前在 ${name} 的內建瀏覽器中，可能無法下載 PDF。建議改用 Safari 或 Chrome 開啟本頁。`,
    ]);
    if (name === 'LINE') {
      // LINE 支援 openExternalBrowser=1 參數，以手機預設瀏覽器開啟連結
      const url = new URL(location.href);
      url.searchParams.set('openExternalBrowser', '1');
      box.append(' ', el('a', { href: url.toString(), text: '用預設瀏覽器開啟' }));
    }
    return box;
  }

  // 深色／淺色模式切換：選擇記在瀏覽器；沒有選擇時跟隨系統設定
  const THEME_KEY = 'mbti-theme';
  const SUN = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>';

  function currentTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function syncThemeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.body).getPropertyValue('--accent').trim();
  }

  function initThemeToggle() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const btn = el('button', { class: 'theme-toggle no-print', type: 'button' });
    const update = () => {
      const dark = currentTheme() === 'dark';
      // 顯示「按下後會切換成」的模式圖示
      btn.innerHTML = dark ? SUN : MOON;
      const label = dark ? '切換為淺色模式' : '切換為深色模式';
      btn.setAttribute('aria-label', label);
      btn.title = label;
      syncThemeColor();
    };
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* 無法儲存時本頁仍可切換 */
      }
      update();
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', update);
    header.append(btn);
    update();
  }

  initThemeToggle();

  // 網站切換導覽列：Holland 職業興趣探索仍在效度驗證中（O*NET 授權規定推出前不得公開推廣），
  // 因此只對曾開啟過 Holland 網站的研究參與者顯示。正式推出後，改為一律顯示即可。
  function initSiteNav() {
    let visited = false;
    try {
      visited = localStorage.getItem('holland-visited') === '1';
    } catch (e) {
      /* 無法讀取時不顯示 */
    }
    const header = document.querySelector('.site-header');
    if (!visited || !header) return;
    header.before(el('nav', { class: 'site-nav no-print', 'aria-label': '網站切換' }, [
      el('a', { href: 'index.html', 'aria-current': 'page', text: '16型性格探索' }),
      el('a', { href: '../holland/', text: '職業興趣探索' }),
    ]));
  }

  initSiteNav();

  return { loadJSON, rawScores, analyze, encodeRaw, parseRaw, progress, el, list, renderDimensions, showError, syncThemeColor, inAppNotice };
})();
