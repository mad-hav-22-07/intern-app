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
        Live — posts are shared with the batch in real time.
      </p>
    )
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border border-warn/25 bg-warn/10 p-3.5">
      <HardDrive className="mt-0.5 size-4 shrink-0 text-warn" />
      <div>
        <p className="text-xs font-medium text-warn">Saved to this browser only</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          Everything here works — posting, replying, voting — but no database is connected, so
          nobody else can see it. Set <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to share it with the batch.
        </p>
      </div>
    </div>
  )
}
