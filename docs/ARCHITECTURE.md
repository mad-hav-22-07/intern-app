# Architecture

How this codebase is put together, and where to change things.

- [Tech stack](#tech-stack)
- [How the app boots](#how-the-app-boots)
- [Routes](#routes)
- [State](#state)
- [Accounts](#accounts)
- [Daily challenges](#daily-challenges)
- [The question bank](#the-question-bank)
- [The admin portal](#the-admin-portal)
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
| Auth | **Supabase Auth** | Server-side bcrypt hashing, email confirmation, reset tokens and rate limiting, none of which should ever be hand-rolled. Optional, with a labelled demo login as the fallback. |

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

`RequireAuth` in `App.tsx` bounces signed-out visitors to `/login`, and waits for
`authLoading` first: restoring a Supabase session is asynchronous, and redirecting
before it resolves would throw a signed-in user back to the login page on every
hard refresh. See [Accounts](#accounts).

---

## Routes

| Path | Component | What it is |
|---|---|---|
| `/login` | `pages/Login` | Sign in, sign up and password reset. Real accounts when Supabase is configured; a hardcoded demo login otherwise. |
| `/reset-password` | `pages/ResetPassword` | Where the emailed recovery link lands. Outside the auth gate, since the user is mid-reset. |
| `/daily` | `pages/Daily` | Today's challenge for each target profile, chosen from the date so everyone on a profile gets the same one. |
| `/` | `pages/Dashboard` | The prep track for the currently selected target role: curated material with check-offs, progress, next deadline. |
| `/profile` | `pages/Profile` | Details, target roles, the activity heatmap and streak, per-track progress, milestones, and the (scripted) resume review. |
| `/friends` | `pages/Friends` | Leaderboard and challenges over mock data. |
| `/competitions` | `pages/Competitions` | Live contest feeds plus curated listings, and a calendar of what the user committed to. |
| `/mock-interview` | `pages/MockInterview` | A scripted interviewer and a fixed feedback report. |
| `/mock-exam` | `pages/MockExam` | Two formats. MCQ papers with a real timer, question palette, flagging and scoring; and **coding rounds** — fullscreen, proctored, with a real compiler behind them. |
| `/blue-book` | `pages/BlueBook` | Last season's placement data, filters, expandable company rows, and a scripted assistant. |
| `/study/:trackId` | `pages/StudyTrack` | One study track — a book, a course or a puzzle site — with a checkbox against every item in it. |
| `/practice` | `pages/Practice` | Every solvable problem in one filterable list, with solved counts by difficulty. |
| `/practice/:problemId` | `pages/PracticeProblem` | One problem in the editor, with the judge and no clock. |
| `/practice/sql/:problemId` | `pages/PracticeSqlProblem` | One SQL problem, with a real SQLite behind it. |
| `/forum` | `pages/Forum` | The post list. Filters live in the URL. |
| `/forum/:postId` | `pages/ForumThread` | One thread with its comment tree. |
| `/admin` | `pages/Admin` | Question bank browser and moderation queue. Gated on `profiles.is_admin`. |
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
| `ipd.daily.v1` | `role:dayNumber` keys for daily challenges already solved |
| `ipd.identity.v1` | a per-browser UUID used as the forum's `author_key` |
| `ipd.forum.*` | the forum's local-mode tables (see below) |
| `ipd.contests.*` | 15-minute cache of the live feeds (in `sessionStorage`) |

Page-local state (filters, open modals, drafts) stays in the page with `useState`.
Only things two pages both need are promoted to the context.

---

## Accounts

Two modes, decided by whether `VITE_SUPABASE_*` are set.

**Demo mode** (no database): one hardcoded username and password, a boolean in
`localStorage`. The login page says so on screen. It exists so a fresh clone runs;
it is not for real student data.

**Real accounts** (Supabase Auth): passwords hashed server-side with bcrypt, email
confirmation required before the account works, reset tokens emailed to the
registered address, and rate limiting, all handled by Supabase rather than by us.

On top of that, `0003_accounts.sql` adds the two rules specific to this platform,
as **triggers on `auth.users`** so they hold regardless of how signup was called:

| Rule | How it is enforced |
|---|---|
| Only `@smail.iitm.ac.in` may sign up | `enforce_institute_email` trigger, before insert |
| One account per roll number | roll derived from the email local part, `unique` on `profiles.roll_no`, checked in `handle_new_user` inside the signup transaction |
| A user can only read or edit their own profile | RLS policies keyed on `auth.uid()` |
| Identity columns cannot be edited | `freeze_profile_identity` trigger restores `id`, `email`, `roll_no` on update |
| A forum post cannot claim another user's identity | `forum_author_matches_session` trigger compares `author_key` to `auth.uid()` |

The client-side checks in `lib/auth.ts` (domain, password rules) exist to give the
form fast feedback. **They are not the boundary** and are trivially bypassed by
calling the API directly, which is exactly why each has a server-side counterpart.

Two deliberate choices worth not "fixing":

- Signup and password reset both report success even when the address is not
  registered. Saying "no account with that email" would turn either form into a
  way to enumerate who has an account.
- The roll number is derived from the email rather than typed, so nobody can claim
  someone else's.

Three settings still have to be enabled in the Supabase dashboard, because SQL
cannot set them: **Confirm email**, **leaked password protection**, and the **Site
URL / redirect allow-list** (otherwise confirmation links point at localhost). They
are listed at the bottom of `0003_accounts.sql`.

---

## Daily challenges

`data/daily.ts` holds a bank per role; `lib/daily.ts` picks one from the date
alone, so every student on a profile sees the same question on the same day and it
rolls over at local midnight. No backend, and it works offline.

Each role gets the question shape its interviews actually use: coding and concept
questions for SDE and AI/ML, probability and brainteasers for Quant, a guesstimate
for Consulting, and timed multiple-choice aptitude sets for FMCG and Finance.

Aptitude sets mark themselves solved once every question has been attempted;
open-ended ones need the user to say they worked through it. Either way it counts
toward the day's streak.

---

## The question bank

`data/questionBank.ts` catalogues ~220 practice problems. Every row is a
**pointer** to the problem on the platform that owns it: title, source,
difficulty, topics, roles and a URL. The statements are deliberately not copied
in. They belong to LeetCode, Brainstellar and HackerRank, reproducing them would
be a licensing problem, and problems get edited over time. Striver's sheet and
NeetCode are catalogues for the same reason.

| Source | Count | How the links are built |
|---|---|---|
| Brainstellar | 101 | Ids and titles read from `brainstellar.com/puzzles` in Aug 2026. Difficulty inferred from the site's own id banding (1-99 easy, 100-199 medium, 200+ hard). |
| LeetCode | 100 | Hand-picked from the lists that actually appear in campus shortlists. Slugs are stable and form the URL directly. |
| HackerRank | 6 | Linked at track level, because individual challenge slugs move. |
| Codeforces | 6 | Tag-filtered problemset queries rather than fixed problem ids, so the link survives the archive growing. |
| GeeksforGeeks | 5 | CS fundamentals and aptitude sets. |

The daily challenge page pulls four related rows per role via
`relatedPractice()`, rotating with the date, so the day's question opens onto
more practice rather than ending.

---

## Study tracks

`data/quant.ts` holds the material a candidate actually works through, at the
granularity of a single problem. **13 tracks, 1069 tickable items**, split across
three files — `quant.ts` (the originals), `probstat.ts`, `neetcode.ts` — and
merged into one `STUDY_TRACKS` array.

| Track | Items | Shape |
|---|---|---|
| MIT 6.041 / RES.6-012 (Bertsekas & Tsitsiklis) | 26 | Every lecture, linked to OCW, plus the authors' 77-page summary notes |
| Harvard Stat 110 (Blitzstein) | 45 | 34 lectures + 11 practice/homework PDFs |
| Introduction to Probability (Blitzstein & Hwang) | 13 | Chapter grid; the full text is free from the authors |
| A First Course in Probability (Ross) | 10 | Chapter grid |
| All of Statistics (Wasserman) | 24 | Chapter grid, in the book's three parts |
| Fifty Challenging Problems (Mosteller) | 56 | Numbered grid |
| Heard on the Street (Crack) | 239 | Numbered grid over the quantitative questions |
| Brainstellar | 101 | Every puzzle, in the site's own four tiers (Easy / Medium / Hard / Deadly) |
| PuzzledQuant | 50 | An open-ended "first fifty solved" counter |
| Mental maths, 80 in 8 | 30 | One tick per timed session |
| NeetCode Blind 75 | 75 | Every problem, in NeetCode's 18 topic groups, with LeetCode links |
| NeetCode 150 | 150 | As above |
| NeetCode 250 | 250 | As above |

Items carry a `difficulty` and a `topic` where the source publishes one, which
drives the chips on each row and the difficulty filter at the top of the page.
Filtering is a *view*: "Mark all" on a filtered group marks only what is
visible, because marking rows that scrolled out of sight is how people stop
trusting a tracker.

### The rule the file follows

**We link to material, we do not reproduce it.** Brainstellar publishes its
puzzle titles and a stable URL per puzzle, so that track is a real list with
real links, read straight out of `QUESTION_BANK` so there is one Brainstellar
list in the codebase rather than two that drift. Crack and Mosteller are books
you buy; their problem statements and titles are not ours to copy, so those
tracks are **numbered grids** — you tick the number against your own copy. That
is also simply the better tracker for a book you are working through, and it
survives the edition changing under you.

Every count and link was checked against the source in August 2026, and where a
number is edition-dependent the track says so in `provenance`. Crack's book had
211 quantitative questions in its 18th edition and 239 now; a tracker that
quietly disagrees with the book in the student's hands is worse than none.

Two provenance notes worth keeping:

- **The NeetCode lists** come from NeetCode's own repo (`neetcode-gh/leetcode`,
  which flags `blind75` / `neetcode150` per problem), and all 250 slugs were
  checked against LeetCode's public GraphQL endpoint, which returns `null` for a
  slug that does not exist. `curl` is useless here — Cloudflare 403s every
  LeetCode URL including deliberately fake ones, so an HTTP status carries no
  signal about validity.
- **PuzzledQuant could not be mirrored.** Its ~950-problem index is public but
  the site throttles automated access hard, and a list captured today would be
  stale within a month. So that track is a plain counter, and its `provenance`
  says exactly that rather than implying it is the site's own list.
- **Harvard's Stat 110 URLs 403 to curl** — that is Harvard's WAF blocking
  non-browser clients, not a dead link. Verified in a real browser; noted in
  `probstat.ts` so nobody "fixes" it later.

### How ticks are stored

Item ids go into the same `done` array in `AppContext` that the dashboard
resource rows use, so a puzzle solved here counts toward the day like anything
else. Two consequences worth knowing:

1. **Ids must never be renumbered.** Changing `mos-12` silently clears that tick
   for everybody who had it.
2. **Bulk marking does not log activity.** `setManyDone` deliberately skips
   `logActivity`: someone hitting "mark all" on a chapter is almost always
   recording work they did before they found this app, and crediting fifty items
   to *today* would both misdate that work and turn the daily goal into a
   one-click formality. Individual ticks still log.

A resource in `data/roles.ts` can name a `track`. When it does, the dashboard row
stops being a checkbox and becomes a link: its done-state is *derived* from the
tracker, because two independent ways to mark the same book finished is how
progress numbers quietly become meaningless. `isResourceDone()` in
`pages/Dashboard.tsx` is the single definition, shared by the row, the
per-section counter and the headline percentage.

---

## Coding rounds

`/mock-exam` has a second format next to the MCQ papers: a proctored coding
round with a real compiler behind it. Four files carry it.

The shape is **LeetCode's, not Codeforces'** — you implement a method, the judge
calls it with real arguments and compares what you returned. Nobody parses
stdin, nobody prints an answer, and `print()` is for debugging only.

### Where the code lives

| File | What |
|---|---|
| `data/problemTypes.ts` | `CodingProblem`, `Lang`, `LANGS` |
| `data/problems/*.ts` | One topic group per file; `problems/index.ts` aggregates them into `ALL_PROBLEMS` |
| `data/coding.ts` | Re-exports the above, plus the timed `CODING_ROUNDS` |
| `lib/harness.ts` | Encoding, value formatting, output parsing; delegates program building to the registry |
| `lib/drivers/index.ts` | **The language registry.** `Lang` is derived from it, so a half-registered language is a type error |
| `lib/drivers/<lang>.ts` | One driver per language — the code wrapped around the student's method |
| `lib/judge.ts` | Runs it — locally for JavaScript, on Judge0 for the rest |
| `lib/sqlJudge.ts` | The SQL runner (SQLite on Judge0) |
| `components/exam/ProblemPanel.tsx` | Statement + solver. **Shared by the round and by practice** |
| `components/exam/CodingRound.tsx` | Only the exam chrome: clock, fullscreen gate, violation counter, report |
| `scripts/solutions/*.ts` | Reference solutions. Never imported by `src/`, so they never reach the bundle |
| `scripts/verify-problems.mts` | `npm run verify:problems` — proves the whole set works |

The split between `ProblemPanel` and `CodingRound` is the one worth preserving.
A round and free practice differ *only* in the chrome around the editor; if the
solver were copied into both, they would disagree within a week.

### The problems — `data/problems/`

The question bank above is a *catalogue* and copies no statements. A round has to
show the statement, so these are **written from scratch**. Each one names the
published problem it is modelled on under `origin`, so a student can go read the
original's editorial afterwards, but no text is borrowed.

**28 problems**, 7 Easy / 16 Medium / 5 Hard, in six files:

| File | Covers |
|---|---|
| `core.ts` | Hash-map lookup, sliding window, interval scheduling |
| `arrays-hashing.ts` | Boyer–Moore voting, canonical-key bucketing, prefix/suffix products, hash-set runs, prefix-sum counting |
| `two-pointers.ts` | Converging pointers, greedy shrink, sorted triples, variable window, running max/min |
| `search-stack.ts` | Lower bound, **binary search on the answer**, monotonic stack, bounded heap, largest rectangle |
| `dp-greedy.ts` | 1-D DP, greedy feasibility sweep, unbounded knapsack, patience sorting, edit distance |
| `graphs-bits.ts` | Flood fill, multi-source BFS, Kahn's topological sort, union-find, XOR partitioning |

**There is no linked-list or tree type**, because the harness has none: parameters
and returns are `int`, `double`, `boolean`, `string`, `int[]`, `string[]`,
`int[][]`. That is a real constraint on what can be authored, and it is cheaper
to reshape a problem around it than to add a type to four drivers.

A problem declares a `Signature` (method name, typed parameters, typed return)
and its cases as plain JSON `{ args, expected }`. Starter code is a class stub
per language. Cases split into visible examples (checked by **Run**) and hidden
ones (only on **Submit**).

### Languages

**Eight**, and adding a ninth does not mean editing anything anyone else is editing:

| Language | Where it runs | Starters |
|---|---|---|
| Python 3, C++, Java | Judge0 | Hand-written per problem |
| JavaScript | A Web Worker in the tab | Hand-written per problem |
| Go, Rust, TypeScript, C# | Judge0 | Generated from the signature |

Adding a language is: write `lib/drivers/<lang>.ts` exporting a `build` and a
`starter`, prove it with `npm run verify:driver -- <lang>`, and add one entry to
the registry. **Starters are generated from the signature** for anything added
after a problem was written, which is what stops "add a language" meaning "write
28 more stubs by hand". `starter` on a problem is therefore `Partial`.

The editor's highlighter keys off a `highlightAs` *family* (`c-like`, `python`,
`javascript`) plus optional per-language `keywords`, so it needs no edit either.

**C++17 / C++20 / C++23 are not three languages.** They are one source file
compiled with a different flag, so the standard is a separate picker that does
not fork the student's code. Judge0 takes it as `compiler_options`; verified
against GCC 14 on the public instance, where the same source fails to compile
under `-std=c++17` and `-std=c++20` and passes under `-std=c++23`.

### SQL

`data/sql.ts` holds six problems run through SQLite on Judge0. They live **inside
Practice**, behind a Coding / SQL switch, rather than in their own section:
writing a query against a judge is the same activity as writing a function
against one, and a student choosing what to practise is not thinking about which
product area it belongs to. The SDE and AI/ML tracks both link to it, because a
DBMS round is half theory and half actually writing the query.
A SQL problem is schema DDL + seed inserts + the student's query, concatenated
into one script; the runner compares the rows that come back.

Two decisions that are the whole difficulty of judging SQL:

1. **Row order.** SQLite guarantees none without `ORDER BY`, so both sides are
   sorted as whole rows before comparing — but *not* deduplicated, so a join
   that fans out into duplicates still fails.
2. **Hidden rows.** A query can pass a visible-only test by selecting literals.
   Submit re-runs against a second, larger seed whose correct answer differs.
   Every statement says so up front rather than springing it.

### Verifying

```bash
npm run verify:problems                      # the four hand-written languages
npm run verify:problems -- --local           # JavaScript only, instant
npm run verify:problems -- --file dp-greedy  # one problem file, before it is registered
npm run verify:driver -- go                  # one language driver, before it is registered
npm run verify:sql                           # the SQL problems
```

It checks that every starter compiles and runs, that **no starter accidentally
passes everything** (a problem whose placeholder already solves it is worthless),
that every reference solution passes every case in all four languages, and that
all four agree character-for-character on every output. Four independent
implementations agreeing is what actually proves an expected value is right.

The `--file` flag loads one authoring file and its solutions directly, without
going through either index, and `verify:driver` loads one driver the same way —
that is what lets several people add problem sets and languages at the same time
without colliding in a shared registry.

`verify:driver` runs a new language against five problems chosen to cover every
type the harness has (`int`, `int[]`, `string`, `int[][]`, and an `int` return),
checks its reference solutions pass all eight cases each, checks the *generated*
starter compiles and runs without accidentally solving anything, and catches
stray stdout. A new language needs solutions for those five, not all 28 — the
expected values are already proven by four other languages; what is under test is
the driver.

`docs/AUTHORING-PROBLEMS.md` is the contract for adding more. The short version:
**write the statement yourself, never copy one**, and do not report a problem as
finished until the verifier is green in all four languages.

### The harness — `lib/harness.ts`

What makes "call the student's method" work across four languages that share no
runtime. `encodeCases` flattens the JSON cases into a line-based blob that goes
in on stdin; `buildProgram` wraps the student's code in a per-language driver
that reads it back into native values, calls the method once per case, times it,
and prints one protocol line per case; `parseRun` pulls those lines back out.

The format is line-based rather than JSON because C++ has no JSON parser in its
standard library, and shipping one inside every submission is a lot of surface
area for something the student never sees.

Two properties worth keeping:

- **All cases run in one execution.** Eight cases used to be eight submissions;
  now they are one compile and one process, which is roughly eight times less
  waiting and eight times less load on a judge we do not pay for.
- **Each case is flushed as it finishes.** So a solution that hangs on case 6
  still has verdicts for 1–5, and the round can name the case that hung — the
  "last executed input" a real judge shows you.

Anything on stdout that is *not* a protocol line is the student's own printing,
and it comes back to them in a Stdout box.

### The judge — `lib/judge.ts`

| Language | Where it runs | Why |
|---|---|---|
| JavaScript | A Web Worker in the tab | No network, no rate limit, and `while (true) {}` dies when the worker is terminated. The worker streams each printed line back as it happens, which is what preserves per-case verdicts through a timeout. |
| Python, C++, Java | Judge0 | Real compilers, CORS open, no key on the public CE instance. |

Three rules this file exists to keep:

1. **A judge that is down is never a wrong answer.** Network failure, a 429, a
   bad status — all report `judge-down` and say so on screen, with a nudge
   towards JavaScript, which needs no network. Telling a student their correct
   solution failed because someone else's server had a bad minute is the one
   unforgivable bug here.
2. **The endpoint is one environment variable.** This ran on Piston's public
   instance until 2026-08-31, when it was taken offline for good after being
   abused. Assume any free judge is temporary: `VITE_JUDGE0_URL`, plus
   `VITE_JUDGE0_KEY` / `VITE_JUDGE0_HOST` for a RapidAPI-hosted one.
3. **Language ids are per-instance.** Public CE numbers Python 3.13 as `109`;
   an older self-hosted Judge0 calls Python 3.8 `71`. Each language lists ids
   newest-first and they are intersected with whatever `/languages` reports.

A case the student typed themselves carries `compared: false`. There is no known
answer for `nums = [3,3,4,9,1]` just because it was pasted over example 1, so it
is shown as *Finished* with an output and no verdict, and it is not counted for
or against them.

### Proctoring — `lib/proctor.ts`

Unlike the decorative "proctoring active" badge on the MCQ paper, this is real.
The browser cannot tell you *what* is on the other tab, so what is enforceable is
exactly three things, and those three are counted honestly and shown to the
student while the clock runs:

- fullscreen exits (`fullscreenchange`)
- tab switches (`visibilitychange`)
- blocked paste attempts, when the round sets `blockPaste`

`requestFullscreen()` must be called inside a user gesture, which is why the
round opens on a gate screen with a button rather than firing from an effect.
The round also records whether fullscreen was ever actually *granted*: a browser
that advertises the API and then refuses it would otherwise strand the student
behind a "return to fullscreen" overlay whose only button can never succeed.
iPhone Safari has no element fullscreen at all, and there the round simply runs
windowed.

### The editor — `components/exam/CodeEditor.tsx`

A textarea with a highlighted `<pre>` exactly behind it: the textarea's own text
is transparent, only its caret and selection show, and the colour comes from the
layer underneath. That is the whole trick, and it is why this is a few hundred
bytes rather than the ~800 KB Monaco would add to a page opened on hostel wifi.

- The two layers must share font, size, line-height, padding and `white-space`,
  or the caret drifts. That is the invariant to guard when editing the file.
- Edits go through `document.execCommand('insertText')` rather than setState.
  It is deprecated, universally implemented, and the only way to change a
  textarea's contents while keeping native undo — which matters enormously 40
  minutes into a timed round.
- Auto-indent cascades, brackets and quotes auto-close (and step over), Tab
  indents a block and Shift-Tab dedents it, and **Escape blurs** so keyboard
  users are not trapped by Tab.
- Syntax colours are the one place the app uses hues beyond green and near-black;
  they live as `--code-*` in `index.css`.

---

## The admin portal

`/admin`, gated on `isAdmin`. Two sections: browse and filter the question bank
(by source, difficulty, profile, topic, free text, with coverage counts), and the
moderation queue of reported forum posts ordered by report count.

Admin is granted **by hand in SQL**:

```sql
update public.profiles set is_admin = true where roll_no = 'ME23B042';
```

There is no way to grant it from inside the app, and `freeze_profile_identity`
restores `is_admin` on any profile update, so a user cannot promote themselves
through the update policy they legitimately hold on their own row.

The gate is a convenience, not a boundary. An admin sees more, but everything
they can *do* still goes through the same RLS and RPCs as everyone else, which is
why removal is not wired up: the current RPCs only let an author delete their own
content, and changing that needs a real moderator role in the database.

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
- **LeetCode** — no public REST API exists, so a community mirror is tried first. It returns only the contests LeetCode has actually **announced**, which is about two weeks out.

Anything beyond that is *projected* from LeetCode's fixed cadence (Weekly every
Sunday 08:00 IST, Biweekly every second Saturday 20:00 IST) anchored on verified
contest numbers. Projections carry `projected: true` and render with a dashed
border and an **Expected** badge, because a prediction must never be presented as
a confirmed listing. The curated case comps and insti mails carry `sample: true`
and a **Sample** badge for the same reason: their titles and prizes are
illustrative placeholders, not real listings.

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
| Add a book or puzzle set with per-item ticking | `src/data/quant.ts` (or `probstat.ts` / `neetcode.ts`), then point a resource at it with `track: '<id>'` |
| Add a solvable problem | `docs/AUTHORING-PROBLEMS.md` — a file under `src/data/problems/`, reference solutions under `scripts/solutions/`, then `npm run verify:problems` |
| Add a competition the APIs cannot know about | `COMPETITIONS` in `src/data/competitions.ts` |
| Add a contest source | a fetcher in `src/lib/contests.ts`, then add it to `fetchAllFeeds()` |
| Change the placement data | `src/data/bluebook.ts` |
| Change mock exam / interview content | `src/data/exams.ts`, `src/data/interviews.ts` |
| Add a coding problem or round | `src/data/coding.ts` — declare a `Signature`, give starters for all four languages, and verify every expected value against real solutions first |
| Support a new parameter or return type | `CType` in `src/lib/harness.ts`, then the reader and formatter in each of the four drivers |
| Point at a different compiler | `VITE_JUDGE0_URL` (see `.env.example`); ids in `LANGUAGE_IDS` in `src/lib/judge.ts` |
| Change what proctoring counts | `src/lib/proctor.ts` |
| Change what counts toward a streak | calls to `logActivity()` (see `AppContext`) |
| Add or edit daily challenges | `src/data/daily.ts`, one array per role |
| Add practice problems | `src/data/questionBank.ts`; the admin page reads it directly |
| Make someone an admin | `update public.profiles set is_admin = true where roll_no = '…'` |
| Change the account rules | `supabase/migrations/0003_accounts.sql` for the real ones, `src/lib/auth.ts` for the form's feedback |
| Add a page | a component in `src/pages/`, a `<Route>` in `App.tsx`, an entry in `NAV` and `TITLES` in `Shell.tsx` |
| Mark something as not built yet | link it to `comingSoon('Name of the thing', '/where-back-goes')` |
| Change the forum's rules | `supabase/migrations/` for the server rules, `src/lib/forumLocal.ts` to keep local mode matching |
