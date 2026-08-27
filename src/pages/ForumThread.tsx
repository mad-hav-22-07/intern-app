import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Send, ShieldAlert } from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/Page'
import { Avatar, VoteControl } from '@/components/forum/VoteControl'
import { CommentTree, type CommentActions } from '@/components/forum/CommentTree'
import { AnonToggle } from '@/components/forum/AnonToggle'
import { TOPIC_LABEL } from '@/data/forum'
import * as forumApi from '@/lib/forumApi'
import { REPORT_THRESHOLD, displayAuthor } from '@/lib/forumTypes'
import { identityKey } from '@/lib/identity'
import { timeAgo } from '@/lib/time'
import { useForumThread, useVotes } from '@/hooks/useForum'
import { useApp } from '@/context/AppContext'

export default function ForumThread() {
  const { postId } = useParams<{ postId: string }>()
  const { profile } = useApp()
  const nav = useNavigate()

  const { post, comments, loading, missing, error, refresh } = useForumThread(postId)
  const { votes, cast } = useVotes()

  const [draft, setDraft] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [posting, setPosting] = useState(false)
  const [reported, setReported] = useState<string[]>([])

  const author = { name: profile.name, roll: profile.rollNo }

  const voteOn = useCallback(
    async (kind: 'post' | 'comment', id: string, value: 1 | -1) => {
      await cast({ kind, id }, value)
      await refresh()
    },
    [cast, refresh],
  )

  const addComment = async (parentId: string | null, body: string, anon: boolean) => {
    if (!postId) return
    await forumApi.createComment({ postId, parentId, body, isAnonymous: anon }, author)
    await refresh()
  }

  const submitTopLevel = async () => {
    if (!draft.trim() || posting) return
    setPosting(true)
    try {
      await addComment(null, draft, anonymous)
      setDraft('')
    } finally {
      setPosting(false)
    }
  }

  const acceptAnswer = async (commentId: string) => {
    if (!postId) return
    const next = post?.acceptedCommentId === commentId ? null : commentId
    await forumApi.acceptAnswer(postId, next)
    await refresh()
  }

  const reportTarget = async (kind: 'post' | 'comment', id: string) => {
    setReported((r) => (r.includes(id) ? r : [...r, id]))
    await forumApi.report({ kind, id })
    await refresh()
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-surface-2" />
        <Card className="animate-pulse space-y-3 p-5">
          <div className="h-3.5 w-32 rounded bg-surface-2" />
          <div className="h-6 w-3/4 rounded bg-surface-2" />
          <div className="h-3 w-full rounded bg-surface-2" />
          <div className="h-3 w-5/6 rounded bg-surface-2" />
        </Card>
      </div>
    )
  }

  if (missing || (!post && !error)) {
    return (
      <EmptyState
        icon={<MessageCircle className="size-6" />}
        title="This thread is gone"
        sub="It may have been removed by a moderator, or the link is wrong."
        action={
          <Button variant="secondary" onClick={() => nav('/forum')}>
            Back to forum
          </Button>
        }
      />
    )
  }

  if (error || !post) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => nav('/forum')}>
          <ArrowLeft className="size-4" /> Back to forum
        </Button>
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4">
          <p className="text-sm font-medium text-danger">Could not load this thread</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{error}</p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={refresh}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  const flagged = post.reportCount >= REPORT_THRESHOLD
  const postAuthor = displayAuthor(post)
  const isOwner = post.authorKey === identityKey()
  const canAccept = isOwner && post.flair === 'Question'
  const totalComments = post.commentCount

  const actions: CommentActions = {
    authorName: profile.name,
    votes,
    onVote: (id, value) => void voteOn('comment', id, value),
    onReply: (parentId, body, anon) => addComment(parentId, body, anon),
    onReport: (id) => void reportTarget('comment', id),
    reported,
    acceptedId: post.acceptedCommentId,
    onAccept: canAccept ? (id) => void acceptAnswer(id) : undefined,
  }

  return (
    <div className="space-y-5">
      <Link
        to="/forum"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Back to forum
      </Link>

      {flagged && (
        <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4">
          <ShieldAlert className="mt-0.5 size-4.5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-medium text-danger">
              Flagged by {post.reportCount} {post.reportCount === 1 ? 'user' : 'users'} — under
              moderation
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Moderators are elected from the batch above. Flagged posts stay visible with this
              banner until reviewed, rather than disappearing silently.
            </p>
          </div>
        </div>
      )}

      <Card>
        <div className="flex gap-4 p-5">
          <VoteControl
            score={post.score}
            myVote={(votes[post.id] as 1 | -1 | undefined) ?? 0}
            onVote={(v) => void voteOn('post', post.id, v)}
            vertical
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{post.flair}</Badge>
              <span className="text-[11px] text-muted">
                {TOPIC_LABEL[post.topic] ?? post.topic} · {timeAgo(post.createdAt)}
              </span>
            </div>

            <h1 className="mt-2.5 text-xl font-semibold leading-snug tracking-tight">
              {post.title}
            </h1>

            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
              <Avatar name={postAuthor.name} anonymous={post.isAnonymous} /> {postAuthor.name} ·{' '}
              {postAuthor.roll}
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {post.body}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => void reportTarget('post', post.id)}
                disabled={reported.includes(post.id)}
                className="text-[11px] text-muted transition-colors hover:text-danger disabled:hover:text-muted"
              >
                {reported.includes(post.id) ? 'Reported' : 'Report post'}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHead
          title={`${totalComments} ${totalComments === 1 ? 'comment' : 'comments'}`}
          icon={<MessageCircle className="size-4" />}
        />
        <div className="p-5 pt-3.5">
          <div className="flex gap-3">
            <Avatar name={profile.name} anonymous={anonymous} />
            <div className="min-w-0 flex-1">
              <Textarea
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add to the discussion — interview experiences help the next batch most."
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <AnonToggle value={anonymous} onChange={setAnonymous} name={profile.name} />
                <Button
                  size="sm"
                  variant="primary"
                  disabled={!draft.trim() || posting}
                  onClick={submitTopLevel}
                >
                  <Send className="size-3.5" /> {posting ? 'Posting…' : 'Comment'}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 divide-y divide-[var(--line)] border-t border-line">
            <CommentTree comments={comments} actions={actions} />
          </div>
        </div>
      </Card>
    </div>
  )
}
