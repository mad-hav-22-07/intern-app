/**
 * The SQL judge.
 *
 * Same idea as `lib/judge.ts`, for SQL instead of a method call: there is no
 * "compile this function" step, so the whole script — the table `schema`, the
 * `seed` rows, and the student's query — goes to Judge0 as one `source_code`
 * against SQLite (language id 82 on the public CE instance, currently SQLite
 * 3.27.2). Judge0 runs it non-interactively and the DDL/DML statements print
 * nothing; only the student's own `SELECT` produces stdout, one result row per
 * line, columns pipe-separated, no header row — e.g. `Ananya|9.1`.
 *
 * **Row order is never compared.** SQLite makes no guarantee about the order
 * rows come back in unless the query has an `ORDER BY`, and the same logical
 * query can come back in a different order depending on the query plan. So
 * both sides — the student's parsed rows and the problem's `expected`/
 * `hiddenExpected` — are sorted (as whole pipe-joined rows, lexicographically)
 * before being compared array-for-array. Duplicates are not deduplicated, only
 * sorted, so a join that fans out into extra copies of a row still fails.
 *
 * A judge that is down, rate-limiting, or erroring is reported as `judge-down`,
 * never as a wrong answer — same rule as `lib/judge.ts`, for the same reason.
 */

import type { SqlProblem } from '@/data/sql'

export type SqlVerdict = 'accepted' | 'wrong' | 'error' | 'timeout' | 'judge-down'

export type SqlOutcome = {
  verdict: SqlVerdict
  /** Parsed rows the query produced. Empty when it did not run at all. */
  rows: string[][]
  /** The student's raw stdout, for the "show me exactly what came back" view. */
  raw: string
  /** The SQLite error text, when `verdict` is `error`. */
  message?: string
  /** Set when the judge itself failed. Never counted against the student. */
  judgeDown?: string
}

export type SqlCheck = {
  /** Result against `schema + seed`. */
  visible: SqlOutcome
  /** Result against `schema + seed + hiddenSeed`. `null` on a plain Run. */
  hidden: SqlOutcome | null
  /** True only when every run that happened matched its expected rows. */
  solved: boolean
}

const REMOTE_TIMEOUT_MS = 30_000

const env = import.meta.env
const JUDGE_URL = (env.VITE_JUDGE0_URL || 'https://ce.judge0.com').replace(/\/+$/, '')
const JUDGE_KEY = env.VITE_JUDGE0_KEY as string | undefined
const JUDGE_HOST = env.VITE_JUDGE0_HOST as string | undefined

/*
 * SQLite ids, newest first. Per-instance, not global — the public CE numbers
 * SQLite 3.27 as 82, and a self-hosted Judge0 may not — so the list is
 * intersected with whatever `/languages` reports, exactly as `judge.ts` does for
 * every other language. Being wrong here produces a clean "judge unavailable"
 * rather than marking correct SQL as wrong.
 */
const SQLITE_IDS = [82]

let languageIds: Promise<Set<number>> | null = null
async function resolveLanguage(): Promise<number> {
  try {
    if (!languageIds) {
      languageIds = fetch(`${JUDGE_URL}/languages`, { headers: headers() })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((list: { id: number }[]) => new Set(list.map((l) => l.id)))
    }
    const available = await languageIds
    return SQLITE_IDS.find((id) => available.has(id)) ?? SQLITE_IDS[0]
  } catch {
    languageIds = null
    return SQLITE_IDS[0]
  }
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (JUDGE_KEY) h['X-RapidAPI-Key'] = JUDGE_KEY
  if (JUDGE_HOST) h['X-RapidAPI-Host'] = JUDGE_HOST
  return h
}

const NETWORK_HINT =
  'Could not reach the judge. Retry in a moment — SQL problems always run on the remote judge, there is no local fallback.'

/** Splits the driver-free stdout into rows of pipe-separated cells. */
function parseRows(stdout: string): string[][] {
  return stdout
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => line.split('|'))
}

