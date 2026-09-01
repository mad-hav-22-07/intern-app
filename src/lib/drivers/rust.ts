import type { CType, Signature } from '../harness'
import { MARK, argName, callArgs, readArgs } from './shared'

/**
 * Rust driver.
 *
 * Shape of the student's code follows LeetCode's Rust track: the harness
 * declares `struct Solution;` and the student writes only
 * `impl Solution { pub fn ... }` above it — not the struct itself, unlike the
 * C++ driver where the student's own `class Solution { ... };` is the whole
 * thing.
 *
 * Arguments are passed by value (owned `Vec<_>` / `String`), not references.
 * The method runs exactly once per case against freshly-read values, so there
 * is nothing to gain from borrowing and it keeps the ownership story simple
 * for a student — no lifetimes to reason about in a signature they didn't
 * write.
 *
 * The signature's camelCase name (`twoSum`) is converted to Rust's
 * conventional snake_case (`two_sum`) for both the call site here and the
 * generated starter, so the two stay in lockstep.
 *
 * `int` maps to `i64`, not `i32`: several problems' expected answers exceed
 * 32 bits, and there's no upside to the narrower type in a judge harness.
 */

/** `twoSum` -> `two_sum`. Used for both the call site and the starter, so the
 * two are always consistent. */
function snakeCase(name: string): string {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase()
}

export function rustDriver(sig: Signature, user: string) {
  const fn = snakeCase(sig.name)
  return `#![allow(dead_code, unused_imports, unused_variables, unused_mut)]
use std::collections::VecDeque;
use std::io::{self, Read, Write};
use std::panic::{self, AssertUnwindSafe};
use std::time::Instant;

struct Solution;

${user}

// ------------------------------------------------------------------ harness
// One global line queue, filled by slurping stdin once up front. Every reader
// below is a free function taking no arguments — that is what lets
// \`shared.ts\`'s READ table (\`_rint()\`, \`_rints()\`, ...) stay identical text
// across every language's driver.
thread_local! {
    static _LINES: std::cell::RefCell<VecDeque<String>> = std::cell::RefCell::new(VecDeque::new());
}

fn _fill() {
    let mut buf = String::new();
    io::stdin().read_to_string(&mut buf).unwrap();
    _LINES.with(|l| {
        let mut l = l.borrow_mut();
        for line in buf.lines() {
            l.push_back(line.to_string());
        }
    });
}

fn _rl() -> String {
    _LINES.with(|l| l.borrow_mut().pop_front().unwrap_or_default())
}

fn _rint() -> i64 {
    _rl().trim().parse().unwrap()
}
fn _rdbl() -> f64 {
    _rl().trim().parse().unwrap()
}
fn _rbool() -> bool {
    _rl().trim() == "1"
}
fn _rstr() -> String {
    _rl()
}
fn _rints() -> Vec<i64> {
    let n = _rint() as usize;
    let line = _rl();
    if n == 0 {
        return Vec::new();
    }
    line.split_whitespace().take(n).map(|x| x.parse().unwrap()).collect()
}
fn _rstrs() -> Vec<String> {
    let n = _rint() as usize;
    (0..n).map(|_| _rl()).collect()
}
fn _rintss() -> Vec<Vec<i64>> {
    let r = _rint() as usize;
    (0..r).map(|_| _rints()).collect()
}

// Rust has no function overloading, so \`_fmt\` is a trait implemented for
// every value shape a signature's \`returns\` can produce, rather than a
// single overloaded free function like the C++ driver's.
trait _Fmt {
    fn _fmt(&self) -> String;
}
impl _Fmt for i64 {
    fn _fmt(&self) -> String {
        self.to_string()
    }
}
impl _Fmt for bool {
    fn _fmt(&self) -> String {
        if *self { "true".to_string() } else { "false".to_string() }
    }
}
impl _Fmt for String {
    fn _fmt(&self) -> String {
        self.clone()
    }
}
impl _Fmt for f64 {
    fn _fmt(&self) -> String {
        // Approximates C++'s default \`ostringstream <<\` (6 significant
        // digits, trailing zeros trimmed) for the magnitudes these problems
        // use. Not a general %g: no scientific notation for huge/tiny values.
        let v = *self;
        if v == v.trunc() && v.abs() < 1e15 {
            return (v.trunc() as i64).to_string();
        }
        let mut s = format!("{:.6}", v);
        while s.ends_with('0') {
            s.pop();
        }
        if s.ends_with('.') {
            s.pop();
        }
        s
    }
}
impl<T: _Fmt> _Fmt for Vec<T> {
    fn _fmt(&self) -> String {
        format!("[{}]", self.iter().map(|x| x._fmt()).collect::<Vec<_>>().join(","))
    }
}

fn main() {
    // Stop the default panic hook printing a backtrace to stderr on every
    // caught panic — a bad case should look like one failed line, not noise.
    panic::set_hook(Box::new(|_| {}));
    _fill();
    let _t = _rint();
    let mut _out = io::stdout();
    for _i in 0.._t {
${readArgs(sig, (n, c) => `        let ${n} = ${c};`)}
        let _c0 = Instant::now();
        let _r = panic::catch_unwind(AssertUnwindSafe(move || Solution::${fn}(${callArgs(sig)})));
        let _us = _c0.elapsed().as_micros();
        match _r {
            Ok(_v) => {
                writeln!(_out, "${MARK}{}|1|{}|{}", _i, _us, _v._fmt()).unwrap();
            }
            Err(_e) => {
                let _msg = if let Some(_s) = _e.downcast_ref::<&str>() {
                    _s.to_string()
                } else if let Some(_s) = _e.downcast_ref::<String>() {
                    _s.clone()
                } else {
                    "panicked".to_string()
                }
                .replace('\\n', " ");
                writeln!(_out, "${MARK}{}|0|0|{}", _i, _msg).unwrap();
            }
        }
        _out.flush().unwrap();
    }
}
`
}

/* ------------------------------------------------------------------ starter */

const RUST_TYPE: Record<CType, string> = {
  int: 'i64',
  double: 'f64',
  boolean: 'bool',
  string: 'String',
  'int[]': 'Vec<i64>',
  'string[]': 'Vec<String>',
  'int[][]': 'Vec<Vec<i64>>',
}

const RUST_ZERO: Record<CType, string> = {
  int: '0',
  double: '0.0',
  boolean: 'false',
  string: 'String::new()',
  'int[]': 'Vec::new()',
  'string[]': 'Vec::new()',
  'int[][]': 'Vec::new()',
}

/** Only the `impl` block — the driver supplies `struct Solution;` above it. */
export function rustStarter(sig: Signature): string {
  const fn = snakeCase(sig.name)
  const params = sig.params.map((p) => `${p.name}: ${RUST_TYPE[p.type]}`).join(', ')
  return `impl Solution {
    pub fn ${fn}(${params}) -> ${RUST_TYPE[sig.returns]} {
        // your code here
        ${RUST_ZERO[sig.returns]}
    }
}
`
}

/** Public Judge0 CE: Rust 1.85.0 is id 108, newest first; 1.40.0 (73) as a
 * fallback for older self-hosted instances that don't have 108. */
export const rustJudge0: number[] = [108, 73]
