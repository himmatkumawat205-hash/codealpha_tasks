(() => {
  'use strict';
  const { Calculator, format, isOperator } = window.SumMath;
  const calculator = new Calculator();
  const result = document.querySelector('#result');
  const expression = document.querySelector('#expression');
  const state = document.querySelector('#result-state');
  const keypad = document.querySelector('.keypad');
  const historyContent = document.querySelector('#history-content');
  const emptyHistory = historyContent.firstElementChild.cloneNode(true);
  const clearHistory = document.querySelector('#clear-history');
  const dialog = document.querySelector('#shortcuts-dialog');
  const storageKey = 'sum-calculator-history-v1';
  let history = [];
  let toastTimer;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) history = saved.filter(item => item && typeof item.expression === 'string' && item.expression.length <= 4000 && typeof item.result === 'string' && item.result.length <= 32 && item.result.trim() !== '' && Number.isFinite(Number(item.result))).slice(0, 8);
  } catch { /* The calculator also works when browser storage is unavailable. */ }
  function notify(message) {
    const toast = document.querySelector('#toast');
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
  }
  function saveHistory() {
    try { localStorage.setItem(storageKey, JSON.stringify(history)); } catch { /* Session history remains usable. */ }
  }
  function renderHistory() {
    historyContent.replaceChildren();
    document.querySelector('#history-count').textContent = String(history.length).padStart(2, '0');
    clearHistory.disabled = history.length === 0;
    if (!history.length) { historyContent.append(emptyHistory.cloneNode(true)); return; }
    const list = document.createElement('ol');
    list.className = 'history-list';
    history.forEach(entry => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.className = 'history-item';
      button.setAttribute('aria-label', 'Reuse result ' + format(Number(entry.result)) + ' from ' + entry.expression);
      const equation = document.createElement('span');
      equation.className = 'history-expression';
      equation.textContent = entry.expression + ' =';
      const answer = document.createElement('span');
      answer.className = 'history-result';
      answer.textContent = format(Number(entry.result));
      button.append(equation, answer);
      button.addEventListener('click', () => { calculator.recall(entry.result); render(); notify('Result ready to use'); });
      item.append(button);
      list.append(item);
    });
    historyContent.append(list);
    historyContent.scrollTop = 0;
  }
  function render() {
    const current = calculator.preview();
    const text = current.error || format(current.value);
    result.textContent = text;
    result.classList.toggle('error', Boolean(current.error));
    result.classList.toggle('long', !current.error && text.length > 11);
    expression.textContent = calculator.expression() || 'Start with a number';
    expression.scrollLeft = expression.scrollWidth;
    const stateText = current.error ? 'CHECK YOUR CALCULATION' : calculator.finished ? 'RESULT' : calculator.tokens.length ? 'LIVE RESULT' : 'READY WHEN YOU ARE';
    state.replaceChildren(document.createElement('i'), document.createTextNode(stateText));
    document.querySelector('#copy-result').disabled = Boolean(current.error);
    keypad.querySelectorAll('[data-operator]').forEach(button => button.classList.toggle('active', isOperator(calculator.tokens.at(-1)) && button.dataset.operator === calculator.tokens.at(-1)));
  }
  function activate(button) {
    if (!button) return;
    if (button.dataset.digit !== undefined) calculator.digit(button.dataset.digit);
    else if (button.dataset.operator) calculator.operator(button.dataset.operator);
    else {
      const action = button.dataset.action;
      if (action === 'equals') {
        const entry = calculator.equals();
        if (entry) { history.unshift(entry); history = history.slice(0, 8); saveHistory(); renderHistory(); }
      } else if (['clear', 'sign', 'percent', 'backspace'].includes(action)) calculator[action]();
    }
    button.classList.remove('pressed');
    requestAnimationFrame(() => { button.classList.add('pressed'); setTimeout(() => button.classList.remove('pressed'), 120); });
    render();
  }
  keypad.addEventListener('click', event => activate(event.target.closest('button')));
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || dialog.open || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) || event.target.isContentEditable) return;
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('button') && !event.target.closest('.keypad')) return;
    let button;
    if (/^[0-9.]$/.test(event.key)) button = keypad.querySelector('[data-digit="' + event.key + '"]');
    else if (['+', '-', '*', '/'].includes(event.key)) button = keypad.querySelector('[data-operator="' + event.key + '"]');
    else {
      const actions = { Enter: 'equals', '=': 'equals', Escape: 'clear', Delete: 'clear', Backspace: 'backspace', '%': 'percent', F9: 'sign' };
      if (actions[event.key]) button = keypad.querySelector('[data-action="' + actions[event.key] + '"]');
    }
    if (button) { event.preventDefault(); button.focus({ preventScroll: true }); activate(button); }
  });
  clearHistory.addEventListener('click', () => { history = []; saveHistory(); renderHistory(); notify('History cleared'); });
  document.querySelector('#copy-result').addEventListener('click', async () => {
    const current = calculator.preview();
    if (current.error) return;
    try { await navigator.clipboard.writeText(String(current.value)); notify('Result copied'); }
    catch { notify('Copy unavailable — select the result to copy it.'); }
  });
  document.querySelector('#show-shortcuts').addEventListener('click', () => dialog.showModal());
  document.querySelector('#close-shortcuts').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
  render();
  renderHistory();
})();
