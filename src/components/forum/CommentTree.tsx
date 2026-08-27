import { useState } from 'react'
import { CheckCircle2, CornerDownRight, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { AnonToggle } from '@/components/forum/AnonToggle'
import { Avatar, VoteControl } from '@/components/forum/VoteControl'
import {
  countReplies,
  displayAuthor,
  type ForumComment,
  type VoteMap,
} from '@/lib/forumTypes'
import { timeAgo } from '@/lib/time'
import { cn } from '@/lib/cn'

export type CommentActions = {
  authorName: string
  votes: VoteMap
  onVote: (commentId: string, value: 1 | -1) => void
  onReply: (parentId: string, body: string, anonymous: boolean) => Promise<void>
  onReport: (commentId: string) => void
  reported: string[]
  /** Set when the post is a Question and the viewer owns it. */
  onAccept?: (commentId: string) => void
  acceptedId?: string | null
}

function ReplyBox({
  onSubmit,
  onCancel,
  authorName,
}: {
  onSubmit: (body: string, anonymous: boolean) => Promise<void>
  onCancel: () => void
  authorName: string
}) {
  const [body, setBody] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!body.trim() || busy) return
    setBusy(true)
    try {
      await onSubmit(body, anonymous)
      setBody('')
      onCancel()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-2 ml-9 space-y-2">
      <Textarea
        rows={3}
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Reply…"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AnonToggle value={anonymous} onChange={setAnonymous} name={authorName} />
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" disabled={!body.trim() || busy} onClick={submit}>
            <Send className="size-3.5" /> {busy ? 'Posting…' : 'Reply'}
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
  const [collapsed, setCollapsed] = useState(false)

  const author = displayAuthor(comment)
  const myVote = (actions.votes[comment.id] as 1 | -1 | undefined) ?? 0
  const isAccepted = actions.acceptedId === comment.id
  const hidden = countReplies(comment)
  const alreadyReported = actions.reported.includes(comment.id)

  return (
    <div
      className={cn(
        depth > 0 && 'ml-4 border-l border-line pl-4',
        isAccepted && 'rounded-r-lg border-l-2 border-l-accent bg-accent-soft/40',
      )}
    >
      <div className="py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Avatar name={author.name} anonymous={comment.isAnonymous} />
          <span className="text-[13px] font-medium">{author.name}</span>
          <span className="text-[11px] text-muted">
            {author.roll} · {timeAgo(comment.createdAt)}
          </span>
          {isAccepted && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-accent">
              <CheckCircle2 className="size-3.5" /> Accepted answer
            </span>
          )}
        </div>

        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="mt-1.5 ml-9 text-[11px] text-accent hover:underline"
          >
            Show {hidden + 1} {hidden === 0 ? 'comment' : 'comments'}
          </button>
        ) : (
          <>
            <p className="mt-1.5 ml-9 whitespace-pre-wrap text-[13px] leading-relaxed text-muted">
              {comment.body}
            </p>

            <div className="mt-1.5 ml-9 flex flex-wrap items-center gap-3">
              <VoteControl
                score={comment.score}
                myVote={myVote}
                compact
                onVote={(v) => actions.onVote(comment.id, v)}
              />
              <button
                onClick={() => setReplying((r) => !r)}
                className="text-[11px] text-muted hover:text-accent"
              >
                Reply
              </button>
              {hidden > 0 && (
                <button
                  onClick={() => setCollapsed(true)}
                  className="text-[11px] text-muted hover:text-accent"
                >
                  Collapse ({hidden})
                </button>
              )}
              {actions.onAccept && (
                <button
                  onClick={() => actions.onAccept?.(comment.id)}
                  className={cn(
                    'flex items-center gap-1 text-[11px] hover:text-accent',
                    isAccepted ? 'text-accent' : 'text-muted',
                  )}
                >
                  <CheckCircle2 className="size-3" />
                  {isAccepted ? 'Unmark answer' : 'Mark as answer'}
                </button>
              )}
              <button
                onClick={() => actions.onReport(comment.id)}
                disabled={alreadyReported}
                className={cn(
                  'text-[11px]',
                  alreadyReported ? 'text-muted/60' : 'text-muted hover:text-danger',
                )}
              >
                {alreadyReported ? 'Reported' : 'Report'}
              </button>
            </div>
          </>
        )}

        {replying && !collapsed && (
          <ReplyBox
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
