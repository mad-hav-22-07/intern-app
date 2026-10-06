/**
 * Proves a *new language driver* works, before it is registered.
 *
 *   npm run verify:driver -- go
 *   npm run verify:driver -- rust --problems cp-pair-sum,cp-gr-land-blocks
 *
 * Adding a language means writing `src/lib/drivers/<lang>.ts`. That file is not
 * in the registry yet — deliberately, so several people can add languages at
 * once without three of them editing `drivers/index.ts` at the same moment. This
 * script loads a driver directly and puts it through the same wringer the main
 * verifier uses.
 *
 * The driver file must export:
 *   export function <lang>Driver(sig: Signature, userCode: string): string
 *   export function <lang>Starter(sig: Signature): string
 *   export const <lang>Judge0: number[]          // Judge0 language ids, newest first
 *   export const <lang>CompilerOptions?: string  // optional
 *
 * and reference solutions go in `scripts/solutions/drivers/<lang>.ts` as
 *   export const SOLUTIONS: Record<string, string>   // problem id -> source
 *
 * You do NOT need a solution for all 28 problems. You need enough to exercise
 * every parameter and return type the harness has — int, int[], string,
 * int[][], and a boolean or string return if any problem uses one. The default
 * set below is chosen to cover exactly that. The expected values are already
 * proven correct by four other languages; what is under test here is your
 * driver, not the problems.
 */
import { ALL_PROBLEMS } from '../src/data/problems/index.ts'
import { encodeCases, fmtValue, parseRun } from '../src/lib/harness.ts'
import type { CodingProblem } from '../src/data/problemTypes.ts'

const JUDGE = process.env.JUDGE0_URL ?? 'https://ce.judge0.com'
const GAP_MS = 350

const args = process.argv.slice(2)
const lang = args.find((a) => !a.startsWith('--'))
if (!lang) {
  console.error('usage: npm run verify:driver -- <lang> [--problems id,id,...]')
  process.exit(1)
}
const only = args.includes('--problems') ? args[args.indexOf('--problems') + 1].split(',') : null

/**
 * Covers every type the harness can express: int[]+int in and int[] out, string
 * in and int out, int[][] in and int out, and a plain int in/out. If your
 * language passes these five it will pass the other 23.
 */
const DEFAULT_SET = [
  'cp-pair-sum', // int[], int -> int[]
  'cp-distinct-window', // string -> int
  'cp-room-booking', // int[][] -> int
  'cp-ar-class-president', // int[] -> int
  'cp-gr-land-blocks', // int[][] -> int
]

const drv = (await import(`../src/lib/drivers/${lang}.ts`)) as Record<string, unknown>
const sols = (await import(`./solutions/drivers/${lang}.ts`)) as { SOLUTIONS: Record<string, string> }

const build = drv[`${lang}Driver`] as ((sig: CodingProblem['signature'], code: string) => string) | undefined
const starter = drv[`${lang}Starter`] as ((sig: CodingProblem['signature']) => string) | undefined
const ids = drv[`${lang}Judge0`] as number[] | undefined
const compilerOptions = drv[`${lang}CompilerOptions`] as string | undefined

if (!build) throw new Error(`src/lib/drivers/${lang}.ts must export ${lang}Driver`)
if (!starter) throw new Error(`src/lib/drivers/${lang}.ts must export ${lang}Starter`)
if (!ids?.length) throw new Error(`src/lib/drivers/${lang}.ts must export ${lang}Judge0: number[]`)

/** Pin to an id the instance actually has; ids are per-instance, not global. */
const available: Set<number> = await fetch(`${JUDGE}/languages`)
  .then((r) => r.json())
  .then((l: { id: number }[]) => new Set(l.map((x) => x.id)))
  .catch(() => new Set<number>())
const languageId = ids.find((i) => available.has(i)) ?? ids[0]

let failures = 0
const fail = (m: string) => { failures++; console.log(`  \x1b[31m✗\x1b[0m ${m}`) }
const ok = (m: string) => console.log(`  \x1b[32m✓\x1b[0m ${m}`)

