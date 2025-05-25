import test from 'ava';

function add(a, b) {
  return a + b;
}

test('addition integration test', t => {
  t.is(add(2, 3), 5);
  t.is(add(-1, 1), 0);
});

test('addition edge cases integration test', t => {
  t.is(add(0, 0), 0);
  t.is(add(1.5, 2.5), 4);
});
