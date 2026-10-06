import {
  buildProgram,
  compilerOptionsFor,
  encodeCases,
  fmtValue,
  isLocal,
  parseRun,
  SPEC,
  type Case,
  type CppStandard,
  type Lang,
  type Signature,
} from './harness'
import { DEFAULT_CPP_STANDARD } from './drivers'

export { isLocal }

/**
 * The judge.
 *
 * One run is **one execution**. The driver in `harness.ts` loops over every test
 * case inside the submitted program, so eight cases cost one compile and one
 * process rather than eight of each. It also flushes a line as each case
 * finishes, which is what lets a timeout still say *which* case hung.
 *
 * Two backends, chosen by language, because neither one alone is good enough:
 *
 *   JavaScript   runs locally in a Web Worker. No network, no rate limit, and a
 *                runaway loop dies when the worker is terminated. The worker
 *                streams each printed line back as it happens, so a solution
 *                that hangs on case 6 still has verdicts for 1–5.
 *
 *   Python/C++/Java  go to Judge0, an open-source sandboxed execution API. Real
 *                compilers, CORS open, no key on the public CE instance.
 *
 * The endpoint is configurable (`VITE_JUDGE0_URL`, plus RapidAPI headers if you
 * point it at a paid instance) and that is not decoration. This app previously
 * ran on Piston's public instance, which was taken offline for good on
 * 2026-08-31 after it was abused. Assume any free judge is temporary and keep
 * the swap to one environment variable.
 *
 * A judge that is down, rate limiting, or erroring is always reported as
 * `judge-down`, never as a wrong answer. Telling a student their correct
 * solution failed because someone else's server had a bad minute is the one
 * unforgivable bug in a thing like this.
 */

export type Verdict =
  | 'pending'
  | 'running'
  | 'accepted'
  | 'ran'
  | 'wrong'
  | 'error'
  | 'timeout'
  | 'skipped'
  | 'judge-down'

export type CaseOutcome = {
  verdict: Verdict
  args: unknown[]
  /** Canonical text of what the function returned. */
  output: string
  /** Canonical text of what it should have returned. */
  expected: string
  /** Microseconds spent inside the student's function, not the process. */
  us: number
  hidden: boolean
  /**
   * False for a case the student typed themselves. There is no known answer for
   * `nums = [3,3,4,9,1]` just because it was pasted over example 1, so nothing
   * is compared and it is not counted for or against them.
   */
  compared: boolean
  /** Exception text, when the case threw. */
  message?: string
}

export type RunReport = {
  cases: CaseOutcome[]
  /** The student's own printing, kept apart from the driver's protocol lines. */
  stdout: string
  /** Compiler output, when the program did not build. */
  compileError?: string
  /** Set when the judge itself failed. Never counted against the student. */
  judgeDown?: string
}

const LOCAL_TIMEOUT_MS = 6_000
const REMOTE_TIMEOUT_MS = 30_000

const env = import.meta.env
const JUDGE_URL = (env.VITE_JUDGE0_URL || 'https://ce.judge0.com').replace(/\/+$/, '')
const JUDGE_KEY = env.VITE_JUDGE0_KEY as string | undefined
const JUDGE_HOST = env.VITE_JUDGE0_HOST as string | undefined

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  // Only set when pointed at RapidAPI; the public CE instance wants neither.
  if (JUDGE_KEY) h['X-RapidAPI-Key'] = JUDGE_KEY
  if (JUDGE_HOST) h['X-RapidAPI-Host'] = JUDGE_HOST
  return h
}

/* ------------------------------------------------------------ local JS runner */

/*
 * The worker body. Kept as a string rather than a separate file so the bundler
 * cannot split it into a chunk that then fails to load from a Blob URL.
 *
 * Every `print` is posted immediately instead of being buffered to the end. That
 * is the whole reason a timeout can still report per-case verdicts: the main
 * thread already holds the lines that were flushed before the loop hung.
 */
