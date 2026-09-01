import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lightbulb,
  ListChecks,
  Loader2,
  Play,
  RotateCcw,
  Send,
  SquareTerminal,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/Page'
import { CodeEditor } from './CodeEditor'
import { type CodingProblem } from '@/data/coding'
import {
  CPP_STANDARDS,
  DEFAULT_CPP_STANDARD,
  LANGS,
  fmtArg,
  fmtMicros,
  starterFor,
  type Case,
  type CppStandard,
  type Lang,
} from '@/lib/harness'
import { isLocal, runCases, type CaseOutcome, type RunReport, type Verdict } from '@/lib/judge'
import { cn } from '@/lib/cn'

/**
 * The parts of a coding problem that both the proctored round and free practice
 * need: the statement, and the solver (language picker, editor, testcase box,
 * result panel).
 *
 * They differ only in the chrome around them — a round adds a clock, a fullscreen
 * gate and a violation counter; practice adds none of that. Everything to do with
 * *solving* lives here so the two cannot drift apart, which they would within a
 * week of being copies.
 */

/* --------------------------------------------------------------- small pieces */

/** Renders `backticks` as inline code. Nothing else is parsed. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.length > 1 && p.startsWith('`') && p.endsWith('`') ? (
          <code
            key={i}
            className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-accent"
          >
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  pending: 'Queued',
  running: 'Running',
  accepted: 'Accepted',
  ran: 'Finished',
  wrong: 'Wrong Answer',
  error: 'Runtime Error',
  timeout: 'Time Limit Exceeded',
  skipped: 'Not run',
  'judge-down': 'Judge unavailable',
}

export function VerdictDot({ v }: { v: Verdict | null }) {
  if (v === null || v === 'pending' || v === 'skipped')
    return <span className="size-3.5 shrink-0 rounded-full border border-line bg-surface-2" />
  if (v === 'ran') return <span className="size-3.5 shrink-0 rounded-full bg-muted/30" />
  if (v === 'running') return <Loader2 className="size-3.5 shrink-0 animate-spin text-muted" />
  if (v === 'accepted') return <CheckCircle2 className="size-3.5 shrink-0 text-accent" />
  if (v === 'judge-down') return <AlertTriangle className="size-3.5 shrink-0 text-warn" />
  return <XCircle className="size-3.5 shrink-0 text-danger" />
}

/** A value as the judge sees it. Monospace, scrolls sideways, never wraps oddly. */
export function Val({ children, tone }: { children: string; tone?: 'good' | 'bad' }) {
  return (
    <pre
      className={cn(
        'scroll-thin max-h-32 overflow-auto whitespace-pre rounded-lg border bg-surface-2 px-3 py-2 font-mono text-[12px] leading-5',
        tone === 'good' ? 'border-accent/30' : tone === 'bad' ? 'border-danger/30' : 'border-line',
      )}
    >
      {children || ' '}
    </pre>
  )
}

/* ---------------------------------------------------------------------- types */

export type Panel = {
  mode: 'run' | 'submit'
  running: boolean
  report: RunReport | null
  /** What was actually run — for Run these may be the student's edited cases. */
  cases: Case[]
}

export type Submission = {
  lang: Lang
  code: string
  passed: number
  total: number
  solved: boolean
  /** Total microseconds inside the student's function across all cases. */
  us: number
  /** Seconds into the round. */
  at: number
}

export const codeKey = (problemId: string, lang: Lang) => `${problemId}:${lang}`

/*
 * Only cases with a known answer are scored. A student who rewrote example 1 to
 * try their own input has neither passed nor failed it, and a run made entirely
 * of their own inputs has no score at all.
 */
export function score(r: RunReport) {
  const judged = r.cases.filter((c) => c.compared)
  return { passed: judged.filter((c) => c.verdict === 'accepted').length, total: judged.length }
}

/** JSON is the testcase-box format on every judge that has one. */
export const toEditable = (p: CodingProblem) =>
  p.cases.filter((c) => !c.hidden).map((c) => c.args.map((a) => JSON.stringify(a)))

/* ---------------------------------------------------------------- the verdict */

