/**
 * The problem list: everything solvable in this app, in one filterable table.
 *
 * Coding and SQL sit behind one switch rather than in two places, because they
 * are the same activity — open a problem, write something, hit a real judge —
 * and a student deciding what to practise is not thinking "which product area
 * is this". Only the editor differs, and that difference lives one level down.
 *
 * A proctored round is for pressure; this is for learning. Solved state lives in
 * the same `done` list as every other tick, keyed by the problem id.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Code2, Database, Filter, Search, Shuffle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { EmptyState, PageHeader } from '@/components/ui/Page'
import { useApp } from '@/context/AppContext'
import { CODING_PROBLEMS } from '@/data/coding'
import { SQL_PROBLEMS } from '@/data/sql'
import type { BankDifficulty } from '@/data/questionBank'
import { cn } from '@/lib/cn'

const DIFF_TONE: Record<BankDifficulty, 'neutral' | 'warn' | 'danger'> = {
  Easy: 'neutral',
  Medium: 'warn',
  Hard: 'danger',
}

type Kind = 'code' | 'sql'

/** The shape both problem types share, which is all this page needs. */
type Listed = {
  id: string
  title: string
  difficulty: BankDifficulty
  topics: string[]
  href: string
}

const CODING: Listed[] = CODING_PROBLEMS.map((p) => ({
  id: p.id,
  title: p.title,
  difficulty: p.difficulty,
  topics: p.topics,
  href: `/practice/${p.id}`,
}))

const SQL: Listed[] = SQL_PROBLEMS.map((p) => ({
  id: p.id,
  title: p.title,
  difficulty: p.difficulty,
  topics: p.topics,
  href: `/practice/sql/${p.id}`,
}))

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

export default function Practice() {
  const { done } = useApp()
  const [kind, setKind] = useState<Kind>('code')
  const [diff, setDiff] = useState<BankDifficulty | null>(null)
  const [topic, setTopic] = useState<string | null>(null)
  const [status, setStatus] = useState<'all' | 'todo' | 'solved'>('all')
  const [q, setQ] = useState('')

  const solved = useMemo(() => new Set(done), [done])
  const pool = kind === 'code' ? CODING : SQL

  const topics = useMemo(() => [...new Set(pool.flatMap((p) => p.topics))].sort(), [pool])

  const list = useMemo(
    () =>
      pool.filter((p) => {
        if (diff && p.difficulty !== diff) return false
        if (topic && !p.topics.includes(topic)) return false
        if (status === 'solved' && !solved.has(p.id)) return false
        if (status === 'todo' && solved.has(p.id)) return false
        if (q && !`${p.title} ${p.topics.join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false
        return true
      }),
    [pool, diff, topic, status, q, solved],
  )

  const doneCount = pool.filter((p) => solved.has(p.id)).length
  const byDiff = (d: BankDifficulty) => {
    const all = pool.filter((p) => p.difficulty === d)
    return { done: all.filter((p) => solved.has(p.id)).length, total: all.length }
  }

  // Somewhere to start when the list is long and nothing is calling to you.
  const random = list.length ? list[Math.floor(Math.random() * list.length)] : null

  /** Switching kind must clear the topic filter — the vocabularies do not overlap. */
  const switchKind = (k: Kind) => {
    setKind(k)
    setTopic(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Practice"
        icon={<Code2 className="size-5" />}
        sub="Every problem in the app, with the same editor and the same judge as a real round — minus the clock. Python, C++, Java, JavaScript, Go, Rust, TypeScript, C#, and SQL."
        actions={
          random && (
            <Link to={random.href}>
              <Button variant="secondary" size="sm">
                <Shuffle className="size-3.5" /> Random
              </Button>
            </Link>
          )
        }
      />

      <div className="flex flex-wrap gap-1.5">
        <Chip active={kind === 'code'} onClick={() => switchKind('code')}>
          <Code2 className="size-3.5" /> Coding <span className="tabular-nums opacity-60">{CODING.length}</span>
        </Chip>
        <Chip active={kind === 'sql'} onClick={() => switchKind('sql')}>
          <Database className="size-3.5" /> SQL <span className="tabular-nums opacity-60">{SQL.length}</span>
        </Chip>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">Solved</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {doneCount}
            <span className="text-base text-muted">/{pool.length}</span>
          </p>
          <Progress className="mt-2" value={pool.length ? (doneCount / pool.length) * 100 : 0} />
        </Card>
        {(['Easy', 'Medium', 'Hard'] as BankDifficulty[]).map((d) => {
          const s = byDiff(d)
          return (
            <Card key={d} className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted">{d}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {s.done}
                <span className="text-base text-muted">/{s.total}</span>
              </p>
              <Progress className="mt-2" value={s.total ? (s.done / s.total) * 100 : 0} />
            </Card>
          )
        })}
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip active={diff === null} onClick={() => setDiff(null)}>All</Chip>
          {(['Easy', 'Medium', 'Hard'] as BankDifficulty[]).map((d) => (
            <Chip key={d} active={diff === d} onClick={() => setDiff(diff === d ? null : d)}>
              {d}
            </Chip>
          ))}
          <span className="mx-1 h-4 w-px bg-line" />
          {(['all', 'todo', 'solved'] as const).map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
              {s === 'all' ? 'Any status' : s === 'todo' ? 'Unsolved' : 'Solved'}
            </Chip>
          ))}
          <span className="flex-1" />
          <label className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-1">
            <Search className="size-3.5 shrink-0 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              aria-label="Search problems"
              className="w-32 bg-transparent text-base outline-none placeholder:text-muted sm:w-40 sm:text-xs"
            />
          </label>
        </div>

        <div className="no-scrollbar flex flex-wrap items-center gap-1.5">
          <Filter className="size-3 shrink-0 text-muted" />
          {topics.map((t) => (
            <Chip key={t} active={topic === t} onClick={() => setTopic(topic === t ? null : t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      {list.length ? (
        <Card className="overflow-hidden">
          {list.map((p, i) => {
            const isDone = solved.has(p.id)
            return (
              <Link
                key={p.id}
                to={p.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2',
                  i > 0 && 'border-t border-line',
                )}
              >
                <span className="w-5 shrink-0">
                  {isDone && <CheckCircle2 className="size-4 text-accent" />}
                </span>
                <span className="w-8 shrink-0 tabular-nums text-[11px] text-muted">{i + 1}</span>
                <span className={cn('min-w-0 flex-1 truncate text-[13px] font-medium', isDone && 'text-muted')}>
                  {p.title}
                </span>
                <span className="hidden min-w-0 shrink-0 gap-1.5 sm:flex">
                  {p.topics.slice(0, 2).map((t) => (
                    <Badge key={t} tone="outline">{t}</Badge>
                  ))}
                </span>
                <Badge tone={DIFF_TONE[p.difficulty]} className="w-16 shrink-0 justify-center">
                  {p.difficulty}
                </Badge>
              </Link>
            )
          })}
        </Card>
      ) : (
        <EmptyState
          icon={kind === 'sql' ? <Database className="size-6" /> : <Code2 className="size-6" />}
          title="Nothing matches"
          sub="Loosen a filter."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setDiff(null)
                setTopic(null)
                setStatus('all')
                setQ('')
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}
    </div>
  )
}
