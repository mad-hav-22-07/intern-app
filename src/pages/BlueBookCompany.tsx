/**
 * One company from the Blue Book, with room to actually read it.
 *
 * This used to be a row that expanded inside a seven-column table, which meant
 * the most valuable part of an entry — the paragraph of student feedback — was
 * competing for horizontal space with a CGPA column. Its own page costs one
 * click and gives the prose the width it needs.
 */
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ListChecks,
  MapPin,
  ExternalLink,
  Info,
  MessageSquareQuote,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { PageHeader, SectionTitle, EmptyState } from '@/components/ui/Page'
import { COMPANIES } from '@/data/bluebook'
import { metaFor } from '@/data/companyMeta'
import { CompanyLogo } from '@/components/ui/CompanyLogo'
import { yearOf, cutoffLabel, sectorLabel } from '@/lib/bluebookView'
import { ROLE_MAP } from '@/data/roles'
import { cn } from '@/lib/cn'

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet
  label: string
  value?: string | null
}) {
  // A fact the book did not record is left out entirely rather than shown as a
  // dash, which reads like a value.
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
        <p className="text-[13px] leading-snug">{value}</p>
      </div>
    </div>
  )
}

export default function BlueBookCompany() {
  const { companyId } = useParams()
  const navigate = useNavigate()

  const index = useMemo(() => COMPANIES.findIndex((c) => c.id === companyId), [companyId])
  const c = index >= 0 ? COMPANIES[index] : undefined

  /** Other write-ups of the same company, usually a different role or season. */
  const alsoSeen = useMemo(
    () => (c ? COMPANIES.filter((x) => x.name === c.name && x.id !== c.id) : []),
    [c],
  )

  if (!c) {
    return (
      <div className="space-y-6">
        <PageHeader title="Blue Book" icon={<Building2 className="size-5" />} />
        <EmptyState
          title="No such company"
          sub="It may have been renamed between editions."
          action={
            <Link to="/blue-book">
              <Button variant="secondary">Back to the Blue Book</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const meta = metaFor(c.name)
  const prev = index > 0 ? COMPANIES[index - 1] : null
  const next = index < COMPANIES.length - 1 ? COMPANIES[index + 1] : null
  const cutoff = cutoffLabel(c.cgpaCutoff)
  const conv =
    c.offers !== undefined && c.shortlisted !== undefined && c.shortlisted > 0
      ? Math.round((c.offers / c.shortlisted) * 100)
      : null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link to="/blue-book" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" /> Blue Book
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => prev && navigate(`/blue-book/${prev.id}`)}
            disabled={!prev}
            className="grid size-7 place-items-center rounded-lg text-muted transition-colors hover:text-ink disabled:opacity-30"
            aria-label="Previous company"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => next && navigate(`/blue-book/${next.id}`)}
            disabled={!next}
            className="grid size-7 place-items-center rounded-lg text-muted transition-colors hover:text-ink disabled:opacity-30"
            aria-label="Next company"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3.5">
        <CompanyLogo name={c.name} domain={meta?.domain} size={52} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{c.name}</h1>
            <Badge tone="accent">{ROLE_MAP[c.profile].label}</Badge>
            <Badge tone="outline">{yearOf(c.edition)}</Badge>
            {sectorLabel(meta?.sector) && <Badge tone="neutral">{sectorLabel(meta?.sector)}</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted">{c.role}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-4 lg:order-1">
          {/*
            * What the company *is* comes before what the role *is*. The Blue
            * Book only ever describes the hiring process, so a student who has
            * heard the name and nothing else has no way in without this.
            */}
          {meta?.about && (
            <Card>
              <CardHead title="What they do" icon={<Info className="size-4" />} />
              <p className="px-5 pb-5 pt-3.5 text-[13.5px] leading-relaxed text-muted">{meta.about}</p>
            </Card>
          )}

          {c.jd && (
            <Card className="p-5">
              <SectionTitle>The role</SectionTitle>
              <p className="text-[13.5px] leading-relaxed text-muted">{c.jd}</p>
            </Card>
          )}

          {c.rounds.length > 0 && (
            <Card>
              <CardHead title="Selection process" sub={`${c.rounds.length} rounds`} icon={<ListChecks className="size-4" />} />
              <ol className="space-y-2 p-5 pt-3.5">
                {c.rounds.map((r, i) => (
                  <li key={`${r}-${i}`} className="flex items-start gap-3">
                    <span className="mt-px grid size-6 shrink-0 place-items-center rounded-lg bg-accent-soft tabular-nums text-[11px] font-medium text-accent">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-[13px] leading-relaxed text-muted">{r}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {/* The reason anyone opens the Blue Book. */}
          {c.feedback.length > 0 && (
            <Card>
              <CardHead
                title="What students said"
                sub="Paraphrased from the feedback forms in the book"
                icon={<MessageSquareQuote className="size-4" />}
              />
              <div className="space-y-2.5 p-5 pt-3.5">
                {c.feedback.map((f, i) => (
                  <div key={i} className="rounded-xl border border-line bg-surface-2 p-3.5 text-[13px] leading-relaxed text-muted">
                    {f}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="min-w-0 space-y-4 lg:order-2">
          <Card className="p-5">
            <div className="space-y-3.5">
              <Fact icon={Wallet} label="Stipend" value={c.stipend} />
              <Fact icon={Sparkles} label="Full-time CTC" value={c.ctc} />
              <Fact icon={GraduationCap} label="CGPA" value={cutoff} />
              <Fact icon={CalendarClock} label="Slot" value={c.day} />
              <Fact icon={MapPin} label="Location" value={c.location} />
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle>Eligibility</SectionTitle>
            {c.allBranches ? (
              <Badge tone="accent">Open to all branches</Badge>
            ) : c.depts.length ? (
              <div className="flex flex-wrap gap-1.5">
                {c.depts.map((d) => <Badge key={d} tone="neutral">{d}</Badge>)}
              </div>
            ) : (
              <p className="text-[11px] leading-relaxed text-muted">
                The book does not list eligible departments for this entry.
              </p>
            )}
          </Card>

          {meta?.links?.length ? (
            <Card className="p-5">
              <SectionTitle>Go deeper</SectionTitle>
              <div className="space-y-1.5">
                {meta.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] transition-colors hover:border-accent/40"
                  >
                    <span className="min-w-0 flex-1 truncate">{l.label}</span>
                    <ExternalLink className="size-3.5 shrink-0 text-muted" />
                  </a>
                ))}
              </div>
            </Card>
          ) : null}

          {c.prepareTopics?.length ? (
            <Card className="p-5">
              <SectionTitle>What to prepare</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {c.prepareTopics.map((t) => <Badge key={t} tone="outline">{t}</Badge>)}
              </div>
            </Card>
          ) : null}

          {(c.applied !== undefined || c.shortlisted !== undefined || c.offers !== undefined) && (
            <Card className="p-5">
              <SectionTitle right={conv !== null ? <span className="text-[11px] text-accent">{conv}% convert</span> : undefined}>
                Funnel
              </SectionTitle>
              <div className="space-y-2">
                {([
                  ['Applied', c.applied],
                  ['Shortlisted', c.shortlisted],
                  ['Offers', c.offers],
                ] as const)
                  .filter(([, v]) => typeof v === 'number')
                  .map(([l, v]) => {
                    // Scale against the largest figure we actually have, so a
                    // company that published only offers still gets a real bar.
                    const max = c.applied ?? c.shortlisted ?? c.offers ?? 1
                    // `??` only falls through on null/undefined, so a book that
                    // prints "0 offers" and nothing else leaves max at 0 too —
                    // 0/0 is NaN, and Progress's invalid `width: NaN%` collapses
                    // to the div's default 100%, drawing a *full* bar for a
                    // company that converted nobody. Zero must render as empty.
                    const pct = max > 0 ? (v! / max) * 100 : 0
                    return (
                      <div key={l}>
                        <div className="mb-1 flex justify-between text-[11px]">
                          <span className="text-muted">{l}</span>
                          <span className="tabular-nums">{v}</span>
                        </div>
                        <Progress value={pct} />
                      </div>
                    )
                  })}
              </div>
            </Card>
          )}

          {alsoSeen.length > 0 && (
            <Card className="p-5">
              <SectionTitle>Also in the book</SectionTitle>
              <div className="space-y-1.5">
                {alsoSeen.map((o) => (
                  <Link
                    key={o.id}
                    to={`/blue-book/${o.id}`}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2',
                      'text-[12px] transition-colors hover:border-accent/40',
                    )}
                  >
                    <Target className="size-3.5 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate">{o.role}</span>
                    <span className="shrink-0 text-[11px] text-muted">{yearOf(o.edition)}</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <p className="px-1 text-[11px] leading-relaxed text-muted">
            From the {c.edition} Blue Book. Summarised, not transcribed — an IIT Madras document,
            not to be shared outside the institute.
          </p>
        </div>
      </div>
    </div>
  )
}