export function ScoreChip({ report }: { report: RunReport }) {
  const { passed, total } = score(report)
  if (!total) return null
  return (
    <span
      className={cn(
        'pr-2 text-[11px] font-medium tabular-nums',
        passed === total ? 'text-accent' : 'text-danger',
      )}
    >
      {passed}/{total} passed
    </span>
  )
}

export function ResultPanel({
  report,
  mode,
  params,
}: {
  report: RunReport
  mode: 'run' | 'submit'
  params: string[]
}) {
  const { passed, total } = score(report)
  const bad = (c: CaseOutcome) => c.verdict !== 'accepted' && c.verdict !== 'ran'
  const allGood = !report.cases.some(bad)
  const firstBad = report.cases.findIndex(bad)
  const totalUs = report.cases.reduce((n, c) => n + c.us, 0)

  if (report.judgeDown) {
    return (
      <div className="rounded-lg border border-warn/30 bg-warn/8 p-3 text-[12px] leading-relaxed text-warn">
        <p className="font-medium">Judge unavailable</p>
        <p className="mt-1">{report.judgeDown}</p>
        <p className="mt-1.5 text-muted">Nothing here counts against you.</p>
      </div>
    )
  }

  if (report.compileError) {
    return (
      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-danger">Compile Error</p>
        <Val tone="bad">{report.compileError}</Val>
      </div>
    )
  }

  const headline = !allGood
    ? VERDICT_LABEL[report.cases[firstBad].verdict]
    : total === 0
      ? 'Finished'
      : mode === 'submit'
        ? 'Accepted'
        : 'All examples passed'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className={cn('text-[15px] font-semibold', allGood ? 'text-accent' : 'text-danger')}>
          {headline}
        </p>
        <p className="text-[11px] tabular-nums text-muted">
          {total > 0 ? `${passed}/${total} testcases · ` : `${report.cases.length} of your own cases · `}
          {fmtMicros(totalUs)}
        </p>
      </div>

      {report.stdout && (
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-wider text-muted">Stdout</p>
          <Val>{report.stdout}</Val>
        </div>
      )}

      <div className="space-y-2">
        {report.cases.map((c, i) => (
          <CaseRow
            key={i}
            n={i + 1}
            c={c}
            params={params}
            // A hand-edited Run case has no known answer to compare against.
            defaultOpen={i === firstBad || (allGood && report.cases.length <= 3)}
          />
        ))}
      </div>
    </div>
  )
}

