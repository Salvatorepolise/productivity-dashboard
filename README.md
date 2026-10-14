# Productivity Dashboard

**v1.0** — Personal productivity dashboard built in public (36-day challenge).

## What this is

A **local-first** web app to track:

- Daily habits (with streaks)
- Coding time
- Goals and notes
- Light weather + daily quote

Data is stored in your browser (`localStorage`).  
Live demo: [https://salvatorepolise.github.io/productivity-dashboard/](https://salvatorepolise.github.io/productivity-dashboard/)

## What this is not

- Not a cloud app (no login, no multi-device sync)
- Not a native mobile app
- Not a full project/task manager

For one browser / one device, it is designed to be used every day.

## Features

- Today's Overview (Total / Completed / Remaining / Progress %)
- Habit Insights
- Quote of the day (API)
- Weather (Open-Meteo)
- Habit Tracker — full CRUD with inline rename
- Search + status filter + sort (derived view)
- Habit streaks (max +1 per local day)
- Daily reset on new local calendar day (completions + coding minutes), also while the tab stays open
- Non-blocking messages (toasts instead of alerts)
- Undo delete (5s toast)
- Keyboard shortcuts (Ctrl/Cmd+K, N, Esc)
- Export / Import JSON (with confirmation before replace)
- Preferences: °C/°F, compact mode, dark mode
- Daily Coding tracker
- Notes with auto-save
- Clean UI (Day 34 restyle)

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript (ES Modules)
- Node's built-in test runner (no dependencies)

## Project structure

```
js/
├── main.js           # entry, events, settings, keyboard, export/import
├── state.js          # habits, filters, undo, daily reset, streaks
├── storage.js        # localStorage (habits, goals)
├── ui.js             # render + DOM
├── habits-logic.js   # pure logic: stats, insights, dates, streaks
├── api.js            # quote + weather
└── preferences.js    # theme, compact, temperature unit
tests/
└── habits-logic.test.js
```

## How to run

```bash
# local server (required for ES modules)
npx serve
# or Live Server in VS Code
```

Or open the live version on GitHub Pages (link above).

## Tests

```bash
npm test
```

Runs the pure habit logic tests (streaks, dates, ids, stats) with Node 18+.

## Keyboard shortcuts

| Shortcut       | Action                                       |
| -------------- | -------------------------------------------- |
| `Ctrl/Cmd + K` | Focus search                                 |
| `N`            | Focus new habit (when not typing in a field) |
| `Esc`          | Clear search                                 |

## Data & privacy

- Habits, goals, notes, coding minutes, and preferences stay in **your browser**
- Export downloads a JSON backup you control
- No analytics backend in this project

## Progress (challenge log)

- **Day 1–10**: Fundamentals → CRUD habits
- **Day 11–18**: Events, modules, external quote API
- **Day 19–22**: TypeScript practice + logic extraction
- **Day 23–24**: Weather API + API/UI separation
- **Day 25–30**: Preferences, undo, filters, shortcuts, export/import, dark mode
- **Day 31–32**: Daily state reset (habits + coding, local date)
- **Day 33**: Habit streaks
- **Day 34**: UI restyle + HTML cleanup
- **Day 35**: Reliability pass + import confirmation
- **Day 36** (13 October 2026): Code audit (5 bug fixes) + **v1.0 release**
- **Day 37** (14 October 2026): New-day reset with open tab, inline rename, toasts, first tests
- MRR: $0

## What's next

- Use it daily and only add features that real use demands
- Continue structured learning (Web Developer Bootcamp)
- Move toward TypeScript + React for larger products / SaaS

---

Building in public.