const WORKER_SRC = `
self.onmessage = function (e) {
  var code = e.data.code
  var stdin = String(e.data.input == null ? '' : e.data.input).replace(/\\r\\n?/g, '\\n')
  var lines = stdin.split('\\n')
  var ptr = 0

  function readline() { return ptr < lines.length ? lines[ptr++] : '' }
  function print() {
    var parts = []
    for (var i = 0; i < arguments.length; i++) parts.push(String(arguments[i]))
    self.postMessage({ t: 'o', v: parts.join(' ') })
  }
  var shimConsole = { log: print, info: print, warn: print, error: print, debug: print }

  try {
    // A Function body, so the student's code and the driver share one scope.
    var fn = new Function('readline', 'print', 'console', code)
    fn(readline, print, shimConsole)
    self.postMessage({ t: 'd' })
  } catch (err) {
    self.postMessage({
      t: 'e',
      v: (err && err.stack) ? String(err.stack).split('\\n').slice(0, 3).join('\\n') : String(err),
    })
  }
}
`

let workerUrl: string | null = null
function getWorkerUrl() {
  if (!workerUrl) workerUrl = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }))
  return workerUrl
}

type RawRun = { stdout: string; runtimeError?: string; timedOut?: boolean; judgeDown?: string; compileError?: string }

function runLocal(program: string, stdin: string): Promise<RawRun> {
  return new Promise((resolve) => {
    let worker: Worker
    try {
      worker = new Worker(getWorkerUrl())
    } catch (err) {
      resolve({ stdout: '', judgeDown: `Could not start the sandbox: ${String(err)}` })
      return
    }

    const out: string[] = []
    const done = (extra: Omit<RawRun, 'stdout'>) => {
      clearTimeout(timer)
      worker.terminate()
      resolve({ stdout: out.join('\n'), ...extra })
    }

    // The only way out of `while (true) {}` is to kill the thread it runs on.
    const timer = setTimeout(() => done({ timedOut: true }), LOCAL_TIMEOUT_MS)

    worker.onmessage = (e: MessageEvent) => {
      const d = e.data as { t: 'o' | 'd' | 'e'; v?: string }
      if (d.t === 'o') out.push(d.v ?? '')
      else if (d.t === 'd') done({})
      else done({ runtimeError: d.v || 'Unknown error' })
    }
    worker.onerror = (e) => done({ runtimeError: e.message || 'Worker error' })

    worker.postMessage({ code: program, input: stdin })
  })
}

/* --------------------------------------------------------------- Judge0 runner */

/*
 * Language ids are per-instance, not global: the public CE instance numbers
 * Python 3.13 as 109, while an older self-hosted Judge0 calls Python 3.8.1 71.
 * So each language lists its ids newest-first (in `drivers/index.ts`) and the
 * list is intersected with whatever `/languages` reports. If that call fails we
 * take the first id and hope; being wrong there produces a clean "judge
 * unavailable", not a wrong answer.
 */
let languageIds: Promise<Set<number>> | null = null
async function resolveLanguage(lang: Lang): Promise<number> {
  const candidates = SPEC[lang].judge0 ?? []
  if (!candidates.length) throw new Error(`${lang} has no Judge0 id; it should have run locally`)
  try {
    if (!languageIds) {
      languageIds = fetch(`${JUDGE_URL}/languages`, { headers: headers() })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((list: { id: number }[]) => new Set(list.map((l) => l.id)))
    }
    const available = await languageIds
    return candidates.find((id) => available.has(id)) ?? candidates[0]
  } catch {
    languageIds = null
    return candidates[0]
  }
}

type Judge0Reply = {
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  message: string | null
  status: { id: number; description: string }
}

const NETWORK_HINT =
  'Could not reach the judge. Retry in a moment, or switch to JavaScript — it runs in this tab and needs no network.'

