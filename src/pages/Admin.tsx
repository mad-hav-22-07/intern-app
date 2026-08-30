/**
 * The admin portal.
 *
 * Two jobs: browse the practice question bank, and work the moderation queue.
 *
 * Access is gated by `isAdmin` from the context, which in demo mode is simply
 * true and with real accounts comes from `profiles.is_admin`. The gate here is a
 * convenience, not a boundary: an admin can see more, but everything they can
 * *do* still goes through the same RLS and RPCs as anyone else. Admin is granted
 * by hand in SQL, and a trigger stops a user setting the flag on themselves.
 */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ExternalLink,
  Flag,
  Library,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState, PageHeader, SectionTitle, Skeleton } from '@/components/ui/Page'
import { useApp } from '@/context/AppContext'
import { ROLES, ROLE_MAP, type RoleId } from '@/data/roles'
import {
  BANK_SOURCES,
  BANK_TOPICS,
  QUESTION_BANK,
  type BankDifficulty,
  type BankSource,
} from '@/data/questionBank'
import * as forumApi from '@/lib/forumApi'
import { REPORT_THRESHOLD, type ForumPost } from '@/lib/forumTypes'
import { timeAgo } from '@/lib/time'
import { cn } from '@/lib/cn'

const DIFFICULTIES: BankDifficulty[] = ['Easy', 'Medium', 'Hard']

const DIFF_TONE: Record<BankDifficulty, 'accent' | 'warn' | 'danger'> = {
  Easy: 'accent',
  Medium: 'warn',
  Hard: 'danger',
}

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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1.5 tabular-nums text-2xl font-semibold">{value}</p>
    </Card>
  )
}

// ------------------------------------------------------------- question bank

function QuestionBank() {
  const [query, setQuery] = useState('')
  const [sources, setSources] = useState<BankSource[]>([])
  const [levels, setLevels] = useState<BankDifficulty[]>([])
  const [roles, setRoles] = useState<RoleId[]>([])
  const [topic, setTopic] = useState<string | null>(null)

  const toggle = <T,>(list: T[], set: (v: T[]) => void, value: T) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return QUESTION_BANK.filter((item) => {
      if (sources.length && !sources.includes(item.source)) return false
      if (levels.length && !levels.includes(item.difficulty)) return false
      if (roles.length && !item.roles.some((r) => roles.includes(r))) return false
      if (topic && !item.topics.includes(topic)) return false
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        item.topics.some((t) => t.toLowerCase().includes(q)) ||
        item.source.toLowerCase().includes(q)
      )
    })
  }, [query, sources, levels, roles, topic])

  /** Coverage per source, so gaps in the bank are visible rather than assumed. */
  const bySource = useMemo(() => {
    const counts = new Map<BankSource, number>()
    for (const item of QUESTION_BANK) {
      counts.set(item.source, (counts.get(item.source) ?? 0) + 1)
    }
    return counts
  }, [])

  const active = sources.length + levels.length + roles.length + (topic ? 1 : 0)
  const clearAll = () => {
    setSources([])
    setLevels([])
    setRoles([])
    setTopic(null)
    setQuery('')
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Questions" value={QUESTION_BANK.length} />
        <Stat label="Sources" value={bySource.size} />
        <Stat label="Topics" value={BANK_TOPICS.length} />
        <Stat label="Showing" value={results.length} />
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, topic or source…"
            aria-label="Search the question bank"
            className="pl-9"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <SectionTitle>Source</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {BANK_SOURCES.map((s) => (
                <Chip
                  key={s}
                  active={sources.includes(s)}
                  onClick={() => toggle(sources, setSources, s)}
                >
                  {s}
                  <span className="ml-1 tabular-nums opacity-60">{bySource.get(s) ?? 0}</span>
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle>Difficulty</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTIES.map((d) => (
                <Chip key={d} active={levels.includes(d)} onClick={() => toggle(levels, setLevels, d)}>
                  {d}
                </Chip>
              ))}
            </div>
          </div>
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
        </div>

        <div className="mt-4">
          <SectionTitle
            right={
              active > 0 ? (
                <button onClick={clearAll} className="text-[11px] text-muted hover:text-ink">
                  clear {active}
                </button>
              ) : undefined
            }
          >
            Topic
          </SectionTitle>
          <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto scroll-thin">
            {BANK_TOPICS.map((t) => (
              <Chip key={t} active={topic === t} onClick={() => setTopic(topic === t ? null : t)}>
                {t}
              </Chip>
            ))}
          </div>
        </div>
      </Card>

      {results.length ? (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-[var(--line)]">
            {results.slice(0, 120).map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-medium">{item.title}</span>
                      <Badge tone={DIFF_TONE[item.difficulty]}>{item.difficulty}</Badge>
                      <span className="text-[11px] text-muted">{item.source}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                      <span>{item.topics.join(' · ')}</span>
                      <span className="opacity-70">
                        {item.roles.map((r) => ROLE_MAP[r].label).join(', ')}
                      </span>
                    </div>
                    {item.note && (
                      <p className="mt-1 text-[11px] leading-relaxed text-muted">{item.note}</p>
                    )}
                  </div>
                  <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted" />
                </a>
              </li>
            ))}
          </ul>
          {results.length > 120 && (
            <p className="border-t border-line px-4 py-2.5 text-[11px] text-muted">
              Showing the first 120 of {results.length}. Narrow the filters to see the rest.
            </p>
          )}
        </Card>
      ) : (
        <EmptyState
          icon={<Library className="size-6" />}
          title="Nothing matches those filters"
          action={
            <Button variant="secondary" onClick={clearAll}>
              Clear filters
            </Button>
          }
        />
      )}

      <p className="rounded-xl border border-dashed border-line px-4 py-3 text-[11px] leading-relaxed text-muted">
        Every row links out to the platform that owns the problem. The statements are not copied
        into this app on purpose: they belong to LeetCode, Brainstellar and HackerRank, and they get
        edited over time. Add rows in <code className="font-mono">src/data/questionBank.ts</code>.
      </p>
    </div>
  )
}

