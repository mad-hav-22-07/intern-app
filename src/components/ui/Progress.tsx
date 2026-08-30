import { cn } from '@/lib/cn'

export function Progress({
  value,
  className,
  showLabel,
}: {
  value: number
  className?: string
  showLabel?: boolean
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${v}%` }}
        />
      </div>
      {showLabel && <span className="font-mono text-[11px] text-muted">{v}%</span>}
    </div>
  )
}

export function Ring({
  value,
  size = 108,
  label,
  sub,
}: {
  value: number
  size?: number
  label?: string
  sub?: string
}) {
  const v = Math.max(0, Math.min(100, value))
  const stroke = 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute text-center leading-none">
        <div
          className={cn(
            'font-mono font-semibold leading-none',
            String(label ?? v).length > 3 ? 'text-lg' : 'text-2xl',
          )}
        >
          {label ?? v}
        </div>
        {sub && (
          <div className="mt-1 whitespace-nowrap text-[10px] uppercase tracking-wider text-muted">
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}