async function runRemote(
  lang: Lang,
  program: string,
  stdin: string,
  cppStandard: CppStandard,
): Promise<RawRun> {
  const languageId = await resolveLanguage(lang)
  const compilerOptions = compilerOptionsFor(lang, cppStandard)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS)

  try {
    const res = await fetch(`${JUDGE_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: headers(),
      signal: controller.signal,
      body: JSON.stringify({
        language_id: languageId,
        source_code: program,
        stdin,
        // Judge0 exposes compilers, not standards. This is how C++17/20/23 come
        // from one compiler without forking the student's source.
        ...(compilerOptions ? { compiler_options: compilerOptions } : {}),
      }),
    })

    if (res.status === 429)
      return { stdout: '', judgeDown: 'The public judge is rate limiting us. Wait a few seconds and run again.' }
    if (!res.ok) return { stdout: '', judgeDown: `Judge returned ${res.status} ${res.statusText}.` }

    const d = (await res.json()) as Judge0Reply
    const stdout = d.stdout ?? ''
    const id = d.status?.id ?? 13

    if (id === 6) return { stdout: '', compileError: d.compile_output || 'Compilation failed.' }
    if (id === 5) return { stdout, timedOut: true }
    if (id >= 7 && id <= 12) {
      return { stdout, runtimeError: d.stderr || d.message || d.status.description }
    }
    if (id !== 3 && id !== 4) {
      return { stdout, judgeDown: d.message || d.status?.description || 'Judge error.' }
    }
    return { stdout }
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError'
    return { stdout: '', judgeDown: aborted ? 'The judge did not answer in 30s.' : NETWORK_HINT }
  } finally {
    clearTimeout(timer)
  }
}

/* ---------------------------------------------------------------- public entry */

/**
 * Compiles the student's method into a full program, runs every case in one
 * execution, and turns the driver's output back into a verdict per case.
 */
export async function runCases(
  lang: Lang,
  userCode: string,
  sig: Signature,
  cases: Case[],
  cppStandard: CppStandard = DEFAULT_CPP_STANDARD,
): Promise<RunReport> {
  const program = buildProgram(lang, sig, userCode)
  const stdin = encodeCases(sig, cases)
  const raw = isLocal(lang)
    ? await runLocal(program, stdin)
    : await runRemote(lang, program, stdin, cppStandard)

  const isCompared = (i: number) => cases[i].expected !== undefined

  const blank = (verdict: Verdict, i: number, message?: string): CaseOutcome => ({
    verdict,
    args: cases[i].args,
    output: '',
    expected: isCompared(i) ? fmtValue(cases[i].expected) : '',
    us: 0,
    hidden: !!cases[i].hidden,
    compared: isCompared(i),
    message,
  })

  if (raw.judgeDown) {
    return { cases: cases.map((_, i) => blank('judge-down', i)), stdout: '', judgeDown: raw.judgeDown }
  }
  if (raw.compileError) {
    return {
      cases: cases.map((_, i) => blank('error', i)),
      stdout: '',
      compileError: raw.compileError.trim(),
    }
  }

  const { stdout, results } = parseRun(raw.stdout)

  /*
   * The first case with no line is where the process died — a timeout, a crash,
   * or a hard exit. It carries the blame; everything after it never ran. This is
   * the "last executed input" a real judge shows you.
   */
  let blamed = false
  const out: CaseOutcome[] = cases.map((c, i) => {
    const r = results.get(i)
    if (!r) {
      if (blamed) return blank('skipped', i)
      blamed = true
      if (raw.timedOut) return blank('timeout', i, 'Your solution did not finish this case in time.')
      return blank('error', i, raw.runtimeError || 'The program stopped before this case produced a result.')
    }
    const compared = isCompared(i)
    const expected = compared ? fmtValue(c.expected) : ''
    if (!r.ok) {
      return { verdict: 'error', args: c.args, output: '', expected, us: r.us, hidden: !!c.hidden, compared, message: r.value }
    }
    return {
      // A case with no known answer only has to run; it cannot be right or wrong.
      verdict: !compared ? 'ran' : r.value === expected ? 'accepted' : 'wrong',
      args: c.args,
      output: r.value,
      expected,
      us: r.us,
      hidden: !!c.hidden,
      compared,
    }
  })

  return { cases: out, stdout }
}
