import { useMemo, useState } from 'react'
import {
  Trophy,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  ExternalLink,
  Users2,
  Award,
  Bell,
  Download,
  RefreshCw,
  Radio,
  Clock,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { PageHeader, EmptyState, SectionTitle, Skeleton } from '@/components/ui/Page'
import { useApp } from '@/context/AppContext'
import { useContests } from '@/hooks/useContests'
import { ROLES, ROLE_MAP, type RoleId } from '@/data/roles'
import {
  SOURCES,
  TAGS,
  dateKey,
  dayOf,
  daysUntil,
  istDate,
  istTime,
  relativeLabel,
  type Competition,
} from '@/data/competitions'
import { downloadIcs, googleCalendarUrl } from '@/lib/calendar'
import { cn } from '@/lib/cn'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200',
        active
          ? 'border-accent/50 bg-accent-soft text-accent'
          : 'border-line bg-surface text-muted hover:border-accent/30 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function CompCard({ c, highlight }: { c: Competition; highlight?: boolean }) {
  const { registered, toggleRegistered } = useApp()
  const isMine = registered.includes(c.id)
  const days = daysUntil(c.startsAt)
  const past = days < 0
  const urgent = days >= 0 && days <= 2

  return (
    <Card
      hover
      id={`comp-${c.id}`}
      className={cn(
        'p-4 transition-shadow',
        past && 'opacity-55',
        isMine && 'border-accent/40',
        highlight && 'ring-2 ring-accent/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{c.tag}</Badge>
            <span className="flex items-center gap-1 text-[11px] text-muted">
              {c.live && <Radio className="size-3 text-accent" />}
              {c.source}
            </span>
          </div>
          <h3 className="mt-2 text-[15px] font-medium leading-snug">{c.title}</h3>
          <p className="mt-0.5 text-xs text-muted">{c.org}</p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={cn(
              'font-mono text-xs font-medium',
              urgent ? 'text-warn' : past ? 'text-muted' : 'text-accent',
            )}
          >
            {relativeLabel(c.startsAt)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">{istTime(c.startsAt)}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted">
        {c.prize && (
          <span className="flex items-center gap-1.5">
            <Award className="size-3.5" /> {c.prize}
          </span>
        )}
        {c.team && (
          <span className="flex items-center gap-1.5">
            <Users2 className="size-3.5" /> {c.team}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          {istDate(c.startsAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" /> {c.timeLabel}
        </span>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex flex-wrap gap-1.5">
          {c.roles.map((r) => (
            <Badge key={r} tone="outline">
              {ROLE_MAP[r].label}
            </Badge>
          ))}
        </div>
        <div className="flex gap-1.5">
          {c.url && (
            <a href={c.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost">
                <ExternalLink className="size-3.5" /> Open
              </Button>
            </a>
          )}
          <Button
            size="sm"
            variant={isMine ? 'primary' : 'secondary'}
            onClick={() => toggleRegistered(c.id)}
            disabled={past}
            title={isMine ? 'Remove from your calendar' : 'Add to your calendar'}
          >
            {isMine ? <Check className="size-3.5" /> : <CalendarPlus className="size-3.5" />}
            {isMine ? "I'm in" : 'Add'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

/**
 * Shows what the user has actually committed to. Nothing lands here on its own —
 * a listing only appears once it is added from the list on the left, so the month
 * stays a plan rather than a firehose. `preview` optionally outlines the days that
 * the current filters would put on it, without claiming them.
 */
function MiniCalendar({
  mine,
  preview,
  selected,
  onSelect,
}: {
  mine: Competition[]
  preview: Competition[]
  selected: string | null
  onSelect: (key: string | null) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [offset, setOffset] = useState(0)

  const view = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const lead = (view.getDay() + 6) % 7 // Monday-first

  const group = (list: Competition[]) => {
    const map = new Map<string, Competition[]>()
    for (const c of list) {
      const k = dateKey(dayOf(c.startsAt))
      map.set(k, [...(map.get(k) ?? []), c])
    }
    return map
  }
  const mineByDay = group(mine)
  const previewByDay = group(preview)

  const cells = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // The month in view is often empty while the next thing the user signed up for
  // sits a month or two out. Offer a jump rather than making them hunt for it.
  const inView = (c: Competition) => {
    const d = dayOf(c.startsAt)
    return d.getFullYear() === view.getFullYear() && d.getMonth() === view.getMonth()
  }
  const nextElsewhere = mine
    .filter((c) => dayOf(c.startsAt).getTime() >= today.getTime() && !inView(c))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0]
  const showJump = nextElsewhere && !mine.some(inView)

  const jumpToNext = () => {
    if (!nextElsewhere) return
    const d = dayOf(nextElsewhere.startsAt)
    setOffset((d.getFullYear() - today.getFullYear()) * 12 + d.getMonth() - today.getMonth())
    onSelect(dateKey(d))
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOffset((o) => o - 1)}
            aria-label="Previous month"
            className="grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => {
              setOffset(0)
              onSelect(dateKey(today))
            }}
            className="rounded-lg px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            Today
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            aria-label="Next month"
            className="grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="pb-1 text-[10px] font-medium uppercase text-muted">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`pad-${i}`} />
          const date = new Date(view.getFullYear(), view.getMonth(), day)
          const k = dateKey(date)
          const booked = mineByDay.get(k) ?? []
          const shown = previewByDay.get(k) ?? []
          const isToday = date.getTime() === today.getTime()
          const isSelected = selected === k
          const empty = booked.length === 0 && shown.length === 0

          return (
            <button
              key={k}
              onClick={() => onSelect(isSelected ? null : k)}
              aria-pressed={isSelected}
              aria-label={`${day} ${MONTHS[view.getMonth()]} — ${booked.length} on your calendar`}
              className={cn(
                'relative grid aspect-square place-items-center rounded-lg border text-xs transition-all duration-200',
                isSelected && 'ring-2 ring-accent/50',
                isToday
                  ? 'border-accent bg-accent font-semibold text-accent-fg'
                  : booked.length
                    ? 'border-accent/40 bg-accent-soft font-medium text-accent'
                    : shown.length
                      ? 'border-dashed border-accent/30 text-muted hover:bg-surface-2'
                      : 'border-transparent text-muted hover:bg-surface-2',
                empty && 'hover:text-ink',
              )}
            >
              {day}
              {booked.length > 0 && !isToday && (
                <span className="absolute bottom-1 flex gap-0.5">
                  {booked.slice(0, 3).map((_, j) => (
                    <span key={j} className="size-1 rounded-full bg-accent" />
                  ))}
                </span>
              )}
              {isToday && booked.length > 0 && (
                <span className="absolute bottom-1 flex gap-0.5">
                  {booked.slice(0, 3).map((_, j) => (
                    <span key={j} className="size-1 rounded-full bg-accent-fg/80" />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {showJump && nextElsewhere && (
        <button
          onClick={jumpToNext}
          className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-accent/35 px-2.5 py-2 text-left text-[11px] text-muted transition-colors hover:border-accent/60 hover:text-accent"
        >
          <span className="truncate">
            Next up: <b className="font-medium text-accent">{nextElsewhere.title}</b>
          </span>
          <span className="shrink-0 font-mono">{istDate(nextElsewhere.startsAt)} →</span>
        </button>
      )}
    </div>
  )
}

export default function Competitions() {
  const { profile, registered, toggleRegistered } = useApp()
  const { all, feeds, loading, refresh } = useContests()

  const [scope, setScope] = useState<'mine' | 'all' | 'saved'>('mine')
  const [roles, setRoles] = useState<RoleId[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [showPast, setShowPast] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [previewOnCalendar, setPreviewOnCalendar] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const list = useMemo(() => {
    let out = all
    if (scope === 'mine') {
      out = out.filter((c) => c.roles.some((r) => profile.targetRoles.includes(r)))
    }
    if (scope === 'saved') out = out.filter((c) => registered.includes(c.id))
    if (roles.length) out = out.filter((c) => c.roles.some((r) => roles.includes(r)))
    if (sources.length) out = out.filter((c) => sources.includes(c.source))
    if (tags.length) out = out.filter((c) => tags.includes(c.tag))
    if (!showPast) out = out.filter((c) => daysUntil(c.startsAt) >= 0)
    return [...out].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
  }, [all, scope, roles, sources, tags, showPast, profile.targetRoles, registered])

  /** Everything on the calendar, regardless of the filters on the left. */
  const myCalendar = useMemo(
    () =>
      all
        .filter((c) => registered.includes(c.id))
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    [all, registered],
  )
  const upcomingMine = myCalendar.filter((c) => daysUntil(c.startsAt) >= 0)

  const daySelection = useMemo(() => {
    if (!selectedDay) return []
    const source = previewOnCalendar ? [...myCalendar, ...list] : myCalendar
    const unique = new Map(source.map((c) => [c.id, c]))
    return [...unique.values()]
      .filter((c) => dateKey(dayOf(c.startsAt)) === selectedDay)
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
  }, [selectedDay, previewOnCalendar, myCalendar, list])

  const toggle = <T extends string>(arr: T[], set: (v: T[]) => void, v: T) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  const activeFilters = roles.length + sources.length + tags.length

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <SectionTitle>Profile</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((r) => (
            <Chip
              key={r.id}
              active={roles.includes(r.id)}
              onClick={() => toggle(roles, setRoles, r.id)}
            >
              {r.label}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Type</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <Chip key={t} active={tags.includes(t)} onClick={() => toggle(tags, setTags, t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Source</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {SOURCES.map((s) => (
            <Chip key={s} active={sources.includes(s)} onClick={() => toggle(sources, setSources, s)}>
              {s}
            </Chip>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition-colors hover:border-accent/30">
        <input
          type="checkbox"
          checked={showPast}
          onChange={(e) => setShowPast(e.target.checked)}
          className="size-4 accent-[var(--accent)]"
        />
        <span className="text-xs">Include past deadlines</span>
      </label>
      {activeFilters > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            setRoles([])
            setSources([])
            setTags([])
          }}
        >
          <X className="size-3.5" /> Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitions"
        icon={<Trophy className="size-5" />}
        sub="Live contests from Codeforces and LeetCode, plus case comps, hackathons and insti mails — filtered to the profiles you are targeting."
        actions={
          <>
            <Button variant="secondary" onClick={onRefresh} disabled={refreshing || loading}>
              <RefreshCw className={cn('size-4', (refreshing || loading) && 'animate-spin')} />
              Refresh feeds
            </Button>
            <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
              <Filter className="size-4" />
              {activeFilters > 0 && <span className="font-mono">{activeFilters}</span>}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          label="Which listings"
          value={scope}
          onChange={setScope}
          items={[
            { value: 'mine', label: 'My profiles' },
            { value: 'all', label: 'Everything' },
            { value: 'saved', label: 'My calendar', count: registered.length },
          ]}
        />
        <p className="text-xs text-muted">
          {list.length} shown
          {scope === 'mine' && ` · matching ${profile.targetRoles.length} profile(s)`}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {feeds.map((f) => (
            <span
              key={f.id}
              title={f.error ?? `${f.items.length} contests from ${f.label}`}
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium',
                f.status === 'live'
                  ? 'border-accent/25 bg-accent-soft text-accent'
                  : f.status === 'computed'
                    ? 'border-warn/25 bg-warn/8 text-warn'
                    : 'border-danger/25 bg-danger/8 text-danger',
              )}
            >
              <Radio className="size-2.5" />
              {f.label}
              {f.status === 'computed' && ' · schedule'}
              {f.status === 'error' && ' · offline'}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[210px_1fr_320px]">
        {/* filter rail */}
        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-4">{filterPanel}</Card>
        </aside>

        {/* listings */}
        <div className="min-w-0 space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
            </>
          ) : list.length ? (
            <div className="stagger space-y-3">
              {list.map((c) => (
                <CompCard
                  key={c.id}
                  c={c}
                  highlight={Boolean(selectedDay) && dateKey(dayOf(c.startsAt)) === selectedDay}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Trophy className="size-6" />}
              title={scope === 'saved' ? 'Your calendar is empty' : 'Nothing matches these filters'}
              sub={
                scope === 'saved'
                  ? 'Add a contest from the list and it shows up on the calendar on the right.'
                  : 'Widen the profile or source filters, or switch to Everything.'
              }
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRoles([])
                    setSources([])
                    setTags([])
                    setScope('all')
                  }}
                >
                  Show everything
                </Button>
              }
            />
          )}
        </div>

        {/* calendar rail */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <MiniCalendar
              mine={myCalendar}
              preview={previewOnCalendar ? list : []}
              selected={selectedDay}
              onSelect={setSelectedDay}
            />

            <div className="mt-4 space-y-2 border-t border-line pt-3.5">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <span className="size-2 rounded-full bg-accent" />
                on your calendar
                {previewOnCalendar && (
                  <>
                    <span className="ml-2 size-2 rounded-full border border-dashed border-accent/50" />
                    matches the filters
                  </>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-muted">
                <input
                  type="checkbox"
                  checked={previewOnCalendar}
                  onChange={(e) => setPreviewOnCalendar(e.target.checked)}
                  className="size-3.5 accent-[var(--accent)]"
                />
                Also outline everything in the list
              </label>
            </div>

            {selectedDay && (
              <div className="anim-in mt-3 border-t border-line pt-3.5">
                <SectionTitle
                  right={
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="text-[11px] text-muted hover:text-ink"
                    >
                      clear
                    </button>
                  }
                >
                  That day
                </SectionTitle>
                {daySelection.length ? (
                  <div className="space-y-2">
                    {daySelection.map((c) => (
                      <div key={c.id} className="rounded-xl border border-line bg-surface-2 p-2.5">
                        <p className="text-[12px] font-medium leading-snug">{c.title}</p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {istTime(c.startsAt)} · {c.source}
                        </p>
                        <div className="mt-2 flex gap-1.5">
                          <Button
                            size="sm"
                            variant={registered.includes(c.id) ? 'primary' : 'secondary'}
                            onClick={() => toggleRegistered(c.id)}
                          >
                            {registered.includes(c.id) ? 'On calendar' : 'Add'}
                          </Button>
                          <a href={googleCalendarUrl(c)} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost">
                              <CalendarDays className="size-3.5" /> Google
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted">
                    Nothing on this day. Add something from the list and it will appear here.
                  </p>
                )}
              </div>
            )}
          </Card>

          <Card>
            <CardHead
              title="My calendar"
              sub={`${upcomingMine.length} upcoming · you chose each of these`}
              icon={<CalendarPlus className="size-4" />}
            />
            <div className="space-y-2 p-5 pt-3.5">
              {upcomingMine.length ? (
                upcomingMine.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="group flex items-start justify-between gap-2 rounded-xl border border-line bg-surface-2 p-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium">{c.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {istDate(c.startsAt)} · {istTime(c.startsAt)} ·{' '}
                        {relativeLabel(c.startsAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleRegistered(c.id)}
                      aria-label={`Remove ${c.title} from your calendar`}
                      className="grid size-6 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[11px] leading-relaxed text-muted">
                  Nothing yet. The calendar never fills itself — press <b>Add</b> on the contests
                  you actually intend to do and they land here.
                </p>
              )}

              <div className="space-y-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start"
                  disabled={!myCalendar.length}
                  onClick={() => downloadIcs(myCalendar)}
                >
                  <Download className="size-3.5" /> Download .ics ({myCalendar.length})
                </Button>
                {upcomingMine[0] && (
                  <a
                    href={googleCalendarUrl(upcomingMine[0])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      <CalendarDays className="size-3.5" /> Add next to Google Calendar
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card className="border-accent/25">
            <CardHead title="Alerts" icon={<Bell className="size-4" />} />
            <p className="px-5 pb-5 pt-3.5 text-[11px] leading-relaxed text-muted">
              The .ics above already carries two reminders per event — a day before and an hour
              before. Push notifications for newly opened listings are still to come.
            </p>
          </Card>
        </aside>
      </div>

      {/* mobile filters */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="anim-fade absolute inset-0 bg-scrim" onClick={() => setFiltersOpen(false)} />
          <div className="anim-slide-up absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Filters</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="text-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            {filterPanel}
            <Button variant="primary" className="mt-5 w-full" onClick={() => setFiltersOpen(false)}>
              Show {list.length} results
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
