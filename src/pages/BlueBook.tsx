/**
 * The Blue Book: every company the Placement & Internship Cell wrote up.
 *
 * This was a seven-column table and it was the wrong shape. The interesting part
 * of an entry is prose — the rounds, and what students said about them — and
 * prose does not belong in a table cell that is competing with six other columns
 * for width. So the list is cards, and a company opens as its own page with room
 * to actually read it.
 *
 * Filtering leads with the **year**, because that is how a student thinks about
 * it: what happened last season, then the season before. Which of the three
 * source books an entry came from is provenance, not navigation, so it lives on
 * the detail page rather than in a column.
 *
 * The books are IIT Madras property and not to be shared outside the institute.
 * This page sits behind `RequireAuth` like everything else, and must stay there.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookMarked, Building2, ChevronRight, Search, Sparkles, Users } from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Progress } from '@/components/ui/Progress'
import { PageHeader, SectionTitle, EmptyState } from '@/components/ui/Page'
import { COMPANIES, type Company } from '@/data/bluebook'
import { metaFor } from '@/data/companyMeta'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { YEARS, yearOf, cutoffLabel, sectorLabel } from '@/lib/bluebookView'
import { answerableInsights } from '@/lib/bluebookInsights'
import { ROLES, ROLE_MAP, type RoleId } from '@/data/roles'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/cn'

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

function CompanyCard({ c }: { c: Company }) {
  const cutoff = cutoffLabel(c.cgpaCutoff)
  const meta = metaFor(c.name)
  return (
    <Link to={`/blue-book/${c.id}`} className="block min-w-0">
      <Card hover className="flex h-full flex-col p-4">
        <div className="flex items-start gap-3">
          <CompanyLogo name={c.name} domain={meta?.domain} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold tracking-tight">{c.name}</p>
            <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted">{c.role}</p>
          </div>
          <ChevronRight className="mt-1 size-4 shrink-0 text-muted" />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="accent">{ROLE_MAP[c.profile].label}</Badge>
          {sectorLabel(meta?.sector) && <Badge tone="outline">{sectorLabel(meta?.sector)}</Badge>}
          {c.allBranches ? (
            <Badge tone="outline">All branches</Badge>
          ) : (
            c.depts.slice(0, 3).map((d) => <Badge key={d} tone="neutral">{d}</Badge>)
          )}
        </div>

        <div className="mt-3 flex-1 space-y-1 text-[11px] text-muted">
          {c.stipend && <p className="line-clamp-1">Stipend · {c.stipend}</p>}
          {cutoff && <p>CGPA · {cutoff}</p>}
          {c.rounds.length > 0 && <p>{c.rounds.length} rounds</p>}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[11px]">
          <span className="text-muted">{yearOf(c.edition)}</span>
          {c.offers !== undefined && (
            <span className="tabular-nums text-accent">
              {c.offers} offer{c.offers === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </Card>
    </Link>
  )
}

export default function BlueBook() {
  const { profile } = useApp()
  const [year, setYear] = useState<string | 'all'>(YEARS[0])
  const [profileF, setProfileF] = useState<RoleId | 'all'>('all')
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(48)

  const list = useMemo(() => {
    let out = COMPANIES
    if (year !== 'all') out = out.filter((c) => yearOf(c.edition) === year)
    if (profileF !== 'all') out = out.filter((c) => c.profile === profileF)
    if (q.trim()) {
      const s = q.toLowerCase()
      out = out.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.role.toLowerCase().includes(s) ||
          c.depts.some((d) => d.toLowerCase() === s) ||
          (c.prepareTopics ?? []).some((t) => t.toLowerCase().includes(s)),
      )
    }
    return out
  }, [year, profileF, q])

  const stats = useMemo(() => {
    const withOffers = list.filter((c) => c.offers !== undefined)
    return {
      withOffers: withOffers.length,
      totalOffers: withOffers.reduce((a, c) => a + c.offers!, 0),
    }
  }, [list])

  const insights = useMemo(() => answerableInsights(list), [list])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blue Book"
        icon={<BookMarked className="size-5" />}
        sub="Every company from the Placement Cell's Blue Books — the rounds, who was eligible, and what students said about each process."
      />

      {/* Year first: it is how a student actually narrows this down. */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] uppercase tracking-wider text-muted">Season</span>
        {YEARS.map((y) => (
          <Chip key={y} active={year === y} onClick={() => setYear(y)}>{y}</Chip>
        ))}
        <Chip active={year === 'all'} onClick={() => setYear('all')}>All seasons</Chip>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Companies', value: list.length, icon: Building2, sub: year === 'all' ? 'across every season' : `in ${year}` },
          { label: 'Offers recorded', value: stats.totalOffers, icon: Sparkles, sub: `from the ${stats.withOffers} that publish a number` },
          { label: 'Profiles', value: new Set(list.map((c) => c.profile)).size, icon: Users, sub: 'represented in this selection' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted">{s.label}</span>
              <s.icon className="size-4 text-accent" />
            </div>
            <p className="mt-2 tabular-nums text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-[11px] text-muted">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <Card className="p-4">
            <div className="space-y-3">
              <div>
                <SectionTitle
                  right={
                    profile.targetRoles.length ? (
                      <button onClick={() => setProfileF(profile.targetRoles[0])} className="text-[11px] text-accent hover:underline">
                        Jump to my profile
                      </button>
                    ) : undefined
                  }
                >
                  Profile
                </SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  <Chip active={profileF === 'all'} onClick={() => setProfileF('all')}>All</Chip>
                  {ROLES.map((r) => (
                    <Chip key={r.id} active={profileF === r.id} onClick={() => setProfileF(r.id)}>
                      {ROLE_MAP[r.id].label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company, role, department or topic…" className="pl-9" />
              </div>
            </div>
          </Card>

          {list.length ? (
            <>
              {/*
               * `grid-cols-1` has to be explicit: with no base column class, Tailwind emits
               * no grid-template-columns rule at all below `sm`, so the single implicit
               * column sizes to content (max-content) instead of the minmax(0,1fr) track
               * `grid-cols-N` gives every other breakpoint. A 63-character company name
               * behind `truncate` (nowrap) then reports that as its min-content width and
               * drags the whole page wider than the viewport — the same class of bug this
               * page's own history warns about. `min-w-0` on the card link below is the
               * second half: a grid item's automatic minimum is its content size unless
               * told otherwise, even inside a track that can shrink.
               */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {list.slice(0, limit).map((c) => <CompanyCard key={c.id} c={c} />)}
              </div>
              {list.length > limit && (
                <div className="flex justify-center">
                  <Button variant="secondary" onClick={() => setLimit((n) => n + 48)}>
                    Show more · {list.length - limit} left
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={<Building2 className="size-6" />}
              title="No companies match"
              sub="Try another season or profile."
              action={
                <Button variant="secondary" onClick={() => { setYear('all'); setProfileF('all'); setQ('') }}>
                  Reset filters
                </Button>
              }
            />
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardHead
              title="What the numbers say"
              sub="Computed from the entries showing, not written by hand"
              icon={<Sparkles className="size-4" />}
            />
            <div className="space-y-3 p-5 pt-3.5">
              {insights.length ? (
                insights.map((i) => (
                  <div key={i.q} className="rounded-xl border border-line bg-surface-2 p-3">
                    <p className="text-[12px] font-medium">{i.q}</p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{i.a}</p>
                  </div>
                ))
              ) : (
                <p className="text-[11px] leading-relaxed text-muted">
                  Nothing computable from this selection — widen the filters.
                </p>
              )}
            </div>
          </Card>

          <Card className="border-accent/25">
            <CardHead title="Where this comes from" icon={<BookMarked className="size-4" />} />
            <div className="space-y-2 px-5 pb-5 pt-3.5 text-[11px] leading-relaxed text-muted">
              <p>
                Transcribed from the Placement &amp; Internship Cell's own Blue Books. Descriptions
                and feedback are summarised rather than quoted, and offer counts appear only where a
                book printed them — a blank means the book did not say.
              </p>
              <p className="text-warn">
                These are IIT Madras documents and are not to be shared outside the institute. That
                is why this page is behind the login.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Progress is only meaningful once a filter is on; keeps the page honest. */}
      {year !== 'all' && (
        <Progress className="opacity-0" value={0} aria-hidden />
      )}
    </div>
  )
}
