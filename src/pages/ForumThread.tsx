/**
 * One thread: the post, its comment tree, and the composer.
 *
 * Ownership decides what is on screen. The author of the post gets edit and delete
 * and, on a Question, the ability to accept an answer; everyone else gets Report.
 * The backend enforces the same rules, so this is presentation, not security.
 */
import { useCallback, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Link2, MessageCircle, Send, ShieldAlert } from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { EmptyState, Skeleton } from '@/components/ui/Page'
import { Tabs } from '@/components/ui/Tabs'
import { Avatar, VoteControl } from '@/components/forum/VoteControl'
import { CommentTree, type CommentActions } from '@/components/forum/CommentTree'
import { ComposeModal } from '@/components/forum/ComposeModal'
import { OwnerMenu } from '@/components/forum/OwnerMenu'
import { RichText } from '@/components/forum/RichText'
import { AnonToggle } from '@/components/forum/AnonToggle'
import { TOPIC_LABEL } from '@/data/forum'
import * as forumApi from '@/lib/forumApi'
import {
  COMMENT_MAX,
  REPORT_THRESHOLD,
  displayAuthor,
  type CommentSort,
  type NewPostInput,
} from '@/lib/forumTypes'
import { identityKey } from '@/lib/identity'
import { timeAgo } from '@/lib/time'
import { useForumThread, useVotes } from '@/hooks/useForum'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/cn'

