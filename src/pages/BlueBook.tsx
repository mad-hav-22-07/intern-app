import { useMemo, useRef, useState, useEffect } from 'react'
import {
  BookMarked,
  ChevronDown,
  Search,
  Sparkles,
  Send,
  PlayCircle,
  Building2,
  TrendingDown,
  Users,
  Download,
  Bot,
} from 'lucide-react'
import { Card, CardHead } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Progress } from '@/components/ui/Progress'
import { PageHeader, EmptyState, SectionTitle } from '@/components/ui/Page'
import { COMPANIES, DEPTS, BLUEBOOK_QA, type Company } from '@/data/bluebook'
import { ROLES, ROLE_MAP, type RoleId } from '@/data/roles'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/cn'

type Msg = { from: 'bot' | 'me'; text: string }

function Row({ c }: { c: Company }) {
  const [open, setOpen] = useState(false)
  const conv = Math.round((c.offers / c.shortlisted) * 100)

  return (
    <>
      <tr
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer border-t border-line transition-colors hover:bg-surface-2"
      >
        <td className="py-3 pl-4 pr-3">
          <div className="flex items-center gap-2.5">
            <ChevronDown className={cn('size-4 shrink-0 text-muted transition-transform', open && 'rotate-180')} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{c.name}</p>
              <p className="truncate text-[11px] text-muted">{c.role}</p>
            </div>
          </div>
        </td>
        <td className="px-3 py-3"><Badge tone="accent">{ROLE_MAP[c.profile].label}</Badge></td>
        <td className="px-3 py-3 text-[13px] whitespace-nowrap">{c.day}</td>
        <td className="px-3 py-3 font-mono text-[13px] whitespace-nowrap">{c.stipend}</td>
        <td className="px-3 py-3 font-mono text-[13px]">{c.cgpaCutoff}</td>
        <td className="px-3 py-3 font-mono text-[13px]">{c.applied}</td>
        <td className="px-3 py-3 font-mono text-[13px]">{c.shortlisted}</td>
        <td className="px-3 py-3">
          <span className="font-mono text-[13px] text-accent">{c.offers}</span>
          <span className="ml-1.5 text-[11px] text-muted">({conv}%)</span>
        </td>
      </tr>
      {open && (
        <tr className="border-t border-line bg-surface-2/50">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <SectionTitle>Job description</SectionTitle>
                <p className="text-[13px] leading-relaxed text-muted">{c.jd}</p>
                <div className="mt-4">
                  <SectionTitle>Rounds</SectionTitle>
                  <ol className="space-y-1.5">
                    {c.rounds.map((r, i) => (
                      <li key={r} className="flex items-start gap-2.5 text-[13px]">
                        <span className="mt-px grid size-5 shrink-0 place-items-center rounded-md bg-accent-soft font-mono text-[10px] text-accent">
                          {i + 1}
                        </span>
                        <span className="text-muted">{r}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <SectionTitle>Eligible departments</SectionTitle>
                  <div className="flex flex-wrap gap-1.5">
                    {c.depts.map((d) => <Badge key={d} tone="neutral">{d}</Badge>)}
                  </div>
                </div>
                <div>
                  <SectionTitle>Funnel</SectionTitle>
                  <div className="space-y-2">
                    {[
                      { l: 'Applied', v: c.applied, max: c.applied },
                      { l: 'Shortlisted', v: c.shortlisted, max: c.applied },
                      { l: 'Offers', v: c.offers, max: c.applied },
                    ].map((s) => (
                      <div key={s.l}>
                        <div className="mb-1 flex justify-between text-[11px]">
                          <span className="text-muted">{s.l}</span>
                          <span className="font-mono">{s.v}</span>
                        </div>
                        <Progress value={(s.v / s.max) * 100} />
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-muted">Location · {c.location}</p>
                {c.hasVideo && (
                  <Button size="sm" variant="secondary" className="w-full">
                    <PlayCircle className="size-3.5" /> Senior experience video (6 min)
                  </Button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function Chatbot() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: 'bot',
      text: 'Ask me anything about last season — cutoffs, conversion rates, which departments a company took, how many rounds to expect. I read the whole Blue Book.',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  function ask(q: string) {
    const hit = BLUEBOOK_QA.find((x) => x.q === q)
    setMsgs((m) => [...m, { from: 'me', text: q }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [
        ...m,
        {
          from: 'bot',
          text:
            hit?.a ??
            'In the prototype I only answer the four suggested questions below — the real version runs retrieval over the parsed Blue Book PDFs and answers anything, with a citation back to the page it came from.',
        },
      ])
    }, 900)
  }

  return (
    <Card className="flex h-[560px] flex-col overflow-hidden">
      <CardHead
        title="Blue Book assistant"
        sub="RAG over the parsed Blue Book"
        icon={<Bot className="size-4" />}
        action={<Badge tone="warn">Scripted</Badge>}
      />
      <div className="flex-1 space-y-3 overflow-y-auto scroll-thin p-5 pt-4">
        {msgs.map((m, i) => (
          <div key={i} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                m.from === 'me'
                  ? 'rounded-br-md bg-accent text-accent-fg'
                  : 'rounded-bl-md border border-line bg-surface-2 text-muted',
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-surface-2 px-3.5 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-accent"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line p-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {BLUEBOOK_QA.map((x) => (
            <button
              key={x.q}
              onClick={() => ask(x.q)}
              className="shrink-0 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[11px] text-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              {x.q.length > 42 ? x.q.slice(0, 42) + '…' : x.q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && input.trim() && ask(input.trim())}
            placeholder="Ask about cutoffs, rounds, conversions…"
          />
          <Button variant="primary" onClick={() => input.trim() && ask(input.trim())} disabled={!input.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function BlueBook() {
  const { profile } = useApp()
  const [profileF, setProfileF] = useState<RoleId | 'all'>('all')
  const [dept, setDept] = useState<string | 'all'>('all')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    let out = COMPANIES
    if (profileF !== 'all') out = out.filter((c) => c.profile === profileF)
    if (dept !== 'all') out = out.filter((c) => c.depts.includes(dept))
    if (q.trim()) {
      const s = q.toLowerCase()
      out = out.filter((c) => c.name.toLowerCase().includes(s) || c.role.toLowerCase().includes(s))
    }
    return out
  }, [profileF, dept, q])

  const totals = useMemo(() => {
    const applied = list.reduce((a, c) => a + c.applied, 0)
    const sl = list.reduce((a, c) => a + c.shortlisted, 0)
    const off = list.reduce((a, c) => a + c.offers, 0)
    return { applied, sl, off, conv: sl ? Math.round((off / sl) * 100) : 0 }
  }, [list])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blue Book Analysis"
        icon={<BookMarked className="size-5" />}
        sub="Last season's intern placements — every company, round, cutoff and conversion rate, with a chatbot on top of it."
        actions={<Button variant="secondary"><Download className="size-4" /> Export</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Companies', value: list.length, icon: Building2, sub: `${COMPANIES.length} in the book` },
          { label: 'Applications', value: totals.applied.toLocaleString(), icon: Users, sub: 'across this selection' },
          { label: 'Shortlists', value: totals.sl, icon: TrendingDown, sub: `${totals.applied ? Math.round((totals.sl / totals.applied) * 100) : 0}% of applicants` },
          { label: 'Offers', value: totals.off, icon: Sparkles, sub: `${totals.conv}% of shortlists convert` },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-muted">{s.label}</span>
              <s.icon className="size-4 text-accent" />
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-[11px] text-muted">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <SectionTitle right={profile.targetRoles.length ? <button onClick={() => setProfileF(profile.targetRoles[0])} className="text-[11px] text-accent hover:underline">Jump to my profile</button> : undefined}>
                  Profile
                </SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', ...ROLES.map((r) => r.id)] as const).map((id) => (
                    <button
                      key={id}
                      onClick={() => setProfileF(id as RoleId | 'all')}
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                        profileF === id ? 'border-accent/50 bg-accent-soft text-accent' : 'border-line bg-surface-2 text-muted hover:text-ink',
                      )}
                    >
                      {id === 'all' ? 'All profiles' : ROLE_MAP[id as RoleId].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <SectionTitle>Department</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', ...DEPTS] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDept(d)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors',
                        dept === d ? 'border-accent/50 bg-accent-soft text-accent' : 'border-line bg-surface-2 text-muted hover:text-ink',
                      )}
                    >
                      {d === 'all' ? 'All' : d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company or role…" className="pl-9" />
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHead
              title="Companies"
              sub="Click any row for the JD, rounds and funnel"
              icon={<Building2 className="size-4" />}
              action={<Badge tone="neutral">{list.length} shown</Badge>}
            />
            {list.length ? (
              <div className="mt-4 overflow-x-auto scroll-thin">
                <table className="w-full min-w-[860px] text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted">
                      <th className="py-2 pl-4 pr-3 font-medium">Company</th>
                      <th className="px-3 py-2 font-medium">Profile</th>
                      <th className="px-3 py-2 font-medium">Slot</th>
                      <th className="px-3 py-2 font-medium">Stipend</th>
                      <th className="px-3 py-2 font-medium">CGPA</th>
                      <th className="px-3 py-2 font-medium">Applied</th>
                      <th className="px-3 py-2 font-medium">Shortlist</th>
                      <th className="px-3 py-2 font-medium">Offers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((c) => <Row key={c.id} c={c} />)}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={<Building2 className="size-6" />}
                  title="No companies match"
                  sub="Try a different profile or department."
                  action={<Button variant="secondary" onClick={() => { setProfileF('all'); setDept('all'); setQ('') }}>Reset filters</Button>}
                />
              </div>
            )}
          </Card>

          <Card>
            <CardHead
              title="Video summaries"
              sub="Seniors walking through their process, company by company"
              icon={<PlayCircle className="size-4" />}
            />
            <div className="grid gap-3 p-5 pt-3.5 sm:grid-cols-3">
              {COMPANIES.filter((c) => c.hasVideo).slice(0, 3).map((c) => (
                <button key={c.id} className="group text-left">
                  <div className="grid aspect-video place-items-center rounded-xl border border-line bg-surface-2 transition-colors group-hover:border-accent/40">
                    <PlayCircle className="size-8 text-muted transition-colors group-hover:text-accent" />
                  </div>
                  <p className="mt-2 text-[13px] font-medium">{c.name}</p>
                  <p className="text-[11px] text-muted">{ROLE_MAP[c.profile].label} · 6 min</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Chatbot />
          <Card className="border-accent/25">
            <CardHead title="Where the data comes from" icon={<BookMarked className="size-4" />} />
            <p className="px-5 pb-5 pt-3.5 text-[11px] leading-relaxed text-muted">
              The real build parses the official Blue Book PDFs into a structured table, then indexes
              the text for retrieval. Layout is modelled on <b className="text-ink">academic.iitm.ac.in</b>.
              Numbers on this page are illustrative.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
