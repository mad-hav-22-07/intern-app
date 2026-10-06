/**
 * Proves every SQL problem in `src/data/sql.ts` actually works.
 *
 *   npm run verify:sql                 # everything
 *   npm run verify:sql -- above        # only ids/titles matching "above"
 *
 * For each problem it checks three things, all against Judge0's SQLite
 * (language id 82) — the same judge `lib/sqlJudge.ts` calls at runtime:
 *
 *   1. `schema + seed + starter` runs cleanly but does **not** match `expected`.
 *      A starter that already passes is worthless — see docs/AUTHORING-PROBLEMS.md
 *      for why the coding problems hold the same rule.
 *   2. `schema + seed + <reference solution>` runs cleanly and matches `expected`
 *      exactly, row set for row set (order-insensitive — see the comment atop
 *      `src/data/sql.ts` for why order is never part of the comparison).
 *   3. `schema + seed + hiddenSeed + <reference solution>` matches
 *      `hiddenExpected`. This is what proves the hidden batch actually changes
 *      the answer rather than just padding the table — a problem where it
 *      doesn't would let a hardcoded `SELECT 'Ana', 9.1` slip through.
 *
 * Reference solutions live in `scripts/solutions/sql.ts` and are never imported
 * by `src/`, so they never reach the bundle.
 *
 * Be gentle with the public judge: requests are serialised with a delay between
 * them, and a 429 gets one retry after a longer backoff.
 */
import { SQL_PROBLEMS } from '../src/data/sql.ts'
import { SQL_SOLUTIONS } from './solutions/sql.ts'
import type { SqlProblem } from '../src/data/sql.ts'

const JUDGE = process.env.JUDGE0_URL ?? 'https://ce.judge0.com'
const LANGUAGE_ID = 82
const GAP_MS = 300

const args = process.argv.slice(2)
const filter = args.find((a) => !a.startsWith('--'))

let failures = 0
const fail = (m: string) => {
  failures++
  console.log(`  \x1b[31m✗\x1b[0m ${m}`)
}
const ok = (m: string) => console.log(`  \x1b[32m✓\x1b[0m ${m}`)

/* ------------------------------------------------------------------ running */

type Reply = {
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  message: string | null
  status: { id: number; description: string }
}

async function submitOnce(script: string): Promise<Reply> {
  const res = await fetch(`${JUDGE}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language_id: LANGUAGE_ID, source_code: script }),
  })
  if (res.status === 429) {
    console.log('  … rate limited, backing off and retrying once')
    await new Promise((r) => setTimeout(r, 3000))
    const retry = await fetch(`${JUDGE}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language_id: LANGUAGE_ID, source_code: script }),
    })
    if (!retry.ok) throw new Error(`judge HTTP ${retry.status} ${retry.statusText}`)
    return (await retry.json()) as Reply
  }
  if (!res.ok) throw new Error(`judge HTTP ${res.status} ${res.statusText}`)
  return (await res.json()) as Reply
}

function parseRows(stdout: string): string[][] {
  return stdout
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((l) => l.length > 0)
    .map((l) => l.split('|'))
}

/** Mirrors `lib/sqlJudge.ts`: sort whole rows, then compare arrays. */
function rowsEqual(a: string[][], b: string[][]): boolean {
  const sa = a.map((r) => r.join('')).sort()
  const sb = b.map((r) => r.join('')).sort()
  return sa.length === sb.length && sa.every((v, i) => v === sb[i])
}

async function run(script: string): Promise<{ rows: string[][] | null; error: string | null }> {
  const d = await submitOnce(script)
  await new Promise((r) => setTimeout(r, GAP_MS))
  const id = d.status?.id ?? 13
  if (id === 3 || id === 4) return { rows: parseRows(d.stdout ?? ''), error: null }
  if (id === 6) return { rows: null, error: `COMPILE ERROR\n${(d.compile_output ?? '').slice(0, 500)}` }
  return { rows: null, error: `[${id}] ${d.status.description} ${(d.stderr || d.message || '').slice(0, 400)}` }
}

/* ----------------------------------------------------------------- structure */

