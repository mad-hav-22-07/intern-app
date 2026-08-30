import { Database, HardDrive } from 'lucide-react'
import { isShared } from '@/lib/forumApi'

/**
 * Tells the reader where their posts are actually going. In local mode the forum
 * is fully functional but private to this browser, and that needs to be obvious
 * before someone writes a long interview report into it.
 */
export function StorageNotice() {
  if (isShared) {
    return (
      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        <Database className="size-3.5 text-accent" />
        Live. Posts are shared with the batch in real time.
      </p>
    )
  }
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-warn/25 bg-warn/8 p-3">
      <HardDrive className="mt-0.5 size-4 shrink-0 text-warn" />
      <div>
        <p className="text-[11px] font-medium text-warn">Saved to this browser only</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Posting, replying, voting and editing all work, but no database is connected yet, so
          nobody else can see any of it.
        </p>
      </div>
    </div>
  )
}
