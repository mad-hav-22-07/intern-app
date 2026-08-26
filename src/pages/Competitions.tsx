import { useMemo, useState } from 'react'
import {
  Trophy,
  CalendarDays,
  List,
  CalendarPlus,
  Check,
  Filter,
  X,
  ExternalLink,
  Users2,
  Award,
  Bell,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { PageHeader, EmptyState, SectionTitle } from '@/components/ui/Page'
import { useApp } from '@/context/AppContext'
import { ROLES, ROLE_MAP, type RoleId } from '@/data/roles'
import { COMPETITIONS, SOURCES, TAGS, dateFor, relativeLabel, type Competition } from '@/data/competitions'
import { cn } from '@/lib/cn'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
      className={cn(
        'rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
        active
          ? 'border-accent/50 bg-accent-soft text-accent'
          : 'border-line bg-surface-2 text-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function CompCard({ c }: { c: Competition }) {
  const { saved, toggleSaved } = useApp()
  const isSaved = saved.includes(c.id)
  const past = c.inDays < 0
  const urgent = c.inDays >= 0 && c.inDays <= 2

  return (
    <Card hover className={cn('p-4', past && 'opacity-55')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{c.tag}</Badge>
            <span className="text-[11px] text-muted">{c.source}</span>
          </div>
          <h3 className="mt-2 text-[15px] font-medium leading-snug">{c.title}</h3>
          <p className="mt-0.5 text-xs text-muted">{c.org}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className={cn('font-mono text-xs font-medium', urgent ? 'text-warn' : past ? 'text-muted' : 'text-accent')}>
            {relativeLabel(c.inDays)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">{c.timeLabel}</p>
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
          {dateFor(c.inDays).getDate()} {MONTHS[dateFor(c.inDays).getMonth()]}
        </span>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex flex-wrap gap-1.5">
          {c.roles.map((r) => (
            <Badge key={r} tone="outline">{ROLE_MAP[r].label}</Badge>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost">
            <ExternalLink className="size-3.5" /> Open
          </Button>
          <Button
            size="sm"
            variant={isSaved ? 'primary' : 'secondary'}
            onClick={() => toggleSaved(c.id)}
            disabled={past}
          >
            {isSaved ? <Check className="size-3.5" /> : <CalendarPlus className="size-3.5" />}
            {isSaved ? 'Added' : 'Add'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function MiniCalendar({ comps }: { comps: Competition[] }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [offset, setOffset] = useState(0)

  const view = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const first = new Date(view.getFullYear(), view.getMonth(), 1)
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() + 6) % 7 // Monday-first

  const byDay = new Map<string, Competition[]>()
  comps.forEach((c) => {
    const d = dateFor(c.inDays)
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    byDay.set(k, [...(byDay.get(k) ?? []), c])
  })

  const cells = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </p>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setOffset((o) => o - 1)}>‹</Button>
          <Button size="sm" variant="ghost" onClick={() => setOffset(0)}>Today</Button>
          <Button size="sm" variant="ghost" onClick={() => setOffset((o) => o + 1)}>›</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="pb-1 text-[10px] font-medium uppercase text-muted">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />
          const date = new Date(view.getFullYear(), view.getMonth(), day)
          const k = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
          const evs = byDay.get(k) ?? []
          const isToday = date.getTime() === today.getTime()
          return (
            <div
              key={k}
              title={evs.map((e) => e.title).join('\n')}
              className={cn(
                'relative grid aspect-square place-items-center rounded-lg border text-xs transition-colors',
                isToday
                  ? 'border-accent bg-accent text-accent-fg font-semibold'
                  : evs.length
                    ? 'border-accent/40 bg-accent-soft text-accent'
                    : 'border-transparent text-muted hover:bg-surface-2',
              )}
            >
              {day}
              {evs.length > 0 && !isToday && (
                <span className="absolute bottom-1 flex gap-0.5">
                  {evs.slice(0, 3).map((_, j) => (
                    <span key={j} className="size-1 rounded-full bg-accent" />
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Competitions() {
  const { profile, saved } = useApp()
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [scope, setScope] = useState<'mine' | 'all' | 'saved'>('mine')
  const [roles, setRoles] = useState<RoleId[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [showPast, setShowPast] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const list = useMemo(() => {
    let out = COMPETITIONS
    if (scope === 'mine') out = out.filter((c) => c.roles.some((r) => profile.targetRoles.includes(r)))
    if (scope === 'saved') out = out.filter((c) => saved.includes(c.id))
    if (roles.length) out = out.filter((c) => c.roles.some((r) => roles.includes(r)))
    if (sources.length) out = out.filter((c) => sources.includes(c.source))
    if (tags.length) out = out.filter((c) => tags.includes(c.tag))
    if (!showPast) out = out.filter((c) => c.inDays >= 0)
    return [...out].sort((a, b) => a.inDays - b.inDays)
  }, [scope, roles, sources, tags, showPast, profile.targetRoles, saved])

  const toggle = <T extends string>(arr: T[], set: (v: T[]) => void, v: T) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  const activeFilters = roles.length + sources.length + tags.length

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <SectionTitle>Profile</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((r) => (
            <Chip key={r.id} active={roles.includes(r.id)} onClick={() => toggle(roles, setRoles, r.id)}>
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
      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5">
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
        sub="Contests, case comps and hackathons pulled from Unstop, Codeforces and insti mails — filtered so the page never gets clogged."
        actions={
          <>
            <Tabs
              value={view}
              onChange={setView}
              items={[
                { value: 'list', label: 'List' },
                { value: 'calendar', label: 'Calendar' },
              ]}
            />
            <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
              <Filter className="size-4" />
              {activeFilters > 0 && <span className="font-mono">{activeFilters}</span>}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={scope}
          onChange={setScope}
          items={[
            { value: 'mine', label: 'My profiles' },
            { value: 'all', label: 'Everything' },
            { value: 'saved', label: 'My calendar', count: saved.length },
          ]}
        />
        <p className="text-xs text-muted">
          {list.length} shown{scope === 'mine' && ` · matching ${profile.targetRoles.length} profile(s)`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[210px_1fr_300px]">
        {/* filter rail */}
        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-4">{filterPanel}</Card>
        </aside>

        {/* main */}
        <div className="space-y-3">
          {view === 'calendar' ? (
            <Card className="p-5 lg:hidden">
              <MiniCalendar comps={list} />
            </Card>
          ) : null}

          {list.length ? (
            list.map((c) => <CompCard key={c.id} c={c} />)
          ) : (
            <EmptyState
              icon={<Trophy className="size-6" />}
              title="Nothing matches these filters"
              sub="Widen the profile or source filters, or switch to Everything."
              action={<Button variant="secondary" onClick={() => { setRoles([]); setSources([]); setTags([]); setScope('all') }}>Show everything</Button>}
            />
          )}
        </div>

        {/* calendar rail */}
        <aside className="space-y-4">
          <Card className="p-5">
            <MiniCalendar comps={list} />
            <div className="mt-4 flex items-center gap-2 border-t border-line pt-3.5 text-[11px] text-muted">
              <span className="size-2 rounded-full bg-accent" />
              deadline or contest day
            </div>
          </Card>

          <Card>
            <CardHead title="Sync" sub="Push saved items to your own calendar" icon={<CalendarPlus className="size-4" />} />
            <div className="space-y-2 p-5 pt-3.5">
              <Button variant="secondary" size="sm" className="w-full justify-start">
                <CalendarDays className="size-3.5" /> Google Calendar
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start">
                <List className="size-3.5" /> Download .ics
              </Button>
              <p className="pt-1 text-[11px] leading-relaxed text-muted">
                {saved.length} item{saved.length === 1 ? '' : 's'} in your calendar. Sync is a stub in
                the prototype.
              </p>
            </div>
          </Card>

          <Card className="border-accent/25">
            <CardHead title="Alerts" icon={<Bell className="size-4" />} />
            <p className="px-5 pb-5 pt-3.5 text-[11px] leading-relaxed text-muted">
              In the real build, new listings for your target profiles trigger a notification the
              morning they open, and again 24 hours before the deadline.
            </p>
          </Card>
        </aside>
      </div>

      {/* mobile filters */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setFiltersOpen(false)} />
          <div className="anim-in absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="text-muted"><X className="size-4" /></button>
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
