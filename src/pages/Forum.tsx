import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUp, Hash, MessagesSquare, Plus, Search, ShieldAlert } from 'lucide-react'
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

export default function Forum() {
  const { profile } = useApp()
  const nav = useNavigate()

  const [range, setRange] = useState<RangeMode>('week')
  const [sort, setSort] = useState<SortMode>('hot')
  const [topic, setTopic] = useState<TopicId | 'all'>('all')
  const [query, setQuery] = useState('')
  const [compose, setCompose] = useState(false)

  const opts: ListOptions = useMemo(
    () => ({ topic, range, sort, query }),
    [topic, range, sort, query],
  )

  const { posts, counts, loading, error, pending, refresh } = useForumList(opts)
  const { votes, cast } = useVotes()

  const onVote = useCallback(
    async (postId: string, value: 1 | -1) => {
      await cast({ kind: 'post', id: postId }, value)
      await refresh()
    },
    [cast, refresh],
  )

  const createPost = async (input: NewPostInput) => {
    const post = await forumApi.createPost(input, {
      name: profile.name,
      roll: profile.rollNo,
    })
    await refresh()
    nav(`/forum/${post.id}`)
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const topicButton = (id: TopicId | 'all', label: string, count: number) => (
    <button
      key={id}
      onClick={() => setTopic(id)}
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-colors',
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

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              value={sort}
              onChange={setSort}
              items={[
                { value: 'hot', label: 'Hot' },
                { value: 'new', label: 'New' },
                { value: 'top', label: 'Top' },
              ]}
            />
            <Tabs
              value={range}
              onChange={setRange}
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar lg:hidden">
            {[{ id: 'all' as const, label: 'All' }, ...TOPICS].map((t) => (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={cn(
                  'shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                  topic === t.id
                    ? 'border-accent/50 bg-accent-soft text-accent'
                    : 'border-line bg-surface-2 text-muted',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="lg:hidden">
            <StorageNotice />
          </div>

          {pending > 0 && (
            <button
              onClick={refresh}
              className="anim-in mx-auto flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-4 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-accent-fg"
            >
              <ArrowUp className="size-3.5" />
              {pending} new {pending === 1 ? 'update' : 'updates'} — refresh
            </button>
          )}

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-4">
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
            <div className="space-y-3">
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
              title="Nothing here"
              sub="No posts match this filter. Try a wider time range or a different topic."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRange('all')
                    setTopic('all')
                    setQuery('')
                  }}
                >
                  Reset filters
                </Button>
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
