/**
 * Proves every solvable problem actually works, in all four languages.
 *
 *   npm run verify:problems                          # everything
 *   npm run verify:problems -- arrays                # only ids/titles matching "arrays"
 *   npm run verify:problems -- --local               # JavaScript only, no network
 *   npm run verify:problems -- --file arrays-hashing # one authoring file, before it is registered
 *
 * For each problem it checks four things:
 *
 *   1. The **starter** compiles and runs in every language. A student who cannot
 *      even press Run on a fresh problem will assume the site is broken.
 *   2. The starter does *not* pass every case, or the placeholder is accidentally
 *      a solution and the problem is worthless.
 *   3. The **reference solution** passes every case in every language. This is
 *      what actually proves the expected values are right: four independent
 *      implementations agreeing is very hard to fake.
 *   4. Every language agrees on the canonical output text, so nobody gets a
 *      wrong answer purely for having chosen Java.
 *
 * Reference solutions live in `scripts/solutions/<file>.ts` and are NOT imported
 * by the app, so they never reach the bundle. See docs/AUTHORING-PROBLEMS.md.
 */
import { ALL_PROBLEMS } from '../src/data/problems/index.ts'
import { buildProgram, encodeCases, fmtValue, parseRun } from '../src/lib/harness.ts'
import { SOLUTIONS as REGISTERED_SOLUTIONS } from './solutions/index.ts'
import type { CodingProblem, Lang } from '../src/data/problemTypes.ts'
import type { SolutionSet } from './solutions/index.ts'

const JUDGE = process.env.JUDGE0_URL ?? 'https://ce.judge0.com'
const LANG_ID: Record<Exclude<Lang, 'javascript'>, number> = { python: 109, cpp: 105, java: 91 }
const GAP_MS = 300

const args = process.argv.slice(2)
const localOnly = args.includes('--local')
const fileArg = args.includes('--file') ? args[args.indexOf('--file') + 1] : null
const filter = args.filter((a) => a !== fileArg).find((a) => !a.startsWith('--'))

/*
 * `--file` loads one authoring file and its matching solutions file directly,
 * without going through either index. That is what lets several people write
 * problem sets at the same time: nobody has to touch a shared registry to run
 * the verifier, so nobody collides in it.
 */
