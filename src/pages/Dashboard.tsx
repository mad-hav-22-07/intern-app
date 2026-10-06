/**
 * The prep track for one target role at a time.
 *
 * The role dropdown is fed by `profile.targetRoles`, so this page has nothing to
 * show until at least one profile is picked, which is the empty state below.
 * Ticking a resource writes to `done` in the context and counts toward the streak.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  Check,
  Flame,
  FileCheck2,
  Trophy,
  Target,
  BookOpen,
  Video,
  Library,
  ListChecks,
  Bell,
  Hammer,
  Laptop,
  ArrowUpRight,
  Settings2,
  Building2,
  Zap,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { EmptyState, SectionTitle } from '@/components/ui/Page'
import { useApp } from '@/context/AppContext'
import { COMMON_SECTION, ROLE_MAP, type ResourceKind, type RoleId } from '@/data/roles'
import { useTrackProgress, type TrackProgress } from '@/lib/useTrackProgress'
import { KIND_LABEL } from '@/data/daily'
import { dailyFor, solveKey } from '@/lib/daily'
import { RESUME_REVIEW } from '@/data/user'
import { daysUntil, relativeLabel } from '@/data/competitions'
import { useContests } from '@/hooks/useContests'
import { cn } from '@/lib/cn'

/**
 * Whether a resource counts as finished. A tracked one is finished when every
 * item in its tracker is; everything else is the plain checkbox. Used by the
 * row, the per-section counter and the headline percentage so the three of them
 * cannot drift apart.
 *
 * `progress` is null until the track data has loaded (see `useTrackProgress`),
 * and a tracked resource is reported unfinished until then — "not known yet"
 * has to read as *not* done, or the dashboard would briefly claim a book was
 * finished and then take it back.
 */
function isResourceDone(
  r: { id: string; track?: string },
  done: string[],
  progress: TrackProgress | null,
) {
  if (!r.track) return done.includes(r.id)
  const items = progress?.itemsByTrack[r.track]
  if (!items) return false
  return items.length > 0 ? items.every((i) => done.includes(i)) : done.includes(r.id)
}

const KIND_ICON: Record<ResourceKind, typeof BookOpen> = {
  sheet: ListChecks,
  book: Library,
  course: BookOpen,
  video: Video,
  platform: Laptop,
  doc: BookOpen,
  alert: Bell,
  project: Hammer,
}

function RoleDropdown({
  roles,
  value,
  onChange,
}: {
  roles: RoleId[]
  value: RoleId
  onChange: (r: RoleId) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Escape closes it the same way clicking outside does — without this a
  // keyboard user who opens the menu with Enter/Space has no way to back out
  // short of tabbing all the way through its options.
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 w-full min-w-56 items-center justify-between gap-3 rounded-xl border border-accent/35 bg-accent-soft px-4 text-sm font-medium text-accent transition-colors hover:border-accent/60"
      >
        <span className="flex items-center gap-2">
          <Target className="size-4" />
          {ROLE_MAP[value].label}
        </span>
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="anim-in absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-2xl">
          <p className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted">
            Your target profiles
          </p>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => {
                onChange(r)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors',
                r === value ? 'bg-accent-soft text-accent' : 'text-ink hover:bg-surface-2',
              )}
            >
              <span className="text-left">
                {ROLE_MAP[r].label}
                <span className="mt-0.5 block text-[11px] text-muted">{ROLE_MAP[r].companies.slice(0, 3).join(' · ')}</span>
              </span>
              {r === value && <Check className="size-4 shrink-0" />}
            </button>
          ))}
          <Link
            to="/profile"
            className="mt-1 flex items-center gap-2 border-t border-line px-3 py-2.5 text-xs text-muted hover:text-accent"
          >
            <Settings2 className="size-3.5" />
            Change target profiles
          </Link>
        </div>
      )}
    </div>
  )
}

/**
 * One row of study material.
 *
 * A resource with a `track` is not a single checkbox: its state is *derived*
 * from how many items in the tracker are ticked, and the row opens the tracker
 * rather than toggling. Two independent ways to mark the same book finished is
 * the sort of thing that quietly makes progress numbers meaningless.
 */
