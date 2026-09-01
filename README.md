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

**Live over the network:** upcoming Codeforces rounds and LeetCode contests, both
cached for 15 minutes and falling back cleanly when a source is down; and the
compiler behind the coding rounds, which is a real Judge0 instance running real
Python, C++ and Java. JavaScript is judged in the browser, so that language keeps
working with no network at all.

**Real accounts, when Supabase is connected:** sign-up restricted to
`@smail.iitm.ac.in`, email confirmation before the account works, one account per
address and per roll number, and password reset by emailed link. Without Supabase
the login falls back to a labelled demo account.

**Real, but stored only in this browser:** profile editing, target roles,
resource check-offs, the study trackers (**1069 individually tickable items**
across 13 tracks — NeetCode 75/150/250, Brainstellar, Heard on the Street,
Mosteller, Ross, Wasserman, Blitzstein & Hwang, Harvard Stat 110, MIT 6.041 and
the mental-maths drill), which problems you have solved, the daily challenge per
profile, the streak and activity heatmap, the competition calendar plus
genuine `.ics` and Google Calendar export, Blue Book filters, the mock exam timer and
scoring, and the friends leaderboard.

**Real, and worth calling out:** the judge. **28 problems** you can actually
solve, written from scratch, in a LeetCode-style editor — you implement a method
in **Python, C++ (17/20/23), Java, JavaScript, Go, Rust, TypeScript or C#**, it
gets called with real arguments, and your return value is compared against hidden
testcases. Editable testcase box, per-case runtimes, your own `print` output
shown back to you. Plus **six SQL problems** run against a real SQLite.

Two ways in. **Practice** (`/practice`) is the filterable problem list with no
clock — coding and SQL behind one switch — and **Mock Exam** wraps the editor in
a proctored round: fullscreen gate, timer, and proctoring that
genuinely counts fullscreen exits, tab switches and blocked pastes rather than
pretending to. Mock Exam also carries **eight exam templates** at Easy / Medium /
Hard for SDE and Quant, each a deliberate simulation of a real assessment rather
than an arbitrary pile of problems.

Every problem is verified in all four languages before it ships — `npm run
verify:problems` checks that each starter compiles, that no starter accidentally
solves its own problem, and that four independent reference implementations agree
character-for-character on every expected value.

**Deliberately scripted:** the resume AI score, the Blue Book assistant's answers,
the mock interviewer's questions, and the proctoring badge on the *MCQ* papers
(the coding rounds enforce theirs for real). Each says so on screen.

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

Then apply the three migrations in `supabase/migrations/` in order in the Supabase
SQL editor. All are idempotent, so re-running them is safe. `0003_accounts.sql`
also lists three dashboard settings that SQL cannot set and that you must turn on
before accounts are safe to use. Optionally load the example threads:

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
