import { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Field'
import { AnonToggle } from '@/components/forum/AnonToggle'
import { TOPICS } from '@/data/forum'
import {
  BODY_MAX,
  FLAIRS,
  TITLE_MAX,
  TITLE_MIN,
  type NewPostInput,
  type TopicId,
} from '@/lib/forumTypes'
import { cn } from '@/lib/cn'

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

/**
 * Used for both "new post" and "edit post". In edit mode the anonymity toggle is
 * hidden — flipping it after the fact would either expose a name people chose to
 * hide, or retroactively hide one others have already replied to.
 */
export function ComposeModal({
  open,
  onClose,
  onSubmit,
  authorName,
  mode = 'create',
  initial,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (input: NewPostInput) => Promise<void>
  authorName: string
  mode?: 'create' | 'edit'
  initial?: Omit<Draft, 'anonymous'>
}) {
  const editing = mode === 'edit'
  const [draft, setDraft] = useState<Draft>(() =>
    editing && initial ? { ...initial, anonymous: false } : loadDraft(),
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Re-seed on open only. `initial` is a fresh object every render, so watching it
  // would overwrite what the user is typing on every keystroke.
  const wasOpen = useRef(open)
  useEffect(() => {
    if (open && !wasOpen.current && editing && initial) {
      setDraft({ ...initial, anonymous: false })
    }
    wasOpen.current = open
  })

  // Autosave, so closing the modal by accident doesn't lose a long write-up.
  // Edits are never written to the shared new-post draft.
  useEffect(() => {
    if (editing) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      /* ignore */
    }
  }, [draft, editing])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const title = draft.title.trim()
  const body = draft.body.trim()
  const titleError =
    title.length > 0 && title.length < TITLE_MIN
      ? `At least ${TITLE_MIN} characters.`
      : draft.title.length > TITLE_MAX
        ? 'Too long.'
        : null
  const bodyError = draft.body.length > BODY_MAX ? 'Too long.' : null
  const valid =
    title.length >= TITLE_MIN &&
    draft.title.length <= TITLE_MAX &&
    body.length > 0 &&
    !bodyError &&
    !busy

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
      if (!editing) {
        setDraft(EMPTY)
        try {
          localStorage.removeItem(DRAFT_KEY)
        } catch {
          /* ignore */
        }
      }
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
      title={editing ? 'Edit post' : 'New post'}
      sub={
        editing
          ? 'Everyone will see that the post was edited.'
          : draft.anonymous
            ? 'Your name will be hidden.'
            : 'Posts are tied to your roll number.'
      }
      wide
      footer={
        <>
          {!editing && (
            <AnonToggle
              value={draft.anonymous}
              onChange={(v) => set('anonymous', v)}
              name={authorName}
            />
          )}
          <div className="flex-1" />
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!valid} onClick={submit}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Post'}
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
              {/* An existing post may carry a moderator-only flair; keep it selectable. */}
              {(FLAIRS.includes(draft.flair as never)
                ? FLAIRS
                : [draft.flair, ...FLAIRS]
              ).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label
            hint={
              <span className={cn(titleError && 'text-danger')}>
                {titleError ?? `${draft.title.length}/${TITLE_MAX}`}
              </span>
            }
          >
            Title
          </Label>
          <Input
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Be specific: Optiver quant round, what actually showed up"
            aria-invalid={Boolean(titleError)}
          />
        </div>

        <div>
          <Label
            hint={
              <span className={cn(bodyError && 'text-danger')}>
                {bodyError ?? (editing ? `${draft.body.length}/${BODY_MAX}` : 'draft saves automatically')}
              </span>
            }
          >
            Body
          </Label>
          <Textarea
            rows={7}
            value={draft.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Share the round structure, what was asked, and what you would do differently."
            aria-invalid={Boolean(bodyError)}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger/8 px-3.5 py-2.5 text-[11px] text-danger">
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
