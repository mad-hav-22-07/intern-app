import { useState } from 'react'
import {
  UserRound,
  Save,
  Check,
  Upload,
  FileText,
  Sparkles,
  AlertTriangle,
  Info,
  Lightbulb,
  RefreshCw,
  Target,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Checkbox } from '@/components/ui/Field'
import { Ring, Progress } from '@/components/ui/Progress'
import { PageHeader, SectionTitle } from '@/components/ui/Page'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/context/AppContext'
import { ROLES, ROLE_MAP } from '@/data/roles'
import { BRANCHES, RESUME_REVIEW } from '@/data/user'
import { cn } from '@/lib/cn'

const SEV = {
  high: { tone: 'danger' as const, icon: AlertTriangle, label: 'High impact' },
  medium: { tone: 'warn' as const, icon: Info, label: 'Worth fixing' },
  low: { tone: 'neutral' as const, icon: Lightbulb, label: 'Polish' },
}

export default function ProfilePage() {
  const { profile, setProfile, toggleRole } = useApp()
  const [draft, setDraft] = useState(profile)
  const [saved, setSaved] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const dirty =
    draft.name !== profile.name ||
    draft.rollNo !== profile.rollNo ||
    draft.branch !== profile.branch ||
    draft.year !== profile.year ||
    draft.cgpa !== profile.cgpa

  function save() {
    setProfile({ ...profile, ...draft, targetRoles: profile.targetRoles })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  function rescore() {
    setScoring(true)
    setTimeout(() => setScoring(false), 1400)
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Profile"
        icon={<UserRound className="size-5" />}
        sub="Your details and the profiles you are targeting. Everything else on the platform filters off this."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* details */}
        <Card className="h-fit">
          <CardHead title="Your details" sub="Visible to friends on the leaderboard" icon={<UserRound className="size-4" />} />
          <div className="grid gap-4 p-5 pt-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Full name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <Label>Roll number</Label>
              <Input value={draft.rollNo} onChange={(e) => setDraft({ ...draft, rollNo: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <Label hint="from institute account">Email</Label>
              <Input value={draft.email} disabled />
            </div>
            <div className="sm:col-span-2">
              <Label>Branch</Label>
              <Select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })}>
                {BRANCHES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Select value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })}>
                {['2nd year', '3rd year', '4th year', '5th year'].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label hint="optional">CGPA</Label>
              <Input value={draft.cgpa} onChange={(e) => setDraft({ ...draft, cgpa: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line p-4">
            <p className="text-[11px] text-muted">
              {saved ? 'Saved to this browser.' : dirty ? 'Unsaved changes' : 'Everything up to date'}
            </p>
            <Button variant="primary" onClick={save} disabled={!dirty}>
              {saved ? <Check className="size-4" /> : <Save className="size-4" />}
              {saved ? 'Saved' : 'Save changes'}
            </Button>
          </div>
        </Card>

        {/* target roles */}
        <Card className="h-fit">
          <CardHead
            title="Target profiles"
            sub="Drives the dashboard dropdown, competitions, mock rounds and Blue Book filters"
            icon={<Target className="size-4" />}
            action={<Badge tone={profile.targetRoles.length ? 'accent' : 'warn'}>{profile.targetRoles.length} selected</Badge>}
          />
          <div className="grid gap-2 p-5 pt-4 sm:grid-cols-2">
            {ROLES.map((r) => (
              <Checkbox
                key={r.id}
                checked={profile.targetRoles.includes(r.id)}
                onChange={() => toggleRole(r.id)}
                label={r.label}
                sub={r.companies.slice(0, 2).join(', ')}
              />
            ))}
          </div>
          {!profile.targetRoles.length && (
            <p className="mx-5 mb-5 rounded-xl border border-warn/25 bg-warn/10 px-3.5 py-2.5 text-xs text-warn">
              Pick at least one — the dashboard has nothing to show without it.
            </p>
          )}
        </Card>
      </div>

      {/* resume */}
      <div>
        <SectionTitle right={<Badge tone="warn">AI model not wired up yet</Badge>}>Resumes</SectionTitle>

        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <Card className="h-fit">
            <CardHead title="Your resume" icon={<FileText className="size-4" />} />
            <div className="p-5 pt-3.5">
              <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                  <FileText className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{RESUME_REVIEW.fileName}</p>
                  <p className="text-[11px] text-muted">Uploaded {RESUME_REVIEW.uploadedAt}</p>
                </div>
              </div>

              <button
                onClick={() => setShowUpload(true)}
                className="mt-3 grid w-full place-items-center gap-2 rounded-xl border border-dashed border-line px-4 py-7 text-center transition-colors hover:border-accent/50 hover:bg-accent-soft/30"
              >
                <Upload className="size-5 text-muted" />
                <span className="text-xs font-medium">Upload a new version</span>
                <span className="text-[11px] text-muted">PDF, max 2 MB · one page</span>
              </button>

              <div className="mt-4">
                <Label>Score against</Label>
                <Select defaultValue={RESUME_REVIEW.targetRole}>
                  {profile.targetRoles.map((r) => (
                    <option key={r} value={r}>{ROLE_MAP[r].label}</option>
                  ))}
                </Select>
              </div>

              <Button variant="secondary" className="mt-3 w-full" onClick={rescore} disabled={scoring}>
                <RefreshCw className={cn('size-4', scoring && 'animate-spin')} />
                {scoring ? 'Analysing…' : 'Re-run analysis'}
              </Button>
            </div>
          </Card>

          <Card>
            <CardHead
              title="AI review"
              sub="Trained on IITM-format resumes, scored against your target profile"
              icon={<Sparkles className="size-4" />}
              action={<Badge tone="accent">{ROLE_MAP[RESUME_REVIEW.targetRole].label}</Badge>}
            />

            <div className="grid gap-6 p-5 pt-4 lg:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center gap-2">
                <Ring value={RESUME_REVIEW.score} label={String(RESUME_REVIEW.score)} sub="out of 100" />
                <Badge tone={RESUME_REVIEW.score >= 75 ? 'accent' : 'warn'}>
                  {RESUME_REVIEW.score >= 75 ? 'Shortlist-ready' : 'Needs work'}
                </Badge>
              </div>

              <div className="space-y-3.5">
                {RESUME_REVIEW.breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-medium">{b.label}</span>
                      <span className="font-mono text-xs text-muted">{b.score}</span>
                    </div>
                    <Progress value={b.score} />
                    <p className="mt-1 text-[11px] text-muted">{b.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-line p-5">
              <SectionTitle>Suggested fixes</SectionTitle>
              <div className="space-y-2.5">
                {RESUME_REVIEW.suggestions.map((s) => {
                  const meta = SEV[s.severity]
                  const Icon = meta.icon
                  return (
                    <div key={s.title} className="flex gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
                      <span
                        className={cn(
                          'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg',
                          s.severity === 'high' && 'bg-danger/10 text-danger',
                          s.severity === 'medium' && 'bg-warn/10 text-warn',
                          s.severity === 'low' && 'bg-accent-soft text-accent',
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13px] font-medium">{s.title}</p>
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted">{s.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-4 rounded-xl border border-dashed border-line px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
                <b className="text-ink">Prototype note:</b> this review is a fixed example. The real
                version either runs a model trained on IITM-format resumes, or wraps an LLM with a
                per-profile rubric so nothing has to be stored server-side.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload resume"
        sub="File handling is not wired up in the prototype."
        footer={<Button variant="primary" onClick={() => setShowUpload(false)}>Close</Button>}
      >
        <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-line px-4 py-10 text-center opacity-60">
          <Upload className="size-6 text-muted" />
          <p className="text-sm font-medium">Drop your PDF here</p>
          <p className="text-xs text-muted">or click to browse · max 2 MB</p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          In the real build this uploads to private storage, extracts the text, and scores it against
          each profile you have selected. Resumes are visible only to you.
        </p>
      </Modal>
    </div>
  )
}
