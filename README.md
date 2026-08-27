# Internship Preparation Drive

A responsive front-end for the prep platform sketched in `notes/IMG_1001–1006.png`.
Every feature from those notes exists as a real page with example content.

**The forum is backed by a real Postgres database (Supabase).** The rest of the app is
still a prototype: auth is a hardcoded check and the other pages read mock data from
`src/data/`.

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
Light theme by default, with a dark-mode toggle in the header.

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

Then apply `supabase/migrations/0001_forum.sql` in the Supabase SQL editor — it is
idempotent, so re-running it is safe — and optionally load the example threads:

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
Voting and accepting an answer go through `security definer` RPCs that enforce
toggle semantics and post ownership.

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
    user.ts        demo profile, example resume review, streak
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
  hooks/useForum.ts   list / thread / vote state
  pages/         one file per sidebar item, plus ForumThread for /forum/:postId
  components/
    forum/       PostRow, CommentTree, ComposeModal, VoteControl, AnonToggle
    ui/          Button, Card, Badge, Modal, Tabs, Field, Progress/Ring, Page
    layout/      Shell — sidebar, header, mobile drawer
  context/       AppContext — fake auth, profile, theme, progress (localStorage)
supabase/migrations/0001_forum.sql
scripts/seed-forum.ts
```

## What's real vs. stubbed

**Backed by a database:** the whole forum — posting, threaded replies, voting
(one per person, persisted), anonymous posting, reporting with an auto-flag
threshold, accepted answers, Hot/New/Top sorting, full-text search, real topic
counts, deep-linkable threads at `/forum/:postId`, and live updates across browsers.

**Fully interactive, local only:** login, profile editing, target-role checkboxes →
dashboard role dropdown, resource check-off + progress, competition filters and
calendar, Blue Book filters and expandable company rows, mock interview session →
feedback, mock exam → palette/timer → results, friends leaderboard, theme toggle.

**Deliberately scripted or stubbed:** the resume AI score, the Blue Book chatbot
answers, the mock interviewer's questions, proctoring, calendar sync, and file
upload. Each of those says so on screen.

## Theming

All colour lives in `src/index.css` as CSS variables — one `:root` block for light,
one `.dark` block for dark. There are no `dark:` variants and no hex literals in any
component, so re-theming the whole app is an edit to those two blocks. The stored
preference is applied by an inline script in `index.html` before first paint.

## Replacing the placeholder content

Everything the notes list as "material to be added" is in `src/data/roles.ts`. Each
resource has an optional `url` — entries without one render as `link pending` instead
of a dead link. Add the URL and it becomes a live link. Same pattern for the Blue Book
PDFs (`bluebook.ts`) and case material.
