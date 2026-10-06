import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Badge } from './Badge'

export function PageHeader({
  title,
  sub,
  icon,
  actions,
  preview,
}: {
  title: string
  sub?: string
  icon?: ReactNode
  actions?: ReactNode
  preview?: boolean
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3.5">
        {icon && (
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent/15">
            {icon}
          </span>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
            {preview && <Badge tone="warn">Prototype preview</Badge>}
          </div>
          {sub && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{sub}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  sub,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  sub?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'anim-in grid place-items-center rounded-2xl border border-dashed border-line bg-surface-2/50 px-6 py-14 text-center',
        className,
      )}
    >
      {icon && (
        <span className="mb-3 grid size-12 place-items-center rounded-xl bg-surface text-muted shadow-card">
          {icon}
        </span>
      )}
      <p className="text-sm font-medium">{title}</p>
      {sub && <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {children}
      </h2>
      {right}
    </div>
  )
}

/** Shimmering placeholder block. Sized by the caller. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-md', className)} />
}