function checkShape(p: SqlProblem) {
  if (!/^sq-[a-z0-9-]+$/.test(p.id)) fail(`${p.id}: id is not sq-<kebab>`)
  if (!p.schema.trim()) fail(`${p.id}: no schema`)
  if (!p.seed.trim()) fail(`${p.id}: no seed`)
  if (!p.starter.trim()) fail(`${p.id}: no starter`)
  if (!p.expected.rows.length) fail(`${p.id}: expected has no rows — an empty-set answer is not a useful check`)
  if (!p.hiddenSeed || !p.hiddenExpected) fail(`${p.id}: no hiddenSeed/hiddenExpected — a hardcoded answer would pass`)
  if (!p.hints?.length) fail(`${p.id}: no hints`)
  if (!p.statement?.length) fail(`${p.id}: no statement`)
}

/* ----------------------------------------------------------------------- main */

const seen = new Set<string>()
for (const p of SQL_PROBLEMS) {
  if (seen.has(p.id)) fail(`duplicate problem id ${p.id}`)
  seen.add(p.id)
}

const targets = SQL_PROBLEMS.filter(
  (p) => !filter || p.id.includes(filter) || p.title.toLowerCase().includes(filter.toLowerCase()),
)
if (!targets.length) {
  console.log(`No problems match ${filter}`)
  process.exit(1)
}

console.log(`Verifying ${targets.length} SQL problem(s) against ${JUDGE}\n`)

for (const p of targets) {
  console.log(`\x1b[1m${p.id}\x1b[0m — ${p.title} (${p.difficulty})`)
  checkShape(p)

  const sol = SQL_SOLUTIONS[p.id]
  if (!sol) {
    fail(`${p.id}: no reference solution in scripts/solutions/sql.ts`)
    continue
  }

  // 1. Starter runs, and does not match the visible expected rows.
  try {
    const starterScript = [p.schema, p.seed, p.starter].join('\n')
    const { rows, error } = await run(starterScript)
    if (error) fail(`${p.id} starter: ${error}`)
    else if (rowsEqual(rows!, p.expected.rows)) fail(`${p.id} starter: matches expected — the placeholder is accidentally correct`)
    else ok(`starter runs and does not match (${rows!.length} row(s))`)
  } catch (e) {
    fail(`${p.id} starter: ${e}`)
  }

  // 2. Reference solution matches the visible expected rows.
  try {
    const solScript = [p.schema, p.seed, sol].join('\n')
    const { rows, error } = await run(solScript)
    if (error) fail(`${p.id} solution (visible): ${error}`)
    else if (!rowsEqual(rows!, p.expected.rows)) {
      fail(`${p.id} solution (visible): rows do not match expected`)
      console.log(`      got:      ${JSON.stringify(rows)}`)
      console.log(`      expected: ${JSON.stringify(p.expected.rows)}`)
    } else ok(`solution matches expected (${rows!.length} row(s))`)
  } catch (e) {
    fail(`${p.id} solution (visible): ${e}`)
  }

  // 3. Reference solution matches hiddenExpected once hiddenSeed is added.
  if (p.hiddenSeed && p.hiddenExpected) {
    try {
      const hiddenScript = [p.schema, p.seed, p.hiddenSeed, sol].join('\n')
      const { rows, error } = await run(hiddenScript)
      if (error) fail(`${p.id} solution (hidden): ${error}`)
      else if (!rowsEqual(rows!, p.hiddenExpected.rows)) {
        fail(`${p.id} solution (hidden): rows do not match hiddenExpected`)
        console.log(`      got:      ${JSON.stringify(rows)}`)
        console.log(`      expected: ${JSON.stringify(p.hiddenExpected.rows)}`)
      } else ok(`solution matches hiddenExpected (${rows!.length} row(s))`)
    } catch (e) {
      fail(`${p.id} solution (hidden): ${e}`)
    }
  }
}

console.log(
  failures === 0
    ? `\n\x1b[32mAll ${targets.length} SQL problem(s) verified.\x1b[0m`
    : `\n\x1b[31m${failures} failure(s).\x1b[0m`,
)
process.exit(failures === 0 ? 0 : 1)
