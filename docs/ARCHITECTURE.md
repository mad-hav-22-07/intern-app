# Architecture

How this codebase is put together, and where to change things.

- [Tech stack](#tech-stack)
- [How the app boots](#how-the-app-boots)
- [Routes](#routes)
- [State](#state)
- [The forum](#the-forum)
- [Competitions and the live feeds](#competitions-and-the-live-feeds)
- [Streaks](#streaks)
- [Styling](#styling)
- [Where to change what](#where-to-change-what)

---

## Tech stack

| Layer | Choice | Why this one |
|---|---|---|
| Build | **Vite 6** | Instant dev server, and a plain static `dist/` that any host can serve. |
| UI | **React 19** | Function components and hooks throughout. One class component (`ErrorBoundary`) because React has no hook for catching render errors. |
| Language | **TypeScript 5.7** | `strict` is on. `npm run build` type-checks before it bundles, so a type error fails the build rather than reaching production. |
| Styling | **Tailwind CSS v4** | Utilities only. Every colour is a CSS variable, so there is not a single hex literal in a component. See [Styling](#styling). |
| Routing | **React Router 7** | Client-side routing. `vercel.json` rewrites every path to `index.html` so deep links survive a refresh. |
| Icons | **lucide-react** | One consistent stroke weight across the app. |
| Font | **Inter** (self-hosted via `@fontsource-variable/inter`) | Closest licensable match to Apple's San Francisco. Real SF is used on Apple devices through `-apple-system`. |
| Database | **Supabase (Postgres)** | Backs the forum. Optional: without it the forum runs on `localStorage`. |

There is **no backend of our own**. The app is static files plus direct calls to
Supabase and two public contest APIs.

---

## How the app boots

```
index.html
  └─ main.tsx
       └─ <ErrorBoundary>        catches render crashes, shows a page instead of a white screen
            └─ <BrowserRouter>   URL ↔ component
                 └─ <AppProvider>  all cross-page state, restored from localStorage
                      └─ <App />    the route table
                           └─ <Shell />  sidebar + header + <Outlet/>
                                └─ the page
```

`Shell` is the only layout. Every signed-in route renders inside its `<Outlet />`,
which is why the sidebar never re-mounts on navigation and page transitions can be
animated by keying a wrapper on `location.pathname`.

`RequireAuth` in `App.tsx` bounces signed-out visitors to `/login`. "Auth" is a
hardcoded username/password check in `AppContext` with a boolean in `localStorage`.
It is a prototype gate, not security.

---

## Routes

| Path | Component | What it is |
|---|---|---|
| `/login` | `pages/Login` | Hardcoded `admin` / `admin123`. Registration and password reset are explained but disabled. |
| `/` | `pages/Dashboard` | The prep track for the currently selected target role: curated material with check-offs, progress, next deadline. |
| `/profile` | `pages/Profile` | Details, target roles, the activity heatmap and streak, per-track progress, milestones, and the (scripted) resume review. |
| `/friends` | `pages/Friends` | Leaderboard and challenges over mock data. |
| `/competitions` | `pages/Competitions` | Live contest feeds plus curated listings, and a calendar of what the user committed to. |
| `/mock-interview` | `pages/MockInterview` | A scripted interviewer and a fixed feedback report. |
| `/mock-exam` | `pages/MockExam` | A real timer, question palette, flagging and scoring over sample questions. |
| `/blue-book` | `pages/BlueBook` | Last season's placement data, filters, expandable company rows, and a scripted assistant. |
| `/forum` | `pages/Forum` | The post list. Filters live in the URL. |
| `/forum/:postId` | `pages/ForumThread` | One thread with its comment tree. |
| `/coming-soon` | `pages/ComingSoon` | Where every not-yet-built control routes to, named via `?feature=`. |
| `*` | `pages/NotFound` | Unknown paths. |

**Nothing is a dead end.** A control that is designed but not wired up links to
`/coming-soon` through the `comingSoon()` helper rather than sitting there doing
nothing when clicked.

---

## State

All cross-page state lives in one context, `context/AppContext.tsx`, and is mirrored
to `localStorage` so a refresh loses nothing. There is no server-side user record.

| Key | Holds |
|---|---|
| `ipd.session.v1` | signed in or not |
| `ipd.profile.v1` | name, roll, branch, year, CGPA, target roles |
| `ipd.done.v1` | ids of resources ticked off |
| `ipd.calendar.v1` | ids of competitions the user committed to |
| `ipd.activity.v1` | `{ 'YYYY-MM-DD': things done that day }`, which drives the streak |
| `ipd.goal.v1` | the daily goal |
| `ipd.identity.v1` | a per-browser UUID used as the forum's `author_key` |
| `ipd.forum.*` | the forum's local-mode tables (see below) |
| `ipd.contests.*` | 15-minute cache of the live feeds (in `sessionStorage`) |

Page-local state (filters, open modals, drafts) stays in the page with `useState`.
Only things two pages both need are promoted to the context.

---

## The forum

The forum is the one feature with a real database, and it is written so that it
works with or without one.

```
        pages/Forum, pages/ForumThread
                     │
             hooks/useForum.ts          list / thread / vote state, optimistic updates
                     │
             lib/forumApi.ts            ONE async surface; picks a backend and nothing else
                     │
        ┌────────────┴────────────┐
lib/forumRemote.ts          lib/forumLocal.ts
 Supabase + Realtime         localStorage + an in-process event bus
```

`forumApi` checks `isSupabaseConfigured` (are both `VITE_SUPABASE_*` env vars set?)
and forwards to one implementation or the other. **Both sides implement the same
function signatures**, so no page or hook ever knows which one it is talking to.

Local mode is not a stub. Posting, threaded replies, voting with one vote per
person, anonymous posting, reporting, accepted answers, editing and deleting all
work; they are just private to that browser, which the UI says on screen.

**Seed threads** in `data/forum.ts` are regenerated on every load so their timestamps
stay relative to now, otherwise "3h ago" would drift to "9d ago" and the Today tab
would empty out. Because seed rows carry `authorKey: 'seed'` and the viewer's key is
a UUID, anything the viewer can edit or delete is by definition one of their own
stored rows.

### Schema

Four tables, all with RLS on: `forum_posts`, `forum_comments` (flat, with
`parent_id`, assembled into a tree client-side), `forum_votes`, `forum_reports`.

Reads and inserts are open to `anon`. **Updates and deletes are closed.** Every
derived number (`score`, `comment_count`, `report_count`) is written by a trigger,
and voting, accepting an answer, editing and deleting all go through
`security definer` RPCs that check ownership server-side. A client cannot set its
own score or edit someone else's post even if it tries.

Migrations are in `supabase/migrations/`, applied in order, and both are idempotent.

> **This is not authentication.** The anon key ships in the client bundle and
> `author_key` is a per-browser UUID. It is enough to make voting one-per-person and
> to gate "edit your own post"; it is not enough to stop a determined person. Real
> accounts (Supabase Auth + an `author_id` FK) are the fix, and the schema is shaped
> to take them.

---

## Competitions and the live feeds

`lib/contests.ts` fetches from two sources and merges them with the curated listings
in `data/competitions.ts`:

- **Codeforces** — their official public API, which sends `Access-Control-Allow-Origin: *`, so the browser can read it directly.
- **LeetCode** — no public REST API exists, so a community mirror is tried first. If it is unreachable, the schedule is *computed* from LeetCode's fixed cadence (Weekly every Sunday 08:00 IST, Biweekly every second Saturday 20:00 IST) anchored on verified contest numbers. The fallback is accurate, not invented, and the UI labels it "schedule" rather than "live".

Both are cached in `sessionStorage` for 15 minutes and both degrade to the curated
list on failure. A feed being down never blocks the page.

**The calendar only ever shows what the user chose.** Nothing is added to it
automatically. `registered` in the context is the single source of truth, and the
`.ics` export and Google Calendar links are real files and real links, not stubs.

---

## Streaks

`lib/streak.ts` computes everything from one dated map, `{ 'YYYY-MM-DD': count }`.

A day counts as active if **anything** was logged on it: ticking off material,
adding a competition, posting on the forum, or finishing a mock round. The daily
goal only drives today's progress ring; it is deliberately not a condition for
keeping the streak, so one light day does not wipe out three weeks of work.

Today not being logged yet is not a break either, since the day is still in
progress, so the current streak is counted from yesterday backwards.

---

## Styling

Every colour is a CSS variable in a single `:root` block in `src/index.css`, split in
two:

- **Page tokens** — `--bg`, `--surface`, `--ink`, `--muted`, `--accent`, `--line`…
- **Nav tokens** — `--nav`, `--nav-ink`, `--nav-accent`… used only by the sidebar, the login panel and the drawer.

The rule the design follows: **the page is white, and near-black and green belong to
the chrome.** Content never competes with navigation for attention.

There is one theme and no toggle. Re-theming the whole app is an edit to that one
block.

Motion is a small fixed vocabulary, also in `index.css`: `anim-in`, `anim-pop`,
`anim-fade`, `anim-slide-left`, `anim-slide-up`, `stagger` for list entrances, `lift`
for hover, and `skeleton` for loading. All of it is disabled under
`prefers-reduced-motion`.

### Two gotchas worth keeping

1. **Entrance keyframes must not end on `transform: none`.** These animations run
   with `fill-mode: both`, so the last keyframe sticks. A retained `transform: none`
   still computes to an identity matrix, which makes the element a *containing block*
   and silently breaks `position: fixed` for every modal rendered inside it. The `to`
   frames therefore omit `transform` entirely. Modals also render through a portal
   into `<body>` as a second line of defence.

2. **Tabular figures are applied per element, never body-wide.** Inter widens the
   hyphen to match a digit in tabular mode, which turns "10-12 weeks" into
   "10 - 12 weeks" across the entire app. Numbers use Tailwind's `tabular-nums`
   class on the specific element instead.

### Mobile

- Form fields are 16px on phones (`text-base sm:text-sm`). Under 16px, iOS Safari zooms the page in on focus and never zooms back out.
- Grid children that contain wide content carry `min-w-0`; grid items default to `min-width: auto` and will otherwise push the page into horizontal scroll.
- Touch targets grow on small screens (vote arrows, the owner menu).
- Anything anchored to the bottom of the screen uses `pad-safe-b` to clear the iPhone home indicator.

---

## Where to change what

| I want to… | Edit |
|---|---|
| Re-theme the app | the `:root` block in `src/index.css` |
| Add or edit study material | `src/data/roles.ts` (each resource takes an optional `url`; without one it renders as `link pending`) |
| Add a competition the APIs cannot know about | `COMPETITIONS` in `src/data/competitions.ts` |
| Add a contest source | a fetcher in `src/lib/contests.ts`, then add it to `fetchAllFeeds()` |
| Change the placement data | `src/data/bluebook.ts` |
| Change mock exam / interview content | `src/data/exams.ts`, `src/data/interviews.ts` |
| Change what counts toward a streak | calls to `logActivity()` (see `AppContext`) |
| Add a page | a component in `src/pages/`, a `<Route>` in `App.tsx`, an entry in `NAV` and `TITLES` in `Shell.tsx` |
| Mark something as not built yet | link it to `comingSoon('Name of the thing', '/where-back-goes')` |
| Change the forum's rules | `supabase/migrations/` for the server rules, `src/lib/forumLocal.ts` to keep local mode matching |
