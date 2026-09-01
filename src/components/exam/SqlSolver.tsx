/**
 * The SQL solver: statement on one side, a query box and a result panel on the
 * other. Deliberately independent of `ProblemPanel.tsx` — there is no method
 * signature and no per-language driver here, just a schema, some seed rows and
 * one query, so it does not share machinery with the coding-round solver
 * beyond the same `ui/` primitives everything else in the app uses.
 *
 * The editor is a plain textarea rather than `CodeEditor.tsx`: that component's
 * highlighter only knows the four coding-round languages, and teaching it SQL's
 * keywords is out of scope for a self-contained feature that must not touch it.
 */
import { useCallback, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Eye, Lightbulb, Loader2, Play, Send, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '@/components/ui/Page'
import type { SqlProblem } from '@/data/sql'
import { runSql, submitSql, type SqlCheck, type SqlOutcome, type SqlVerdict } from '@/lib/sqlJudge'
import { cn } from '@/lib/cn'

/* --------------------------------------------------------------- small pieces */

/** Renders `backticks` as inline code. Nothing else is parsed. */
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.length > 1 && p.startsWith('`') && p.endsWith('`') ? (
          <code key={i} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-accent">
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

function Sql({ children }: { children: string }) {
  return (
    // Capped height, not just `overflow-auto`: this also renders a SQLite error
    // message, whose length is the judge's to decide. Without a cap a long one
    // grows the box instead of scrolling it and pushes the rest of the panel down.
    <pre className="scroll-thin max-h-56 overflow-auto rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[12px] leading-5">
      {children}
    </pre>
  )
}

const VERDICT_LABEL: Record<SqlVerdict, string> = {
  accepted: 'Matches',
  wrong: 'Does not match',
  error: 'SQL error',
  timeout: 'Time limit exceeded',
  'judge-down': 'Judge unavailable',
}

function VerdictDot({ v }: { v: SqlVerdict }) {
  if (v === 'accepted') return <CheckCircle2 className="size-3.5 shrink-0 text-accent" />
  if (v === 'judge-down') return <AlertTriangle className="size-3.5 shrink-0 text-warn" />
  return <XCircle className="size-3.5 shrink-0 text-danger" />
}

/** A small table for a result set. `cols` is display-only — never compared. */
function RowsTable({ cols, rows }: { cols: string[]; rows: string[][] }) {
  if (!rows.length) {
    return <p className="rounded-lg border border-line bg-surface-2 px-3 py-4 text-center text-[12px] text-muted">No rows.</p>
  }
  return (
    <div className="scroll-thin max-h-64 overflow-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-[12px]">
        <thead className="sticky top-0 bg-surface-2">
          <tr>
            {cols.map((c, i) => (
              <th key={i} className="border-b border-line px-2.5 py-1.5 text-left font-mono font-medium text-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i > 0 ? 'border-t border-line' : ''}>
              {r.map((v, j) => (
                <td key={j} className="whitespace-nowrap px-2.5 py-1.5 font-mono">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OutcomeBlock({
  outcome,
  cols,
  label,
  revealRows,
}: {
  outcome: SqlOutcome
  cols: string[]
  label: string
  /** False for the hidden check — its rows stay secret, only the verdict shows. */
  revealRows: boolean
}) {
  return (
    <div className="space-y-2 rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center gap-2">
        <VerdictDot v={outcome.verdict} />
        <span className="text-[12px] font-semibold">{label}</span>
        <span className="flex-1" />
        <span className="text-[11px] text-muted">{VERDICT_LABEL[outcome.verdict]}</span>
      </div>

      {outcome.verdict === 'judge-down' && (
        <div className="rounded-lg border border-warn/30 bg-warn/8 p-2.5 text-[12px] leading-relaxed text-warn">
          <p>{outcome.judgeDown}</p>
          <p className="mt-1 text-muted">Nothing here counts against you.</p>
        </div>
      )}

      {outcome.verdict === 'error' && (
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-wider text-danger">SQLite said</p>
          <Sql>{outcome.message || 'The query failed to run.'}</Sql>
        </div>
      )}

      {outcome.verdict === 'timeout' && (
        <p className="text-[12px] text-muted">Your query did not finish in time.</p>
      )}

      {(outcome.verdict === 'accepted' || outcome.verdict === 'wrong') &&
        (revealRows ? (
          <RowsTable cols={cols} rows={outcome.rows} />
        ) : (
          <p className="text-[11px] text-muted">
            The hidden rows stay hidden — only the verdict is shown, same as a hidden testcase in a
            coding round.
          </p>
        ))}
    </div>
  )
}

/* ----------------------------------------------------------------- the solver */

export type SqlSolver = {
  queryFor: (p: SqlProblem) => string
  setQuery: (p: SqlProblem, next: string) => void
  checks: Record<string, SqlCheck | null>
  busy: boolean
  lastMode: Record<string, 'run' | 'submit'>
  run: (p: SqlProblem) => void
  submit: (p: SqlProblem) => void
}

export function useSqlSolver(onSubmitted?: (problem: SqlProblem, check: SqlCheck) => void): SqlSolver {
  const [queryMap, setQueryMap] = useState<Record<string, string>>({})
  const [checks, setChecks] = useState<Record<string, SqlCheck | null>>({})
  const [lastMode, setLastMode] = useState<Record<string, 'run' | 'submit'>>({})
  const [busy, setBusy] = useState(false)
  const token = useRef(0)

  const queryFor = useCallback((p: SqlProblem) => queryMap[p.id] ?? p.starter, [queryMap])
  const setQuery = useCallback(
    (p: SqlProblem, next: string) => setQueryMap((m) => ({ ...m, [p.id]: next })),
    [],
  )

  const go = useCallback(
    async (p: SqlProblem, mode: 'run' | 'submit') => {
      const mine = ++token.current
      setBusy(true)
      setLastMode((m) => ({ ...m, [p.id]: mode }))
      setChecks((c) => ({ ...c, [p.id]: null }))
      const check = mode === 'run' ? await runSql(p, queryFor(p)) : await submitSql(p, queryFor(p))
      if (token.current !== mine) return
      setChecks((c) => ({ ...c, [p.id]: check }))
      setBusy(false)
      if (mode === 'submit' && check.solved) onSubmitted?.(p, check)
    },
    [queryFor, onSubmitted],
  )

  return {
    queryFor,
    setQuery,
    checks,
    busy,
    lastMode,
    run: (p) => go(p, 'run'),
    submit: (p) => go(p, 'submit'),
  }
}

export function SqlSolverPane({
  problem,
  solver,
  className,
}: {
  problem: SqlProblem
  solver: SqlSolver
  className?: string
}) {
  const { queryFor, setQuery, checks, busy, lastMode, run, submit } = solver
  const check = checks[problem.id]
  const mode = lastMode[problem.id]

  return (
    <section className={cn('min-h-0 flex-col', className)}>
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2">
        <span className="text-[11px] text-muted">SQLite · compiled on the remote judge</span>
        <span className="flex-1" />
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(problem)}>
          {busy && mode === 'run' ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          Run
        </Button>
        <Button size="sm" variant="primary" disabled={busy} onClick={() => submit(problem)}>
          {busy && mode === 'submit' ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          Submit
        </Button>
      </div>

      <textarea
        value={queryFor(problem)}
        onChange={(e) => setQuery(problem, e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        aria-label="SQL query"
        className="scroll-thin min-h-[160px] flex-1 resize-none border-b border-line bg-surface-2 px-3 py-3 font-mono text-[13px] leading-[20px] outline-none"
      />

      <div className="scroll-thin min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {busy ? (
          <p className="flex items-center justify-center gap-2 py-6 text-xs text-muted">
            <Loader2 className="size-3.5 animate-spin" /> Running on the judge…
          </p>
        ) : !check ? (
          <p className="py-6 text-center text-xs leading-relaxed text-muted">
            Run to check your query against the rows above, then Submit to also check it against a
            hidden batch of rows.
          </p>
        ) : (
          <>
            <OutcomeBlock outcome={check.visible} cols={problem.expected.columns} label="Visible rows" revealRows />
            {check.hidden && (
              <OutcomeBlock
                outcome={check.hidden}
                cols={problem.hiddenExpected?.columns ?? problem.expected.columns}
                label="Hidden rows"
                revealRows={false}
              />
            )}
            {mode === 'submit' && (
              <p className={cn('text-[12px] font-medium', check.solved ? 'text-accent' : 'text-danger')}>
                {check.solved ? 'Accepted.' : 'Not accepted yet — see above.'}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- the statement */

export function SqlStatement({ problem, className }: { problem: SqlProblem; className?: string }) {
  const [hintCount, setHintCount] = useState(0)
  return (
    <section className={cn('scroll-thin min-h-0 overflow-y-auto px-4 py-5', className)}>
      <div className="mx-auto max-w-2xl space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">{problem.title}</h1>
            <Badge tone={problem.difficulty === 'Hard' ? 'danger' : problem.difficulty === 'Medium' ? 'warn' : 'neutral'}>
              {problem.difficulty}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {problem.topics.map((t) => (
              <Badge key={t} tone="outline">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-[13.5px] leading-relaxed">
          {problem.statement.map((para, i) => (
            <p key={i}>
              <InlineText text={para} />
            </p>
          ))}
        </div>

        <div>
          <SectionTitle>Schema</SectionTitle>
          <Sql>{problem.schema}</Sql>
        </div>

        <div>
          <SectionTitle>Seed rows</SectionTitle>
          <Sql>{problem.seed}</Sql>
        </div>

        <div>
          <SectionTitle>Expected output</SectionTitle>
          <RowsTable cols={problem.expected.columns} rows={problem.expected.rows} />
        </div>

        <div>
          <SectionTitle>Hints</SectionTitle>
          <div className="space-y-2">
            {problem.hints.slice(0, hintCount).map((h, i) => (
              <div key={i} className="rounded-xl border border-warn/25 bg-warn/8 p-3 text-xs leading-relaxed text-muted">
                <Lightbulb className="mr-1.5 inline size-3.5 text-warn" />
                <InlineText text={h} />
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
