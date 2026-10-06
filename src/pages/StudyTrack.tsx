/**
 * One study track, with a checkbox against every item in it.
 *
 * Ticks are stored in the same `done` list the dashboard resource rows use, so a
 * puzzle solved here counts toward the day exactly like anything else. Item ids
 * come from `data/quant.ts` and must stay stable: renaming one silently clears
 * that tick for everybody.
 */
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Dumbbell,
  Info,
  Filter,
  Laptop,
  Library,
  RotateCcw,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress, Ring } from '@/components/ui/Progress'
import { EmptyState, PageHeader, SectionTitle } from '@/components/ui/Page'
import { useApp } from '@/context/AppContext'
import {
  KIND_WORD,
  LINK_WORD,
  STUDY_TRACKS,
  TRACK_MAP,
  trackDifficulties,
  trackItemIds,
  trackTotal,
  type ItemDifficulty,
  type StudyTrack,
  type TrackGroup,
  type TrackItem,
  type TrackKind,
} from '@/data/quant'
import { cn } from '@/lib/cn'

const KIND_ICON: Record<TrackKind, typeof BookOpen> = {
  book: Library,
  notes: BookOpen,
  platform: Laptop,
  drill: Dumbbell,
}

const DIFF_TONE: Record<ItemDifficulty, 'neutral' | 'warn' | 'danger'> = {
  Easy: 'neutral',
  Medium: 'warn',
  Hard: 'danger',
  Deadly: 'danger',
}

/* --------------------------------------------------------------------- pieces */

function GroupHeader({
  group,
  doneCount,
  onAll,
  onNone,
}: {
  group: TrackGroup
  doneCount: number
  onAll: () => void
  onNone: () => void
}) {
  const total = group.items.length
  const pct = total ? Math.round((doneCount / total) * 100) : 0
  return (
    <div className="mb-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold tracking-tight">{group.title}</h3>
        <div className="flex items-center gap-3">
          <span className="tabular-nums text-[11px] text-muted">
            {doneCount}/{total}
          </span>
          {doneCount < total ? (
            <button onClick={onAll} className="text-[11px] text-muted transition-colors hover:text-accent">
              Mark all
            </button>
          ) : (
            <button onClick={onNone} className="flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-ink">
              <RotateCcw className="size-3" /> Clear
            </button>
          )}
        </div>
      </div>
      {group.note && <p className="mt-1 text-xs leading-relaxed text-muted">{group.note}</p>}
      <Progress className="mt-2" value={pct} />
    </div>
  )
}

function ListRow({
  item,
  showDifficulty,
  isDone,
  onToggle,
}: {
  item: TrackItem
  /** Hidden when the whole group is one difficulty — the heading already said it. */
  showDifficulty: boolean
  isDone: boolean
  onToggle: () => void
}) {
  const { label, title, url } = item
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors',
        isDone ? 'border-accent/30 bg-accent-soft/40' : 'border-line bg-surface-2 hover:border-accent/30',
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          'grid size-5 shrink-0 place-items-center rounded-md border transition-colors',
          isDone ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface hover:border-accent',
        )}
        aria-label={isDone ? `Mark ${title ?? label} as not done` : `Mark ${title ?? label} as done`}
      >
        {isDone && <Check className="size-3.5" strokeWidth={3} />}
      </button>

      <span className="w-9 shrink-0 tabular-nums text-[11px] text-muted">{label}</span>

      <span className={cn('min-w-0 flex-1 truncate text-[13px]', isDone && 'text-muted line-through')}>
        {title ?? label}
      </span>

      {item.topic && (
        <span className="hidden shrink-0 text-[11px] text-muted sm:inline">{item.topic}</span>
      )}
      {showDifficulty && item.difficulty && (
        <Badge tone={DIFF_TONE[item.difficulty]} className="shrink-0">
          {item.difficulty}
        </Badge>
      )}

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-muted transition-colors hover:text-accent"
          aria-label="Open"
        >
          <ArrowUpRight className="size-4" />
        </a>
      )}
    </div>
  )
}

