/**
 * A round-by-round mock interview.
 *
 * The interviewer follows a fixed script per role and the feedback report is
 * pre-written. The session flow, timer and transcript are real, and completing a
 * round counts toward the day's streak.
 */
import { useEffect, useRef, useState } from 'react'
import {
  Mic,
  Send,
  Bot,
  Clock,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Play,
  RotateCcw,
  Video,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Progress, Ring } from '@/components/ui/Progress'
import { PageHeader, EmptyState, SectionTitle } from '@/components/ui/Page'
import { useApp } from '@/context/AppContext'
import { ROLE_MAP, type RoleId } from '@/data/roles'
import { ROUNDS, FEEDBACK, type Round } from '@/data/interviews'
import { RESUME_REVIEW } from '@/data/user'
import { cn } from '@/lib/cn'
import { Link } from 'react-router-dom'
import { comingSoon } from '@/lib/comingSoon'

type Msg = { from: 'bot' | 'me'; text: string }

function Session({ round, role, onExit }: { round: Round; role: RoleId; onExit: () => void }) {
  const { profile, logActivity } = useApp()
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: 'bot',
      text: `Hi ${profile.name.split(' ')[0]}, thanks for making the time. I've read your resume, ${RESUME_REVIEW.fileName}. This is a ${round.minutes}-minute ${round.label.toLowerCase()} for a ${ROLE_MAP[role].label} internship. Ready when you are.`,
    },
    { from: 'bot', text: round.script[0].q },
  ])
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'q' | 'followup'>('q')
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [seconds, setSeconds] = useState(round.minutes * 60)
  const [ended, setEnded] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ended) return
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [ended])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const elapsed = ((round.minutes * 60 - seconds) / (round.minutes * 60)) * 100

  function answer() {
    if (!input.trim()) return
    setMsgs((m) => [...m, { from: 'me', text: input.trim() }])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      setTyping(false)
      const cur = round.script[step]
      if (phase === 'q' && cur.followUp) {
        setPhase('followup')
        setMsgs((m) => [...m, { from: 'bot', text: cur.followUp! }])
        return
      }
      const next = step + 1
      if (next < round.script.length) {
        setStep(next)
        setPhase('q')
        setMsgs((m) => [...m, { from: 'bot', text: round.script[next].q }])
      } else {
        setEnded(true)
        logActivity('mock-interview')
        setMsgs((m) => [
          ...m,
          { from: 'bot', text: "That's all from me. Thanks. I'm generating your feedback now." },
        ])
      }
    }, 1100)
  }

  if (ended) {
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="size-4" /> Back to rounds
        </Button>

        <Card className="overflow-hidden">
          <CardHead
            title="Round feedback"
            sub={`${ROLE_MAP[role].label} · ${round.label}`}
            icon={<Sparkles className="size-4" />}
            action={<Badge tone="warn">Example output</Badge>}
          />
          <div className="grid gap-6 p-5 pt-4 lg:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-2">
              <Ring value={FEEDBACK.overall} label={String(FEEDBACK.overall)} sub="overall" />
              <Badge tone={FEEDBACK.overall >= 70 ? 'accent' : 'warn'}>
                {FEEDBACK.overall >= 70 ? 'Would pass' : 'Borderline'}
              </Badge>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {FEEDBACK.metrics.map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[13px] font-medium">{m.label}</span>
                    <span className="tabular-nums text-xs text-muted">{m.value}</span>
                  </div>
                  <Progress value={m.value} />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHead title="What worked" icon={<CheckCircle2 className="size-4" />} />
            <ul className="space-y-2.5 p-5 pt-3.5">
              {FEEDBACK.strengths.map((s) => (
                <li key={s} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHead title="What to fix" icon={<AlertTriangle className="size-4" />} />
            <div className="space-y-2.5 p-5 pt-3.5">
              {FEEDBACK.improve.map((i) => (
                <div key={i.title} className="rounded-xl border border-line bg-surface-2 p-3.5">
                  <p className="text-[13px] font-medium">{i.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{i.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={onExit}><RotateCcw className="size-4" /> Try another round</Button>
          <Link to={comingSoon('Transcript download', '/mock-interview')}>
            <Button variant="secondary"><FileText className="size-4" /> Download transcript</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="size-4" /> Leave interview
        </Button>
        <div className="flex items-center gap-3">
          <Badge tone="accent">
            Question {Math.min(step + 1, round.script.length)}/{round.script.length}
          </Badge>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-1.5">
            <Clock className="size-3.5 text-accent" />
            <span className="tabular-nums text-sm">{mm}:{ss}</span>
          </div>
        </div>
      </div>

      <Progress value={elapsed} />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="flex h-[540px] flex-col overflow-hidden">
          <CardHead
            title={`${ROLE_MAP[role].label} · ${round.label}`}
            sub={round.desc}
            icon={<Bot className="size-4" />}
          />
          <div className="flex-1 space-y-3 overflow-y-auto scroll-thin p-5 pt-4">
            {msgs.map((m, i) => (
              <div key={i} className={cn('flex gap-2.5', m.from === 'me' ? 'justify-end' : 'justify-start')}>
                {m.from === 'bot' && (
                  <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Bot className="size-3.5" />
                  </span>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                    m.from === 'me'
                      ? 'rounded-br-md bg-accent text-accent-fg'
                      : 'rounded-bl-md border border-line bg-surface-2 text-muted',
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <Bot className="size-3.5" />
                </span>
                <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-surface-2 px-3.5 py-3">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="size-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="flex gap-2 border-t border-line p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && answer()}
              placeholder="Type your answer. Think out loud, the way you would speak it."
              autoFocus
            />
            <Button variant="primary" onClick={answer} disabled={!input.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHead title="Camera" icon={<Video className="size-4" />} action={<Badge tone="neutral">Off</Badge>} />
            <div className="p-5 pt-3.5">
              <div className="grid aspect-video place-items-center rounded-xl border border-dashed border-line bg-surface-2">
                <Video className="size-6 text-muted" />
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
                Video and speech analysis (pace, filler words, eye contact) is planned but not in this
                prototype.
              </p>
            </div>
          </Card>

          <Card>
            <CardHead title="Live notes" icon={<Sparkles className="size-4" />} />
            <ul className="space-y-2 p-5 pt-3.5 text-[11px] leading-relaxed text-muted">
              <li>· State your approach before you start writing.</li>
              <li>· Volunteer time and space complexity without being asked.</li>
              <li>· Say the edge cases out loud even if you skip coding them.</li>
              <li>· Narrate dead ends. Silence reads as being stuck.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function MockInterview() {
  const { profile } = useApp()
  const [role, setRole] = useState<RoleId | null>(profile.targetRoles[0] ?? null)
  const [active, setActive] = useState<Round | null>(null)

  useEffect(() => {
    if (!profile.targetRoles.length) setRole(null)
    else if (!role || !profile.targetRoles.includes(role)) setRole(profile.targetRoles[0])
  }, [profile.targetRoles, role])

  if (!profile.targetRoles.length) {
    return (
      <>
        <PageHeader title="Mock Interview" icon={<Mic className="size-5" />} />
        <EmptyState
          icon={<Mic className="size-6" />}
          title="Pick a target profile first"
          sub="Interview rounds are role-specific. An SDE loop looks nothing like a consulting one."
          action={<Link to="/profile"><Button variant="primary">Go to profile</Button></Link>}
        />
      </>
    )
  }

  if (active && role) return <Session round={active} role={role} onExit={() => setActive(null)} />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mock Interview"
        icon={<Mic className="size-5" />}
        preview
        sub="An AI interviewer that has read your resume and runs the rounds a real loop would, then tells you what to fix."
      />

      <Card className="p-4">
        <SectionTitle>Choose a profile</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {profile.targetRoles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                'rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors',
                role === r ? 'border-accent/50 bg-accent-soft text-accent' : 'border-line bg-surface-2 text-muted hover:text-ink',
              )}
            >
              {ROLE_MAP[r].label}
            </button>
          ))}
        </div>
      </Card>

      <div>
        <SectionTitle right={<Badge tone="accent">{role ? ROLE_MAP[role].label : ''} loop</Badge>}>
          Rounds
        </SectionTitle>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {role &&
            ROUNDS[role].map((r, i) => (
              <Card key={r.id} hover className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-accent-soft tabular-nums text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  <Badge tone="neutral"><Clock className="size-3" /> {r.minutes} min</Badge>
                </div>
                <h3 className="mt-3.5 text-[15px] font-medium">{r.label}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">{r.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-muted">{r.script.length} questions</span>
                  <Button size="sm" variant="primary" onClick={() => setActive(r)}>
                    <Play className="size-3.5" /> Start
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      </div>

      <Card className="border-accent/25">
        <CardHead title="How the real version works" icon={<Sparkles className="size-4" />} />
        <div className="grid gap-4 p-5 pt-3.5 sm:grid-cols-3">
          {[
            { t: 'Reads your resume', b: 'Questions are generated from your actual projects, not a generic bank, so you have to defend what you wrote.' },
            { t: 'Runs the real loop', b: 'Round structure mirrors what the Blue Book says that company actually ran last season.' },
            { t: 'Scores and explains', b: 'Correctness, communication, pace and structure, each with the specific moment that cost you.' },
          ].map((x) => (
            <div key={x.t}>
              <p className="text-[13px] font-medium">{x.t}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{x.b}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
