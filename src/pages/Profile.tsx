/**
 * Identity, targets, and everything the platform actually knows about the user's
 * effort: the streak, the activity wall, per-track progress and milestones.
 *
 * All of it is derived from real logged activity rather than stored figures. The
 * only scripted part is the resume review, which says so on screen.
 */
import { useEffect, useMemo, useState } from 'react'
import {
  UserRound,
  Save,
  Check,
  Upload,
  FileText,
  Sparkles,
  AlertTriangle,
  Info,
  Lightbulb,
  RefreshCw,
  Target,
  Flame,
  Minus,
  Plus,
  Trophy,
  MessagesSquare,
  CalendarCheck,
  Award,
  Lock,
  BookOpen,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Checkbox } from '@/components/ui/Field'
import { Ring, Progress } from '@/components/ui/Progress'
import { PageHeader, SectionTitle } from '@/components/ui/Page'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/context/AppContext'
import { ROLES, ROLE_MAP, COMMON_SECTION } from '@/data/roles'
import { BRANCHES, RESUME_REVIEW } from '@/data/user'
import { heatmapWeeks, intensity } from '@/lib/streak'
import * as forumApi from '@/lib/forumApi'
import { cn } from '@/lib/cn'

const SEV = {
  high: { tone: 'danger' as const, icon: AlertTriangle, label: 'High impact' },
  medium: { tone: 'warn' as const, icon: Info, label: 'Worth fixing' },
  low: { tone: 'neutral' as const, icon: Lightbulb, label: 'Polish' },
}

const HEATMAP_WEEKS = 14

function Stat({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted">{label}</span>
        <span className="text-accent">{icon}</span>
      </div>
      <p className="mt-2 tabular-nums text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-muted">{sub}</p>}
    </Card>
  )
}

