/**
 * One SQL problem, open in the query box. Same shape as `pages/PracticeProblem`
 * — a fullscreen portal, prev/next, a "just solved" toast — built against
 * `components/exam/SqlSolver` instead of `ProblemPanel`.
 */
import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, PageHeader } from '@/components/ui/Page'
import { SqlSolverPane, SqlStatement, useSqlSolver } from '@/components/exam/SqlSolver'
import { SQL_PROBLEMS, SQL_PROBLEM_MAP } from '@/data/sql'
import type { SqlCheck } from '@/lib/sqlJudge'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/cn'

export default function SqlPracticeProblem() {
  const { problemId } = useParams()
  const navigate = useNavigate()
  const { done, toggleDone } = useApp()
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem')
  const [justSolved, setJustSolved] = useState(false)

  const problem = problemId ? SQL_PROBLEM_MAP[problemId] : undefined
  const index = useMemo(() => SQL_PROBLEMS.findIndex((p) => p.id === problemId), [problemId])
  const isDone = !!problemId && done.includes(problemId)

  // One-way and logs exactly once, same rule as PracticeProblem: re-solving
  // something already ticked must not credit the day's goal a second time.
  const onSubmitted = useCallback(
    (p: (typeof SQL_PROBLEMS)[number], check: SqlCheck) => {
      if (!check.solved) return
      setJustSolved(true)
      if (!done.includes(p.id)) toggleDone(p.id)
    },
    [done, toggleDone],
  )

  const solver = useSqlSolver(onSubmitted)

  if (!problem) {
    return (
      <div className="space-y-6">
        <PageHeader title="SQL Practice" />
        <EmptyState
          title="No such problem"
          sub="It may have been renamed."
          action={
            <Link to="/practice">
              <Button variant="secondary">Back to the problem list</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const prev = index > 0 ? SQL_PROBLEMS[index - 1] : null
  const next = index < SQL_PROBLEMS.length - 1 ? SQL_PROBLEMS[index + 1] : null

  return createPortal(
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      <header className="flex shrink-0 items-center gap-2 border-b border-nav-line bg-nav px-3 py-2.5 text-nav-ink sm:gap-3 sm:px-4">
        <button
          onClick={() => navigate('/practice')}
          aria-label="SQL Practice"
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] text-nav-muted transition-colors hover:text-nav-ink"
        >
          {/* The label text is hidden below sm, which drops it from the accessible
              name too — aria-label keeps this from becoming an unlabelled icon button. */}
          <ArrowLeft className="size-3.5" /> <span className="hidden sm:inline">SQL Practice</span>
        </button>

        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-tight">
          {index + 1}. {problem.title}
        </span>

        {(isDone || justSolved) && (
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-nav-accent">
            <CheckCircle2 className="size-3.5" />
            <span className="hidden sm:inline">Solved</span>
          </span>
        )}

        {problem.origin && (
          <a
            href={problem.origin.url}
            target="_blank"
            rel="noreferrer"
            className="hidden shrink-0 items-center gap-1.5 text-[11px] text-nav-muted transition-colors hover:text-nav-ink md:flex"
            title={`Modelled on ${problem.origin.source}: ${problem.origin.title}`}
          >
            {problem.origin.source} <ExternalLink className="size-3" />
          </a>
        )}

        <span className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => prev && navigate(`/practice/sql/${prev.id}`)}
            disabled={!prev}
            className="grid size-7 place-items-center rounded-lg text-nav-muted transition-colors hover:text-nav-ink disabled:opacity-30"
            aria-label="Previous problem"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => next && navigate(`/practice/sql/${next.id}`)}
            disabled={!next}
            className="grid size-7 place-items-center rounded-lg text-nav-muted transition-colors hover:text-nav-ink disabled:opacity-30"
            aria-label="Next problem"
          >
            <ChevronRight className="size-4" />
          </button>
        </span>
      </header>

      <div className="flex shrink-0 gap-1 border-b border-line bg-surface p-1.5 lg:hidden">
        {(['problem', 'code'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMobileTab(t)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition-colors',
              mobileTab === t ? 'bg-accent-soft text-accent' : 'text-muted',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)]">
        <SqlStatement
          key={problem.id}
          problem={problem}
          className={cn('border-line lg:border-r', mobileTab === 'problem' ? 'block' : 'hidden lg:block')}
        />
        <SqlSolverPane
          problem={problem}
          solver={solver}
          className={mobileTab === 'code' ? 'flex' : 'hidden lg:flex'}
        />
      </div>

      {justSolved && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <div className="anim-slide-up pointer-events-auto flex items-center gap-3 rounded-xl border border-accent/30 bg-surface px-4 py-3 shadow-float">
            <CheckCircle2 className="size-5 text-accent" />
            <div>
              <p className="text-[13px] font-semibold text-accent">Accepted</p>
              <p className="text-[11px] text-muted">Marked solved and counted toward today.</p>
            </div>
            {next && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setJustSolved(false)
                  navigate(`/practice/sql/${next.id}`)
                }}
              >
                Next problem
              </Button>
            )}
            <button onClick={() => setJustSolved(false)} className="text-[11px] text-muted hover:text-ink" aria-label="Dismiss">
              <Badge tone="outline">Dismiss</Badge>
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
