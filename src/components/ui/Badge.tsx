import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'accent' | 'neutral' | 'warn' | 'danger' | 'outline'

const tones: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent border-accent/25',
  neutral: 'bg-surface-2 text-muted border-line',
  warn: 'bg-warn/10 text-warn border-warn/25',
  danger: 'bg-danger/10 text-danger border-danger/25',
  outline: 'bg-transparent text-muted border-line',
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