async function run(program: string, stdin: string) {
  const res = await fetch(`${JUDGE}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language_id: languageId,
      source_code: program,
      stdin,
      ...(compilerOptions ? { compiler_options: compilerOptions } : {}),
    }),
  })
  if (!res.ok) return { error: `judge HTTP ${res.status}`, stdout: '' }
  const d = (await res.json()) as {
    stdout: string | null; stderr: string | null; compile_output: string | null
    status: { id: number; description: string }
  }
  await new Promise((r) => setTimeout(r, GAP_MS))
  if (d.status.id === 6) return { error: `COMPILE ERROR\n${(d.compile_output ?? '').slice(0, 900)}`, stdout: '' }
  if (d.status.id !== 3) {
    return { error: `[${d.status.id}] ${d.status.description} ${(d.stderr ?? '').slice(0, 500)}`, stdout: d.stdout ?? '' }
  }
  return { error: null as string | null, stdout: d.stdout ?? '' }
}

const targets = ALL_PROBLEMS.filter((p) => (only ?? DEFAULT_SET).includes(p.id))
console.log(`Verifying the ${lang} driver on ${targets.length} problem(s), Judge0 id ${languageId}` +
  (compilerOptions ? ` (${compilerOptions})` : '') + '\n')

for (const p of targets) {
  console.log(`\x1b[1m${p.id}\x1b[0m — ${p.title} (${p.signature.params.map((x) => x.type).join(', ')} -> ${p.signature.returns})`)
  const stdin = encodeCases(p.signature, p.cases)

  const solution = sols.SOLUTIONS[p.id]
  if (!solution) { fail(`no reference solution for ${p.id} in scripts/solutions/drivers/${lang}.ts`); continue }

  const s = await run(build(p.signature, solution), stdin)
  if (s.error) { fail(`solution: ${s.error}`); continue }
  const { results, stdout } = parseRun(s.stdout)
  if (results.size !== p.cases.length) {
    fail(`solution produced ${results.size} case lines, expected ${p.cases.length}. Raw stdout:\n${s.stdout.slice(0, 400)}`)
    continue
  }
  const passed = p.cases.filter((c, i) => results.get(i)!.ok && results.get(i)!.value === fmtValue(c.expected)).length
  if (passed !== p.cases.length) {
    fail(`solution passed only ${passed}/${p.cases.length}`)
    p.cases.forEach((c, i) => {
      const r = results.get(i)!
      if (!r.ok || r.value !== fmtValue(c.expected)) {
        console.log(`      case ${i}: ok=${r.ok} got=${JSON.stringify(r.value)} want=${JSON.stringify(fmtValue(c.expected))}`)
      }
    })
    continue
  }
  if (stdout.trim()) fail(`solution leaked stdout the driver did not claim: ${JSON.stringify(stdout.slice(0, 120))}`)

  // The generated stub must compile and run, or a student cannot press Run.
  const st = await run(build(p.signature, starter(p.signature)), stdin)
  if (st.error) { fail(`generated starter: ${st.error}\n--- starter was ---\n${starter(p.signature)}`); continue }
  const stRes = parseRun(st.stdout).results
  if (stRes.size !== p.cases.length) { fail(`generated starter produced ${stRes.size}/${p.cases.length} case lines`); continue }
  const stPassed = p.cases.filter((c, i) => stRes.get(i)!.ok && stRes.get(i)!.value === fmtValue(c.expected)).length
  if (stPassed === p.cases.length) { fail(`generated starter passes everything — the placeholder is a solution`); continue }

  ok(`solution ${passed}/${p.cases.length}, generated starter ${stPassed}/${p.cases.length}`)
}

console.log(failures === 0
  ? `\n\x1b[32mThe ${lang} driver is good.\x1b[0m`
  : `\n\x1b[31m${failures} failure(s).\x1b[0m`)
process.exit(failures === 0 ? 0 : 1)
