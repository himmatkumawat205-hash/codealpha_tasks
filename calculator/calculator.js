/* A small, explicit arithmetic engine. User input is never executed as code. */
(function (root) {
  'use strict';
  const isOperator = value => ['+', '-', '*', '/'].includes(value);
  const clean = value => {
    if (!Number.isFinite(value)) throw new Error('Result is too large');
    return Number(value.toPrecision(15));
  };
  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  function evaluate(tokens) {
    const input = [...tokens];
    if (isOperator(input.at(-1))) input.pop();
    if (!input.length) return 0;
    let term = Number(input[0]);
    let total = 0;
    let direction = 1;
    for (let i = 1; i < input.length; i += 2) {
      const operator = input[i];
      const value = Number(input[i + 1]);
      if (operator === '*') term *= value;
      else if (operator === '/') {
        if (value === 0) throw new Error('Cannot divide by zero');
        term /= value;
      } else {
        total += direction * term;
        direction = operator === '+' ? 1 : -1;
        term = value;
      }
      if (!Number.isFinite(term) || !Number.isFinite(total)) throw new Error('Result is too large');
    }
    return clean(total + direction * term);
  }
  function format(value) {
    if (Object.is(value, -0)) value = 0;
    if (value !== 0 && (Math.abs(value) >= 1e12 || Math.abs(value) < 1e-7)) {
      return value.toExponential(9).replace(/\.?0+e/, 'e').replace('e+', 'e');
    }
    return value.toLocaleString('en-US', { maximumSignificantDigits: 12 });
  }
  function expressionText(tokens) {
    return tokens.map((token, index) => {
      if (isOperator(token)) return symbols[token];
      const negative = token.startsWith('-');
      const text = token.replace('-', '−');
      return negative && index > 0 ? '(' + text + ')' : text;
    }).join(' ');
  }
  class Calculator {
    constructor() { this.clear(); }
    clear() { this.tokens = []; this.finished = false; this.completedExpression = ''; }
    digit(digit) {
      if (!/^[0-9.]$/.test(digit)) return;
      if (this.finished) this.clear();
      if (!this.tokens.length || isOperator(this.tokens.at(-1))) this.tokens.push('0');
      let current = this.tokens.at(-1);
      if (current.includes('e')) current = '0';
      if (digit === '.') {
        if (!current.includes('.')) current += '.';
      } else {
        if (current.replace(/[-.]/g, '').length >= 15) return;
        current = current === '0' ? digit : current === '-0' ? '-' + digit : current + digit;
      }
      this.tokens[this.tokens.length - 1] = current;
    }
    operator(operator) {
      if (!isOperator(operator)) return;
      this.finished = false;
      this.completedExpression = '';
      if (!this.tokens.length) {
        if (operator === '-') { this.tokens.push('-0'); return; }
        this.tokens.push('0');
      }
      if (isOperator(this.tokens.at(-1))) this.tokens[this.tokens.length - 1] = operator;
      else if (this.tokens.length < 199) this.tokens.push(operator);
    }
    sign() {
      this.finished = false;
      this.completedExpression = '';
      if (!this.tokens.length || isOperator(this.tokens.at(-1))) this.tokens.push('0');
      const current = this.tokens.at(-1);
      this.tokens[this.tokens.length - 1] = current.startsWith('-') ? current.slice(1) : '-' + current;
    }
    percent() {
      if (!this.tokens.length || isOperator(this.tokens.at(-1))) return;
      this.finished = false;
      this.completedExpression = '';
      this.tokens[this.tokens.length - 1] = String(clean(Number(this.tokens.at(-1)) / 100));
    }
    backspace() {
      this.finished = false;
      this.completedExpression = '';
      const current = this.tokens.at(-1);
      if (!current) return;
      if (isOperator(current)) this.tokens.pop();
      else if (current.includes('e') || current.length === 1 || (current.length === 2 && current[0] === '-')) this.tokens.pop();
      else this.tokens[this.tokens.length - 1] = current.slice(0, -1);
    }
    preview() {
      try { return { value: evaluate(this.tokens), error: null }; }
      catch (error) { return { value: null, error: error.message }; }
    }
    equals() {
      if (!this.tokens.length || this.finished) return null;
      const result = this.preview();
      if (result.error) return null;
      const complete = [...this.tokens];
      if (isOperator(complete.at(-1))) complete.pop();
      const entry = { expression: expressionText(complete), result: String(result.value) };
      this.completedExpression = entry.expression;
      this.tokens = [entry.result];
      this.finished = true;
      return entry;
    }
    recall(value) {
      if (!Number.isFinite(Number(value))) return;
      this.tokens = [String(Number(value))];
      this.finished = true;
      this.completedExpression = '';
    }
    expression() { return this.completedExpression ? this.completedExpression + ' =' : expressionText(this.tokens); }
  }
  const api = { Calculator, evaluate, format, expressionText, isOperator };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SumMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
