import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { cn } from '@/lib/cn'

export function VoteControl({
  score,
  myVote,
  onVote,
  vertical,
  compact,
}: {
  score: number
  myVote: 1 | -1 | 0
  onVote: (value: 1 | -1) => void
  vertical?: boolean
  compact?: boolean
}) {
  const size = compact ? 'size-4' : 'size-4.5'
  return (
    <div className={cn('flex items-center gap-0.5', vertical && 'flex-col')}>
      <button
        type="button"
        onClick={() => onVote(1)}
        aria-label="Upvote"
        aria-pressed={myVote === 1}
        className={cn(
          'rounded-md p-0.5 transition-colors hover:bg-surface-2',
          myVote === 1 ? 'text-accent' : 'text-muted hover:text-accent',
        )}
      >
        <ArrowBigUp className={size} fill={myVote === 1 ? 'currentColor' : 'none'} />
      </button>

      <span
        className={cn(
          'min-w-8 text-center font-mono text-xs font-medium tabular-nums',
          myVote === 1 && 'text-accent',
          myVote === -1 && 'text-danger',
        )}
      >
        {score}
      </span>

      <button
        type="button"
        onClick={() => onVote(-1)}
        aria-label="Downvote"
        aria-pressed={myVote === -1}
        className={cn(
          'rounded-md p-0.5 transition-colors hover:bg-surface-2',
          myVote === -1 ? 'text-danger' : 'text-muted hover:text-danger',
        )}
      >
        <ArrowBigDown className={size} fill={myVote === -1 ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}

export function Avatar({ name, anonymous }: { name: string; anonymous?: boolean }) {
  const initials = anonymous
    ? '?'
    : name
        .split(' ')
        .map((s) => s[0])
        .join('')
        .slice(0, 2)
  return (
    <span
      className={cn(
        'grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold',
        anonymous ? 'bg-surface-2 text-muted' : 'bg-accent-soft text-accent',
      )}
    >
      {initials}
    </span>
  )
}
