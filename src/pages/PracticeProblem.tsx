/**
 * One problem, open in the editor, with no clock and nobody watching.
 *
 * Everything that makes it work is shared with the proctored round — same
 * editor, same judge, same testcase box (`components/exam/ProblemPanel`). The
 * only differences are what is absent: no timer, no fullscreen gate, no
 * violation counter, and paste is allowed.
 *
 * It renders through a portal into `<body>` for the same reason the round does:
 * the page shell animates itself in with `.anim-in`, which leaves a transform on
 * an ancestor, and an ancestor with a transform makes `position: fixed` relative
 * to *it* rather than to the viewport.
 */
import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, PageHeader } from '@/components/ui/Page'
import { ProblemStatement, SolverPane, score, useSolver } from '@/components/exam/ProblemPanel'
import { CODING_PROBLEMS, PROBLEM_MAP } from '@/data/coding'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/cn'

export default function PracticeProblem() {
  const { problemId } = useParams()
  const navigate = useNavigate()
  const { done, toggleDone } = useApp()
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem')
  const [justSolved, setJustSolved] = useState(false)

  const problem = problemId ? PROBLEM_MAP[problemId] : undefined
  const index = useMemo(
    () => CODING_PROBLEMS.findIndex((p) => p.id === problemId),
    [problemId],
  )
  const isDone = !!problemId && done.includes(problemId)

  /*
   * Solving is one-way, and it logs exactly once. `toggleDone` already writes to
   * the activity log, so logging again here would credit two units of work for
   * one solved problem — and re-solving something already ticked must not credit
   * anything at all, or the day's goal is one Ctrl-Enter away from being met.
   */
  const onSubmitted = useCallback(
    (p: (typeof CODING_PROBLEMS)[number], report: Parameters<typeof score>[0]) => {
      const { passed, total } = score(report)
      if (total === 0 || passed !== total) return
      setJustSolved(true)
      if (!done.includes(p.id)) toggleDone(p.id)
    },
    [done, toggleDone],
  )

  const solver = useSolver(onSubmitted)

  if (!problem) {
    return (
      <div className="space-y-6">
        <PageHeader title="Practice" />
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

  const prev = index > 0 ? CODING_PROBLEMS[index - 1] : null
  const next = index < CODING_PROBLEMS.length - 1 ? CODING_PROBLEMS[index + 1] : null

  return createPortal(
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      <header className="flex shrink-0 items-center gap-2 border-b border-nav-line bg-nav px-3 py-2.5 text-nav-ink sm:gap-3 sm:px-4">
        <button
          onClick={() => navigate('/practice')}
          aria-label="Problems"
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] text-nav-muted transition-colors hover:text-nav-ink"
        >
          {/* The label text is hidden below sm, which drops it from the accessible
              name too — aria-label keeps this from becoming an unlabelled icon button. */}
          <ArrowLeft className="size-3.5" /> <span className="hidden sm:inline">Problems</span>
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

        <a
          href={problem.origin.url}
          target="_blank"
          rel="noreferrer"
          className="hidden shrink-0 items-center gap-1.5 text-[11px] text-nav-muted transition-colors hover:text-nav-ink md:flex"
          title={`Modelled on ${problem.origin.source}: ${problem.origin.title}`}
        >
          {problem.origin.source} <ExternalLink className="size-3" />
        </a>

        <span className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => prev && navigate(`/practice/${prev.id}`)}
            disabled={!prev}
            className="grid size-7 place-items-center rounded-lg text-nav-muted transition-colors hover:text-nav-ink disabled:opacity-30"
            aria-label="Previous problem"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => next && navigate(`/practice/${next.id}`)}
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
        <ProblemStatement
          key={problem.id}
          problem={problem}
          className={cn(
            'border-line lg:border-r',
            mobileTab === 'problem' ? 'block' : 'hidden lg:block',
          )}
        />
        <SolverPane
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
                  navigate(`/practice/${next.id}`)
                }}
              >
                Next problem
              </Button>
            )}
            <button
              onClick={() => setJustSolved(false)}
              className="text-[11px] text-muted hover:text-ink"
              aria-label="Dismiss"
            >
              <Badge tone="outline">Dismiss</Badge>
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
