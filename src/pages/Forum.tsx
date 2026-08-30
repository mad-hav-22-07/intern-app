import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUp, Hash, Loader2, MessagesSquare, Plus, Search, ShieldAlert, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Field'
import { EmptyState, PageHeader, SectionTitle } from '@/components/ui/Page'
import { PostRow, PostRowSkeleton } from '@/components/forum/PostRow'
import { ComposeModal } from '@/components/forum/ComposeModal'
import { StorageNotice } from '@/components/forum/StorageNotice'
import { TOPICS } from '@/data/forum'
import * as forumApi from '@/lib/forumApi'
import type { ListOptions, NewPostInput, RangeMode, SortMode, TopicId } from '@/lib/forumTypes'
import { useForumList, useVotes } from '@/hooks/useForum'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/cn'

const SORTS: SortMode[] = ['hot', 'new', 'top']
const RANGES: RangeMode[] = ['today', 'week', 'all']
const TOPIC_IDS = TOPICS.map((t) => t.id)

/** Delays `value` so a search doesn't refetch on every keystroke. */
function useDebounced<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return settled
}

export default function Forum() {
  const { profile, logActivity } = useApp()
  const nav = useNavigate()

  // Filters live in the URL, so a filtered feed is shareable and Back undoes a
  // filter change instead of leaving the page.
  const [params, setParams] = useSearchParams()
  const sort = (SORTS.find((s) => s === params.get('sort')) ?? 'hot') as SortMode
  const range = (RANGES.find((r) => r === params.get('range')) ?? 'week') as RangeMode
  const topicParam = params.get('topic')
  const topic: TopicId | 'all' =
    topicParam && TOPIC_IDS.includes(topicParam as TopicId) ? (topicParam as TopicId) : 'all'
  const urlQuery = params.get('q') ?? ''

  const setParam = useCallback(
    (key: string, value: string, fallback: string) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value === fallback) next.delete(key)
          else next.set(key, value)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const [input, setInput] = useState(urlQuery)
  const debounced = useDebounced(input, 300)

  // One-way sync: the box drives the URL. Reading the URL back into the box
  // would fight the user's typing.
  useEffect(() => {
    setParam('q', debounced.trim(), '')
  }, [debounced, setParam])

  const [compose, setCompose] = useState(false)

  const opts: ListOptions = useMemo(
    () => ({ topic, range, sort, query: urlQuery }),
    [topic, range, sort, urlQuery],
  )

  const { posts, counts, loading, busy, error, pending, patchScore, refresh } = useForumList(opts)
  const { votes, cast } = useVotes()
  const listTop = useRef<HTMLDivElement>(null)

  const onVote = useCallback(
    async (postId: string, value: 1 | -1) => {
      const delta = await cast({ kind: 'post', id: postId }, value)
      patchScore(postId, delta)
    },
    [cast, patchScore],
  )

  const createPost = async (input: NewPostInput) => {
    const post = await forumApi.createPost(input, {
      name: profile.name,
      roll: profile.rollNo,
    })
    logActivity('forum')
    nav(`/forum/${post.id}`)
  }

  const pullNew = () => {
    void refresh()
    listTop.current?.scrollIntoView({ block: 'start' })
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const filtered = topic !== 'all' || range !== 'all' || Boolean(urlQuery)

  const resetFilters = () => {
    setParams(new URLSearchParams(), { replace: true })
    setInput('')
  }

  const topicButton = (id: TopicId | 'all', label: string, count: number) => (
    <button
      key={id}
      onClick={() => setParam('topic', id, 'all')}
      aria-current={topic === id}
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-all duration-200',
        topic === id
          ? 'bg-accent-soft font-medium text-accent'
          : 'text-muted hover:bg-surface-2 hover:text-ink',
      )}
    >
      <span className="flex items-center gap-2">
        <Hash className="size-3.5" /> {label}
      </span>
      <span className="font-mono text-[11px]">{count}</span>
    </button>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forum"
        icon={<MessagesSquare className="size-5" />}
        sub="Interview experiences, questions and case partners — from the batch that just went through it."
        actions={
          <Button variant="primary" onClick={() => setCompose(true)}>
            <Plus className="size-4" /> New post
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-4">
            <SectionTitle>Topics</SectionTitle>
            <div className="space-y-0.5">
              {topicButton('all', 'All topics', total)}
              {TOPICS.map((t) => topicButton(t.id, t.label, counts[t.id] ?? 0))}
            </div>

            <div className="mt-5 rounded-xl border border-line bg-surface-2 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-medium">
                <ShieldAlert className="size-3.5 text-accent" /> Moderation
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                Posts are tied to roll numbers unless you post anonymously. Selling, poaching and
                fabricated experiences get removed by student moderators.
              </p>
            </div>

            <div className="mt-3">
              <StorageNotice />
            </div>
          </Card>
        </aside>

        <div className="min-w-0 space-y-4" ref={listTop}>
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              label="Sort posts"
              value={sort}
              onChange={(v) => setParam('sort', v, 'hot')}
              items={[
                { value: 'hot', label: 'Hot' },
                { value: 'new', label: 'New' },
                { value: 'top', label: 'Top' },
              ]}
            />
            <Tabs
              label="Time range"
              value={range}
              onChange={(v) => setParam('range', v, 'week')}
              size="sm"
              items={[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Past week' },
                { value: 'all', label: 'All time' },
              ]}
            />
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search posts…"
                aria-label="Search posts"
                className="pl-9 pr-9"
              />
              {input && (
                <button
                  onClick={() => setInput('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar lg:hidden">
            {[{ id: 'all' as const, label: 'All' }, ...TOPICS].map((t) => (
              <button
                key={t.id}
                onClick={() => setParam('topic', t.id, 'all')}
                className={cn(
                  'shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                  topic === t.id
                    ? 'border-accent/50 bg-accent-soft text-accent'
                    : 'border-line bg-surface text-muted',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="lg:hidden">
            <StorageNotice />
          </div>

          <div className="flex min-h-5 items-center justify-between gap-3">
            <p className="text-[11px] text-muted">
              {loading ? 'Loading…' : `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
              {urlQuery && !loading && <> matching “{urlQuery}”</>}
            </p>
            {busy && !loading && <Loader2 className="size-3.5 animate-spin text-muted" />}
          </div>

          {pending > 0 && (
            <button
              onClick={pullNew}
              className="anim-pop mx-auto flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-4 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-accent-fg"
            >
              <ArrowUp className="size-3.5" />
              {pending} new {pending === 1 ? 'update' : 'updates'} — refresh
            </button>
          )}

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/8 p-4">
              <p className="text-sm font-medium text-danger">Could not load the forum</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{error}</p>
              <Button size="sm" variant="secondary" className="mt-3" onClick={refresh}>
                Try again
              </Button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              <PostRowSkeleton />
              <PostRowSkeleton />
              <PostRowSkeleton />
            </div>
          ) : posts.length ? (
            <div className="stagger space-y-3">
              {posts.map((p) => (
                <PostRow
                  key={p.id}
                  post={p}
                  myVote={(votes[p.id] as 1 | -1 | undefined) ?? 0}
                  onVote={(v) => void onVote(p.id, v)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<MessagesSquare className="size-6" />}
              title={urlQuery ? `No posts match “${urlQuery}”` : 'Nothing here yet'}
              sub={
                filtered
                  ? 'Try a wider time range, a different topic, or clear the search.'
                  : 'Be the first to post in this topic.'
              }
              action={
                filtered ? (
                  <Button variant="secondary" onClick={resetFilters}>
                    Reset filters
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => setCompose(true)}>
                    <Plus className="size-4" /> New post
                  </Button>
                )
              }
            />
          )}
        </div>
      </div>

      <ComposeModal
        open={compose}
        onClose={() => setCompose(false)}
        onSubmit={createPost}
        authorName={profile.name}
      />
    </div>
  )
}
