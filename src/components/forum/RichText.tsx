import { cn } from '@/lib/cn'

// Trailing punctuation is excluded so "see https://x.com/y." doesn't swallow the
// full stop into the href.
const URL_RE = /(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]])/g

/**
 * Post and comment bodies are plain text, with no markdown, on purpose, because the
 * compose box has no preview. Line breaks are preserved and bare URLs become
 * links, which covers what people actually paste into a prep forum.
 */
export function RichText({ children, className }: { children: string; className?: string }) {
  const parts = children.split(URL_RE)

  return (
    <p className={cn('whitespace-pre-wrap break-words', className)}>
      {/* split() on a single-group regex alternates text, capture, text… */}
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:decoration-accent"
          >
            {part.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  )
}
