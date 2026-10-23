// 作答頁：每階段 10 題、共 6 階段；作答後自動捲到下一題，完成後前往結果頁
'use strict';

(async () => {
  const app = document.getElementById('app');
  const { el } = MBTI;
  const params = new URLSearchParams(location.search);
  const PAGE_SIZE = 10;
  const SCROLL_DELAY_MS = 250;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  let data;
  try {
    data = await MBTI.loadJSON('data/questions.json');
  } catch (e) {
    MBTI.showError(app, '題目載入失敗，請重新整理頁面再試一次。');
    return;
  }

  const questions = data.questions;
  const total = questions.length;
  const pageCount = Math.ceil(total / PAGE_SIZE);
  if (params.get('new') === '1') {
    MBTI.progress.clear();
    // 移除網址參數，避免重新整理頁面時再次清除作答進度
    history.replaceState(null, '', location.pathname);
  }
  const saved = MBTI.progress.load();
  const answers = saved ? saved.answers : {};
  // 相容舊版進度格式（一次一題時記錄的是題目索引 index）
  const savedPage = saved ? (Number.isInteger(saved.page) ? saved.page : Math.floor((saved.index | 0) / PAGE_SIZE)) : 0;
  let page = Math.min(Math.max(savedPage, 0), pageCount - 1);
  let scrollTimer = null;

  // 每次渲染後更新的元素參照
  let progressBar, progressBarFill, doneText, stageNote;

  const pageQuestions = (p) => questions.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE);
  const answeredCount = () => questions.filter((q) => answers[q.id]).length;
  const firstUnansweredPage = () => {
    const i = questions.findIndex((q) => !answers[q.id]);
    return i === -1 ? -1 : Math.floor(i / PAGE_SIZE);
  };

  function persist() {
    MBTI.progress.save({ version: data.version, page, answers });
  }

  function updateProgress() {
    const done = answeredCount();
    doneText.textContent = `已完成 ${done} / ${total} 題`;
    progressBar.setAttribute('aria-valuenow', String(done));
    progressBarFill.style.width = `${(done / total) * 100}%`;
    const left = pageQuestions(page).filter((q) => !answers[q.id]).length;
    stageNote.textContent = left ? `本階段還有 ${left} 題未作答` : '';
  }

  function questionCard(q) {
    const name = `q${q.id}`;
    const options = data.scale.map((opt) => {
      const input = el('input', { type: 'radio', name, value: String(opt.value) });
      if (answers[q.id] === opt.value) input.checked = true;
      input.addEventListener('change', () => choose(q, opt.value));
      return el('label', {}, [
        input,
        el('span', { class: 'dot', 'aria-hidden': 'true', text: String(opt.value) }),
        el('span', { class: 'visually-hidden', text: `${opt.value} ${opt.label}` }),
      ]);
    });
    const first = data.scale[0].label;
    const last = data.scale[data.scale.length - 1].label;
    return el('section', { class: 'card q-item', id: `q-${q.id}` }, [
      el('fieldset', {}, [
        el('legend', {}, [el('span', { class: 'q-num', text: `${q.id}.` }), q.text]),
        el('div', { class: 'likert' }, options),
        el('div', { class: 'likert-anchors', 'aria-hidden': 'true' }, [el('span', { text: first }), el('span', { text: last })]),
      ]),
      el('p', { class: 'q-missing-note', text: '請作答此題' }),
    ]);
  }

  function render() {
    const isLast = page === pageCount - 1;
    // 每個階段使用不同色系（css/style.css 的 body[data-stage]）
    document.body.dataset.stage = String(page + 1);
    MBTI.syncThemeColor();
    const stageTitle = el('div', { class: 'stage-title', tabindex: '-1', text: `第 ${page + 1} / ${pageCount} 階段` });
    doneText = el('span');
    progressBarFill = el('div', { class: 'progress-bar' });
    progressBar = el('div', {
      class: 'progress', role: 'progressbar', 'aria-label': '作答進度',
      'aria-valuemin': '0', 'aria-valuemax': String(total),
    }, [progressBarFill]);
    stageNote = el('p', { class: 'stage-note', role: 'status', 'aria-live': 'polite' });

    const prev = el('button', { class: 'btn btn-outline', type: 'button', text: '上一階段' });
    prev.disabled = page === 0;
    prev.addEventListener('click', () => goPage(page - 1));
    const next = el('button', { class: 'btn', type: 'button', text: isLast ? '查看結果' : '下一階段' });
    next.addEventListener('click', () => (isLast ? finish() : nextPage()));

    app.replaceChildren(...[
      el('div', { class: 'progress-wrap' }, [
        el('div', { class: 'progress-meta' }, [stageTitle, doneText]),
        progressBar,
      ]),
      page === 0 ? el('p', { class: 'small muted', text: data.instructions }) : null,
      ...pageQuestions(page).map(questionCard),
      el('div', { class: 'quiz-nav' }, [prev, next]),
      stageNote,
    ].filter(Boolean));
    updateProgress();
    return stageTitle;
  }

  function goPage(p) {
    clearTimeout(scrollTimer);
    if (p < 0 || p >= pageCount) return;
    page = p;
    persist();
    const title = render();
    window.scrollTo({ top: 0 });
    title.focus({ preventScroll: true });
  }

  function choose(q, value) {
    answers[q.id] = value;
    persist();
    document.getElementById(`q-${q.id}`).classList.remove('missing');
    updateProgress();

    // 自動捲到下一題（僅當下一題尚未作答，避免修改答案時畫面亂跳）
    clearTimeout(scrollTimer);
    const list = pageQuestions(page);
    const nextQ = list[list.indexOf(q) + 1];
    const target = nextQ
      ? (!answers[nextQ.id] ? document.getElementById(`q-${nextQ.id}`) : null)
      : app.querySelector('.quiz-nav');
    if (target) {
      scrollTimer = setTimeout(() => target.scrollIntoView({ behavior: scrollBehavior, block: nextQ ? 'center' : 'end' }), SCROLL_DELAY_MS);
    }
  }

  // 檢查本階段是否全部作答；未完成時標示並捲到第一個未作答題目
  function checkPage() {
    const missing = pageQuestions(page).filter((q) => !answers[q.id]);
    missing.forEach((q) => document.getElementById(`q-${q.id}`).classList.add('missing'));
    if (missing.length) {
      const card = document.getElementById(`q-${missing[0].id}`);
      card.scrollIntoView({ behavior: scrollBehavior, block: 'center' });
      card.querySelector('input').focus({ preventScroll: true });
      return false;
    }
    return true;
  }

  function nextPage() {
    if (checkPage()) goPage(page + 1);
  }

  function finish() {
    if (!checkPage()) return;
    const p = firstUnansweredPage();
    if (p !== -1) {
      goPage(p);
      checkPage();
      return;
    }
    const raw = MBTI.rawScores(data, answers);
    MBTI.progress.clear();
    location.href = 'result.html?' + MBTI.encodeRaw(raw);
  }

  render();
})();