/** GitHub-style contribution wall over the last few months. */
function ActivityWall({ goal }: { goal: number }) {
  const { activity } = useApp()
  const weeks = useMemo(() => heatmapWeeks(activity, HEATMAP_WEEKS), [activity])

  // A month label sits above the column its month starts in. A month showing
  // only a sliver of columns at either edge of the window gets no label, and
  // neither does one that would print on top of the previous label.
  const labels = useMemo(() => {
    const starts = weeks
      .map((w, i) => ({ i, month: w[0].date.getMonth(), date: w[0].date }))
      .filter((c, i, all) => i === 0 || all[i - 1].month !== c.month)

    const out = Array<string>(weeks.length).fill('')
    let lastLabelled = -99
    starts.forEach((start, n) => {
      const width = (starts[n + 1]?.i ?? weeks.length) - start.i
      if (width < 2 || start.i - lastLabelled < 2) return
      out[start.i] = start.date.toLocaleDateString('en-IN', { month: 'short' })
      lastLabelled = start.i
    })
    return out
  }, [weeks])

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="min-w-max">
        <div className="mb-1 flex gap-1">
          {labels.map((l, i) => (
            <span key={i} className="w-4 shrink-0 whitespace-nowrap text-[9px] text-muted">
              {l}
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, w) => (
            <div key={w} className="flex flex-col gap-1">
              {week.map((cell) => {
                const level = intensity(cell.count, goal)
                return (
                  <span
                    key={cell.key}
                    title={`${cell.date.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })} · ${cell.count === 0 ? 'nothing logged' : `${cell.count} done`}`}
                    className={cn(
                      'size-4 rounded-[3px] transition-colors duration-300',
                      cell.future
                        ? 'bg-transparent'
                        : level === 0
                          ? 'bg-surface-2 ring-1 ring-inset ring-line'
                          : level === 1
                            ? 'bg-accent/25'
                            : level === 2
                              ? 'bg-accent/55'
                              : 'bg-accent',
                    )}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { profile, setProfile, toggleRole, done, registered, streak, dailyGoal, setDailyGoal, logActivity } =
    useApp()

  const [draft, setDraft] = useState(profile)
  const [saved, setSaved] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [forumStats, setForumStats] = useState({ posts: 0, comments: 0, karma: 0 })

  useEffect(() => {
    let live = true
    void forumApi
      .myStats()
      .then((s) => live && setForumStats(s))
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [])

  const dirty =
    draft.name !== profile.name ||
    draft.rollNo !== profile.rollNo ||
    draft.branch !== profile.branch ||
    draft.year !== profile.year ||
    draft.cgpa !== profile.cgpa

  function save() {
    setProfile({ ...profile, ...draft, targetRoles: profile.targetRoles })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  function rescore() {
    setScoring(true)
    setTimeout(() => setScoring(false), 1400)
  }

  /** Completion per target role, plus the shared section everyone gets. */
  const trackProgress = useMemo(() => {
    const rows = profile.targetRoles.map((id) => {
      const all = ROLE_MAP[id].sections.flatMap((s) => s.resources)
      const completed = all.filter((r) => done.includes(r.id)).length
      return { id, label: ROLE_MAP[id].label, completed, total: all.length }
    })
    const shared = COMMON_SECTION.resources
    rows.push({
      id: 'common' as never,
      label: 'For every role',
      completed: shared.filter((r) => done.includes(r.id)).length,
      total: shared.length,
    })
    return rows
  }, [profile.targetRoles, done])

  const overall = useMemo(() => {
    const completed = trackProgress.reduce((n, r) => n + r.completed, 0)
    const total = trackProgress.reduce((n, r) => n + r.total, 0)
    return { completed, total, pct: total ? (completed / total) * 100 : 0 }
  }, [trackProgress])

  const achievements = useMemo(
    () => [
      {
        id: 'first-week',
        label: 'Week one',
        hint: 'A 7-day streak',
        earned: streak.best >= 7,
        icon: Flame,
      },
      {
        id: 'fortnight',
        label: 'Fortnight',
        hint: 'A 14-day streak',
        earned: streak.best >= 14,
        icon: Flame,
      },
      {
        id: 'month',
        label: 'Full month',
        hint: 'A 30-day streak',
        earned: streak.best >= 30,
        icon: Award,
      },
      {
        id: 'ten',
        label: 'Ten down',
        hint: '10 resources ticked off',
        earned: done.length >= 10,
        icon: BookOpen,
      },
      {
        id: 'planner',
        label: 'Planner',
        hint: '3 competitions on your calendar',
        earned: registered.length >= 3,
        icon: CalendarCheck,
      },
      {
        id: 'contributor',
        label: 'Contributor',
        hint: 'Posted or replied on the forum',
        earned: forumStats.posts + forumStats.comments > 0,
        icon: MessagesSquare,
      },
    ],
    [streak.best, done.length, registered.length, forumStats],
  )

  const earned = achievements.filter((a) => a.earned).length
  const todayPct = Math.min(100, (streak.todayCount / Math.max(1, dailyGoal)) * 100)

  return (
    <div className="space-y-7">
      <PageHeader
        title="Profile"
        icon={<UserRound className="size-5" />}
        sub="Your details, the profiles you are targeting, and everything the platform tracks about how you are actually going."
      />

      {/* identity + streak */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-nav text-xl font-semibold text-nav-accent">
            {profile.name
              .split(' ')
              .map((s) => s[0])
              .join('')
              .slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight">{profile.name}</h2>
            <p className="mt-0.5 text-xs text-muted">
              {profile.rollNo} · {profile.branch} · {profile.year}
              {profile.cgpa && ` · CGPA ${profile.cgpa}`}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {profile.targetRoles.length ? (
                profile.targetRoles.map((r) => (
                  <Badge key={r} tone="accent">
                    {ROLE_MAP[r].label}
                  </Badge>
                ))
              ) : (
                <Badge tone="warn">No target profiles selected</Badge>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-5 sm:border-l sm:border-line sm:pl-6">
            <Ring
              value={todayPct}
              size={92}
              label={`${streak.todayCount}/${dailyGoal}`}
              sub="today"
            />
            <div>
              <p className="flex items-center gap-1.5 tabular-nums text-xl font-semibold">
                <Flame className="size-4 text-accent" />
                {streak.current}d
              </p>
              <p className="mt-0.5 text-[11px] text-muted">current streak</p>
              <p className="mt-2 text-[11px] text-muted">best {streak.best}d</p>
            </div>
          </div>
        </div>
      </Card>

      {/* stat strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Material done"
          value={`${overall.completed}/${overall.total}`}
          sub={`${Math.round(overall.pct)}% of your tracks`}
          icon={<Target className="size-4" />}
        />
        <Stat
          label="Days active"
          value={String(streak.activeDays)}
          sub={`${streak.totalLogged} things logged`}
          icon={<CalendarCheck className="size-4" />}
        />
        <Stat
          label="On your calendar"
          value={String(registered.length)}
          sub="competitions you committed to"
          icon={<Trophy className="size-4" />}
        />
        <Stat
          label="Forum karma"
          value={String(forumStats.karma)}
          sub={`${forumStats.posts} posts · ${forumStats.comments} replies`}
          icon={<MessagesSquare className="size-4" />}
        />
      </div>

      {/* activity */}
      <Card>
        <CardHead
          title="Activity"
          sub="A day counts once you tick off material, add a competition, or post on the forum."
          icon={<Flame className="size-4" />}
          action={
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted">Daily goal</span>
              <div className="flex items-center rounded-lg border border-line">
                <button
                  onClick={() => setDailyGoal(Math.max(1, dailyGoal - 1))}
                  aria-label="Lower daily goal"
                  className="grid size-7 place-items-center rounded-l-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-7 text-center tabular-nums text-xs">{dailyGoal}</span>
                <button
                  onClick={() => setDailyGoal(Math.min(12, dailyGoal + 1))}
                  aria-label="Raise daily goal"
                  className="grid size-7 place-items-center rounded-r-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          }
        />
        <div className="p-5 pt-4">
          <ActivityWall goal={dailyGoal} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              less
              <span className="size-3 rounded-[3px] bg-surface-2 ring-1 ring-inset ring-line" />
              <span className="size-3 rounded-[3px] bg-accent/25" />
              <span className="size-3 rounded-[3px] bg-accent/55" />
              <span className="size-3 rounded-[3px] bg-accent" />
              more
            </div>
            <Button size="sm" variant="secondary" onClick={() => logActivity('manual')}>
              <Plus className="size-3.5" /> Log a session
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* track progress */}
        <Card className="h-fit">
          <CardHead
            title="Track progress"
            sub="Ticked off from the dashboard. The same data, broken out per profile."
            icon={<BookOpen className="size-4" />}
            action={<Badge tone="accent">{Math.round(overall.pct)}%</Badge>}
          />
          <div className="space-y-3.5 p-5 pt-4">
            {trackProgress.map((t) => (
              <div key={t.id}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium">{t.label}</span>
                  <span className="tabular-nums text-xs text-muted">
                    {t.completed}/{t.total}
                  </span>
                </div>
                <Progress value={t.total ? (t.completed / t.total) * 100 : 0} />
              </div>
            ))}
            {!profile.targetRoles.length && (
              <p className="text-xs text-muted">
                Pick a target profile below and its material shows up here.
              </p>
            )}
          </div>
        </Card>

        {/* achievements */}
        <Card className="h-fit">
          <CardHead
            title="Milestones"
            sub="Earned from real activity, not handed out"
            icon={<Award className="size-4" />}
            action={
              <Badge tone={earned ? 'accent' : 'neutral'}>
                {earned}/{achievements.length}
              </Badge>
            }
          />
          <div className="grid gap-2 p-5 pt-4 sm:grid-cols-2">
            {achievements.map((a) => {
              const Icon = a.earned ? a.icon : Lock
              return (
                <div
                  key={a.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 transition-colors',
                    a.earned
                      ? 'border-accent/35 bg-accent-soft'
                      : 'border-dashed border-line bg-surface-2/60',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-lg',
                      a.earned ? 'bg-accent text-accent-fg' : 'bg-surface text-muted',
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'truncate text-[13px] font-medium',
                        a.earned ? 'text-accent' : 'text-muted',
                      )}
                    >
                      {a.label}
                    </p>
                    <p className="truncate text-[11px] text-muted">{a.hint}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* details */}
        <Card className="h-fit">
          <CardHead
            title="Your details"
            sub="Visible to friends on the leaderboard"
            icon={<UserRound className="size-4" />}
          />
          <div className="grid gap-4 p-5 pt-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Full name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Roll number</Label>
              <Input
                value={draft.rollNo}
                onChange={(e) => setDraft({ ...draft, rollNo: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <Label hint="from institute account">Email</Label>
              <Input value={draft.email} disabled />
            </div>
            <div className="sm:col-span-2">
              <Label hint="department material lands here later">Branch</Label>
              <Select
                value={draft.branch}
                onChange={(e) => setDraft({ ...draft, branch: e.target.value })}
              >
                {BRANCHES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Select value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })}>
                {['2nd year', '3rd year', '4th year', '5th year'].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label hint="optional">CGPA</Label>
              <Input
                value={draft.cgpa}
                onChange={(e) => setDraft({ ...draft, cgpa: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line p-4">
            <p className="text-[11px] text-muted">
              {saved ? 'Saved to this browser.' : dirty ? 'Unsaved changes' : 'Everything up to date'}
            </p>
            <Button variant="primary" onClick={save} disabled={!dirty}>
              {saved ? <Check className="size-4" /> : <Save className="size-4" />}
              {saved ? 'Saved' : 'Save changes'}
            </Button>
          </div>
        </Card>

        {/* target roles */}
        <Card className="h-fit">
          <CardHead
            title="Target profiles"
            sub="Drives the dashboard, competitions, mock rounds and Blue Book filters"
            icon={<Target className="size-4" />}
            action={
              <Badge tone={profile.targetRoles.length ? 'accent' : 'warn'}>
                {profile.targetRoles.length} selected
              </Badge>
            }
          />
          <div className="grid gap-2 p-5 pt-4 sm:grid-cols-2">
            {ROLES.map((r) => (
              <Checkbox
                key={r.id}
                checked={profile.targetRoles.includes(r.id)}
                onChange={() => toggleRole(r.id)}
                label={r.label}
                sub={r.companies.slice(0, 2).join(', ')}
              />
            ))}
          </div>
          {!profile.targetRoles.length && (
            <p className="mx-5 mb-5 rounded-xl border border-warn/25 bg-warn/8 px-3.5 py-2.5 text-xs text-warn">
              Pick at least one. The dashboard has nothing to show without it.
            </p>
          )}
        </Card>
      </div>

      {/* resume */}
      <div>
        <SectionTitle right={<Badge tone="warn">AI model not wired up yet</Badge>}>
          Resumes
        </SectionTitle>

        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <Card className="h-fit">
            <CardHead title="Your resume" icon={<FileText className="size-4" />} />
            <div className="p-5 pt-3.5">
              <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                  <FileText className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{RESUME_REVIEW.fileName}</p>
                  <p className="text-[11px] text-muted">Uploaded {RESUME_REVIEW.uploadedAt}</p>
                </div>
              </div>

              <button
                onClick={() => setShowUpload(true)}
                className="mt-3 grid w-full place-items-center gap-2 rounded-xl border border-dashed border-line px-4 py-7 text-center transition-colors hover:border-accent/50 hover:bg-accent-soft/40"
              >
                <Upload className="size-5 text-muted" />
                <span className="text-xs font-medium">Upload a new version</span>
                <span className="text-[11px] text-muted">PDF, max 2 MB · one page</span>
              </button>

              <div className="mt-4">
                <Label>Score against</Label>
                <Select defaultValue={RESUME_REVIEW.targetRole}>
                  {(profile.targetRoles.length ? profile.targetRoles : [RESUME_REVIEW.targetRole]).map(
                    (r) => (
                      <option key={r} value={r}>
                        {ROLE_MAP[r].label}
                      </option>
                    ),
                  )}
                </Select>
              </div>

              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={rescore}
                disabled={scoring}
              >
                <RefreshCw className={cn('size-4', scoring && 'animate-spin')} />
                {scoring ? 'Analysing…' : 'Re-run analysis'}
              </Button>
            </div>
          </Card>

          <Card>
            <CardHead
              title="AI review"
              sub="Trained on IITM-format resumes, scored against your target profile"
              icon={<Sparkles className="size-4" />}
              action={<Badge tone="accent">{ROLE_MAP[RESUME_REVIEW.targetRole].label}</Badge>}
            />

            <div className="grid gap-6 p-5 pt-4 lg:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center gap-2">
                <Ring
                  value={RESUME_REVIEW.score}
                  label={String(RESUME_REVIEW.score)}
                  sub="out of 100"
                />
                <Badge tone={RESUME_REVIEW.score >= 75 ? 'accent' : 'warn'}>
                  {RESUME_REVIEW.score >= 75 ? 'Shortlist-ready' : 'Needs work'}
                </Badge>
              </div>

              <div className="space-y-3.5">
                {RESUME_REVIEW.breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-medium">{b.label}</span>
                      <span className="tabular-nums text-xs text-muted">{b.score}</span>
                    </div>
                    <Progress value={b.score} />
                    <p className="mt-1 text-[11px] text-muted">{b.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-line p-5">
              <SectionTitle>Suggested fixes</SectionTitle>
              <div className="space-y-2.5">
                {RESUME_REVIEW.suggestions.map((s) => {
                  const meta = SEV[s.severity]
                  const Icon = meta.icon
                  return (
                    <div
                      key={s.title}
                      className="flex gap-3 rounded-xl border border-line bg-surface-2 p-3.5"
                    >
                      <span
                        className={cn(
                          'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg',
                          s.severity === 'high' && 'bg-danger/10 text-danger',
                          s.severity === 'medium' && 'bg-warn/10 text-warn',
                          s.severity === 'low' && 'bg-accent-soft text-accent',
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13px] font-medium">{s.title}</p>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted">{s.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-4 rounded-xl border border-dashed border-line px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
                <b className="text-ink">Prototype note:</b> this review is a fixed example. The real
                version either runs a model trained on IITM-format resumes, or wraps an LLM with a
                per-profile rubric so nothing has to be stored server-side.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload resume"
        sub="File handling is not wired up in the prototype."
        footer={
          <Button variant="primary" onClick={() => setShowUpload(false)}>
            Close
          </Button>
        }
      >
        <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-line px-4 py-10 text-center opacity-60">
          <Upload className="size-6 text-muted" />
          <p className="text-sm font-medium">Drop your PDF here</p>
          <p className="text-xs text-muted">or click to browse · max 2 MB</p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          In the real build this uploads to private storage, extracts the text, and scores it against
          each profile you have selected. Resumes are visible only to you.
        </p>
      </Modal>
    </div>
  )
}
