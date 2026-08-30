import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'accent' | 'neutral' | 'warn' | 'danger' | 'outline' | 'solid'

const tones: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent border-accent/20',
  neutral: 'bg-surface-2 text-muted border-line',
  warn: 'bg-warn/8 text-warn border-warn/20',
  danger: 'bg-danger/8 text-danger border-danger/20',
  outline: 'bg-transparent text-muted border-line',
  solid: 'bg-accent text-accent-fg border-accent',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-5',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
