// 作答頁：一次一題，作答後自動前往下一題，完成後前往結果頁
'use strict';

(async () => {
  const app = document.getElementById('app');
  const { el } = MBTI;
  const params = new URLSearchParams(location.search);
  const AUTO_ADVANCE_MS = 280;

  let data;
  try {
    data = await MBTI.loadJSON('data/questions.json');
  } catch (e) {
    MBTI.showError(app, '題目載入失敗，請重新整理頁面再試一次。');
    return;
  }

  const questions = data.questions;
  const total = questions.length;
  if (params.get('new') === '1') MBTI.progress.clear();
  const saved = MBTI.progress.load();
  const answers = saved ? saved.answers : {};
  let index = saved ? Math.min(Math.max(saved.index | 0, 0), total - 1) : 0;
  let advanceTimer = null;

  const answeredCount = () => questions.filter((q) => answers[q.id]).length;
  const firstUnanswered = () => questions.findIndex((q) => !answers[q.id]);

  function persist() {
    MBTI.progress.save({ version: data.version, index, answers });
  }

  function render(focus) {
    const q = questions[index];
    const done = answeredCount();
    const isLast = index === total - 1;

    const scale = el('div', { class: 'scale' },
      data.scale.map((opt) => {
        const input = el('input', { type: 'radio', name: `q${q.id}`, value: String(opt.value) });
        if (answers[q.id] === opt.value) input.checked = true;
        input.addEventListener('change', () => choose(opt.value));
        return el('label', {}, [input, el('span', {}, [el('span', { class: 'num', text: String(opt.value) }), opt.label])]);
      })
    );

    const prev = el('button', { class: 'btn btn-outline', type: 'button', text: '上一題' });
    prev.disabled = index === 0;
    prev.addEventListener('click', () => go(index - 1));

    const next = el('button', { class: 'btn', type: 'button', text: isLast ? '查看結果' : '下一題' });
    next.disabled = isLast ? done < total : !answers[q.id];
    next.addEventListener('click', () => (isLast ? finish() : go(index + 1)));

    const heading = el('div', { tabindex: '-1', class: 'question-focus' });
    app.replaceChildren(...[
      el('div', { class: 'progress-wrap' }, [
        el('div', { class: 'progress-meta' }, [
          el('span', { text: `第 ${index + 1} / ${total} 題` }),
          el('span', { text: `已完成 ${done} 題` }),
        ]),
        el('div', {
          class: 'progress', role: 'progressbar', 'aria-label': '作答進度',
          'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(done),
        }, [el('div', { class: 'progress-bar', style: `width:${(done / total) * 100}%` })]),
      ]),
      el('section', { class: 'card question' }, [
        heading,
        el('fieldset', {}, [el('legend', { text: q.text }), scale]),
      ]),
      el('div', { class: 'quiz-nav' }, [prev, next]),
      isLast && done < total
        ? el('p', { class: 'small muted center' }, [`還有 ${total - done} 題未作答，`, unansweredLink()])
        : null,
      index === 0 ? el('p', { class: 'small muted center', text: data.instructions }) : null,
      el('p', { class: 'small muted center kbd-hint', text: '提示：可用鍵盤數字鍵 1～5 作答，← 鍵回上一題。' }),
    ].filter(Boolean));
    if (focus) heading.focus({ preventScroll: true });
  }

  function unansweredLink() {
    const btn = el('button', { class: 'btn-text', type: 'button', text: '前往未作答的題目' });
    btn.addEventListener('click', () => go(firstUnanswered()));
    return btn;
  }

  function go(i) {
    clearTimeout(advanceTimer);
    if (i < 0 || i >= total) return;
    index = i;
    persist();
    render(true);
    window.scrollTo({ top: 0 });
  }

  function choose(value) {
    const q = questions[index];
    answers[q.id] = value;
    persist();
    clearTimeout(advanceTimer);
    if (index < total - 1) {
      render(false);
      const from = index;
      advanceTimer = setTimeout(() => { if (index === from) go(index + 1); }, AUTO_ADVANCE_MS);
    } else {
      render(false);
    }
  }

  function finish() {
    const missing = firstUnanswered();
    if (missing !== -1) {
      go(missing);
      return;
    }
    const raw = MBTI.rawScores(data, answers);
    MBTI.progress.clear();
    location.href = 'result.html?' + MBTI.encodeRaw(raw);
  }

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (/^[1-5]$/.test(e.key)) {
      const input = app.querySelector(`input[value="${e.key}"]`);
      if (input) {
        input.checked = true;
        choose(Number(e.key));
      }
    } else if (e.key === 'ArrowLeft' && !(e.target instanceof HTMLInputElement)) {
      go(index - 1);
    }
  });

  render(false);
})();
