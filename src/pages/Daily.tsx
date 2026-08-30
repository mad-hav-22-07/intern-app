/**
 * Today's challenge, one per target profile.
 *
 * The question is chosen from the date alone (see `lib/daily.ts`), so it is the
 * same for everyone on that profile and rolls over at local midnight. Solving one
 * counts toward the day's streak, which is the point: a small daily commitment
 * that is hard to skip is worth more than an occasional long session.
 */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
  Lightbulb,
  Target,
  Zap,
  ExternalLink,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, PageHeader, SectionTitle } from '@/components/ui/Page'
import { useApp } from '@/context/AppContext'
import { ROLE_MAP, type RoleId } from '@/data/roles'
import { KIND_LABEL, type DailyItem, type Mcq } from '@/data/daily'
import { dailyFor, msUntilTomorrow, relatedPractice, solveKey } from '@/lib/daily'
import { cn } from '@/lib/cn'

const TONE: Record<DailyItem['difficulty'], 'accent' | 'warn' | 'danger'> = {
  Easy: 'accent',
  Medium: 'warn',
  Hard: 'danger',
}

/** Live "resets in 6h 12m", so the daily framing is believable. */
function useCountdown() {
  const [left, setLeft] = useState(() => msUntilTomorrow())
  useEffect(() => {
    const id = setInterval(() => setLeft(msUntilTomorrow()), 30_000)
    return () => clearInterval(id)
  }, [])
  const hours = Math.floor(left / 3_600_000)
  const minutes = Math.floor((left % 3_600_000) / 60_000)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

/** A single aptitude question. Answers are revealed per question, not per set. */
function McqRow({ mcq, index, onAnswered }: { mcq: Mcq; index: number; onAnswered: () => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3.5">
      <p className="text-[13px] font-medium leading-relaxed">
        <span className="mr-1.5 tabular-nums text-muted">Q{index + 1}.</span>
        {mcq.q}
      </p>

      <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
        {mcq.options.map((option, i) => {
          const isRight = i === mcq.answer
          const isPicked = picked === i
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => {
                setPicked(i)
                onAnswered()
              }}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition-all duration-200',
                !answered && 'border-line bg-surface hover:border-accent/50 hover:bg-accent-soft',
                answered && isRight && 'border-accent bg-accent-soft font-medium text-accent',
                answered && isPicked && !isRight && 'border-danger bg-danger/8 text-danger',
                answered && !isRight && !isPicked && 'border-line bg-surface opacity-50',
              )}
            >
              <span
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-md border text-[10px] tabular-nums',
                  answered && isRight
                    ? 'border-accent bg-accent text-accent-fg'
                    : answered && isPicked
                      ? 'border-danger text-danger'
                      : 'border-line',
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          )
        })}
      </div>

      {answered && (
        <p className="anim-in mt-2.5 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] leading-relaxed text-muted">
          <b className={cn('font-medium', picked === mcq.answer ? 'text-accent' : 'text-danger')}>
            {picked === mcq.answer ? 'Correct. ' : 'Not quite. '}
          </b>
          {mcq.why}
        </p>
      )}
    </div>
  )
}

