const assert = require('node:assert/strict');
const { Calculator, evaluate, format } = require('./calculator.js');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function type(text) { const c = new Calculator(); for (const char of text) { if ('+-*/'.includes(char)) c.operator(char); else c.digit(char); } return c; }
test('Addition, subtraction, multiplication, division', () => {
  for (const [input, expected] of [['12+8',20],['3-9',-6],['7*6',42],['81/9',9]]) assert.equal(type(input).preview().value, expected);
});
test('Precedence and left associativity', () => {
  for (const [input, expected] of [['2+3*4',14],['20-8/2',16],['24/4*2',12],['10-3-2',5],['10/2/5',1]]) assert.equal(type(input).preview().value, expected);
});
test('Floating point cleanup', () => assert.equal(type('0.1+0.2').preview().value, 0.3));
test('Division by zero is recoverable', () => { const c = type('5/0'); assert.match(c.preview().error, /zero/); assert.equal(c.equals(), null); c.digit('2'); assert.equal(c.preview().value, 2.5); });
test('Zero divided by zero', () => assert.match(type('0/0').preview().error, /zero/));
test('Trailing operator previews current result', () => assert.equal(type('2+3*').preview().value, 5));
test('Consecutive operators replace the pending operator', () => assert.equal(type('8+*2').preview().value, 16));
test('Leading decimal and duplicate decimal', () => assert.equal(type('.5..5').preview().value, .55));
test('Leading zeros', () => assert.deepEqual(type('00045').tokens, ['45']));
test('Negative initial input', () => assert.equal(type('-5+2').preview().value, -3));
test('Toggle sign of an operand', () => { const c = type('8*2'); c.sign(); assert.equal(c.preview().value, -16); c.sign(); assert.equal(c.preview().value, 16); });
test('Start a negative operand with sign', () => { const c = type('8*'); c.sign(); c.digit('2'); assert.equal(c.preview().value, -16); });
test('Percent divides current operand by 100', () => { const c = type('200*10'); c.percent(); assert.equal(c.preview().value, 20); });
test('Backspace operands and operators', () => { const c = type('12+34'); c.backspace(); assert.equal(c.preview().value,15); c.backspace(); assert.equal(c.preview().value,12); c.backspace(); assert.deepEqual(c.tokens,['12']); });
test('Equals returns history; repeated equals is idempotent', () => { const c=type('2+3*4'); assert.deepEqual(c.equals(),{expression:'2 + 3 × 4',result:'14'}); assert.equal(c.equals(),null); });
test('Digit after equals begins a fresh calculation', () => { const c=type('2+3'); c.equals(); c.digit('7'); assert.equal(c.preview().value,7); });
test('Operator after equals continues from result', () => { const c=type('2+3'); c.equals(); c.operator('*'); c.digit('4'); assert.equal(c.preview().value,20); });
test('Recall and continue', () => { const c=new Calculator(); c.recall('-2.5'); c.operator('+'); c.digit('5'); assert.equal(c.preview().value,2.5); });
test('Clear resets state', () => { const c=type('2+3'); c.equals(); c.clear(); assert.equal(c.preview().value,0); assert.equal(c.expression(),''); assert.equal(c.finished,false); });
test('Finite overflow error and scientific formatting', () => { assert.throws(()=>evaluate(['1e308','*','100']),/too large/); assert.equal(format(1e15),'1e15'); assert.equal(format(1e-9),'1e-9'); });
test('Limit input precision', () => assert.equal(type('12345678901234567').tokens[0].length,15));
test('Arbitrary text cannot enter engine', () => { const c=new Calculator(); c.digit('alert(1)'); c.operator('**'); assert.deepEqual(c.tokens,[]); });
console.log('\n' + passed + ' checks passed.');
