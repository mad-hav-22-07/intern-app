import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({
  className,
  hover,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-card',
        hover && 'lift hover:border-accent/40',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHead({
  title,
  sub,
  icon,
  action,
  className,
}: {
  title: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight">{title}</h3>
          {sub && <p className="mt-0.5 text-xs leading-relaxed text-muted">{sub}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