export default function ForumThread() {
  const { postId } = useParams<{ postId: string }>()
  const { profile, logActivity } = useApp()
  const nav = useNavigate()

  const [sort, setSort] = useState<CommentSort>('best')
  const { post, comments, loading, missing, error, patchScore, refresh } = useForumThread(
    postId,
    sort,
  )
  const { votes, cast } = useVotes()

  const [draft, setDraft] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)
  const [reported, setReported] = useState<string[]>(() => forumApi.myReports())
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const author = { name: profile.name, roll: profile.rollNo }

  const voteOn = useCallback(
    async (kind: 'post' | 'comment', id: string, value: 1 | -1) => {
      const delta = await cast({ kind, id }, value)
      patchScore(kind, id, delta)
    },
    [cast, patchScore],
  )

  const addComment = async (parentId: string | null, body: string, anon: boolean) => {
    if (!postId) return
    await forumApi.createComment({ postId, parentId, body, isAnonymous: anon }, author)
    logActivity('forum')
    await refresh()
  }

  const submitTopLevel = async () => {
    const body = draft.trim()
    if (!body || body.length > COMMENT_MAX || posting) return
    setPosting(true)
    setPostError(null)
    try {
      await addComment(null, body, anonymous)
      setDraft('')
    } catch (e) {
      setPostError(e instanceof Error ? e.message : 'Could not post that comment.')
    } finally {
      setPosting(false)
    }
  }

  const onDraftKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void submitTopLevel()
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

  const savePost = async (input: NewPostInput) => {
    if (!postId) return
    await forumApi.updatePost(postId, {
      title: input.title,
      body: input.body,
      topic: input.topic,
      flair: input.flair,
    })
    await refresh()
  }

  const removePost = async () => {
    if (!postId) return
    await forumApi.deletePost(postId)
    nav('/forum', { replace: true })
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked, and the URL bar still has the link */
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-32" />
        <Card className="space-y-3 p-5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </Card>
        <Card className="space-y-3 p-5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-2/3" />
        </Card>
      </div>
    )
  }

  if (missing || (!post && !error)) {
    return (
      <EmptyState
        icon={<MessageCircle className="size-6" />}
        title="This thread is gone"
        sub="It may have been removed by its author or a moderator, or the link is wrong."
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
        <div className="rounded-xl border border-danger/30 bg-danger/8 p-4">
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
  const total = post.commentCount
  const overLimit = draft.length > COMMENT_MAX

  const actions: CommentActions = {
    authorName: profile.name,
    votes,
    onVote: (id, value) => void voteOn('comment', id, value),
    onReply: (parentId, body, anon) => addComment(parentId, body, anon),
    onEdit: async (id, body) => {
      await forumApi.updateComment(id, body)
      await refresh()
    },
    onDelete: (id) => {
      void forumApi.deleteComment(id).then(refresh)
    },
    onReport: (id) => void reportTarget('comment', id),
    reported,
    acceptedId: post.acceptedCommentId,
    onAccept: canAccept ? (id) => void acceptAnswer(id) : undefined,
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/forum"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" /> Back to forum
        </Link>
        <Button size="sm" variant="ghost" onClick={copyLink}>
          {copied ? <Check className="size-3.5 text-accent" /> : <Link2 className="size-3.5" />}
          {copied ? 'Link copied' : 'Copy link'}
        </Button>
      </div>

      {flagged && (
        <div className="anim-in flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/8 p-4">
          <ShieldAlert className="mt-0.5 size-4.5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-medium text-danger">
              Flagged by {post.reportCount} {post.reportCount === 1 ? 'user' : 'users'}, now under
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
            <div className="flex items-start gap-2">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <Badge tone="neutral">{post.flair}</Badge>
                {post.pinned && <Badge tone="accent">Pinned</Badge>}
                <span className="text-[11px] text-muted">
                  {TOPIC_LABEL[post.topic] ?? post.topic} · {timeAgo(post.createdAt)}
                  {post.editedAt && ` · edited ${timeAgo(post.editedAt)}`}
                </span>
              </div>
              {isOwner && (
                <OwnerMenu
                  onEdit={() => setEditing(true)}
                  onDelete={() => void removePost()}
                  confirmLabel="Delete this post?"
                />
              )}
            </div>

            <h1 className="mt-2.5 text-xl font-semibold leading-snug tracking-tight">
              {post.title}
            </h1>

            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
              <Avatar name={postAuthor.name} anonymous={post.isAnonymous} /> {postAuthor.name} ·{' '}
              {postAuthor.roll}
              {isOwner && (
                <span className="rounded border border-line px-1 text-[10px]">you</span>
              )}
            </div>

            <RichText className="mt-4 text-sm leading-relaxed text-muted">{post.body}</RichText>

            {!isOwner && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => void reportTarget('post', post.id)}
                  disabled={reported.includes(post.id)}
                  className="text-[11px] text-muted transition-colors hover:text-danger disabled:hover:text-muted"
                >
                  {reported.includes(post.id) ? 'Reported' : 'Report post'}
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHead
          title={`${total} ${total === 1 ? 'comment' : 'comments'}`}
          icon={<MessageCircle className="size-4" />}
          action={
            total > 1 ? (
              <Tabs
                label="Sort comments"
                size="sm"
                value={sort}
                onChange={setSort}
                items={[
                  { value: 'best', label: 'Best' },
                  { value: 'new', label: 'Newest' },
                  { value: 'old', label: 'Oldest' },
                ]}
              />
            ) : undefined
          }
        />
        <div className="p-5 pt-3.5">
          <div className="flex gap-3">
            <Avatar name={profile.name} anonymous={anonymous} />
            <div className="min-w-0 flex-1">
              <Textarea
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onDraftKey}
                aria-invalid={overLimit}
                aria-label="Add a comment"
                placeholder="Add to the discussion. Interview experiences help the next batch most."
              />
              {postError && <p className="mt-1.5 text-[11px] text-danger">{postError}</p>}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <AnonToggle value={anonymous} onChange={setAnonymous} name={profile.name} />
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'tabular-nums text-[11px]',
                      overLimit ? 'text-danger' : 'text-muted/70',
                    )}
                  >
                    {draft.length > COMMENT_MAX - 400 && `${draft.length}/${COMMENT_MAX}`}
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!draft.trim() || overLimit || posting}
                    onClick={submitTopLevel}
                  >
                    <Send className="size-3.5" /> {posting ? 'Posting…' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 divide-y divide-[var(--line)] border-t border-line">
            <CommentTree comments={comments} actions={actions} />
          </div>
        </div>
      </Card>

      <ComposeModal
        open={editing}
        mode="edit"
        onClose={() => setEditing(false)}
        onSubmit={savePost}
        authorName={profile.name}
        initial={{
          title: post.title,
          body: post.body,
          topic: post.topic,
          flair: post.flair,
        }}
      />
    </div>
  )
}
