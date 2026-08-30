import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * The edit / delete menu shown on content the viewer wrote. Deleting asks for
 * confirmation inline rather than through a `confirm()` dialog, which would
 * block the page.
 */
export function OwnerMenu({
  onEdit,
  onDelete,
  deleteLabel = 'Delete',
  confirmLabel = 'Delete for good?',
  className,
}: {
  onEdit?: () => void
  onDelete: () => void
  deleteLabel?: string
  confirmLabel?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  // Reopening should never land on a primed delete button.
  useEffect(() => {
    if (!open) setConfirming(false)
  }, [open])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Post actions"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink sm:size-7"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div className="anim-pop absolute right-0 z-30 mt-1 w-44 origin-top-right overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-float">
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onEdit()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-ink transition-colors hover:bg-surface-2 sm:py-2"
            >
              <Pencil className="size-3.5" /> Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (!confirming) {
                setConfirming(true)
                return
              }
              setOpen(false)
              onDelete()
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors',
              confirming ? 'bg-danger/10 font-medium text-danger' : 'text-danger hover:bg-danger/8',
            )}
          >
            <Trash2 className="size-3.5" /> {confirming ? confirmLabel : deleteLabel}
          </button>
        </div>
      )}
    </div>
  )
}