async function loadTargets(): Promise<{ problems: CodingProblem[]; solutions: Record<string, SolutionSet> }> {
  if (!fileArg) return { problems: ALL_PROBLEMS, solutions: REGISTERED_SOLUTIONS }
  const base = fileArg.replace(/^.*\//, '').replace(/\.ts$/, '')
  const mod = (await import(`../src/data/problems/${base}.ts`)) as Record<string, unknown>
  const sols = (await import(`./solutions/${base}.ts`)) as Record<string, unknown>
  const problems = Object.values(mod).find(Array.isArray) as CodingProblem[] | undefined
  const solutions = Object.values(sols).find((v) => v && typeof v === 'object' && !Array.isArray(v)) as
    | Record<string, SolutionSet>
    | undefined
  if (!problems) throw new Error(`src/data/problems/${base}.ts exports no array of problems`)
  if (!solutions) throw new Error(`scripts/solutions/${base}.ts exports no solutions object`)
  return { problems, solutions }
}

const { problems: POOL, solutions: SOLUTIONS } = await loadTargets()

const LANGS: Lang[] = localOnly ? ['javascript'] : ['python', 'cpp', 'java', 'javascript']

let failures = 0
const fail = (m: string) => {
  failures++
  console.log(`  \x1b[31m✗\x1b[0m ${m}`)
}
const ok = (m: string) => console.log(`  \x1b[32m✓\x1b[0m ${m}`)

/** Mirrors the Web Worker in src/lib/judge.ts. */
function runLocal(program: string, stdin: string) {
  const lines = stdin.replace(/\r\n?/g, '\n').split('\n')
  let ptr = 0
  const out: string[] = []
  const readline = () => (ptr < lines.length ? lines[ptr++] : '')
  const print = (...a: unknown[]) => out.push(a.map(String).join(' '))
  const shim = { log: print, info: print, warn: print, error: print, debug: print }
  const fn = new Function('readline', 'print', 'console', program)
  fn(readline, print, shim)
  return { stdout: out.join('\n'), error: null as string | null }
}

async function runRemote(lang: Exclude<Lang, 'javascript'>, program: string, stdin: string) {
  const res = await fetch(`${JUDGE}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language_id: LANG_ID[lang], source_code: program, stdin }),
  })
  if (!res.ok) return { stdout: '', error: `judge HTTP ${res.status} ${res.statusText}` }
  const d = (await res.json()) as {
    stdout: string | null
    stderr: string | null
    compile_output: string | null
    status: { id: number; description: string }
  }
  if (d.status.id === 6) return { stdout: '', error: `COMPILE ERROR\n${(d.compile_output ?? '').slice(0, 700)}` }
  if (d.status.id !== 3) {
    return { stdout: d.stdout ?? '', error: `[${d.status.id}] ${d.status.description} ${(d.stderr ?? '').slice(0, 400)}` }
  }
  await new Promise((r) => setTimeout(r, GAP_MS))
  return { stdout: d.stdout ?? '', error: null }
}

async function run(lang: Lang, program: string, stdin: string) {
  if (lang === 'javascript') {
    try {
      return runLocal(program, stdin)
    } catch (e) {
      return { stdout: '', error: `threw: ${e}` }
    }
  }
  return runRemote(lang as Exclude<Lang, 'javascript'>, program, stdin)
}

/** How many cases a program got right, or an error string. */
async function score(p: CodingProblem, lang: Lang, code: string) {
  const program = buildProgram(lang, p.signature, code)
  const stdin = encodeCases(p.signature, p.cases)
  const { stdout, error } = await run(lang, program, stdin)
  if (error) return { error, passed: 0, outputs: [] as string[] }
  const { results } = parseRun(stdout)
  if (results.size !== p.cases.length) {
    return { error: `produced ${results.size} case lines, expected ${p.cases.length}`, passed: 0, outputs: [] }
  }
  const outputs = p.cases.map((_, i) => (results.get(i)!.ok ? results.get(i)!.value : `!ERR ${results.get(i)!.value}`))
  const passed = p.cases.filter((c, i) => results.get(i)!.ok && results.get(i)!.value === fmtValue(c.expected)).length
  return { error: null, passed, outputs }
}

/* ------------------------------------------------------------------ structure */

function checkShape(p: CodingProblem) {
  const sig = p.signature
  if (!/^[a-z][A-Za-z0-9]*$/.test(sig.name)) fail(`${p.id}: method name "${sig.name}" is not lowerCamelCase`)
  if (!p.cases.length) fail(`${p.id}: no cases`)
  const visible = p.cases.filter((c) => !c.hidden).length
  if (visible < 2) fail(`${p.id}: needs at least 2 visible examples, has ${visible}`)
  if (p.cases.length - visible < 3) fail(`${p.id}: needs at least 3 hidden cases, has ${p.cases.length - visible}`)
  for (const [i, c] of p.cases.entries()) {
    if (c.args.length !== sig.params.length) {
      fail(`${p.id} case ${i}: ${c.args.length} args, signature wants ${sig.params.length}`)
    }
    if (c.expected === undefined) fail(`${p.id} case ${i}: expected is undefined`)
  }
  for (const l of ['python', 'cpp', 'java', 'javascript'] as Lang[]) {
    if (!p.starter[l]?.trim()) fail(`${p.id}: no ${l} starter`)
  }
  if (!p.hints?.length) fail(`${p.id}: no hints`)
  if (!p.origin?.url) fail(`${p.id}: no origin link`)
}

/* ----------------------------------------------------------------------- main */

const seen = new Set<string>()
for (const p of POOL) {
  if (seen.has(p.id)) fail(`duplicate problem id ${p.id}`)
  seen.add(p.id)
}

const targets = POOL.filter((p) => !filter || p.id.includes(filter) || p.title.toLowerCase().includes(filter.toLowerCase()))
if (!targets.length) {
  console.log(`No problems match ${filter}`)
  process.exit(1)
}

console.log(`Verifying ${targets.length} problem(s) in ${LANGS.join(', ')}\n`)

for (const p of targets) {
  console.log(`\x1b[1m${p.id}\x1b[0m — ${p.title} (${p.difficulty}, ${p.cases.length} cases)`)
  checkShape(p)

  const sol = SOLUTIONS[p.id]
  if (!sol) {
    fail(`${p.id}: no reference solution in scripts/solutions/`)
    continue
  }

  const canonical: Record<string, string[]> = {}

  for (const lang of LANGS) {
    if (!sol[lang]) {
      fail(`${p.id}/${lang}: reference solution missing`)
      continue
    }

    const s = await score(p, lang, sol[lang])
    if (s.error) {
      fail(`${p.id}/${lang} solution: ${s.error}`)
      continue
    }
    if (s.passed !== p.cases.length) {
      fail(`${p.id}/${lang} solution: only ${s.passed}/${p.cases.length} passed`)
      p.cases.forEach((c, i) => {
        if (s.outputs[i] !== fmtValue(c.expected)) {
          console.log(`      case ${i}: got ${JSON.stringify(s.outputs[i])} want ${JSON.stringify(fmtValue(c.expected))}`)
        }
      })
      continue
    }
    canonical[lang] = s.outputs

    const st = await score(p, lang, p.starter[lang])
    if (st.error) {
      fail(`${p.id}/${lang} starter: ${st.error}`)
      continue
    }
    if (st.passed === p.cases.length) {
      fail(`${p.id}/${lang} starter: passes everything — the placeholder is accidentally correct`)
      continue
    }
    ok(`${lang}: solution ${s.passed}/${p.cases.length}, starter ${st.passed}/${p.cases.length}`)
  }

  // Four implementations must agree character for character.
  const langsWithOutput = Object.keys(canonical)
  for (const l of langsWithOutput.slice(1)) {
    const a = canonical[langsWithOutput[0]]
    const b = canonical[l]
    const i = a.findIndex((v, k) => v !== b[k])
    if (i >= 0) fail(`${p.id}: ${langsWithOutput[0]} and ${l} disagree on case ${i}: ${a[i]} vs ${b[i]}`)
  }
}

console.log(
  failures === 0
    ? `\n\x1b[32mAll ${targets.length} problem(s) verified.\x1b[0m`
    : `\n\x1b[31m${failures} failure(s).\x1b[0m`,
)
process.exit(failures === 0 ? 0 : 1)
