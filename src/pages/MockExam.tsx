/**
 * Timed problem sets.
 *
 * The timer, question palette, flagging and scoring are all real; only the question
 * bank is sample content. Finishing a paper counts toward the day's streak.
 */
import { useEffect, useMemo, useState } from 'react'
import {
  FileCheck2,
  Clock,
  Users2,
  User,
  Play,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Camera,
  Flag,
  CheckCircle2,
  XCircle,
  Trophy,
  Swords,
  CalendarClock,
  Code2,
  Terminal,
  Maximize2,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Progress, Ring } from '@/components/ui/Progress'
import { PageHeader, SectionTitle, EmptyState } from '@/components/ui/Page'
import { Modal } from '@/components/ui/Modal'
import { EXAMS, FRIENDS, type Exam } from '@/data/exams'
import { CODING_ROUNDS, LANGS, PROBLEM_MAP, type CodingRound as Round } from '@/data/coding'
import { EXAM_TEMPLATES, toRound } from '@/data/examTemplates'
import { CodingRound } from '@/components/exam/CodingRound'
import { ROLE_MAP } from '@/data/roles'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/cn'
import { Link } from 'react-router-dom'
import { comingSoon } from '@/lib/comingSoon'

function Live({ exam, mode, onExit }: { exam: Exam; mode: 'solo' | 'vs'; onExit: () => void }) {
  const { logActivity } = useApp()
  const qs = exam.questions
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<Record<string, number>>({})
  const [flagged, setFlagged] = useState<string[]>([])
  // Distinct from `picked`: a question you opened and left blank has been seen,
  // which is not the same claim as one you never scrolled to. The palette used to
  // conflate the two under "Not visited", so a flagged-but-blank question (which
  // you plainly did visit, that's how you flagged it) was reported as un-opened.
  const [visited, setVisited] = useState<string[]>(() => [qs[0].id])
  const [seconds, setSeconds] = useState(exam.minutes * 60)
  const [submitted, setSubmitted] = useState(false)
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    if (submitted) return
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [submitted])

  useEffect(() => {
    setVisited((v) => (v.includes(qs[idx].id) ? v : [...v, qs[idx].id]))
  }, [idx, qs])

  useEffect(() => {
    if (seconds === 0) setSubmitted(true)
  }, [seconds])

  // Sitting a paper counts toward today, whether it was submitted or timed out.
  useEffect(() => {
    if (submitted) logActivity('mock-exam')
  }, [submitted, logActivity])

  const q = qs[idx]
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const score = qs.filter((x) => picked[x.id] === x.answer).length

  if (submitted) {
    const pct = Math.round((score / qs.length) * 100)
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={onExit}><ArrowLeft className="size-4" /> Back to exams</Button>

        <Card>
          <CardHead title="Results" sub={exam.title} icon={<Trophy className="size-4" />} />
          <div className="grid gap-6 p-5 pt-4 lg:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-2">
              <Ring value={pct} label={`${score}/${qs.length}`} sub={`${pct}%`} />
              <Badge tone={pct >= 60 ? 'accent' : 'warn'}>{pct >= 60 ? 'Above average' : 'Below average'}</Badge>
            </div>
            <div className="space-y-3.5">
              {[
                { l: 'Your score', v: pct },
                { l: 'Batch average', v: exam.avgScore },
                { l: 'Your previous best', v: exam.yourBest ?? 0 },
              ].map((s) => (
                <div key={s.l}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[13px] font-medium">{s.l}</span>
                    <span className="tabular-nums text-xs text-muted">{s.v}%</span>
                  </div>
                  <Progress value={s.v} />
                </div>
              ))}
              {mode === 'vs' && (
                <div className="rounded-xl border border-accent/25 bg-accent-soft p-3.5">
                  <p className="text-[13px] font-medium text-accent">
                    <Swords className="mr-1.5 inline size-3.5" /> Head-to-head
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    You {pct}% · Ananya S 76% · Karthik V 68%. Ananya takes this one.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHead title="Question review" icon={<CheckCircle2 className="size-4" />} />
          <div className="space-y-3 p-5 pt-3.5">
            {qs.map((x, i) => {
              const ok = picked[x.id] === x.answer
              const attempted = picked[x.id] !== undefined
              return (
                <div key={x.id} className={cn('rounded-xl border p-4', ok ? 'border-accent/30 bg-accent-soft/30' : 'border-line bg-surface-2')}>
                  <div className="flex items-start gap-3">
                    {ok ? (
                      <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-accent" />
                    ) : (
                      <XCircle className="mt-0.5 size-4.5 shrink-0 text-danger" />
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium leading-relaxed">
                        <span className="mr-1.5 tabular-nums text-muted">Q{i + 1}.</span>
                        {x.text}
                      </p>
                      <p className="mt-2 text-xs text-muted">
                        Correct: <b className="text-accent">{x.options[x.answer]}</b>
                        {attempted && !ok && <> · you chose <b className="text-danger">{x.options[picked[x.id]]}</b></>}
                        {!attempted && <> · <b className="text-warn">not attempted</b></>}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted">{x.explain}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Badge tone="danger" className="animate-pulse"><Camera className="size-3" /> Proctoring active</Badge>
          <Badge tone="neutral">{mode === 'vs' ? 'Head-to-head' : 'Individual'}</Badge>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-1.5">
          <Clock className={cn('size-3.5', seconds < 60 ? 'text-danger' : 'text-accent')} />
          <span className={cn('tabular-nums text-sm', seconds < 60 && 'text-danger')}>{mm}:{ss}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-muted">
              Question {idx + 1} of {qs.length}
            </p>
            <button
              onClick={() => setFlagged((f) => (f.includes(q.id) ? f.filter((x) => x !== q.id) : [...f, q.id]))}
              className={cn('flex items-center gap-1.5 text-[11px] transition-colors', flagged.includes(q.id) ? 'text-warn' : 'text-muted hover:text-ink')}
            >
              <Flag className="size-3.5" fill={flagged.includes(q.id) ? 'currentColor' : 'none'} />
              {flagged.includes(q.id) ? 'Flagged' : 'Flag for review'}
            </button>
          </div>

          <p className="mt-3 text-[15px] leading-relaxed">{q.text}</p>

          <div className="mt-5 space-y-2">
            {q.options.map((o, i) => (
              <button
                key={o}
                onClick={() => setPicked((p) => ({ ...p, [q.id]: i }))}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[13px] transition-colors',
                  picked[q.id] === i ? 'border-accent/55 bg-accent-soft text-accent' : 'border-line bg-surface-2 hover:border-accent/30',
                )}
              >
                <span className={cn('grid size-6 shrink-0 place-items-center rounded-lg border tabular-nums text-[11px]', picked[q.id] === i ? 'border-accent bg-accent text-accent-fg' : 'border-line')}>
                  {String.fromCharCode(65 + i)}
                </span>
                {o}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
            <Button variant="ghost" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
              <ArrowLeft className="size-4" /> Previous
            </Button>
            {idx === qs.length - 1 ? (
              <Button variant="primary" onClick={() => setConfirm(true)}>Submit exam</Button>
            ) : (
              <Button variant="primary" onClick={() => setIdx((i) => Math.min(qs.length - 1, i + 1))}>
                Next <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle>Question palette</SectionTitle>
            <div className="grid grid-cols-5 gap-1.5">
              {qs.map((x, i) => {
                const isAnswered = picked[x.id] !== undefined
                const isFlagged = flagged.includes(x.id)
                // A question can be visited and left blank without being flagged —
                // that is not the same state as one never opened, so it gets its
                // own colour rather than silently falling into "not visited".
                const isSkipped = !isAnswered && !isFlagged && visited.includes(x.id)
                const state = isFlagged ? 'flagged' : isAnswered ? 'answered' : isSkipped ? 'skipped' : 'unvisited'
                return (
                  <button
                    key={x.id}
                    onClick={() => setIdx(i)}
                    aria-current={i === idx ? 'true' : undefined}
                    aria-label={`Question ${i + 1}, ${state}${i === idx ? ', current' : ''}`}
                    className={cn(
                      'grid aspect-square place-items-center rounded-lg border tabular-nums text-xs transition-colors',
                      i === idx
                        ? 'border-accent bg-accent text-accent-fg'
                        : isFlagged
                          ? 'border-warn/50 bg-warn/10 text-warn'
                          : isAnswered
                            ? 'border-accent/40 bg-accent-soft text-accent'
                            : isSkipped
                              ? 'border-danger/40 bg-danger/10 text-danger'
                              : 'border-line bg-surface-2 text-muted',
                    )}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <div className="mt-3.5 space-y-1.5 border-t border-line pt-3 text-[11px] text-muted">
              <p><span className="mr-1.5 inline-block size-2 rounded-sm bg-accent" />Answered · {Object.keys(picked).length}</p>
              <p><span className="mr-1.5 inline-block size-2 rounded-sm bg-warn" />Flagged · {flagged.length}</p>
              <p>
                <span className="mr-1.5 inline-block size-2 rounded-sm bg-danger" />
                Visited, skipped · {qs.filter((x) => !flagged.includes(x.id) && picked[x.id] === undefined && visited.includes(x.id)).length}
              </p>
              <p><span className="mr-1.5 inline-block size-2 rounded-sm bg-line" />Not visited · {qs.length - visited.length}</p>
            </div>
            <Button variant="secondary" size="sm" className="mt-3.5 w-full" onClick={() => setConfirm(true)}>
              Submit exam
            </Button>
          </Card>

          <Card className="border-danger/25">
            <CardHead title="Proctoring" icon={<ShieldCheck className="size-4" />} />
            <ul className="space-y-1.5 p-5 pt-3.5 text-[11px] leading-relaxed text-muted">
              <li>· Tab switches are logged</li>
              <li>· Webcam frames sampled every 30s</li>
              <li>· Copy-paste disabled in the answer area</li>
              <li className="pt-1.5 text-warn">Not enforced in the prototype.</li>
            </ul>
          </Card>
        </div>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Submit exam?"
        sub={`${Object.keys(picked).length} of ${qs.length} answered · ${flagged.length} flagged`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>Keep working</Button>
            <Button variant="primary" onClick={() => { setConfirm(false); setSubmitted(true) }}>Submit</Button>
          </>
        }
      />
    </div>
  )
}

export default function MockExam() {
  const { profile } = useApp()
  const [mode, setMode] = useState<'solo' | 'vs'>('solo')
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [active, setActive] = useState<Exam | null>(null)
  const [coding, setCoding] = useState<Round | null>(null)
  const [tier, setTier] = useState<Round['difficulty'] | null>(null)
  const [challenge, setChallenge] = useState<Exam | null>(null)

  const list = useMemo(
    () => (scope === 'mine' ? EXAMS.filter((e) => profile.targetRoles.includes(e.role)) : EXAMS),
    [scope, profile.targetRoles],
  )

  if (active) return <Live exam={active} mode={mode} onExit={() => setActive(null)} />
  if (coding) return <CodingRound round={coding} onExit={() => setCoding(null)} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mock Exam"
        icon={<FileCheck2 className="size-5" />}
        preview
        sub="Timed, proctored problem sets. Take them alone, or put one up against your friends and see who folds under the clock."
      />

      <Card className="border-accent/25">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <Code2 className="size-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold">Just want to practise?</p>
              <p className="mt-0.5 max-w-lg text-xs leading-relaxed text-muted">
                Every problem below is also open on its own, with the same editor and judge and no
                clock. Rounds are for pressure; practice is for learning them in the first place.
              </p>
            </div>
          </div>
          <Link to="/practice">
            <Button variant="secondary" size="sm">Open the problem list</Button>
          </Link>
        </div>
      </Card>

      <section>
        <SectionTitle
          right={
            <span className="text-[11px] text-muted">
              <Maximize2 className="mr-1 inline size-3" /> Fullscreen · live judge
            </span>
          }
        >
          Coding rounds
        </SectionTitle>

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {([null, 'Easy', 'Medium', 'Hard'] as const).map((t) => (
            <button
              key={t ?? 'all'}
              onClick={() => setTier(t)}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors',
                tier === t
                  ? 'border-accent/50 bg-accent-soft text-accent'
                  : 'border-line bg-surface-2 text-muted hover:text-ink',
              )}
            >
              {t ?? 'All tiers'}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {/*
            * Templates first, then the older hand-made rounds. A template is a
            * designed simulation of a real assessment; the originals are kept
            * because their problem mixes are still good practice.
            */}
          {[...EXAM_TEMPLATES.map(toRound), ...CODING_ROUNDS]
            .filter((r) => scope === 'all' || profile.targetRoles.includes(r.role))
            .filter((r) => !tier || r.difficulty === tier)
            .map((r) => (
            <Card key={r.id} hover className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="accent">{ROLE_MAP[r.role].label}</Badge>
                <Badge tone={r.difficulty === 'Hard' ? 'danger' : r.difficulty === 'Medium' ? 'warn' : 'neutral'}>
                  {r.difficulty}
                </Badge>
              </div>
              <h3 className="mt-3 text-[15px] font-medium leading-snug">{r.title}</h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
                <span className="flex items-center gap-1"><Clock className="size-3.5" /> {r.minutes} min</span>
                <span>{r.problemIds.length} problem{r.problemIds.length > 1 ? 's' : ''}</span>
                <span>{r.attempts.toLocaleString()} attempts</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.problemIds.map((id) => (
                  <Badge key={id} tone="outline">{PROBLEM_MAP[id]?.title ?? id}</Badge>
                ))}
              </div>

              <div className="mt-4 flex-1">
                <div className="mb-1 flex items-baseline justify-between text-[11px]">
                  <span className="text-muted">Batch average</span>
                  <span className="tabular-nums">{r.avgScore}%</span>
                </div>
                <Progress value={r.avgScore} />
                {r.yourBest !== undefined && (
                  <p className="mt-2 text-[11px] text-accent">Your best · {r.yourBest}%</p>
                )}
              </div>

              <Button size="sm" variant="primary" className="mt-4 w-full" onClick={() => setCoding(r)}>
                <Code2 className="size-3.5" /> Start coding round
              </Button>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted">
                <Terminal className="size-3" />
                {LANGS.map((l) => l.label.split(' ')[0]).join(' · ')}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <SectionTitle>Aptitude and MCQ papers</SectionTitle>

      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => setMode('solo')} className="text-left">
          <Card className={cn('h-full p-5 transition-colors', mode === 'solo' ? 'border-accent/55 bg-accent-soft' : 'hover:border-accent/30')}>
            <div className="flex items-start gap-3">
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', mode === 'solo' ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-muted')}>
                <User className="size-4.5" />
              </span>
              <div>
                <p className={cn('text-sm font-semibold', mode === 'solo' && 'text-accent')}>Individual</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Your own clock, your own pace. Results compared against the batch average.
                </p>
              </div>
            </div>
          </Card>
        </button>

        <button onClick={() => setMode('vs')} className="text-left">
          <Card className={cn('h-full p-5 transition-colors', mode === 'vs' ? 'border-accent/55 bg-accent-soft' : 'hover:border-accent/30')}>
            <div className="flex items-start gap-3">
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', mode === 'vs' ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-muted')}>
                <Users2 className="size-4.5" />
              </span>
              <div>
                <p className={cn('text-sm font-semibold', mode === 'vs' && 'text-accent')}>Against friends</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Same paper, same start time, live leaderboard while the clock runs.
                </p>
              </div>
            </div>
          </Card>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={scope}
          onChange={setScope}
          items={[
            { value: 'mine', label: 'My profiles', count: EXAMS.filter((e) => profile.targetRoles.includes(e.role)).length },
            { value: 'all', label: 'All exams', count: EXAMS.length },
          ]}
        />
      </div>

      {list.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((e) => (
            <Card key={e.id} hover className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="accent">{ROLE_MAP[e.role].label}</Badge>
                <Badge tone={e.difficulty === 'Hard' ? 'danger' : e.difficulty === 'Medium' ? 'warn' : 'neutral'}>
                  {e.difficulty}
                </Badge>
              </div>
              <h3 className="mt-3 text-[15px] font-medium leading-snug">{e.title}</h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
                <span className="flex items-center gap-1"><Clock className="size-3.5" /> {e.minutes} min</span>
                <span>{e.questionCount} questions</span>
                <span>{e.attempts.toLocaleString()} attempts</span>
              </div>

              <div className="mt-4 flex-1">
                <div className="mb-1 flex items-baseline justify-between text-[11px]">
                  <span className="text-muted">Batch average</span>
                  <span className="tabular-nums">{e.avgScore}%</span>
                </div>
                <Progress value={e.avgScore} />
                {e.yourBest !== undefined && (
                  <p className="mt-2 text-[11px] text-accent">Your best · {e.yourBest}%</p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="primary" className="flex-1" onClick={() => setActive(e)}>
                  <Play className="size-3.5" /> Start
                </Button>
                {mode === 'vs' && (
                  <Button size="sm" variant="secondary" onClick={() => setChallenge(e)}>
                    <Swords className="size-3.5" />
                  </Button>
                )}
              </div>
              <p className="mt-2 text-center text-[10px] text-muted">
                Prototype runs a 5-question sample
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileCheck2 className="size-6" />}
          title="No exams for your profiles"
          sub="Switch to All exams, or add more target profiles."
          action={<Button variant="secondary" onClick={() => setScope('all')}>Show all exams</Button>}
        />
      )}

      <Card className="border-accent/25">
        <CardHead title="Open weekly exam" sub="Anyone can attend, no shortlist needed" icon={<CalendarClock className="size-4" />} />
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 pt-3.5">
          <p className="max-w-md text-xs leading-relaxed text-muted">
            Every Saturday at 8pm, a mixed set across all seven profiles. Leaderboard published
            afterwards, and the top ten get a written breakdown of where they lost marks.
          </p>
          <Link to={comingSoon('Weekly exam booking', '/mock-exam')}>
            <Button variant="primary" size="sm">Reserve my slot</Button>
          </Link>
        </div>
      </Card>

      <Modal
        open={!!challenge}
        onClose={() => setChallenge(null)}
        title="Challenge friends"
        sub={challenge?.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => setChallenge(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => setChallenge(null)}>Send challenge</Button>
          </>
        }
      >
        <div className="space-y-2">
          {FRIENDS.slice(0, 5).map((f) => (
            <label key={f.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3">
              <input type="checkbox" defaultChecked={f.online} className="size-4 accent-[var(--accent)]" />
              <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
                {f.name.split(' ').map((s) => s[0]).join('')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium">{f.name}</span>
                <span className="block text-[11px] text-muted">{f.roll} · {f.streak}d streak</span>
              </span>
              {f.online && <Badge tone="accent">online</Badge>}
            </label>
          ))}
          <p className="pt-2 text-[11px] leading-relaxed text-muted">
            Everyone gets the same paper and the same start time. The leaderboard updates live while
            the clock runs.
          </p>
        </div>
      </Modal>
    </div>
  )
}
