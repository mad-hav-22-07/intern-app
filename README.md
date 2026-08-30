# Internship Preparation Drive

A responsive front-end for the prep platform sketched in `notes/IMG_1001–1006.png`.
Every feature from those notes exists as a real page with example content.

**The forum is backed by a real Postgres database (Supabase), and the Competitions
page reads live contest feeds.** The rest of the app is still a prototype: auth is a
hardcoded check and the other pages read mock data from `src/data/`.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

Sign in with **`admin` / `admin123`** (the login page has a tap-to-fill button for it).

The forum works immediately with no setup — without a database it saves to
`localStorage` and says so on screen. Connect Supabase to share it with the batch.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · React Router · lucide-react · Supabase.
One light theme, no toggle — see [Theming](#theming).

## Connecting the forum database

```bash
npm i -g vercel
vercel link
vercel integration add supabase --yes    # provisions Postgres + injects env vars
vercel env pull .env.local --yes
```

Vite only exposes `VITE_`-prefixed variables, so mirror the two the app reads
(see `.env.example`):

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Then apply the migrations in `supabase/migrations/` in order in the Supabase SQL
editor — both are idempotent, so re-running them is safe — and optionally load the
example threads:

```bash
npm run db:seed
```

### Schema

| Table | Holds |
|---|---|
| `forum_posts` | threads, with denormalised `score` / `comment_count` / `report_count` and a generated full-text `search` column |
| `forum_comments` | flat rows with `parent_id`, assembled into a reply tree client-side |
| `forum_votes` | one row per `(voter, target)`, written only through the `forum_vote` RPC |
| `forum_reports` | one row per `(reporter, target)`; three reports flags a post |

RLS is on for all four. Reads and inserts are open to `anon`; updates and deletes are
closed, and every derived number is written by a trigger rather than by the client.
Voting, accepting an answer, and editing or deleting your own content all go through
`security definer` RPCs that enforce toggle semantics and author ownership
(`0002_forum_edit_delete.sql`). Deleting a comment that has replies leaves a tombstone
rather than taking the subthread with it.

> **This is not authentication.** The anon key ships in the client bundle and
> `author_key` is a per-browser UUID in `localStorage`, so identity is self-asserted.
> It is good enough to make voting one-per-person and to gate "accept an answer" to
> the thread's author. Real accounts (Supabase Auth + an `author_id` FK + ownership
> policies) are the fix, and the schema is shaped to take them.

## Where things live

```
src/
  data/          mock content — replace these files with real material
    roles.ts       7 target profiles + their curated study material
    user.ts        demo profile, example resume review
    forum.ts       example threads, used as seed data and as the offline fallback
    competitions.ts, bluebook.ts, interviews.ts, exams.ts
  lib/
    supabase.ts    client + `isSupabaseConfigured`
    forumApi.ts    one async surface over two backends
    forumRemote.ts Supabase implementation (+ Realtime)
    forumLocal.ts  localStorage implementation
    forumTypes.ts  types, comment-tree builder, anonymity helper
    identity.ts    per-browser key used as author_key / voter_key
    time.ts        timeAgo, hoursSince, hot ranking
    contests.ts    live Codeforces + LeetCode feeds, cached and fallback-safe
    calendar.ts    .ics export and Google Calendar links
    streak.ts      streak / heatmap maths over the activity log
  hooks/useForum.ts   list / thread / vote state
  hooks/useContests.ts  curated listings merged with the live feeds
  pages/         one file per sidebar item, plus ForumThread for /forum/:postId
  components/
    forum/       PostRow, CommentTree, ComposeModal, VoteControl, AnonToggle
    ui/          Button, Card, Badge, Modal, Tabs, Field, Progress/Ring, Page
    layout/      Shell — sidebar, header, mobile drawer
  context/       AppContext — fake auth, profile, progress, activity log (localStorage)
supabase/migrations/0001_forum.sql, 0002_forum_edit_delete.sql
scripts/seed-forum.ts
```

## What's real vs. stubbed

**Backed by a database:** the whole forum — posting, threaded replies, editing and
deleting your own posts and comments, voting (one per person, persisted), anonymous
posting, reporting with an auto-flag threshold, accepted answers, Hot/New/Top sorting,
Best/Newest/Oldest comment sorting, full-text search, real topic counts, filters kept
in the URL so a filtered feed is shareable, deep-linkable threads at `/forum/:postId`,
and live updates across browsers.

**Live over the network:** upcoming Codeforces rounds (their public API, CORS-open)
and LeetCode contests (a community mirror, falling back to LeetCode's fixed
Weekly/Biweekly schedule when it is unreachable). Both are cached in `sessionStorage`
for 15 minutes and degrade to the curated listings, saying so on screen.

**Fully interactive, local only:** login, profile editing, target-role checkboxes →
dashboard role dropdown, resource check-off + progress, the streak and activity
heatmap (a real log — ticking material off, adding a competition or posting on the
forum all count toward the day), competition filters, the personal calendar plus real
`.ics` / Google Calendar export, Blue Book filters and expandable company rows, mock
interview session → feedback, mock exam → palette/timer → results, friends
leaderboard.

**Deliberately scripted or stubbed:** the resume AI score, the Blue Book chatbot
answers, the mock interviewer's questions, proctoring, calendar sync, and file
upload. Each of those says so on screen.

## Theming

One theme, no toggle. The page is white; near-black and green are reserved for the
chrome — the sidebar, the login panel and primary actions — so content never competes
with navigation for attention.

All colour lives in `src/index.css` as CSS variables in a single `:root` block, split
into page tokens (`--bg`, `--surface`, `--ink`, `--accent`, …) and nav tokens
(`--nav`, `--nav-ink`, `--nav-accent`, …). No component carries a hex literal, so
re-theming the whole app is an edit to that one block.

Motion lives there too, as a small set of utilities: `anim-in`, `anim-pop`,
`anim-fade`, `anim-slide-left/up`, `stagger` for list entrances, `lift` for hover, and
`skeleton` for loading. Everything is disabled under `prefers-reduced-motion`.

> One gotcha worth keeping: the entrance keyframes deliberately leave `transform` out
> of their `to` frame. With `animation-fill-mode: both`, a retained `transform: none`
> still computes to an identity matrix, which makes the element a containing block and
> breaks `position: fixed` for anything rendered inside it. Modals additionally render
> through a portal into `<body>`.

## Replacing the placeholder content

Everything the notes list as "material to be added" is in `src/data/roles.ts`. Each
resource has an optional `url` — entries without one render as `link pending` instead
of a dead link. Add the URL and it becomes a live link. Same pattern for the Blue Book
PDFs (`bluebook.ts`) and case material.
