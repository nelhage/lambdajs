(function() {
  'use strict';

  const cons = a => b => c => c(a)(b);
  const car  = p => p(a => b => a);
  const cdr  = p => p(a => b => b);

  const true_  = a => b => a;
  const false_ = a => b => b;
  const if_    = a => b => c => a(b)(c);
  const and_   = a => b => a(b)(false_);
  const or_    = a => b => a(true_)(b);

  const zero_  = f => x => x;
  const one_   = f => x => f(x);
  const two_   = f => x => f(f(x));

  const inc    = n => f => x => f(n(f)(x));
  const add    = a => b => a(inc)(b);
  const mul    = a => b => a(n => add(n)(b))(zero_);
  const expt   = a => b => a(b)(zero_);

  const zerop  = n => n(_ => false_)(true_);

  const dec    = n => car(n(p => cons(cdr(p))(inc(cdr(p))))
                          (cons(zero_)(zero_)));
  const sub    = a => b => b(dec)(a);

  const less_eq = a => b => zerop(sub(a)(b));
  const less    = a => b => zerop(sub(inc(a))(b));

  const js2church = n => (n === 0) ? zero_ : inc(js2church(n-1));
  const church2js = n => n(x => x + 1)(0);

  const Y = f => ((g => f(x => g(g)(x)))
                  (g => f(x => g(g)(x))));

  const fact = Y(fact_ => n => (
    if_(zerop(n))(_ => one_)(_ => mul(n)(fact_(dec(n))))()));

  const mod = Y(mod => n => x =>
                (rem => if_(zerop(rem))(_ => n)(_ => mod(dec(rem))(x))())
                (sub(inc(n))(x)));

  const three_ = inc(inc(inc(zero_)));
  const five_  = inc(inc(three_));
  const fizzBuzzOne = n => (
    (m3 => m5 =>
     if_(and_(m3)(m5))
        ("FizzBuzz")
        (if_(m3)("Fizz")(if_(m5)("Buzz")(n))))
    (zerop(mod(n)(three_)))
    (zerop(mod(n)(five_))));
  const fizzBuzz = n => Y(
    iter => i =>
      if_(less(n)(i))(
        _ => cons(false_)(false_)
      )(
        _ => cons(true_)(cons(fizzBuzzOne(i))(iter(inc(i))))
      )()
  )(one_);

  function test() {
    const assert = require('assert');
    assert.strictEqual(99, church2js(dec(js2church(100))));
    assert.strictEqual(true,  zerop(zero_)(true)(false));
    assert.strictEqual(false, zerop(one_)(true)(false));
    assert.strictEqual(false, zerop(two_)(true)(false));
    assert.strictEqual(6, church2js(mul(js2church(3))(js2church(2))));
    assert.strictEqual(6, church2js(fact(js2church(3))));
    assert.strictEqual(2, church2js(mod(js2church(5))(js2church(3))));
    assert.strictEqual(2, church2js(mod(js2church(50))(js2church(6))));

    assert.strictEqual(1, church2js(fizzBuzzOne(js2church(1))));
    assert.strictEqual(2, church2js(fizzBuzzOne(js2church(2))));
    assert.strictEqual("Fizz", fizzBuzzOne(js2church(3)));
    assert.strictEqual("Buzz", fizzBuzzOne(js2church(5)));
    assert.strictEqual("FizzBuzz", fizzBuzzOne(js2church(15)));

    assert.strictEqual(true,  less_eq(js2church(15))(js2church(16))(true)(false));
    assert.strictEqual(false, less(js2church(5))(js2church(5))(true)(false));
    assert.strictEqual(false, less_eq(js2church(16))(js2church(15))(true)(false));
    assert.strictEqual(true,  less_eq(js2church(15))(js2church(15))(true)(false));
    assert.strictEqual(false, less(js2church(15))(js2church(15))(true)(false));

    let fb = fizzBuzz(js2church(100));
    while(car(fb)(true)(false)) {
      let elem = car(cdr(fb));
      if (typeof(elem) !== 'string') {
        elem = church2js(elem);
      }
      console.log(elem);
      fb = cdr(cdr(fb));
    }
  }

  test();
})();
