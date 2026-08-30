import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Modal({
  open,
  onClose,
  title,
  sub,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  sub?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  // Rendered into <body> so no ancestor's transform, filter or overflow can turn
  // `position: fixed` into something relative to a page section.
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="anim-fade absolute inset-0 bg-scrim backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'anim-pop relative flex max-h-[90dvh] w-full flex-col rounded-2xl border border-line bg-surface shadow-float',
          wide ? 'max-w-2xl' : 'max-w-md',
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        {children && <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-5">{children}</div>}
        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line p-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
