import { useState } from 'react'
import {
  Users,
  UserPlus,
  Search,
  Flame,
  Swords,
  Trophy,
  Clock,
  Check,
  X,
  Crown,
  MessageCircle,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Field'
import { Progress } from '@/components/ui/Progress'
import { PageHeader, SectionTitle, EmptyState } from '@/components/ui/Page'
import { Modal } from '@/components/ui/Modal'
import { FRIENDS, REQUESTS, type Friend } from '@/data/exams'
import { ROLE_MAP } from '@/data/roles'
import { useApp } from '@/context/AppContext'
import { STREAK } from '@/data/user'
import { cn } from '@/lib/cn'

function Av({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent ring-1 ring-accent/20"
      style={{ width: size, height: size, fontSize: size / 3.2 }}
    >
      {name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
    </span>
  )
}

export default function Friends() {
  const { profile } = useApp()
  const [tab, setTab] = useState<'friends' | 'leaderboard' | 'requests'>('friends')
  const [q, setQ] = useState('')
  const [add, setAdd] = useState(false)
  const [challenge, setChallenge] = useState<Friend | null>(null)
  const [handled, setHandled] = useState<string[]>([])

  const list = FRIENDS.filter(
    (f) => f.name.toLowerCase().includes(q.toLowerCase()) || f.roll.toLowerCase().includes(q.toLowerCase()),
  )

  const board = [
    ...FRIENDS,
    { id: 'me', name: profile.name, roll: profile.rollNo, branch: profile.branch, roles: profile.targetRoles, streak: STREAK.current, weekMinutes: 420, solved: 187 },
  ].sort((a, b) => b.weekMinutes - a.weekMinutes)

  const maxMinutes = Math.max(...board.map((b) => b.weekMinutes))
  const pending = REQUESTS.filter((r) => !handled.includes(r.id))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Friends"
        icon={<Users className="size-5" />}
        sub="Prep is easier with people doing it alongside you. Compare streaks, challenge each other to mock exams, find a case partner."
        actions={<Button variant="primary" onClick={() => setAdd(true)}><UserPlus className="size-4" /> Add friend</Button>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'friends', label: 'My friends', count: FRIENDS.length },
            { value: 'leaderboard', label: 'Leaderboard' },
            { value: 'requests', label: 'Requests', count: pending.length },
          ]}
        />
        {tab === 'friends' && (
          <div className="relative min-w-48 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or roll…" className="pl-9" />
          </div>
        )}
      </div>

      {tab === 'friends' && (
        list.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((f) => (
              <Card key={f.id} hover className="p-5">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Av name={f.name} />
                    {f.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-accent" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.name}</p>
                    <p className="truncate text-[11px] text-muted">{f.roll} · {f.branch}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {f.roles.map((r) => <Badge key={r} tone="outline">{ROLE_MAP[r].label}</Badge>)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3.5 text-center">
                  <div>
                    <p className="font-mono text-sm font-semibold text-accent">{f.streak}d</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted">Streak</p>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold">{Math.round(f.weekMinutes / 60)}h</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted">This week</p>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold">{f.solved}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted">Solved</p>
                  </div>
                </div>

                <div className="mt-3.5 flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => setChallenge(f)}>
                    <Swords className="size-3.5" /> Challenge
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MessageCircle className="size-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Users className="size-6" />} title="Nobody by that name" sub="Try a roll number instead." />
        )
      )}

      {tab === 'leaderboard' && (
        <Card>
          <CardHead
            title="This week"
            sub="Ranked by focused prep time — resets Monday"
            icon={<Trophy className="size-4" />}
            action={<Badge tone="accent">Week 34</Badge>}
          />
          <div className="divide-y divide-[var(--line)] p-5 pt-3.5">
            {board.map((f, i) => {
              const isMe = f.id === 'me'
              return (
                <div key={f.id} className={cn('flex items-center gap-3 py-3', isMe && 'rounded-xl bg-accent-soft px-3')}>
                  <span className={cn('grid size-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-semibold', i === 0 ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-muted')}>
                    {i === 0 ? <Crown className="size-3.5" /> : i + 1}
                  </span>
                  <Av name={f.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-[13px] font-medium', isMe && 'text-accent')}>
                      {f.name}{isMe && ' (you)'}
                    </p>
                    <p className="truncate text-[11px] text-muted">{f.roll}</p>
                  </div>
                  <div className="hidden w-40 sm:block">
                    <Progress value={(f.weekMinutes / maxMinutes) * 100} />
                  </div>
                  <div className="w-16 shrink-0 text-right">
                    <p className="font-mono text-[13px] font-semibold">{Math.round(f.weekMinutes / 60)}h</p>
                    <p className="flex items-center justify-end gap-0.5 text-[10px] text-muted">
                      <Flame className="size-3 text-accent" />{f.streak}d
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {tab === 'requests' && (
        pending.length ? (
          <div className="space-y-3">
            {pending.map((r) => (
              <Card key={r.id} className="flex flex-wrap items-center gap-4 p-4">
                <Av name={r.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-[11px] text-muted">{r.roll} · {r.branch} · {r.mutual} mutual friends</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => setHandled((h) => [...h, r.id])}>
                    <Check className="size-3.5" /> Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setHandled((h) => [...h, r.id])}>
                    <X className="size-3.5" /> Ignore
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState icon={<UserPlus className="size-6" />} title="No pending requests" sub="You are all caught up." />
        )
      )}

      <Modal
        open={add}
        onClose={() => setAdd(false)}
        title="Add a friend"
        sub="Search the batch by name or roll number."
        footer={<Button variant="primary" onClick={() => setAdd(false)}>Done</Button>}
      >
        <Input placeholder="e.g. CS22B015" autoFocus />
        <div className="mt-4">
          <SectionTitle>Suggested — same target profiles</SectionTitle>
          <div className="space-y-2">
            {REQUESTS.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
                <Av name={r.name} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">{r.name}</p>
                  <p className="text-[11px] text-muted">{r.roll} · {r.mutual} mutual</p>
                </div>
                <Button size="sm" variant="secondary"><UserPlus className="size-3.5" /> Add</Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!challenge}
        onClose={() => setChallenge(null)}
        title={`Challenge ${challenge?.name ?? ''}`}
        sub="Same paper, same start time, live leaderboard."
        footer={
          <>
            <Button variant="ghost" onClick={() => setChallenge(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => setChallenge(null)}>Send challenge</Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3.5 py-3">
            <span className="text-[13px]">Exam</span>
            <span className="text-[13px] font-medium">SDE Screening Simulation</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3.5 py-3">
            <span className="flex items-center gap-2 text-[13px]"><Clock className="size-3.5 text-accent" /> Starts</span>
            <span className="text-[13px] font-medium">Today, 9:00 pm</span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            {challenge?.name} gets a notification and has to accept before the start time. Challenges
            are a stub in the prototype.
          </p>
        </div>
      </Modal>
    </div>
  )
}
