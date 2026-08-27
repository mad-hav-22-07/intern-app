import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Field'
import { AnonToggle } from '@/components/forum/AnonToggle'
import { TOPICS } from '@/data/forum'
import { FLAIRS, type NewPostInput, type TopicId } from '@/lib/forumTypes'

const DRAFT_KEY = 'ipd.forum.draft.v1'

type Draft = { title: string; body: string; topic: TopicId; flair: string; anonymous: boolean }

const EMPTY: Draft = {
  title: '',
  body: '',
  topic: 'general',
  flair: 'Question',
  anonymous: false,
}

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) } : EMPTY
  } catch {
    return EMPTY
  }
}

export function ComposeModal({
  open,
  onClose,
  onSubmit,
  authorName,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (input: NewPostInput) => Promise<void>
  authorName: string
}) {
  const [draft, setDraft] = useState<Draft>(loadDraft)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Autosave, so closing the modal by accident doesn't lose a long write-up.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      /* ignore */
    }
  }, [draft])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const title = draft.title.trim()
  const body = draft.body.trim()
  const titleError =
    title.length > 0 && title.length < 5 ? 'At least 5 characters.' : title.length > 200 ? 'Too long.' : null
  const valid = title.length >= 5 && title.length <= 200 && body.length > 0 && !busy

  const submit = async () => {
    if (!valid) return
    setBusy(true)
    setError(null)
    try {
      await onSubmit({
        title,
        body,
        topic: draft.topic,
        flair: draft.flair,
        isAnonymous: draft.anonymous,
      })
      setDraft(EMPTY)
      localStorage.removeItem(DRAFT_KEY)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New post"
      sub={draft.anonymous ? 'Your name will be hidden.' : 'Posts are tied to your roll number.'}
      wide
      footer={
        <>
          <AnonToggle
            value={draft.anonymous}
            onChange={(v) => set('anonymous', v)}
            name={authorName}
          />
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!valid} onClick={submit}>
            {busy ? 'Posting…' : 'Post'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Topic</Label>
            <Select value={draft.topic} onChange={(e) => set('topic', e.target.value as TopicId)}>
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Flair</Label>
            <Select value={draft.flair} onChange={(e) => set('flair', e.target.value)}>
              {FLAIRS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label hint={titleError ?? `${title.length}/200`}>Title</Label>
          <Input
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Be specific: Optiver quant round, what actually showed up"
          />
        </div>

        <div>
          <Label hint="draft saves automatically">Body</Label>
          <Textarea
            rows={7}
            value={draft.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Share the round structure, what was asked, and what you would do differently."
          />
        </div>

        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-[11px] text-danger">
            {error}
          </p>
        )}

        <p className="rounded-xl border border-dashed border-line px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
          Do not name individual interviewers, and do not post material under NDA. Use the
          anonymous toggle if you are sharing a rejection or anything sensitive.
        </p>
      </div>
    </Modal>
  )
}
