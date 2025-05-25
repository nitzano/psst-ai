import test from 'ava';

class Calculator {
  add(a, b) {
    return a + b;
  }

  multiply(a, b) {
    return a * b;
  }
}

test('Calculator unit tests', t => {
  const calc = new Calculator();
  
  t.is(calc.add(2, 3), 5);
  t.is(calc.multiply(4, 5), 20);
});