/** Sorts whole rows (joined, so column count differences sort too) before diffing. */
function sortedKey(rows: string[][]): string[] {
  return rows.map((r) => r.join('')).sort()
}

function rowsEqual(a: string[][], b: string[][]): boolean {
  const sa = sortedKey(a)
  const sb = sortedKey(b)
  if (sa.length !== sb.length) return false
  return sa.every((v, i) => v === sb[i])
}

type Judge0Reply = {
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  message: string | null
  status: { id: number; description: string }
}

/** One script, one execution: `schema + seed [+ hiddenSeed] + query`. */
async function execute(script: string): Promise<SqlOutcome> {
  // Resolve the id before arming the timer: the `/languages` lookup is a
  // separate round trip, and letting it eat the run's timeout budget would abort
  // a perfectly healthy query on a slow connection.
  const languageId = await resolveLanguage()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS)

  try {
    const res = await fetch(`${JUDGE_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: headers(),
      signal: controller.signal,
      body: JSON.stringify({ language_id: languageId, source_code: script }),
    })

    if (res.status === 429) {
      return {
        verdict: 'judge-down',
        rows: [],
        raw: '',
        judgeDown: 'The public judge is rate limiting us. Wait a few seconds and run again.',
      }
    }
    if (!res.ok) {
      return { verdict: 'judge-down', rows: [], raw: '', judgeDown: `Judge returned ${res.status} ${res.statusText}.` }
    }

    const d = (await res.json()) as Judge0Reply
    const id = d.status?.id ?? 13
    const raw = d.stdout ?? ''

    if (id === 5) return { verdict: 'timeout', rows: [], raw }
    // SQLite has no separate compile step, but Judge0's shape still carries the field.
    if (id === 6) return { verdict: 'error', rows: [], raw: '', message: d.compile_output || 'Failed to run.' }
    if (id >= 7 && id <= 12) {
      return { verdict: 'error', rows: [], raw, message: (d.stderr || d.message || d.status.description).trim() }
    }
    if (id !== 3 && id !== 4) {
      return { verdict: 'judge-down', rows: [], raw, judgeDown: d.message || d.status?.description || 'Judge error.' }
    }
    return { verdict: 'accepted', rows: parseRows(raw), raw }
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError'
    return {
      verdict: 'judge-down',
      rows: [],
      raw: '',
      judgeDown: aborted ? 'The judge did not answer in 30s.' : NETWORK_HINT,
    }
  } finally {
    clearTimeout(timer)
  }
}

/** Runs `query` against `schema + seed [+ extraSeed]` and grades it against `want`. */
async function runAndGrade(
  schema: string,
  seed: string,
  extraSeed: string | undefined,
  query: string,
  want: { rows: string[][] },
): Promise<SqlOutcome> {
  const script = [schema, seed, extraSeed, query].filter(Boolean).join('\n')
  const out = await execute(script)
  if (out.verdict !== 'accepted') return out
  return { ...out, verdict: rowsEqual(out.rows, want.rows) ? 'accepted' : 'wrong' }
}

/** "Run": just the visible schema + seed, checked against the visible `expected`. */
export async function runSql(problem: SqlProblem, query: string): Promise<SqlCheck> {
  const visible = await runAndGrade(problem.schema, problem.seed, undefined, query, problem.expected)
  return { visible, hidden: null, solved: visible.verdict === 'accepted' }
}

/**
 * "Submit": the visible check, then — only if that passed — the hidden one.
 * Both have to come back `accepted` for the attempt to count as solved.
 */
export async function submitSql(problem: SqlProblem, query: string): Promise<SqlCheck> {
  const visible = await runAndGrade(problem.schema, problem.seed, undefined, query, problem.expected)
  if (visible.verdict !== 'accepted' || !problem.hiddenSeed || !problem.hiddenExpected) {
    return { visible, hidden: null, solved: visible.verdict === 'accepted' && !problem.hiddenSeed }
  }
  const hidden = await runAndGrade(problem.schema, problem.seed, problem.hiddenSeed, query, problem.hiddenExpected)
  return { visible, hidden, solved: hidden.verdict === 'accepted' }
}