export function CaseRow({
  n,
  c,
  params,
  defaultOpen,
}: {
  n: number
  c: CaseOutcome
  params: string[]
  defaultOpen: boolean
}) {
  const compared = c.compared
  return (
    <details
      open={defaultOpen}
      className={cn(
        'rounded-lg border',
        c.verdict === 'accepted'
          ? 'border-accent/25 bg-accent-soft/40'
          : c.verdict === 'skipped' || c.verdict === 'ran'
            ? 'border-line'
            : 'border-danger/25',
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3 py-2 text-xs">
        <VerdictDot v={c.verdict} />
        <span className="font-medium">
          {c.hidden ? `Testcase ${n}` : `Case ${n}`}
          {!compared && !c.hidden && (
            <span className="ml-1.5 font-normal text-[11px] text-muted">your input</span>
          )}
        </span>
        <span className="flex-1" />
        <span className="text-[11px] text-muted">{VERDICT_LABEL[c.verdict]}</span>
        {c.us > 0 && <span className="tabular-nums text-[11px] text-muted">{fmtMicros(c.us)}</span>}
      </summary>

      <div className="space-y-2 border-t border-line px-3 py-2.5">
        {c.hidden ? (
          <p className="text-[11px] text-muted">
            The input for a hidden testcase stays hidden. Only the verdict is shown.
          </p>
        ) : (
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wider text-muted">Input</p>
            <Val>{params.map((p, j) => `${p} = ${fmtArg(c.args[j])}`).join('\n')}</Val>
          </div>
        )}

        {c.verdict !== 'skipped' && (
          <div className={cn('grid gap-2', compared && !c.hidden ? 'sm:grid-cols-2' : '')}>
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted">Output</p>
              <Val tone={c.verdict === 'accepted' ? 'good' : c.output ? 'bad' : undefined}>
                {c.output}
              </Val>
            </div>
            {compared && !c.hidden && (
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wider text-muted">Expected</p>
                <Val>{c.expected}</Val>
              </div>
            )}
          </div>
        )}

        {c.message && (
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wider text-danger">
              {c.verdict === 'timeout' ? 'Time limit' : 'Error'}
            </p>
            <Val tone="bad">{c.message}</Val>
          </div>
        )}
      </div>
    </details>
  )
}

/* ----------------------------------------------------------------- the solver */

/**
 * All the state a solver needs, held by the *caller*.
 *
 * A proctored round shows one problem at a time out of three, and a student who
 * runs P1, checks P2 and comes back expects their results and their edited
 * testcases to still be there. Keeping this above the component is what makes
 * that true, and it costs the caller one line.
 */
export function useSolver(onSubmitted?: (problem: CodingProblem, report: RunReport) => void) {
  const [lang, setLang] = useState<Lang>('python')
  // The C++ standard is not a language: it is the same source compiled with a
  // different flag, so it must not fork the code the student has written.
  const [cppStandard, setCppStandard] = useState<CppStandard>(DEFAULT_CPP_STANDARD)
  const [codeMap, setCodeMap] = useState<Record<string, string>>({})
  const [panels, setPanels] = useState<Record<string, Panel>>({})
  const [edits, setEdits] = useState<Record<string, string[][]>>({})
  const [busy, setBusy] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [bottomTab, setBottomTab] = useState<'testcase' | 'result'>('testcase')
  const token = useRef(0)

  useEffect(() => () => { token.current++ }, [])

  const codeFor = useCallback(
    (p: CodingProblem, l: Lang) => codeMap[codeKey(p.id, l)] ?? starterFor(p, l),
    [codeMap],
  )

  const setCode = useCallback(
    (p: CodingProblem, l: Lang, next: string) =>
      setCodeMap((m) => ({ ...m, [codeKey(p.id, l)]: next })),
    [],
  )

  const execute = useCallback(
    async (p: CodingProblem, mode: 'run' | 'submit') => {
      let cases: Case[]

      if (mode === 'submit') {
        cases = p.cases
      } else {
        // Run uses whatever is in the testcase box, which may have been edited.
        const original = toEditable(p)
        const rows = edits[p.id] ?? original
        try {
          cases = rows.map((row, i) => {
            const args = row.map((raw, j) => {
              try {
                return JSON.parse(raw)
              } catch {
                throw new Error(`Case ${i + 1}, ${p.signature.params[j].name}: not valid JSON`)
              }
            })
            // Only an untouched case still has a known answer to compare against.
            const untouched = row.every((raw, j) => raw === original[i]?.[j])
            return { args, expected: untouched ? p.cases[i].expected : undefined }
          })
        } catch (err) {
          setEditError(err instanceof Error ? err.message : String(err))
          setBottomTab('testcase')
          return
        }
        setEditError(null)
      }

      const mine = ++token.current
      setBusy(true)
      setBottomTab('result')
      setPanels((s) => ({ ...s, [p.id]: { mode, running: true, report: null, cases } }))

      const report = await runCases(lang, codeFor(p, lang), p.signature, cases, cppStandard)
      if (token.current !== mine) return

      setPanels((s) => ({ ...s, [p.id]: { mode, running: false, report, cases } }))
      setBusy(false)
      if (mode === 'submit' && !report.judgeDown) onSubmitted?.(p, report)
    },
    [edits, lang, cppStandard, codeFor, onSubmitted],
  )

  const cancel = useCallback(() => {
    token.current++
    setBusy(false)
  }, [])

  return {
    lang, setLang,
    cppStandard, setCppStandard,
    codeFor, setCode,
    panels, edits, setEdits,
    busy, editError, setEditError,
    bottomTab, setBottomTab,
    execute, cancel,
  }
}

export type Solver = ReturnType<typeof useSolver>

/** Toolbar + editor + testcase/result panel. The right-hand half of the screen. */
export function SolverPane({
  problem,
  solver,
  blockPaste,
  onBlockedPaste,
  className,
}: {
  problem: CodingProblem
  solver: Solver
  blockPaste?: boolean
  onBlockedPaste?: () => void
  className?: string
}) {
  const { lang, setLang, cppStandard, setCppStandard, codeFor, setCode, panels, edits, setEdits,
          busy, editError, setEditError, bottomTab, setBottomTab, execute } = solver
  const panel = panels[problem.id] ?? null
  const myEdits = edits[problem.id] ?? toEditable(problem)
  const [openCase, setOpenCase] = useState(0)
  const sig = problem.signature

  // `openCase` is not keyed by problem, so switching to a problem with fewer
  // cases than the tab you had open would otherwise leave the testcase editor
  // pointed at a row that does not exist for the new problem — the inputs go
  // blank, and typing into one throws trying to write `rows[openCase][j]` on
  // an undefined row. Every problem currently ships the same case count, so
  // this cannot fire today, but it costs nothing to not depend on that.
  useEffect(() => {
    if (openCase >= myEdits.length) setOpenCase(0)
  }, [problem.id, myEdits.length, openCase])

  return (
    <section className={cn('min-h-0 flex-col', className)}>
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="h-8 rounded-lg border border-line bg-surface-2 px-2 text-xs outline-none focus-visible:border-accent"
          aria-label="Language"
        >
          {LANGS.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>

        {lang === 'cpp' && (
          <select
            value={cppStandard}
            onChange={(e) => setCppStandard(e.target.value as CppStandard)}
            className="h-8 rounded-lg border border-line bg-surface-2 px-2 text-xs outline-none focus-visible:border-accent"
            aria-label="C++ standard"
          >
            {CPP_STANDARDS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        )}

        <span className="hidden text-[11px] text-muted sm:inline">
          {isLocal(lang) ? 'runs in this tab' : 'compiled on the remote judge'}
        </span>

        <span className="flex-1" />

        <Button size="sm" variant="secondary" disabled={busy} onClick={() => execute(problem, 'run')}>
          {busy && panel?.mode === 'run' ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          Run
        </Button>
        <Button size="sm" variant="primary" disabled={busy} onClick={() => execute(problem, 'submit')}>
          {busy && panel?.mode === 'submit' ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          Submit
        </Button>
      </div>

      <CodeEditor
        value={codeFor(problem, lang)}
        onChange={(next) => setCode(problem, lang, next)}
        lang={lang}
        blockPaste={blockPaste}
        onBlockedPaste={onBlockedPaste}
        className="min-h-0 flex-1"
      />

      <div className="flex h-[42%] min-h-[190px] shrink-0 flex-col border-t border-line bg-surface">
        <div className="flex shrink-0 items-center gap-1 border-b border-line px-2">
          {([
            ['testcase', 'Testcase', ListChecks],
            ['result', 'Result', SquareTerminal],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setBottomTab(id)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs transition-colors',
                bottomTab === id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink',
              )}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
          <span className="flex-1" />
          {bottomTab === 'result' && panel?.report && !panel.report.judgeDown && (
            <ScoreChip report={panel.report} />
          )}
        </div>

        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-3">
          {bottomTab === 'testcase' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {myEdits.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setOpenCase(i)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-[12px] transition-colors',
                      openCase === i ? 'bg-surface-2 font-medium text-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    Case {i + 1}
                  </button>
                ))}
                <span className="flex-1" />
                {edits[problem.id] && (
                  <button
                    onClick={() => {
                      setEdits((e) => {
                        const next = { ...e }
                        delete next[problem.id]
                        return next
                      })
                      setEditError(null)
                    }}
                    className="flex items-center gap-1 text-[11px] text-muted hover:text-ink"
                  >
                    <RotateCcw className="size-3" /> Reset
                  </button>
                )}
              </div>

              {sig.params.map((p, j) => (
                <label key={p.name} className="block">
                  <span className="mb-1 block font-mono text-[11px] text-muted">{p.name} =</span>
                  <input
                    value={myEdits[openCase]?.[j] ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      setEditError(null)
                      setEdits((s) => {
                        const rows = (s[problem.id] ?? toEditable(problem)).map((r) => r.slice())
                        rows[openCase][j] = v
                        return { ...s, [problem.id]: rows }
                      })
                    }}
                    spellCheck={false}
                    className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[12px] outline-none focus-visible:border-accent"
                  />
                </label>
              ))}

              {editError ? (
                <p className="text-[11px] text-danger">{editError}</p>
              ) : (
                <p className="text-[11px] leading-relaxed text-muted">
                  Values are JSON. Edit them and press Run to try your own input — Submit always
                  uses the real testcases, including the hidden ones.
                </p>
              )}
            </div>
          ) : !panel ? (
            <p className="py-6 text-center text-xs leading-relaxed text-muted">
              Run to check the examples, then Submit to run every hidden testcase.
            </p>
          ) : panel.running ? (
            <p className="flex items-center justify-center gap-2 py-6 text-xs text-muted">
              <Loader2 className="size-3.5 animate-spin" />
              {isLocal(lang) ? 'Running…' : 'Compiling and running on the judge…'}
            </p>
          ) : (
            <ResultPanel
              report={panel.report!}
              mode={panel.mode}
              params={sig.params.map((p) => p.name)}
            />
          )}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- the statement */

/** The left-hand half: statement, examples, constraints, hints. */
export function ProblemStatement({
  problem,
  index,
  className,
}: {
  problem: CodingProblem
  /** Shown before the title in a round, where problems are numbered. */
  index?: number
  className?: string
}) {
  const [hintCount, setHintCount] = useState(0)
  const examples = problem.cases.filter((c) => !c.hidden)
  const sig = problem.signature

  return (
    <section className={cn('scroll-thin min-h-0 overflow-y-auto px-4 py-5', className)}>
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">
              {index !== undefined ? `${index}. ` : ''}{problem.title}
            </h1>
            <Badge tone={problem.difficulty === 'Hard' ? 'danger' : problem.difficulty === 'Medium' ? 'warn' : 'neutral'}>
              {problem.difficulty}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {problem.topics.map((t) => (
              <Badge key={t} tone="outline">{t}</Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-[13.5px] leading-relaxed">
          {problem.statement.map((para, i) => (
            <p key={i}><Inline text={para} /></p>
          ))}
        </div>

        <div className="space-y-3">
          {examples.map((c, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface-2/50 p-3.5">
              <p className="text-[13px] font-semibold">Example {i + 1}</p>
              <dl className="mt-2 space-y-1.5 font-mono text-[12px] leading-5">
                <div className="flex gap-2">
                  <dt className="shrink-0 font-sans text-muted">Input:</dt>
                  <dd className="min-w-0 break-all">
                    {sig.params.map((p, j) => `${p.name} = ${fmtArg(c.args[j])}`).join(', ')}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-sans text-muted">Output:</dt>
                  <dd className="min-w-0 break-all">{fmtArg(c.expected)}</dd>
                </div>
              </dl>
              {c.note && (
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  <span className="font-medium text-ink">Explanation: </span>
                  {c.note}
                </p>
              )}
            </div>
          ))}
          <p className="text-[11px] text-muted">
            {problem.cases.length - examples.length} further testcases are hidden until you submit.
          </p>
        </div>

        <div>
          <SectionTitle>Constraints</SectionTitle>
          <ul className="space-y-1 text-muted">
            {problem.constraints.map((c) => (
              <li key={c} className="font-mono text-[12px]">{c}</li>
            ))}
          </ul>
        </div>

        <div>
          <SectionTitle>Hints</SectionTitle>
          <div className="space-y-2">
            {problem.hints.slice(0, hintCount).map((h, i) => (
              <div key={i} className="rounded-xl border border-warn/25 bg-warn/8 p-3 text-xs leading-relaxed text-muted">
                <Lightbulb className="mr-1.5 inline size-3.5 text-warn" />
                <Inline text={h} />
              </div>
            ))}
            {hintCount < problem.hints.length && (
              <Button size="sm" variant="secondary" onClick={() => setHintCount((n) => n + 1)}>
                <Eye className="size-3.5" />
                Reveal hint {hintCount + 1} of {problem.hints.length}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
