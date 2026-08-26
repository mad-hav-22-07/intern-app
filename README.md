# Internship Preparation Drive — UI prototype

A clickable, responsive front-end prototype of the prep platform sketched in `notes/IMG_1001–1006.png`.
Every feature from those notes exists as a real page with example content. **No backend** — auth is a
hardcoded check and all data is mock data in `src/data/`.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

Sign in with **`admin` / `admin123`** (the login page has a tap-to-fill button for it).

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · React Router · lucide-react.
Black + green theme, dark by default, with a light-mode toggle in the header.

## Where things live

```
src/
  data/          all mock content — replace these files with real material
    roles.ts       7 target profiles + their curated study material
    user.ts        demo profile, example resume review, streak
    competitions.ts, forum.ts, bluebook.ts, interviews.ts, exams.ts
  pages/         one file per sidebar item
  components/
    ui/          Button, Card, Badge, Modal, Tabs, Field, Progress/Ring, Page
    layout/      Shell — sidebar, header, mobile drawer
  context/       AppContext — fake auth, profile, theme, progress (localStorage)
```

## What's real vs. stubbed

**Fully interactive:** login, profile editing, target-role checkboxes → dashboard role dropdown,
resource check-off + progress, competition filters and calendar, forum browse/search/comment,
Blue Book filters and expandable company rows, mock interview session → feedback, mock exam →
palette/timer → results, friends leaderboard, light/dark toggle.

**Deliberately scripted or stubbed:** the resume AI score, the Blue Book chatbot answers, the mock
interviewer's questions, proctoring, calendar sync, file upload, and posting to the forum. Each of
those says so on screen.

## Replacing the placeholder content

Everything the notes list as "material to be added" is in `src/data/roles.ts`. Each resource has an
optional `url` — entries without one render as `link pending` instead of a dead link. Add the URL and
it becomes a live link. Same pattern for the Blue Book PDFs (`bluebook.ts`) and case material.
