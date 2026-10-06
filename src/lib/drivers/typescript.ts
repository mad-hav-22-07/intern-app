import type { CType, Signature } from '../harness'
import { MARK, callArgs, readArgs } from './shared'

/**
 * TypeScript driver.
 *
 * Unlike JavaScript (which runs as a `Function` body inside a Web Worker in the
 * tab, with `readline`/`print` shims and no real stdin), TypeScript has no
 * compiler available in the page, so it is a *remote* language: it goes to
 * Judge0 exactly like Python and C++. That means real stdin, real stdout, and a
 * real process — this file is structured like `python.ts`/`cpp.ts`, not like
 * `javascript.ts`.
 *
 * What Judge0 actually does with a TypeScript submission (probed empirically
 * against `https://ce.judge0.com`, ids 101/5.6.2, 94/5.0.3 and 74/3.7.4 — all
 * three behave the same way):
 *
 *   - It runs under plain Node. `require`, `process`, `process.stdin`,
 *     `process.hrtime.bigint()` all exist at runtime on every one of the three
 *     ids. `process.stdin` itself is not the easiest way to read a fixed blob
 *     synchronously, so this driver reads with
 *     `require('fs').readFileSync(0, 'utf8')` the same way the C++/Python
 *     drivers use blocking reads, then indexes into the lines.
 *   - There is no `@types/node` installed, so *without* any suppression, the
 *     compiler treats `require`/`process` as unknown globals and refuses to
 *     emit at all: a bare `require(...)` fails with `TS2580: Cannot find name
 *     'require'`, and the submission comes back as Judge0 status 6 (Compilation
 *     Error) rather than running anything.
 *   - Type checking is genuinely fatal, not just advisory: a real type
 *     mismatch (`let x: string = 123`) is also `status 6`, not a warning.
 *
 * The decision this forces: put `// @ts-nocheck` as the very first line of the
 * generated program. This is a deliberate choice, not a shortcut — it turns off
 * type *checking* only; the file is still transpiled and run as TypeScript, so
 * the student's parameter and return type annotations still show up in the
 * editor and still describe the signature. What `@ts-nocheck` buys is that a
 * half-written solution (wrong return type mid-edit, an untyped local, a
 * missing `@types/node`-only global the driver itself needs) degrades to a
 * runtime error on the *first case that hits it*, exactly like every other
 * language here, instead of refusing to run at all before printing a single
 * result. Confirmed empirically: with `@ts-nocheck`, `require`/`process`
 * resolve fine and the same "not assignable" line that was `status 6` above
 * compiles clean and runs. The point of the exercise is the algorithm, not
 * appeasing `tsc`.
 */

const TS_TYPE: Record<CType, string> = {
  int: 'number',
  double: 'number',
  boolean: 'boolean',
  string: 'string',
  'int[]': 'number[]',
  'string[]': 'string[]',
  'int[][]': 'number[][]',
}

const TS_ZERO: Record<CType, string> = {
  int: '0',
  double: '0',
  boolean: 'false',
  string: "''",
  'int[]': '[]',
  'string[]': '[]',
  'int[][]': '[]',
}

export function typescriptDriver(sig: Signature, user: string): string {
  return `// @ts-nocheck
// Type *checking* is off (see the comment in src/lib/drivers/typescript.ts for
// why); the file is still run as TypeScript so the student's annotations are
// real, and a type problem simply surfaces as a runtime error like any other
// language here rather than a refusal to run at all.

${user}

// ------------------------------------------------------------------ harness
const _lines: string[] = require('fs').readFileSync(0, 'utf8').split('\\n')
let _li = 0
function _rl(): string {
  let s = _lines[_li++] ?? ''
  if (s.endsWith('\\r')) s = s.slice(0, -1)
  return s
}
function _rint(): number { return parseInt(_rl().trim(), 10) }
function _rdbl(): number { return parseFloat(_rl().trim()) }
function _rbool(): boolean { return _rl().trim() === '1' }
function _rstr(): string { return _rl() }
function _rints(): number[] {
  const n = _rint()
  const l = _rl().trim()
  return n && l ? l.split(/\\s+/).map(Number) : []
}
function _rstrs(): string[] {
  const n = _rint()
  const a: string[] = []
  for (let i = 0; i < n; i++) a.push(_rl())
  return a
}
function _rintss(): number[][] {
  const r = _rint()
  const a: number[][] = []
  for (let i = 0; i < r; i++) a.push(_rints())
  return a
}
function _fmt(v: any): string {
  if (v === null || v === undefined) return 'null'
  if (Array.isArray(v)) return '[' + v.map(_fmt).join(',') + ']'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return String(v)
}

const _t = _rint()
for (let _i = 0; _i < _t; _i++) {
${readArgs(sig, (n, c) => `  const ${n} = ${c}`)}
  const _t0 = process.hrtime.bigint()
  try {
    const _r = ${sig.name}(${callArgs(sig)})
    const _us = Number((process.hrtime.bigint() - _t0) / 1000n)
    console.log('${MARK}' + _i + '|1|' + _us + '|' + _fmt(_r))
  } catch (_e: any) {
    const _us = Number((process.hrtime.bigint() - _t0) / 1000n)
    const _m = String((_e && _e.message) || _e).replace(/\\n/g, ' ')
    console.log('${MARK}' + _i + '|0|' + _us + '|' + _m)
  }
}
`
}

/** LeetCode's TypeScript track shape: a top-level typed function, no class. */
export function typescriptStarter(sig: Signature): string {
  const params = sig.params.map((p) => `${p.name}: ${TS_TYPE[p.type]}`).join(', ')
  return `function ${sig.name}(${params}): ${TS_TYPE[sig.returns]} {
  // your code here
  return ${TS_ZERO[sig.returns]}
}
`
}

/** Judge0 language ids, newest first: TypeScript 5.6.2, 5.0.3, 3.7.4. */
export const typescriptJudge0: number[] = [101, 94, 74]
