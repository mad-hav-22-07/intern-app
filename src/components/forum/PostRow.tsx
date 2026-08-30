import { Link } from 'react-router-dom'
import { CheckCircle2, Flag, MessageCircle, Pin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Page'
import { Avatar, VoteControl } from '@/components/forum/VoteControl'
import { TOPIC_LABEL } from '@/data/forum'
import { REPORT_THRESHOLD, displayAuthor, type ForumPost } from '@/lib/forumTypes'
import { identityKey } from '@/lib/identity'
import { timeAgo } from '@/lib/time'
import { cn } from '@/lib/cn'

export function PostRow({
  post,
  myVote,
  onVote,
}: {
  post: ForumPost
  myVote: 1 | -1 | 0
  onVote: (value: 1 | -1) => void
}) {
  const flagged = post.reportCount >= REPORT_THRESHOLD
  const author = displayAuthor(post)
  const mine = post.authorKey === identityKey()

  return (
    <Card
      hover
      className={cn('flex gap-3 p-4', flagged && 'border-danger/30 bg-danger/[0.02]')}
    >
      <div className="pt-0.5">
        <VoteControl score={post.score} myVote={myVote} onVote={onVote} vertical />
      </div>

      <Link to={`/forum/${post.id}`} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {post.pinned && (
            <Badge tone="accent">
              <Pin className="size-3" /> Pinned
            </Badge>
          )}
          <Badge tone={flagged ? 'danger' : 'neutral'}>{post.flair}</Badge>
          {post.acceptedCommentId && (
            <Badge tone="accent">
              <CheckCircle2 className="size-3" /> Answered
            </Badge>
          )}
          {mine && <Badge tone="outline">Yours</Badge>}
          <span className="text-[11px] text-muted">
            {TOPIC_LABEL[post.topic] ?? post.topic} · {timeAgo(post.createdAt)}
            {post.editedAt && ' · edited'}
          </span>
        </div>

        <h3 className="mt-2 text-[15px] font-medium leading-snug">{post.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{post.body}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <Avatar name={author.name} anonymous={post.isAnonymous} /> {author.name} · {author.roll}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3.5" /> {post.commentCount}
          </span>
          {flagged && (
            <span className="flex items-center gap-1 text-danger">
              <Flag className="size-3.5" /> {post.reportCount} reports
            </span>
          )}
        </div>
      </Link>
    </Card>
  )
}

export function PostRowSkeleton() {
  return (
    <Card className="flex gap-3 p-4">
      <div className="flex w-8 flex-col items-center gap-1.5 pt-1">
        <Skeleton className="size-4" />
        <Skeleton className="h-3 w-6" />
        <Skeleton className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-2.5 py-0.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </Card>
  )
}
