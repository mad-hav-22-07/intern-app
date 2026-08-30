# Internship Preparation Drive

A prep platform for IIT Madras students going into intern season. Pick the profiles
you are targeting and the dashboard, competitions, mock rounds and Blue Book filters
all shape themselves around that choice.

Built from the plan sketched in `notes/IMG_1001–1006.png`. Every feature in those
notes exists as a real page.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

Sign in with **`admin` / `admin123`** (the login page has a tap-to-fill button).

The forum works immediately with no setup. Without a database it saves to
`localStorage` and says so on screen. Connect Supabase to share it with the batch.

```bash
npm run build        # type-checks, then bundles to dist/
npm run preview      # serve the production build locally
```

## What's real and what isn't

**Backed by a database (Supabase):** the whole forum. Posting, threaded replies,
editing and deleting your own content, voting one-per-person, anonymous posting,
reporting with an auto-flag threshold, accepted answers, Hot/New/Top sorting,
full-text search, filters kept in the URL, and live updates across browsers.

**Live over the network:** upcoming Codeforces rounds and LeetCode contests. Both
are cached for 15 minutes and fall back cleanly when a source is down.

**Real, but stored only in this browser:** login, profile editing, target roles,
resource check-offs, the streak and activity heatmap, the competition calendar plus
genuine `.ics` and Google Calendar export, Blue Book filters, the mock exam timer and
scoring, and the friends leaderboard.

**Deliberately scripted:** the resume AI score, the Blue Book assistant's answers,
the mock interviewer's questions, and proctoring. Each says so on screen.

**Not built yet:** anything that links to `/coming-soon`. Those controls exist in the
design but are not wired up, so they route to a page that says which piece is
missing rather than doing nothing when clicked.

## Documentation

**[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** is the full picture: the tech stack
and why each piece was chosen, how the app boots, every route, the state model and
its `localStorage` keys, the forum's two-backend design, the contest feeds, the
styling system, and a "where to change what" table.

Start there. This file only covers running and deploying.

## Layout

```
src/
  data/          mock content; replace these files with real material
  lib/           everything with no React in it: API clients, dates, maths
  hooks/         the stateful glue between lib/ and pages/
  pages/         one file per route
  components/
    ui/          the design system: Button, Card, Badge, Modal, Field, …
    forum/       forum-specific pieces
    layout/      Shell (sidebar, header, drawer) and ErrorBoundary
    art/         inline SVG illustrations
  context/       AppContext, the only cross-page state
supabase/migrations/   the forum schema, applied in order
docs/ARCHITECTURE.md
```

## Connecting the forum database

Without these the forum still works, it is just private to each browser.

```bash
vercel link
vercel integration add supabase --yes    # provisions Postgres + injects env vars
vercel env pull .env.local --yes
```

Vite only exposes `VITE_`-prefixed variables, so mirror the two the app reads (see
`.env.example`):

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

> These are inlined at **build** time, so add them *before* deploying, or redeploy
> afterwards. Setting them does not change a build that already shipped.

Then apply `supabase/migrations/0001_forum.sql` and `0002_forum_edit_delete.sql` in
the Supabase SQL editor. Both are idempotent, so re-running them is safe. Optionally
load the example threads:

```bash
npm run db:seed
```

## Deploying

The app is a static SPA, so nothing needs a server. `vercel.json` already rewrites
every path to `index.html` so deep links like `/forum/:postId` survive a refresh.

Either connect the GitHub repo at [vercel.com/new](https://vercel.com/new) for
automatic deploys on push, or:

```bash
npx vercel link
npx vercel deploy --prod
```

Vercel auto-detects Vite, so there is no build configuration to set.
