import { useState, type KeyboardEvent } from 'react'
import { CheckCircle2, CornerDownRight, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { AnonToggle } from '@/components/forum/AnonToggle'
import { OwnerMenu } from '@/components/forum/OwnerMenu'
import { RichText } from '@/components/forum/RichText'
import { Avatar, VoteControl } from '@/components/forum/VoteControl'
import {
  COMMENT_MAX,
  countReplies,
  displayAuthor,
  type ForumComment,
  type VoteMap,
} from '@/lib/forumTypes'
import { identityKey } from '@/lib/identity'
import { timeAgo } from '@/lib/time'
import { cn } from '@/lib/cn'

/** Past this depth replies stop indenting, or the thread runs off a phone screen. */
const MAX_INDENT = 4

export type CommentActions = {
  authorName: string
  votes: VoteMap
  onVote: (commentId: string, value: 1 | -1) => void
  onReply: (parentId: string, body: string, anonymous: boolean) => Promise<void>
  onEdit: (commentId: string, body: string) => Promise<void>
  onDelete: (commentId: string) => void
  onReport: (commentId: string) => void
  reported: string[]
  /** Set when the post is a Question and the viewer owns it. */
  onAccept?: (commentId: string) => void
  acceptedId?: string | null
}

/** Shared Textarea + submit row, used for both replying and editing. */
function ComposeBox({
  initial = '',
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
  authorName,
  showAnon,
  className,
}: {
  initial?: string
  placeholder: string
  submitLabel: string
  onSubmit: (body: string, anonymous: boolean) => Promise<void>
  onCancel: () => void
  authorName: string
  showAnon: boolean
  className?: string
}) {
  const [body, setBody] = useState(initial)
  const [anonymous, setAnonymous] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const text = body.trim()
  const tooLong = body.length > COMMENT_MAX
  const valid = text.length > 0 && !tooLong && !busy

  const submit = async () => {
    if (!valid) return
    setBusy(true)
    setError(null)
    try {
      await onSubmit(body, anonymous)
      setBody('')
      onCancel()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void submit()
    }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className={cn('mt-2 space-y-2', className)}>
      <Textarea
        rows={3}
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-invalid={tooLong}
      />
      {error && <p className="text-[11px] text-danger">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {showAnon ? (
          <AnonToggle value={anonymous} onChange={setAnonymous} name={authorName} />
        ) : (
          <span className="text-[11px] text-muted">⌘/Ctrl + Enter to save</span>
        )}
        <div className="flex items-center gap-2">
          {tooLong && (
            <span className="font-mono text-[11px] text-danger">
              {body.length}/{COMMENT_MAX}
            </span>
          )}
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" disabled={!valid} onClick={submit}>
            <Send className="size-3.5" /> {busy ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

function CommentNode({
  comment,
  actions,
  depth,
}: {
  comment: ForumComment
  actions: CommentActions
  depth: number
}) {
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const author = displayAuthor(comment)
  const myVote = (actions.votes[comment.id] as 1 | -1 | undefined) ?? 0
  const isAccepted = actions.acceptedId === comment.id
  const hidden = countReplies(comment)
  const alreadyReported = actions.reported.includes(comment.id)
  const mine = comment.authorKey === identityKey() && !comment.deleted

  return (
    <div
      className={cn(
        depth > 0 && 'border-l border-line pl-4',
        depth > 0 && depth <= MAX_INDENT && 'ml-4',
        isAccepted && 'rounded-r-xl border-l-2 border-l-accent bg-accent-soft/50',
      )}
    >
      <div className="py-3">
        <div className="flex items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <Avatar name={author.name} anonymous={comment.isAnonymous} />
            <span className={cn('text-[13px] font-medium', comment.deleted && 'text-muted')}>
              {comment.deleted ? '—' : author.name}
            </span>
            {!comment.deleted && (
              <span className="text-[11px] text-muted">
                {author.roll} · {timeAgo(comment.createdAt)}
                {comment.editedAt && ' · edited'}
              </span>
            )}
            {mine && (
              <span className="rounded border border-line px-1 text-[10px] text-muted">you</span>
            )}
            {isAccepted && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-accent">
                <CheckCircle2 className="size-3.5" /> Accepted answer
              </span>
            )}
          </div>
          {mine && !editing && (
            <OwnerMenu
              onEdit={() => {
                setEditing(true)
                setCollapsed(false)
              }}
              onDelete={() => actions.onDelete(comment.id)}
              confirmLabel="Delete comment?"
            />
          )}
        </div>

        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="mt-1.5 ml-9 text-[11px] font-medium text-accent hover:underline"
          >
            Show {hidden + 1} {hidden === 0 ? 'comment' : 'comments'}
          </button>
        ) : editing ? (
          <div className="ml-9">
            <ComposeBox
              initial={comment.body}
              placeholder="Edit your comment…"
              submitLabel="Save"
              showAnon={false}
              authorName={actions.authorName}
              onCancel={() => setEditing(false)}
              onSubmit={(body) => actions.onEdit(comment.id, body)}
            />
          </div>
        ) : (
          <>
            <RichText
              className={cn(
                'mt-1.5 ml-9 text-[13px] leading-relaxed',
                comment.deleted ? 'italic text-muted/70' : 'text-muted',
              )}
            >
              {comment.body}
            </RichText>

            <div className="mt-1.5 ml-9 flex flex-wrap items-center gap-3">
              {!comment.deleted && (
                <VoteControl
                  score={comment.score}
                  myVote={myVote}
                  compact
                  onVote={(v) => actions.onVote(comment.id, v)}
                />
              )}
              <button
                onClick={() => setReplying((r) => !r)}
                className="text-[11px] text-muted transition-colors hover:text-accent"
              >
                {replying ? 'Cancel reply' : 'Reply'}
              </button>
              {hidden > 0 && (
                <button
                  onClick={() => setCollapsed(true)}
                  className="text-[11px] text-muted transition-colors hover:text-accent"
                >
                  Collapse ({hidden})
                </button>
              )}
              {actions.onAccept && !comment.deleted && (
                <button
                  onClick={() => actions.onAccept?.(comment.id)}
                  className={cn(
                    'flex items-center gap-1 text-[11px] transition-colors hover:text-accent',
                    isAccepted ? 'text-accent' : 'text-muted',
                  )}
                >
                  <CheckCircle2 className="size-3" />
                  {isAccepted ? 'Unmark answer' : 'Mark as answer'}
                </button>
              )}
              {!mine && !comment.deleted && (
                <button
                  onClick={() => actions.onReport(comment.id)}
                  disabled={alreadyReported}
                  className={cn(
                    'text-[11px] transition-colors',
                    alreadyReported ? 'text-muted/60' : 'text-muted hover:text-danger',
                  )}
                >
                  {alreadyReported ? 'Reported' : 'Report'}
                </button>
              )}
            </div>
          </>
        )}

        {replying && !collapsed && !editing && (
          <ComposeBox
            className="ml-9"
            placeholder={`Reply to ${comment.deleted ? 'this thread' : author.name}…`}
            submitLabel="Reply"
            showAnon
            authorName={actions.authorName}
            onCancel={() => setReplying(false)}
            onSubmit={(body, anon) => actions.onReply(comment.id, body, anon)}
          />
        )}
      </div>

      {!collapsed &&
        comment.replies.map((r) => (
          <CommentNode key={r.id} comment={r} actions={actions} depth={depth + 1} />
        ))}
    </div>
  )
}

export function CommentTree({
  comments,
  actions,
}: {
  comments: ForumComment[]
  actions: CommentActions
}) {
  if (!comments.length) {
    return (
      <p className="flex items-center justify-center gap-2 py-8 text-center text-xs text-muted">
        <CornerDownRight className="size-3.5" /> No comments yet. Be the first.
      </p>
    )
  }
  return (
    <>
      {comments.map((c) => (
        <CommentNode key={c.id} comment={c} actions={actions} depth={0} />
      ))}
    </>
  )
}
