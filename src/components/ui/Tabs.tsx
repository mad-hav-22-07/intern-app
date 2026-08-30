import { cn } from '@/lib/cn'

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
  size = 'md',
  label,
}: {
  value: T
  onChange: (v: T) => void
  items: { value: T; label: string; count?: number }[]
  className?: string
  size?: 'sm' | 'md'
  label?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-line bg-surface-2 p-1',
        className,
      )}
    >
      {items.map((it) => {
        const active = value === it.value
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.value)}
            className={cn(
              'rounded-lg font-medium transition-all duration-200',
              size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs',
              active
                ? 'bg-surface text-accent shadow-card ring-1 ring-accent/20'
                : 'text-muted hover:bg-surface/70 hover:text-ink',
            )}
          >
            {it.label}
            {it.count !== undefined && (
              <span className={cn('ml-1.5 tabular-nums', active ? 'opacity-80' : 'opacity-60')}>
                {it.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