function ResourceRow({
  id,
  title,
  by,
  note,
  kind,
  effort,
  url,
  track,
}: {
  id: string
  title: string
  by?: string
  note?: string
  kind: ResourceKind
  effort?: string
  url?: string
  track?: string
}) {
  const { done, toggleDone } = useApp()
  const Icon = KIND_ICON[kind]
  const progress = useTrackProgress()

  const items = track ? (progress?.itemsByTrack[track] ?? null) : null
  const doneCount = items ? items.filter((i) => done.includes(i)).length : 0
  const isDone = isResourceDone({ id, track }, done, progress)

  const body = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Icon className="size-3.5 shrink-0 text-muted" />
          <span className={cn('text-sm font-medium', isDone && 'text-muted line-through')}>{title}</span>
          {by && <span className="text-[11px] text-muted">· {by}</span>}
          {url ? (
            <ArrowUpRight className="size-3.5 text-accent" />
          ) : (
            !track && <Badge tone="outline">link pending</Badge>
          )}
        </div>
        {note && <p className="mt-1 text-xs leading-relaxed text-muted">{note}</p>}
        {track && (
          <div className="mt-2 flex items-center gap-2.5">
            <Progress className="max-w-56 flex-1" value={items?.length ? (doneCount / items.length) * 100 : 0} />
            <span className="shrink-0 tabular-nums text-[10px] text-muted">
              {items ? `${doneCount}/${items.length}` : '…'}
            </span>
            <span className="shrink-0 text-[10px] font-medium text-accent">Open tracker</span>
          </div>
        )}
      </div>

      {effort && (
        <span className="shrink-0 rounded-md bg-surface px-2 py-1 tabular-nums text-[10px] text-muted">
          {effort}
        </span>
      )}
    </>
  )

  const shell = cn(
    'flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-3.5 transition-colors',
    isDone ? 'border-accent/30 bg-accent-soft/40' : 'hover:border-accent/30',
  )

  const mark = (
    <span
      className={cn(
        'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors',
        isDone ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface',
      )}
    >
      {isDone && <Check className="size-3.5" strokeWidth={3} />}
    </span>
  )

  if (track) {
    return (
      <Link to={`/study/${track}`} className={shell}>
        {mark}
        {body}
      </Link>
    )
  }

  const check = (
    <button
      onClick={() => toggleDone(id)}
      className={cn(
        'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors',
        isDone ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface hover:border-accent',
      )}
      aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
    >
      {isDone && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  )

  /*
   * A row with a link should open it. The arrow used to be decorative — it
   * promised a destination the row never went to, which is worse than showing
   * no arrow at all. The checkbox stays a button inside the link so ticking
   * something off does not also navigate away from the page.
   */
  if (url?.startsWith('/')) {
    return (
      <Link to={url} className={shell}>
        {check}
        {body}
      </Link>
    )
  }
  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={shell}>
        {check}
        {body}
      </a>
    )
  }

  return (
    <div className={shell}>
      {check}
      {body}
    </div>
  )
}

