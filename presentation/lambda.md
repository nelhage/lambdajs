# The Lambda Calculus in One Hour

Nelson Elhage <nelhage@stripe.com>

---

# What this talk is

- Not very formal
- Mostly for fun!
- Hopefully mind-expanding

---

# The lambda calculus

---

- Formal system published by Alonzo Church in the 1930s
- ~Contemporaneous with Turing's paper
- Direct inspiration for the LISP family of languages

---

# Lambda calculus: terms

| Name | Syntax |
| ---- | ------ |
| Variable |  `x` |
| Abstraction | `λx.x`  |
| Application | `(M N)` |

---

# Lambda calculus: reductions

| Reduction | Operation |
| ---- | ------ |
| α-conversion | `λx.M` → `λy.M[x→y]` |
| β-reduction ("application") | `((λx.M) N)` → `M[x→N]` |

---

# Example

- `((λx.(x x)) (λy.y)`
- → `((λy.y) (λy.y))`
- → `((λy.y) (λz.z))`
- → `(λz.z)`

---

# Furious handwaving ensues

Note:

I'm going to essentially ignore all that. Instead, I'm going to
blithely assert that it's ~basically~ equivalent to a "real"
programming language where the only thing we can do is define and call
functions of one argument.

---

# Javascript

| Name | Syntax |
| ---- | ------ |
| Variable |  `x` |
| Abstraction | `x => y`  |
| Application | `M(N)` |

---

# Building computation from functions

---

# Agenda

- Basic primitives
- Boolean logic
- Numbers
- Data structures
- Loops

---

# Currying

```js
function(x,y,z) { … }
```

⇒

```js
(x => (y => (z => …)))
```

---

# Currying

```js
f(x, y, z)
```

⇒

```js
f(x)(y)(z);
```

---

# Assigning variables

```js
{
  const X = Y;
  …
}
```

⇒

```js
((X => …) Y)
```

---

# Boolean logic

```js
const true_  = a => b => a;
const false_ = a => b => b;
```
<!-- .element: class="fragment" -->

```
const if_    = a => b => c => a(b)(c);
```
<!-- .element: class="fragment" -->

---

# Boolean logic

```js
const not_   = a => if_(a)(false_)(true_);
```
<!-- .element: class="fragment" -->

```js
const and_   = a => b => a(b)(false_);
```
<!-- .element: class="fragment" -->

```js
const or_    = a => b => a(true_)(b);
```
<!-- .element: class="fragment" -->

---

# Church numerals

## Definition

- The integer _n_ is a function `n(f, x)` that applies `f` to `x`, `n`
  times.

---

# Church numerals: example

```js
const one  = f => x => f(x);
```
<!-- .element: class="fragment" -->

```
const two  = f => x => f(f(x));
```
<!-- .element: class="fragment" -->

```
const zero = f => x => x;
```
<!-- .element: class="fragment" -->

---

# Arithmetic

```js
const inc = n => f => x => f(n(f)(x));
```
<!-- .element: class="fragment" -->

```js
const add = a => b => a(inc)(b);
```
<!-- .element: class="fragment" -->

```js
const mul = a => b => a(add(b))(zero);
```
<!-- .element: class="fragment" -->

---

# Brain Teaser!

```js
const ??? = a => b => b(a);
```

---

# Subtraction

```js
const dec = n => f => x = f⁻¹(n(f(x))); // ?????
```
<!-- .element: class="fragment" -->

```
dec(n)(x => false);
```
<!-- .element: class="fragment" -->

---

# Data Structures

## "cons cells"

![cons cell](img/cons.png)
<!-- .element: style="background: white;" -->

```js
car(cons(x)(y)) === x;
cdr(cons(x)(y)) === y;
```

---

# Cons lists

![cons list](img/list.png)
<!-- .element: style="background: white;" -->

---

# Implementing cons

```js
const cons = a => b => c => c(a)(b);
```
<!-- .element: class="fragment" -->

```js
const car  = p => p(a => b => a);
const cdr  = p => p(a => b => b);
```
<!-- .element: class="fragment" -->

---

# Subtraction...

```js
const step = p => cons(cdr(p), inc(cdr(p)));
const init = cons(zero)(zero);
```
<!-- .element: class="fragment" -->

| step | value  |
| ---- | -----  |
|   0  | (0, 0) |
|   1  | (0, 1) |
|   2  | (1, 2) |
|   3  | (2, 3) |
|   …  |  …     |
<!-- .element: class="fragment" -->

---

# Subtraction

```js
const dec = n => car(n(p => cons(cdr(p))(inc(cdr(p))))
                      (cons(zero)(zero)));

const sub = a => b => b(dec)(a);
```

---

# Comparison

```js
const zerop = n => // ????
```

---

# Comparison

```js
const zerop = n => n(x => false_)(true_);
```

---

# Comparison

```js
const less_eq = a => b => zerop(sub(a)(b));
```
<!-- .element: class="fragment" -->

```js
const less    = a => b => zerop(sub(inc(a))(b));
```
<!-- .element: class="fragment" -->

```js
const equal   = a => b => and_(zerop(sub(a)(b)))
                              (zerop(sub(b)(a)));
```
<!-- .element: class="fragment" -->

---

# Recursion

---

# Problem: Implement factorial

```
fact(0) = 1
fact(n) = n*fact(n - 1)
```

---

# First try

```js
(fact => fact(5))(n =>
   if_(zerop(n))
      (_ => one)
      (_ => mul(n)(fact(dec(n)))))
```

---

# The problem

- apply β-reduction once:

```js
(fact => fact(5))(n =>
   if_(zerop(n))
      (_ => one)
      (_ => mul(n)(fact(dec(n))))())
```
β ⇒
```js
(n => if_(zerop(n))
         (_ => one)
         (_ => mul(n)(fact(dec(n)))))(5)
```

---

# Recursion

```js
(f => f(f))(f => f(f))
```
β ⇒
```js
(f => f(f))(f => f(f))
```

---

# Generalizing...

```js
const fact_ = recur => n => (
  if_(zerop(n))
     (_ => one)
     (_ => mul(n)(recur(recur)(dec(n))))());
```

```js
const fact1 = fact_(fact_);
```
<!-- .element: class="fragment" -->

---

# Generalizing...

- Writing `recur(recur)(...)` is annoying
- What we want to write is

```js
const fact = Magic(fact_ => n => (
  if_(zerop(n))
     (_ => one)
     (_ => mul(n)(fact_(dec(n))))()));

```

---

# Types

What is the type of

```js
fact_ => n => (
  if_(zerop(n))
     (_ => one)
     (_ => mul(n)(fact_(dec(n))))())
```
?

---

# Types

- It returns a factorial function
- It takes as input ... a factorial function
<!-- .element: class="fragment" -->
- <p>It has type `<factorial> → <factorial>` </p>
<!-- .element: class="fragment" -->
- <p>Concretely: `(<number> → <number>) → (<number> → <number>)`</p>
<!-- .element: class="fragment" -->

---

# Types

- What is the type of `Magic`?

```js
const fact = Magic(fact_ => n => (
  if_(zerop(n))
     (_ => one)
     (_ => mul(n)(fact_(dec(n))))()));

```

---

# Types

- It takes a `<factorial> → <factorial>`
- <p>It returns `<factorial>`</p>
<!-- .element: class="fragment" -->
- <p>It has type `(<factorial> → <factorial>) → <factorial>`</p>
<!-- .element: class="fragment" -->
- <p>Or in general: `(T → T) → T`</p>
<!-- .element: class="fragment" -->