function Challenge({ role, item }: { role: RoleId; item: DailyItem }) {
  const { solvedDaily, markDailySolved } = useApp()
  const key = solveKey(role)
  const solved = solvedDaily.includes(key)
  const related = useMemo(() => relatedPractice(role), [role])

  const [showHint, setShowHint] = useState(false)
  const [showApproach, setShowApproach] = useState(false)
  const [answeredCount, setAnsweredCount] = useState(0)

  const total = item.questions?.length ?? 0
  const allAnswered = total > 0 && answeredCount >= total

  // An aptitude set marks itself done once every question has been attempted;
  // an open-ended question needs the user to say so.
  useEffect(() => {
    if (allAnswered && !solved) markDailySolved(key)
  }, [allAnswered, solved, markDailySolved, key])

  return (
    <Card className={cn('overflow-hidden', solved && 'border-accent/40')}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-surface-2/60 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
            <Zap className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted">
              {ROLE_MAP[role].label} · {KIND_LABEL[item.kind]}
            </p>
            <h2 className="truncate text-sm font-semibold tracking-tight">{item.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={TONE[item.difficulty]}>{item.difficulty}</Badge>
          {solved && (
            <Badge tone="accent">
              <CheckCircle2 className="size-3" /> Done
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm leading-relaxed">{item.prompt}</p>

        {item.questions && (
          <div className="space-y-2.5">
            {item.questions.map((mcq, i) => (
              <McqRow
                key={i}
                mcq={mcq}
                index={i}
                onAnswered={() => setAnsweredCount((n) => n + 1)}
              />
            ))}
            <p className="text-[11px] text-muted">
              {answeredCount}/{total} attempted
            </p>
          </div>
        )}

        {item.hint && !item.questions && (
          <div>
            {showHint ? (
              <p className="anim-in flex gap-2.5 rounded-xl border border-warn/25 bg-warn/8 px-3.5 py-2.5 text-[13px] leading-relaxed text-muted">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-warn" />
                {item.hint}
              </p>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setShowHint(true)}>
                <Lightbulb className="size-3.5" /> Show a hint
              </Button>
            )}
          </div>
        )}

        {item.approach && (
          <div className="rounded-xl border border-line">
            <button
              onClick={() => setShowApproach((v) => !v)}
              aria-expanded={showApproach}
              className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors hover:bg-surface-2"
            >
              What a strong answer covers
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-muted transition-transform duration-200',
                  showApproach && 'rotate-180',
                )}
              />
            </button>
            {showApproach && (
              <ul className="anim-in space-y-2 border-t border-line px-3.5 py-3">
                {item.approach.map((line, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {related.length > 0 && (
          <div className="border-t border-line pt-3.5">
            <SectionTitle>More like this</SectionTitle>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {related.map((q) => (
                <a
                  key={q.id}
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[12px] transition-colors hover:border-accent/40 hover:bg-accent-soft"
                >
                  <span className="min-w-0 flex-1 truncate">{q.title}</span>
                  <span className="shrink-0 text-[10px] text-muted">{q.source}</span>
                  <ExternalLink className="size-3 shrink-0 text-muted" />
                </a>
              ))}
            </div>
          </div>
        )}

        {!item.questions && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
            <Button
              variant={solved ? 'secondary' : 'primary'}
              size="sm"
              disabled={solved}
              onClick={() => markDailySolved(key)}
            >
              <Check className="size-3.5" /> {solved ? 'Marked as done' : 'I worked through this'}
            </Button>
            <p className="text-[11px] text-muted">
              {solved ? 'Counted toward today.' : 'Attempt it before opening the approach.'}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function Daily() {
  const { profile, solvedDaily } = useApp()
  const resetsIn = useCountdown()

  const items = useMemo(
    () =>
      profile.targetRoles
        .map((role) => ({ role, item: dailyFor(role) }))
        .filter((x): x is { role: RoleId; item: DailyItem } => x.item !== null),
    [profile.targetRoles],
  )

  const doneToday = items.filter((x) => solvedDaily.includes(solveKey(x.role))).length

  if (!items.length) {
    return (
      <>
        <PageHeader
          title="Today's challenge"
          icon={<Zap className="size-5" />}
          sub="One question a day for each profile you are targeting."
        />
        <EmptyState
          icon={<Target className="size-6" />}
          title="No target profiles selected"
          sub="Pick the roles you are aiming for and a question appears here every day for each of them."
          action={
            <Link to="/profile">
              <Button variant="primary">Choose target profiles</Button>
            </Link>
          }
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's challenge"
        icon={<Zap className="size-5" />}
        sub="One question per profile, the same for everyone on it, rolling over at midnight. Working through one counts toward your streak."
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[11px] text-muted">
              <Clock className="size-3.5" /> resets in {resetsIn}
            </span>
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium',
                doneToday === items.length
                  ? 'border-accent/40 bg-accent-soft text-accent'
                  : 'border-line bg-surface-2 text-muted',
              )}
            >
              <Flame className="size-3.5" />
              <span className="tabular-nums">
                {doneToday}/{items.length}
              </span>{' '}
              done
            </span>
          </div>
        }
      />

      <div className="stagger space-y-4">
        {items.map(({ role, item }) => (
          <Challenge key={role} role={role} item={item} />
        ))}
      </div>

      <p className="rounded-xl border border-dashed border-line px-4 py-3 text-[11px] leading-relaxed text-muted">
        Everyone targeting the same profile gets the same question today, so it is worth arguing
        about in the{' '}
        <Link to="/forum" className="text-accent hover:underline">
          forum
        </Link>
        . Post your approach before you open the solution.
      </p>
    </div>
  )
}