export default function Dashboard() {
  const { profile, done, streak, dailyGoal, solvedDaily } = useApp()
  const progress = useTrackProgress()
  const { all: competitions } = useContests()
  const roles = profile.targetRoles
  const [active, setActive] = useState<RoleId | null>(roles[0] ?? null)

  useEffect(() => {
    if (roles.length && (!active || !roles.includes(active))) setActive(roles[0])
    if (!roles.length) setActive(null)
  }, [roles, active])

  const role = active ? ROLE_MAP[active] : null

  const stats = useMemo(() => {
    const all = role ? role.sections.flatMap((s) => s.resources) : []
    const completed = all.filter((r) => isResourceDone(r, done, progress)).length
    return { total: all.length, completed, pct: all.length ? (completed / all.length) * 100 : 0 }
  }, [role, done, progress])

  // Today's challenge for whichever profile is selected above.
  const today = useMemo(() => (active ? dailyFor(active) : null), [active])
  const todayDone = active ? solvedDaily.includes(solveKey(active)) : false

  const upcoming = useMemo(
    () =>
      competitions
        .filter((c) => daysUntil(c.startsAt) >= 0 && (!active || c.roles.includes(active)))
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
        .slice(0, 4),
    [competitions, active],
  )

  if (!roles.length) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Internship Preparation Drive</h1>
          <p className="mt-1 text-sm text-muted">Pick your target profiles to unlock your prep track.</p>
        </div>
        <EmptyState
          icon={<Target className="size-6" />}
          title="No target profiles selected"
          sub="The dashboard shapes itself around the roles you are aiming for. Choose at least one on your profile and the material, competitions and mock rounds all follow."
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
    <div className="space-y-7">
      {/* header + role switcher */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your prep track</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">{role?.tagline}</p>
        </div>
        <RoleDropdown roles={roles} value={active!} onChange={setActive} />
      </div>

      {/* stat strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted">Track progress</span>
            <Target className="size-4 text-accent" />
          </div>
          <p className="mt-2 tabular-nums text-2xl font-semibold">
            {stats.completed}
            <span className="text-base text-muted">/{stats.total}</span>
          </p>
          <Progress value={stats.pct} className="mt-3" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted">Current streak</span>
            <Flame className="size-4 text-accent" />
          </div>
          <p className="mt-2 tabular-nums text-2xl font-semibold">{streak.current}d</p>
          <p className="mt-1 text-[11px] text-muted">
            Best {streak.best}d · {streak.todayCount}/{dailyGoal} today
          </p>
        </Card>

        <Link to="/profile">
          <Card hover className="h-full p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted">Resume score</span>
              <FileCheck2 className="size-4 text-accent" />
            </div>
            <p className="mt-2 tabular-nums text-2xl font-semibold">
              {RESUME_REVIEW.score}
              <span className="text-base text-muted">/100</span>
            </p>
            {/* Derived from the same fixture the resume tab reads, so this card can
               never quote a count the suggestions list does not back up. */}
            <p className="mt-1 text-[11px] text-muted">
              {RESUME_REVIEW.suggestions.length} suggestions waiting
            </p>
          </Card>
        </Link>

        <Link to="/competitions">
          <Card hover className="h-full p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted">Next deadline</span>
              <Trophy className="size-4 text-accent" />
            </div>
            <p className="mt-2 truncate text-sm font-semibold">
              {upcoming[0]?.title ?? 'Nothing scheduled'}
            </p>
            <p className="mt-1 text-[11px] text-accent">
              {upcoming[0] ? relativeLabel(upcoming[0].startsAt) : 'Nothing yet'}
            </p>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* main content */}
        <div className="space-y-6">
          <SectionTitle right={<Badge tone="accent">{role?.label} track</Badge>}>
            Curated material
          </SectionTitle>

          {role?.sections.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <CardHead
                title={s.title}
                sub={s.hint}
                icon={<BookOpen className="size-4" />}
                action={
                  <Badge tone="neutral">
                    {s.resources.filter((r) => isResourceDone(r, done, progress)).length}/{s.resources.length}
                  </Badge>
                }
              />
              <div className="space-y-2 p-5 pt-4">
                {s.resources.map((r) => (
                  <ResourceRow key={r.id} {...r} />
                ))}
              </div>
            </Card>
          ))}

          <Card className="overflow-hidden border-accent/25">
            <CardHead
              title={COMMON_SECTION.title}
              sub={COMMON_SECTION.hint}
              icon={<Library className="size-4" />}
              action={<Badge tone="accent">All roles</Badge>}
            />
            <div className="space-y-2 p-5 pt-4">
              {COMMON_SECTION.resources.map((r) => (
                <ResourceRow key={r.id} {...r} />
              ))}
            </div>
          </Card>
        </div>

        {/* side rail */}
        <div className="space-y-6">
          <Card>
            <CardHead title="Hiring for this profile" icon={<Building2 className="size-4" />} />
            <div className="flex flex-wrap gap-1.5 p-5 pt-3.5">
              {role?.companies.map((c) => (
                <Badge key={c} tone="neutral">{c}</Badge>
              ))}
            </div>
            <p className="px-5 pb-5 text-[11px] leading-relaxed text-muted">
              Pulled from last season's Blue Book.{' '}
              <Link to="/blue-book" className="text-accent hover:underline">See full analysis →</Link>
            </p>
          </Card>

          <Card>
            <CardHead
              title="Upcoming for you"
              sub={`Filtered to ${role?.label}`}
              icon={<Trophy className="size-4" />}
            />
            <div className="space-y-2 p-5 pt-3.5">
              {upcoming.length ? (
                upcoming.map((c) => (
                  <Link
                    key={c.id}
                    to="/competitions"
                    className="block rounded-xl border border-line bg-surface-2 p-3 transition-colors hover:border-accent/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium leading-snug">{c.title}</p>
                      <Badge tone={daysUntil(c.startsAt) <= 2 ? 'warn' : 'neutral'}>
                        {relativeLabel(c.startsAt)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted">{c.org} · {c.source}</p>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-muted">Nothing on the radar for this profile.</p>
              )}
            </div>
          </Card>

          {today && (
            <Card hover className="overflow-hidden border-accent/25">
              <Link to="/daily" className="block">
                <div className="flex items-center justify-between gap-3 border-b border-line bg-accent-soft/50 px-5 py-3">
                  <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-accent">
                    <Zap className="size-3.5" /> {KIND_LABEL[today.kind]}
                  </span>
                  {todayDone ? (
                    <Badge tone="accent">
                      <Check className="size-3" /> Done
                    </Badge>
                  ) : (
                    <Badge tone="neutral">{today.difficulty}</Badge>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-sm font-medium leading-snug">{today.title}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
                    {today.prompt}
                  </p>
                  <p className="mt-3 text-[11px] font-medium text-accent">
                    {/* The arrow has to live inside the string literal. Written as
                       plain JSX text next to the braces it used to print as six
                       literal characters instead of the glyph it names. */}
                    {todayDone ? 'Review it \u2192' : 'Solve today\u2019s \u2192'}
                  </p>
                </div>
              </Link>
            </Card>
          )}

          <Card className="border-accent/25 bg-accent-soft/30">
            <CardHead title="Weekly challenge" icon={<Flame className="size-4" />} />
            <div className="p-5 pt-3.5">
              <p className="text-sm font-medium">Open weekly exam · Saturday 8pm</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                Anyone can attend. Mixed set across all seven profiles, leaderboard published after.
              </p>
              <Link to="/mock-exam">
                <Button variant="primary" size="sm" className="mt-3.5 w-full">Reserve my slot</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