// ------------------------------------------------------------- moderation

function Moderation() {
  const [posts, setPosts] = useState<ForumPost[] | null>(null)

  useEffect(() => {
    let live = true
    void forumApi
      .listPosts({ topic: 'all', range: 'all', sort: 'new', query: '' })
      .then((rows) => live && setPosts(rows))
      .catch(() => live && setPosts([]))
    return () => {
      live = false
    }
  }, [])

  if (!posts) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    )
  }

  const reported = posts
    .filter((p) => p.reportCount > 0)
    .sort((a, b) => b.reportCount - a.reportCount)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Posts" value={posts.length} />
        <Stat label="Reported" value={reported.length} />
        <Stat
          label="Over threshold"
          value={reported.filter((p) => p.reportCount >= REPORT_THRESHOLD).length}
        />
      </div>

      {reported.length ? (
        <Card className="overflow-hidden">
          <CardHead
            title="Reported posts"
            sub={`Auto-flagged at ${REPORT_THRESHOLD} reports. Flagged posts stay visible with a banner rather than disappearing.`}
            icon={<Flag className="size-4" />}
          />
          <ul className="mt-3 divide-y divide-[var(--line)] border-t border-line">
            {reported.map((post) => {
              const over = post.reportCount >= REPORT_THRESHOLD
              return (
                <li key={post.id}>
                  <Link
                    to={`/forum/${post.id}`}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg',
                        over ? 'bg-danger/10 text-danger' : 'bg-warn/10 text-warn',
                      )}
                    >
                      <Flag className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{post.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {post.flair} · {timeAgo(post.createdAt)} · score {post.score}
                      </p>
                    </div>
                    <Badge tone={over ? 'danger' : 'warn'}>
                      {post.reportCount} {post.reportCount === 1 ? 'report' : 'reports'}
                    </Badge>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : (
        <EmptyState
          icon={<ShieldCheck className="size-6" />}
          title="Nothing reported"
          sub="The queue is empty. Reported posts appear here ordered by how many people flagged them."
        />
      )}

      <p className="rounded-xl border border-dashed border-line px-4 py-3 text-[11px] leading-relaxed text-muted">
        Removal is not wired up. Deleting someone else's post needs a moderator role in the database
        rather than a button here, since the current RPCs deliberately only let an author delete
        their own content.
      </p>
    </div>
  )
}

// ------------------------------------------------------------------ page

export default function Admin() {
  const { isAdmin } = useApp()
  const [tab, setTab] = useState<'bank' | 'moderation'>('bank')

  if (!isAdmin) {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-6" />}
        title="Admins only"
        sub="This account does not have the admin flag. It is granted directly in the database, not from inside the app."
        action={
          <Link to="/">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        icon={<ShieldCheck className="size-5" />}
        sub="The practice question bank and the moderation queue."
        actions={
          <Tabs
            label="Admin section"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'bank', label: 'Question bank', count: QUESTION_BANK.length },
              { value: 'moderation', label: 'Moderation' },
            ]}
          />
        }
      />
      {tab === 'bank' ? <QuestionBank /> : <Moderation />}
    </div>
  )
}
