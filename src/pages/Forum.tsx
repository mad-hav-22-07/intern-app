import { useMemo, useState } from 'react'
import {
  MessagesSquare,
  ArrowBigUp,
  ArrowBigDown,
  MessageCircle,
  Pin,
  Flag,
  Search,
  Plus,
  ArrowLeft,
  ShieldAlert,
  Send,
  Hash,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Input, Textarea, Label, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { PageHeader, EmptyState, SectionTitle } from '@/components/ui/Page'
import { POSTS, TOPICS, type Comment, type Post } from '@/data/forum'
import { ROLE_MAP } from '@/data/roles'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/cn'

function Votes({ votes, vertical }: { votes: number; vertical?: boolean }) {
  const [v, setV] = useState<0 | 1 | -1>(0)
  const total = votes + v
  return (
    <div className={cn('flex items-center gap-0.5', vertical && 'flex-col')}>
      <button
        onClick={() => setV(v === 1 ? 0 : 1)}
        className={cn('rounded-md p-0.5 transition-colors hover:bg-surface-2', v === 1 ? 'text-accent' : 'text-muted')}
        aria-label="Upvote"
      >
        <ArrowBigUp className="size-4.5" fill={v === 1 ? 'currentColor' : 'none'} />
      </button>
      <span className={cn('min-w-8 text-center font-mono text-xs font-medium', v === 1 && 'text-accent', v === -1 && 'text-danger')}>
        {total}
      </span>
      <button
        onClick={() => setV(v === -1 ? 0 : -1)}
        className={cn('rounded-md p-0.5 transition-colors hover:bg-surface-2', v === -1 ? 'text-danger' : 'text-muted')}
        aria-label="Downvote"
      >
        <ArrowBigDown className="size-4.5" fill={v === -1 ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
      {name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
    </span>
  )
}

function CommentNode({ c, depth = 0 }: { c: Comment; depth?: number }) {
  return (
    <div className={cn(depth > 0 && 'ml-4 border-l border-line pl-4')}>
      <div className="py-3">
        <div className="flex items-center gap-2">
          <Avatar name={c.author} />
          <span className="text-[13px] font-medium">{c.author}</span>
          <span className="text-[11px] text-muted">{c.roll} · {c.ago}</span>
        </div>
        <p className="mt-1.5 pl-9 text-[13px] leading-relaxed text-muted">{c.body}</p>
        <div className="mt-1.5 flex items-center gap-3 pl-9">
          <Votes votes={c.votes} />
          <button className="text-[11px] text-muted hover:text-accent">Reply</button>
          <button className="text-[11px] text-muted hover:text-danger">Report</button>
        </div>
      </div>
      {c.replies?.map((r) => <CommentNode key={r.id} c={r} depth={depth + 1} />)}
    </div>
  )
}

function PostRow({ p, onOpen }: { p: Post; onOpen: () => void }) {
  return (
    <Card hover className={cn('flex gap-3 p-4', p.reported && 'border-danger/30')}>
      <div className="pt-0.5">
        <Votes votes={p.votes} vertical />
      </div>
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          {p.pinned && <Badge tone="accent"><Pin className="size-3" /> Pinned</Badge>}
          <Badge tone={p.reported ? 'danger' : 'neutral'}>{p.flair}</Badge>
          <span className="text-[11px] text-muted">
            {p.topic === 'general' ? 'General' : ROLE_MAP[p.topic].label} · {p.ago}
          </span>
        </div>
        <h3 className="mt-2 text-[15px] font-medium leading-snug">{p.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{p.body}</p>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <Avatar name={p.author} /> {p.author} · {p.roll}
          </span>
          <span className="flex items-center gap-1"><MessageCircle className="size-3.5" /> {p.comments.length}</span>
          {p.reported && (
            <span className="flex items-center gap-1 text-danger"><Flag className="size-3.5" /> reported</span>
          )}
        </div>
      </button>
    </Card>
  )
}

export default function Forum() {
  const { profile } = useApp()
  const [tab, setTab] = useState<'today' | 'week' | 'all'>('today')
  const [topic, setTopic] = useState<string>('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Post | null>(null)
  const [compose, setCompose] = useState(false)
  const [draft, setDraft] = useState('')
  const [extra, setExtra] = useState<Comment[]>([])

  const list = useMemo(() => {
    let out = POSTS
    if (tab === 'today') out = out.filter((p) => p.hours <= 24)
    if (tab === 'week') out = out.filter((p) => p.hours <= 24 * 7)
    if (topic !== 'all') out = out.filter((p) => p.topic === topic)
    if (q.trim()) {
      const s = q.toLowerCase()
      out = out.filter((p) => p.title.toLowerCase().includes(s) || p.body.toLowerCase().includes(s))
    }
    return [...out].sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false) || b.votes - a.votes)
  }, [tab, topic, q])

  const counts = {
    today: POSTS.filter((p) => p.hours <= 24).length,
    week: POSTS.filter((p) => p.hours <= 24 * 7).length,
    all: POSTS.length,
  }

  if (open) {
    const comments = [...open.comments, ...extra]
    return (
      <div className="space-y-5">
        <Button variant="ghost" size="sm" onClick={() => { setOpen(null); setExtra([]) }}>
          <ArrowLeft className="size-4" /> Back to forum
        </Button>

        {open.reported && (
          <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4">
            <ShieldAlert className="mt-0.5 size-4.5 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-medium text-danger">Flagged by 6 users — under moderation</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Moderators are elected from the batch above. Flagged posts stay visible with this
                banner until reviewed, rather than disappearing silently.
              </p>
            </div>
          </div>
        )}

        <Card>
          <div className="flex gap-4 p-5">
            <Votes votes={open.votes} vertical />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{open.flair}</Badge>
                <span className="text-[11px] text-muted">
                  {open.topic === 'general' ? 'General' : ROLE_MAP[open.topic].label} · {open.ago}
                </span>
              </div>
              <h1 className="mt-2.5 text-xl font-semibold leading-snug tracking-tight">{open.title}</h1>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                <Avatar name={open.author} /> {open.author} · {open.roll}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">{open.body}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHead title={`${comments.length} comments`} icon={<MessageCircle className="size-4" />} />
          <div className="p-5 pt-3.5">
            <div className="flex gap-3">
              <Avatar name={profile.name} />
              <div className="min-w-0 flex-1">
                <Textarea
                  rows={3}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add to the discussion — interview experiences help the next batch most."
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-muted">Posting as {profile.name} · {profile.rollNo}</p>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!draft.trim()}
                    onClick={() => {
                      setExtra((p) => [
                        ...p,
                        {
                          id: `new-${p.length}`,
                          author: profile.name,
                          roll: profile.rollNo,
                          body: draft.trim(),
                          ago: 'just now',
                          votes: 1,
                        },
                      ])
                      setDraft('')
                    }}
                  >
                    <Send className="size-3.5" /> Comment
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 divide-y divide-[var(--line)] border-t border-line">
              {comments.length ? (
                comments.map((c) => <CommentNode key={c.id} c={c} />)
              ) : (
                <p className="py-8 text-center text-xs text-muted">No comments yet. Be the first.</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forum"
        icon={<MessagesSquare className="size-5" />}
        sub="Interview experiences, questions and case partners — from the batch that just went through it."
        actions={<Button variant="primary" onClick={() => setCompose(true)}><Plus className="size-4" /> New post</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <Card className="sticky top-24 p-4">
            <SectionTitle>Topics</SectionTitle>
            <div className="space-y-0.5">
              <button
                onClick={() => setTopic('all')}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-colors',
                  topic === 'all' ? 'bg-accent-soft font-medium text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink',
                )}
              >
                <span className="flex items-center gap-2"><Hash className="size-3.5" /> All topics</span>
                <span className="font-mono text-[11px]">{POSTS.length}</span>
              </button>
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-colors',
                    topic === t.id ? 'bg-accent-soft font-medium text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink',
                  )}
                >
                  <span className="flex items-center gap-2"><Hash className="size-3.5" /> {t.label}</span>
                  <span className="font-mono text-[11px]">{t.count}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-line bg-surface-2 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-medium"><ShieldAlert className="size-3.5 text-accent" /> Moderation</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                Posts are tied to roll numbers. Selling, poaching and fabricated experiences get
                removed by student moderators.
              </p>
            </div>
          </Card>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: 'today', label: 'Today', count: counts.today },
                { value: 'week', label: 'Past week', count: counts.week },
                { value: 'all', label: 'All', count: counts.all },
              ]}
            />
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" className="pl-9" />
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar lg:hidden">
            {[{ id: 'all', label: 'All' }, ...TOPICS].map((t) => (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={cn(
                  'shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                  topic === t.id ? 'border-accent/50 bg-accent-soft text-accent' : 'border-line bg-surface-2 text-muted',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {list.length ? (
            <div className="space-y-3">
              {list.map((p) => <PostRow key={p.id} p={p} onOpen={() => setOpen(p)} />)}
            </div>
          ) : (
            <EmptyState
              icon={<MessagesSquare className="size-6" />}
              title="Nothing here"
              sub="No posts match this filter. Try a wider time range or a different topic."
              action={<Button variant="secondary" onClick={() => { setTab('all'); setTopic('all'); setQ('') }}>Reset filters</Button>}
            />
          )}
        </div>
      </div>

      <Modal
        open={compose}
        onClose={() => setCompose(false)}
        title="New post"
        sub="Posts are tied to your roll number."
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setCompose(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setCompose(false)}>Post</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Topic</Label>
              <Select defaultValue="general">
                {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Flair</Label>
              <Select defaultValue="Question">
                {['Question', 'Interview Experience', 'Resource', 'Looking for partner', 'Discussion'].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Title</Label>
            <Input placeholder="Be specific: Optiver quant round, what actually showed up" />
          </div>
          <div>
            <Label hint="markdown supported">Body</Label>
            <Textarea rows={6} placeholder="Share the round structure, what was asked, and what you would do differently." />
          </div>
          <p className="rounded-xl border border-dashed border-line px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
            Do not name individual interviewers, and do not post material under NDA. Posting is
            disabled in the prototype.
          </p>
        </div>
      </Modal>
    </div>
  )
}
