import { SPEC, type Lang } from './drivers'
import { MARK } from './drivers/shared'

export type { Lang } from './drivers'
export { LANGS, LANG_SPECS, SPEC, isLocal, CPP_STANDARDS, DEFAULT_CPP_STANDARD, compilerOptionsFor } from './drivers'
export type { CppStandard, LangSpec } from './drivers'

/**
 * The function harness.
 *
 * LeetCode does not ask you to parse stdin. You implement a method, it calls
 * that method with real arguments, and it compares the value you returned. This
 * file is what makes that possible across four languages that share no runtime.
 *
 * The shape of it:
 *
 *   1. A problem declares a `Signature` — a method name, typed parameters and a
 *      typed return. Tests are `{ args, expected }` in plain JSON.
 *   2. `encodeCases` flattens every test into a line-based blob that goes in on
 *      stdin. It is line-based rather than JSON because C++ has no JSON parser
 *      in its standard library, and writing one into every submission is a lot
 *      of surface area for something the student never sees.
 *   3. `buildProgram` wraps the student's code in a per-language driver that
 *      reads that blob back into native values, calls the method once per test,
 *      times it, and prints one protocol line per case.
 *   4. `parseRun` pulls the protocol lines back out and leaves everything else
 *      as the student's own stdout, so their `print()` debugging still shows up
 *      where they expect it.
 *
 * Two decisions worth keeping:
 *
 * **All cases run in one execution.** Eight tests used to be eight submissions;
 * now it is one, which is roughly eight times less waiting and eight times less
 * load on a judge we do not pay for.
 *
 * **Each case is flushed as it finishes.** So when a solution times out on case
 * 6, cases 1–5 still have verdicts and the round can say *which* input hung —
 * the "last executed input" a real judge shows you.
 */

/* ----------------------------------------------------------------- the types */

export type CType = 'int' | 'double' | 'boolean' | 'string' | 'int[]' | 'string[]' | 'int[][]'

export type Param = { name: string; type: CType }

export type Signature = {
  /** The method the student implements, e.g. `twoSum`. */
  name: string
  params: Param[]
  returns: CType
}

export type Case = {
  args: unknown[]
  expected: unknown
  /** Withheld until submit. Visible cases are shown in the statement. */
  hidden?: boolean
  /** One line of "why", shown under a visible example. */
  note?: string
}

/* --------------------------------------------------------------- value shapes */

/**
 * The canonical text form of a value. Both sides of every comparison go through
 * this — the expected value here in TypeScript, the returned value in whichever
 * language ran it — so `[0,1]` from Python, C++, Java and JavaScript are all the
 * same eight characters by the time they are compared.
 */
export function fmtValue(v: unknown): string {
  if (v === null || v === undefined) return 'null'
  if (Array.isArray(v)) return '[' + v.map(fmtValue).join(',') + ']'
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'string') return v
  return String(v)
}

/** How an argument is written in the statement and the testcase editor. */
export function fmtArg(v: unknown): string {
  return typeof v === 'string' ? JSON.stringify(v) : fmtValue(v)
}

/** `nums = [2,7,11,15], target = 9` — the way an example input reads. */
export function fmtArgs(sig: Signature, args: unknown[]): string {
  return sig.params.map((p, i) => `${p.name} = ${fmtArg(args[i])}`).join(', ')
}

/* ------------------------------------------------------------------ encoding */

function encodeValue(type: CType, v: unknown, out: string[]) {
  switch (type) {
    case 'int':
    case 'double':
      out.push(String(v))
      break
    case 'boolean':
      out.push(v ? '1' : '0')
      break
    case 'string':
      out.push(String(v))
      break
    case 'int[]': {
      const a = (v as number[]) ?? []
      out.push(String(a.length))
      out.push(a.join(' '))
      break
    }
    case 'string[]': {
      const a = (v as string[]) ?? []
      out.push(String(a.length))
      for (const s of a) out.push(s)
      break
    }
    case 'int[][]': {
      const rows = (v as number[][]) ?? []
      out.push(String(rows.length))
      for (const r of rows) {
        out.push(String(r.length))
        out.push(r.join(' '))
      }
      break
    }
  }
}

/** The stdin blob: a case count, then every argument of every case in order. */
export function encodeCases(sig: Signature, cases: Case[]): string {
  const out: string[] = [String(cases.length)]
  for (const c of cases) {
    sig.params.forEach((p, i) => encodeValue(p.type, c.args[i], out))
  }
  return out.join('\n') + '\n'
}

/* ------------------------------------------------------------------- drivers */

/*
 * The per-language drivers moved to `drivers/`, one file each, the day adding a
 * fifth language stopped meaning editing a file four other people were editing.
 * `buildProgram` is now just a lookup.
 */

/** The student's code plus the driver, ready to compile and run. */
export function buildProgram(lang: Lang, sig: Signature, userCode: string): string {
  return SPEC[lang].build(sig, userCode)
}

/**
 * The starter a problem shows for a language: its own if it has one, otherwise a
 * stub generated from the signature. Problems written before the registry
 * existed hand-wrote all four; anything added since gets the generated one,
 * which is what keeps "add a language" from meaning "write 28 more stubs".
 */
export function starterFor(
  problem: { signature: Signature; starter: Partial<Record<Lang, string>> },
  lang: Lang,
): string {
  return problem.starter[lang] ?? SPEC[lang].starter(problem.signature)
}

/* -------------------------------------------------------------------- output */

export type CaseResult = { ok: boolean; us: number; value: string }

/**
 * Splits a run's stdout into the driver's per-case lines and everything else,
 * which is the student's own printing and gets shown back to them as-is.
 */
export function parseRun(raw: string): { stdout: string; results: Map<number, CaseResult> } {
  const results = new Map<number, CaseResult>()
  const rest: string[] = []

  for (const line of raw.replace(/\r\n?/g, '\n').split('\n')) {
    if (!line.startsWith(MARK)) {
      rest.push(line)
      continue
    }
    const body = line.slice(MARK.length)
    const a = body.indexOf('|')
    const b = body.indexOf('|', a + 1)
    const c = body.indexOf('|', b + 1)
    if (a < 0 || b < 0 || c < 0) continue
    const i = Number(body.slice(0, a))
    if (!Number.isInteger(i)) continue
    results.set(i, {
      ok: body.slice(a + 1, b) === '1',
      us: Number(body.slice(b + 1, c)) || 0,
      value: body.slice(c + 1),
    })
  }

  return { stdout: rest.join('\n').replace(/\n+$/, ''), results }
}

/** `1240` → `1.24 ms`, `830` → `0.83 ms`. Judges speak in milliseconds. */
export function fmtMicros(us: number) {
  if (us >= 1_000_000) return `${(us / 1_000_000).toFixed(2)} s`
  return `${(us / 1000).toFixed(2)} ms`
}
