import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  Maximize2,
  ShieldAlert,
  Trophy,
  XCircle,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress, Ring } from '@/components/ui/Progress'
import { SectionTitle } from '@/components/ui/Page'
import { Modal } from '@/components/ui/Modal'
import {
  ProblemStatement,
  SolverPane,
  Val,
  score,
  useSolver,
  type Submission,
} from './ProblemPanel'
import { LANGS, PROBLEM_MAP, type CodingProblem, type CodingRound as Round } from '@/data/coding'
import { fmtMicros } from '@/lib/harness'
import { useProctor } from '@/lib/proctor'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/cn'

/**
 * A proctored coding round: fullscreen gate, clock, statement, editor, judge.
 *
 * Everything to do with *solving* — the editor, the testcase box, the result
 * panel — lives in `ProblemPanel.tsx` and is shared with free practice. What is
 * left here is only the chrome a timed, watched exam adds on top: the clock, the
 * fullscreen gate, the violation counter and the report.
 */

export function CodingRound({ round, onExit }: { round: Round; onExit: () => void }) {
  const { logActivity } = useApp()
  const problems = useMemo(
    () => round.problemIds.map((id) => PROBLEM_MAP[id]).filter(Boolean) as CodingProblem[],
    [round.problemIds],
  )

  const [phase, setPhase] = useState<'gate' | 'live' | 'done'>('gate')
  const [seconds, setSeconds] = useState(round.minutes * 60)
  const [idx, setIdx] = useState(0)
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem')
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [subs, setSubs] = useState<Record<string, Submission>>({})
  /*
   * Whether fullscreen was actually granted when the round started — not the
   * same question as whether the browser claims to support it. A browser that
   * advertises `requestFullscreen` and then refuses it (kiosk policy, an
   * embedded webview, a permission the user has denied) would otherwise leave
   * the student behind a "return to fullscreen" overlay whose only button can
   * never succeed. If we never had it, we do not demand it back.
   */
  const [fullscreenHeld, setFullscreenHeld] = useState(false)

  const proctor = useProctor(phase === 'live')
  const elapsed = round.minutes * 60 - seconds

  /*
   * The submit handler below is created once so that the solver's memoisation is
   * not thrown away every second by a dependency on the clock. These refs are how
   * it reads the current language, code and elapsed time without being rebuilt.
   */
  const snapshot = useRef({ lang: 'python' as Submission['lang'], code: '', elapsed: 0 })

  const onSubmitted = useCallback((p: CodingProblem, report: Parameters<typeof score>[0]) => {
    const { passed } = score(report)
    const us = report.cases.reduce((n, c) => n + c.us, 0)
    const { lang, code, elapsed: at } = snapshot.current
    setSubs((s) => {
      const prev = s[p.id]
      // Strictly worse loses; a tie takes the newer one, which is the submission
      // the student just made and expects to see in the report.
      if (prev && prev.passed > passed) return s
      return {
        ...s,
        [p.id]: { lang, code, passed, total: p.cases.length, solved: passed === p.cases.length, us, at },
      }
    })
  }, [])

  const solver = useSolver(onSubmitted)
  const problem = problems[idx]
  snapshot.current = { lang: solver.lang, code: solver.codeFor(problem, solver.lang), elapsed }

  /* ------------------------------------------------------------------- clock */

  useEffect(() => {
    if (phase !== 'live') return
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [phase])

  const { cancel } = solver
  const finish = useCallback(() => {
    cancel()
    proctor.leave()
    setPhase('done')
  }, [proctor, cancel])

  useEffect(() => {
    if (phase === 'live' && seconds === 0) finish()
  }, [phase, seconds, finish])

  useEffect(() => {
    if (phase === 'done') logActivity('mock-exam')
  }, [phase, logActivity])

  // A round in progress should cost something to walk away from. The scroll lock
  // is part of the same idea: the page behind the round must not move.
  useEffect(() => {
    if (phase !== 'live') return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('beforeunload', warn)
      document.body.style.overflow = ''
    }
  }, [phase])

  /* --------------------------------------------------------------------- gate */

  if (phase === 'gate') {
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="size-4" /> Back to exams
        </Button>

        <Card className="mx-auto max-w-2xl">
          <CardHead
            title={round.title}
            sub={`${problems.length} problem${problems.length > 1 ? 's' : ''} · ${round.minutes} minutes · ${round.difficulty}`}
            icon={<Code2 className="size-4" />}
          />
          <div className="space-y-5 p-5 pt-4">
            <div className="rounded-xl border border-accent/25 bg-accent-soft p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-accent">
                <Maximize2 className="size-4" /> This round runs in fullscreen
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {proctor.supported
                  ? 'Starting will put the browser into fullscreen. Leaving it does not end the round, but every exit is counted and shown in your report — the same rule most campus online assessments use.'
                  : 'Your browser will not grant fullscreen (this is normal on iPhone). The round still runs windowed; the fullscreen counter simply stays at zero.'}
              </p>
            </div>

            <div>
              <SectionTitle>What is enforced</SectionTitle>
              <ul className="space-y-2 text-xs leading-relaxed text-muted">
                <li className="flex gap-2.5">
                  <ShieldAlert className="mt-px size-3.5 shrink-0 text-warn" />
                  Tab switches and window blurs are counted.
                </li>
                <li className="flex gap-2.5">
                  <ShieldAlert className="mt-px size-3.5 shrink-0 text-warn" />
                  Fullscreen exits are counted.
                </li>
                <li className="flex gap-2.5">
                  <ShieldAlert className="mt-px size-3.5 shrink-0 text-warn" />
                  {round.blockPaste
                    ? 'Paste into the editor is blocked, and each attempt is counted.'
                    : 'Paste is allowed in this warm-up round.'}
                </li>
                <li className="flex gap-2.5">
                  <Clock className="mt-px size-3.5 shrink-0 text-muted" />
                  The clock does not stop, and submitting early does not end the round.
                </li>
              </ul>
            </div>

            <div>
              <SectionTitle>Problems</SectionTitle>
              <div className="space-y-2">
                {problems.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5"
                  >
                    <span className="min-w-0 text-[13px]">
                      <span className="mr-2 tabular-nums text-muted">{i + 1}.</span>
                      {p.title}
                    </span>
                    <Badge tone={p.difficulty === 'Hard' ? 'danger' : p.difficulty === 'Medium' ? 'warn' : 'neutral'}>
                      {p.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={async () => {
                setFullscreenHeld(await proctor.enter())
                proctor.reset()
                setPhase('live')
              }}
            >
              <Maximize2 className="size-4" /> Enter fullscreen and start
            </Button>
            <p className="text-center text-[11px] text-muted">
              Press Esc at any time to leave fullscreen. The round keeps running.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  /* ------------------------------------------------------------------ results */

  if (phase === 'done') {
    const solvedCount = problems.filter((p) => subs[p.id]?.solved).length
    const passedTests = problems.reduce((n, p) => n + (subs[p.id]?.passed ?? 0), 0)
    const totalTests = problems.reduce((n, p) => n + p.cases.length, 0)
    const pct = Math.round((passedTests / totalTests) * 100)
    const flags = proctor.tabSwitches + proctor.fullscreenExits + proctor.blockedPastes

    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="size-4" /> Back to exams
        </Button>

        <Card>
          <CardHead title="Round report" sub={round.title} icon={<Trophy className="size-4" />} />
          <div className="grid gap-6 p-5 pt-4 lg:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-2">
              <Ring value={pct} label={`${solvedCount}/${problems.length}`} sub={`${pct}%`} />
              <Badge tone={solvedCount === problems.length ? 'accent' : pct >= 50 ? 'warn' : 'danger'}>
                {solvedCount === problems.length
                  ? 'All problems solved'
                  : `${solvedCount} solved, ${problems.length - solvedCount} not`}
              </Badge>
            </div>
            <div className="space-y-3.5">
              {[
                { l: 'Testcases passed', v: pct },
                { l: 'Batch average', v: round.avgScore },
                { l: 'Your previous best', v: round.yourBest ?? 0 },
              ].map((s) => (
                <div key={s.l}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[13px] font-medium">{s.l}</span>
                    <span className="tabular-nums text-xs text-muted">{s.v}%</span>
                  </div>
                  <Progress value={s.v} />
                </div>
              ))}
              <div
                className={cn(
                  'rounded-xl border p-3.5',
                  flags ? 'border-warn/30 bg-warn/8' : 'border-accent/25 bg-accent-soft',
                )}
              >
                <p className={cn('text-[13px] font-medium', flags ? 'text-warn' : 'text-accent')}>
                  <ShieldAlert className="mr-1.5 inline size-3.5" />
                  {flags ? `${flags} proctoring flag${flags > 1 ? 's' : ''}` : 'Clean run — no flags'}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {proctor.tabSwitches} tab switch{proctor.tabSwitches === 1 ? '' : 'es'} ·{' '}
                  {proctor.fullscreenExits} fullscreen exit{proctor.fullscreenExits === 1 ? '' : 's'} ·{' '}
                  {proctor.blockedPastes} blocked paste{proctor.blockedPastes === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {problems.map((p) => {
          const sub = subs[p.id]
          return (
            <Card key={p.id}>
              <CardHead
                title={p.title}
                sub={
                  sub
                    ? `${sub.passed}/${sub.total} testcases · ${fmtMicros(sub.us)} · submitted at ${Math.floor(sub.at / 60)}m ${sub.at % 60}s · ${LANGS.find((l) => l.id === sub.lang)?.label}`
                    : 'Never submitted'
                }
                icon={sub?.solved ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                action={
                  <Badge tone={sub?.solved ? 'accent' : sub ? 'warn' : 'neutral'}>
                    {sub?.solved ? 'Accepted' : sub ? 'Partial' : 'Not attempted'}
                  </Badge>
                }
              />
              <div className="space-y-3 p-5 pt-3.5">
                {sub && <Progress value={Math.round((sub.passed / sub.total) * 100)} />}
                <div className="rounded-xl border border-line bg-surface-2 p-3.5">
                  <p className="text-xs font-medium">Where to go next</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {sub?.solved
                      ? 'Solved. Read the editorial on the original anyway — the discussion is where the neater solution usually is.'
                      : p.hints[p.hints.length - 1]}
                  </p>
                  <a
                    href={p.origin.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
                  >
                    {p.origin.source} · {p.origin.title} <ExternalLink className="size-3" />
                  </a>
                </div>
                {sub && (
                  <details className="group">
                    <summary className="cursor-pointer list-none text-xs text-muted hover:text-ink">
                      <ChevronRight className="mr-1 inline size-3.5 transition-transform group-open:rotate-90" />
                      Your submission
                    </summary>
                    <Val>{sub.code}</Val>
                  </details>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  /* --------------------------------------------------------------------- live */

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const low = seconds < 300
  const flagCount = proctor.tabSwitches + proctor.fullscreenExits + proctor.blockedPastes

  // Into <body>, for the same reason the Modal does it: the page shell animates
  // itself in with `.anim-in`, which leaves a transform on an ancestor, and an
  // ancestor with a transform makes `position: fixed` relative to *it* rather
  // than to the viewport. The round would then be boxed inside the content
  // column with the sidebar still showing, which is not a proctored anything.
  return createPortal(
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      <header className="flex shrink-0 items-center gap-2 border-b border-nav-line bg-nav px-3 py-2.5 text-nav-ink sm:gap-3 sm:px-4">
        <span className="hidden shrink-0 text-[13px] font-semibold tracking-tight sm:block">
          {round.title}
        </span>

        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {problems.map((p, i) => {
            const s = subs[p.id]
            return (
              <button
                key={p.id}
                onClick={() => setIdx(i)}
                aria-current={i === idx ? 'true' : undefined}
                // The solved/partial/untouched status is carried by a coloured dot
                // with no text next to it — name it explicitly, since a screen
                // reader has nothing else in this button to announce that state.
                aria-label={`Problem ${i + 1}, ${p.title}, ${s?.solved ? 'solved' : s ? 'attempted, not solved' : 'not attempted'}`}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors',
                  i === idx ? 'bg-nav-2 text-nav-ink' : 'text-nav-muted hover:text-nav-ink',
                )}
              >
                {s?.solved ? (
                  <CheckCircle2 className="size-3.5 text-nav-accent" />
                ) : s ? (
                  <span className="size-1.5 rounded-full bg-warn" />
                ) : (
                  <span className="size-1.5 rounded-full bg-nav-line" />
                )}
                P{i + 1}
                <span className="hidden md:inline">· {p.title}</span>
              </button>
            )
          })}
        </div>

        {flagCount > 0 && (
          <span
            className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-warn/40 px-2 py-1 text-[11px] text-warn sm:flex"
            title="Tab switches + fullscreen exits + blocked pastes"
          >
            <ShieldAlert className="size-3.5" />
            {flagCount}
          </span>
        )}

        <span
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 tabular-nums',
            low ? 'border-danger/50 text-danger' : 'border-nav-line text-nav-ink',
          )}
        >
          <Clock className="size-3.5" />
          <span className="text-[13px]">{mm}:{ss}</span>
        </span>

        <button
          onClick={() => setConfirmEnd(true)}
          className="shrink-0 rounded-lg border border-nav-line px-2.5 py-1.5 text-[12px] text-nav-muted transition-colors hover:text-nav-ink"
        >
          End
        </button>
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
          index={idx + 1}
          // One display utility at a time. Emitting both `block` and `hidden`
          // and hoping the stylesheet orders them the way you want is how a
          // pane ends up visible on a phone that should not see it.
          className={cn(
            'border-line lg:border-r',
            mobileTab === 'problem' ? 'block' : 'hidden lg:block',
          )}
        />

        <SolverPane
          problem={problem}
          solver={solver}
          blockPaste={round.blockPaste}
          onBlockedPaste={proctor.countBlockedPaste}
          className={mobileTab === 'code' ? 'flex' : 'hidden lg:flex'}
        />
      </div>

      {fullscreenHeld && !proctor.fullscreen && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-scrim p-6 backdrop-blur-sm">
          <Card className="max-w-sm p-6 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-xl bg-warn/10 text-warn">
              <AlertTriangle className="size-5" />
            </span>
            <p className="mt-3 text-sm font-semibold">You left fullscreen</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              The clock is still running, and this was logged as exit {proctor.fullscreenExits}.
              Return to carry on.
            </p>
            <Button
              variant="primary"
              className="mt-4 w-full"
              onClick={async () => {
                // A refusal here would strand them, so drop the requirement.
                if (!(await proctor.enter())) setFullscreenHeld(false)
              }}
            >
              <Maximize2 className="size-4" /> Back to fullscreen
            </Button>
            <button
              onClick={() => setConfirmEnd(true)}
              className="mt-2.5 text-[11px] text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              End the round instead
            </button>
          </Card>
        </div>
      )}

      <Modal
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        title="End the round?"
        sub={`${Object.keys(subs).length} of ${problems.length} problems submitted · ${mm}:${ss} left on the clock`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmEnd(false)}>Keep working</Button>
            <Button variant="primary" onClick={() => { setConfirmEnd(false); finish() }}>
              End and see the report
            </Button>
          </>
        }
      >
        <p className="text-xs leading-relaxed text-muted">
          Only submitted problems are scored. Anything you have typed but not submitted counts for
          nothing, exactly as on a real judge.
        </p>
      </Modal>
    </div>,
    document.body,
  )
}
