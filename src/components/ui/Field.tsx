import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const base =
  'w-full rounded-xl border border-line bg-surface-2 px-3.5 text-sm text-ink placeholder:text-muted/70 ' +
  'transition-colors focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent-soft'

export function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label className="text-xs font-medium text-muted">{children}</label>
      {hint && <span className="text-[11px] text-muted/70">{hint}</span>}
    </div>
  )
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, 'h-10', className)} {...rest} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, 'py-2.5 leading-relaxed', className)} {...rest} />
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(base, 'h-10 appearance-none pr-9', className)} {...rest}>
      {children}
    </select>
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
  sub,
  icon,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  sub?: ReactNode
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all',
        checked
          ? 'border-accent/55 bg-accent-soft'
          : 'border-line bg-surface-2 hover:border-line hover:bg-surface-2/60',
      )}
    >
      <span
        className={cn(
          'grid size-5 shrink-0 place-items-center rounded-md border transition-colors',
          checked ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface',
        )}
      >
        {checked && (
          <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block text-sm font-medium', checked && 'text-accent')}>
          {icon && <span className="mr-1.5 inline-block align-[-2px]">{icon}</span>}
          {label}
        </span>
        {sub && <span className="mt-0.5 block truncate text-[11px] text-muted">{sub}</span>}
      </span>
    </button>
  )
}