function FilterChip({
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
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors',
        active
          ? 'border-accent/50 bg-accent-soft text-accent'
          : 'border-line bg-surface-2 text-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

/* -------------------------------------------------------------------- the page */

export default function StudyTrackPage() {
  const { trackId } = useParams()
  const { done, toggleDone, setManyDone } = useApp()
  const track = trackId ? TRACK_MAP[trackId] : undefined
  const [showAllOther, setShowAllOther] = useState(false)
  const [diffFilter, setDiffFilter] = useState<ItemDifficulty | null>(null)
  const [hideDone, setHideDone] = useState(false)

  const doneSet = useMemo(() => new Set(done), [done])

  if (!track) {
    return (
      <div className="space-y-6">
        <PageHeader title="Study tracker" icon={<Library className="size-5" />} />
        <EmptyState
          icon={<Library className="size-6" />}
          title="No such track"
          sub="It may have been renamed. Pick one from the list below."
          action={
            <Link to="/">
              <Button variant="secondary">Back to the dashboard</Button>
            </Link>
          }
        />
        <div className="grid gap-3 md:grid-cols-2">
          {STUDY_TRACKS.map((t) => (
            <TrackCard key={t.id} track={t} doneSet={doneSet} />
          ))}
        </div>
      </div>
    )
  }

  const ids = trackItemIds(track)
  const total = ids.length
  const doneCount = ids.filter((id) => doneSet.has(id)).length
  const pct = total ? Math.round((doneCount / total) * 100) : 0
  const Icon = KIND_ICON[track.kind]
  const others = STUDY_TRACKS.filter((t) => t.id !== track.id)
  const difficulties = trackDifficulties(track)

  /*
   * Filtering is a *view*. "Mark all" on a filtered group still marks only what
   * you can see — marking rows that scrolled out of view because of a filter you
   * set two minutes ago is exactly the kind of surprise that makes people stop
   * trusting a tracker.
   */
  const visibleItems = (g: TrackGroup) =>
    g.items.filter(
      (i) =>
        (!diffFilter || i.difficulty === diffFilter) && (!hideDone || !doneSet.has(i.id)),
    )

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> Back to the prep track
      </Link>

      <PageHeader
        title={track.title}
        icon={<Icon className="size-5" />}
        sub={track.blurb}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{KIND_WORD[track.kind]}</Badge>
            {track.effort && <Badge tone="outline">{track.effort}</Badge>}
          </div>
        }
      />

      {track.by && <p className="-mt-3 text-xs text-muted">{track.by}</p>}

      {(difficulties.length > 1 || total > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {difficulties.length > 1 && (
            <>
              <FilterChip active={diffFilter === null} onClick={() => setDiffFilter(null)}>
                All
              </FilterChip>
              {difficulties.map((d) => {
                const n = track.groups.flatMap((g) => g.items).filter((i) => i.difficulty === d).length
                return (
                  <FilterChip key={d} active={diffFilter === d} onClick={() => setDiffFilter(d)}>
                    {d} <span className="tabular-nums opacity-60">{n}</span>
                  </FilterChip>
                )
              })}
              <span className="mx-1 h-4 w-px bg-line" />
            </>
          )}
          <FilterChip active={hideDone} onClick={() => setHideDone((v) => !v)}>
            <Filter className="size-3" /> Hide done
          </FilterChip>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-5 lg:order-1">
          {track.groups.length === 0 ? (
            <EmptyState
              icon={<Info className="size-6" />}
              title="Nothing to tick here"
              sub="This one is open-ended. Use the links and come back to the tracked sets."
            />
          ) : (
            track.groups.map((g) => {
              const shown = visibleItems(g)
              const gIds = shown.map((i) => i.id)
              const gDone = g.items.filter((i) => doneSet.has(i.id)).length
              // One difficulty for the whole group? The heading already said it.
              const mixed = new Set(g.items.map((i) => i.difficulty)).size > 1
              if (!shown.length) return null
              return (
                <Card key={g.id} className="p-5">
                  <GroupHeader
                    group={g}
                    doneCount={gDone}
                    onAll={() => setManyDone(gIds, true)}
                    onNone={() => setManyDone(gIds, false)}
                  />

                  {g.layout === 'grid' ? (
                    <div className="flex flex-wrap gap-1.5">
                      {shown.map((it) => {
                        const isDone = doneSet.has(it.id)
                        return (
                          <button
                            key={it.id}
                            onClick={() => toggleDone(it.id)}
                            aria-pressed={isDone}
                            className={cn(
                              'grid size-9 place-items-center rounded-lg border tabular-nums text-[11px] transition-colors',
                              isDone
                                ? 'border-accent bg-accent text-accent-fg'
                                : 'border-line bg-surface-2 text-muted hover:border-accent/50 hover:text-ink',
                            )}
                          >
                            {it.label}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {shown.map((it) => (
                        <ListRow
                          key={it.id}
                          item={it}
                          showDifficulty={mixed}
                          isDone={doneSet.has(it.id)}
                          onToggle={() => toggleDone(it.id)}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>

        <div className="min-w-0 space-y-4 lg:order-2">
          <Card className="p-5">
            <div className="flex flex-col items-center gap-3">
              <Ring value={pct} label={`${doneCount}/${total}`} sub={`${pct}%`} />
              <p className="text-center text-[11px] leading-relaxed text-muted">
                {doneCount === 0
                  ? 'Nothing ticked yet.'
                  : doneCount === total
                    ? 'Finished. Go back through the ones that took you longest.'
                    : `${total - doneCount} left.`}
              </p>
            </div>
          </Card>

          <Card>
            <CardHead title="Where to get it" icon={<BookOpen className="size-4" />} />
            <div className="space-y-2 p-5 pt-3.5">
              {track.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-line bg-surface-2 p-3 transition-colors hover:border-accent/40"
                >
                  <span className="flex items-center gap-2">
                    <Badge tone={l.kind === 'buy' ? 'warn' : 'accent'}>{LINK_WORD[l.kind]}</Badge>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{l.label}</span>
                    <ArrowUpRight className="size-3.5 shrink-0 text-muted" />
                  </span>
                  {l.note && <span className="mt-1.5 block text-[11px] leading-relaxed text-muted">{l.note}</span>}
                </a>
              ))}
            </div>
          </Card>

          {track.provenance && (
            <Card className="p-4">
              <p className="flex gap-2 text-[11px] leading-relaxed text-muted">
                <Info className="mt-px size-3.5 shrink-0" />
                {track.provenance}
              </p>
            </Card>
          )}

          <div>
            <SectionTitle
              right={
                others.length > 3 && (
                  <button
                    onClick={() => setShowAllOther((v) => !v)}
                    className="text-[11px] text-muted hover:text-ink"
                  >
                    {showAllOther ? 'Show fewer' : `All ${others.length}`}
                  </button>
                )
              }
            >
              Other tracks
            </SectionTitle>
            <div className="space-y-2">
              {(showAllOther ? others : others.slice(0, 3)).map((t) => (
                <TrackCard key={t.id} track={t} doneSet={doneSet} compact />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TrackCard({
  track,
  doneSet,
  compact,
}: {
  track: StudyTrack
  doneSet: Set<string>
  compact?: boolean
}) {
  const total = trackTotal(track)
  const doneCount = trackItemIds(track).filter((id) => doneSet.has(id)).length
  const Icon = KIND_ICON[track.kind]

  return (
    <Link to={`/study/${track.id}`} className="block">
      <Card hover className={cn('p-4', !compact && 'p-5')}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{track.title}</p>
            {track.by && <p className="truncate text-[11px] text-muted">{track.by}</p>}
            {total > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Progress className="flex-1" value={total ? (doneCount / total) * 100 : 0} />
                <span className="shrink-0 tabular-nums text-[10px] text-muted">
                  {doneCount}/{total}
                </span>
              </div>
            )}
          </div>
          <ChevronRight className="mt-1 size-4 shrink-0 text-muted" />
        </div>
      </Card>
    </Link>
  )
}
