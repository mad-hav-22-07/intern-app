/** The one button in the app. Every clickable action uses a variant of this. */
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-fg font-medium shadow-card hover:bg-accent-dim hover:shadow-raised',
  secondary:
    'bg-surface text-ink border border-line hover:border-accent/50 hover:bg-accent-soft hover:text-accent',
  ghost: 'text-muted hover:text-ink hover:bg-surface-2',
  danger: 'bg-danger/8 text-danger border border-danger/25 hover:bg-danger/14',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-sm gap-2 rounded-xl',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  children?: ReactNode
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap',
        'transition-all duration-200 ease-out',
        'disabled:opacity-45 disabled:pointer-events-none active:scale-[0.97]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
