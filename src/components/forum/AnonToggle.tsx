import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Compact inline version of the anonymity switch. `Field.tsx`'s `Checkbox` is a
 * full-width block control, too heavy to sit next to a Reply button.
 */
export function AnonToggle({
  value,
  onChange,
  name,
}: {
  value: boolean
  onChange: (v: boolean) => void
  name: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      title={
        value
          ? 'Your name is hidden from other students'
          : `Posting publicly as ${name}`
      }
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
        value
          ? 'border-accent/50 bg-accent-soft text-accent'
          : 'border-line bg-surface-2 text-muted hover:text-ink',
      )}
    >
      {value ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      {value ? 'Anonymous' : 'Posting as ' + name}
    </button>
  )
}
