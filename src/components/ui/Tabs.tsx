import { cn } from '@/lib/cn'

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
  size = 'md',
}: {
  value: T
  onChange: (v: T) => void
  items: { value: T; label: string; count?: number }[]
  className?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-line bg-surface-2 p-1',
        className,
      )}
    >
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={cn(
            'rounded-lg font-medium transition-all',
            size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs',
            value === it.value
              ? 'bg-accent text-accent-fg shadow-sm'
              : 'text-muted hover:bg-surface hover:text-ink',
          )}
        >
          {it.label}
          {it.count !== undefined && (
            <span className={cn('ml-1.5 font-mono', value === it.value ? 'opacity-70' : 'opacity-60')}>
              {it.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
