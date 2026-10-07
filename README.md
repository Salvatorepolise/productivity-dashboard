# Productivity Dashboard

Simple and focused personal productivity dashboard built during my public challenge.

## Features

- Today's Overview (Total / Completed / Remaining / Progress %)
- Habit Insights (dynamic motivational message)
- Quote of the day (external API + async/await)
- Weather (Open-Meteo — loading / success / error)
- User preferences (°C/°F, compact mode, dark mode — persisted)
- Undo delete (temporary state + 5s toast)
- Keyboard shortcuts (Ctrl/Cmd+K search, N new habit, Esc clear search)
- Export / Import habits (JSON backup + validation)
- Daily state reset on new local calendar day (habit completions + coding minutes)
- Today's Goals (dynamic list + add new goals)
- Habit Tracker with full CRUD
- Search + Status filter + Sort (derived view, source state untouched)
- Duplicate validation
- Event delegation
- Progress bar + analytics
- Reset Habits button
- Persistent data with localStorage
- Daily Coding tracker
- Notes with auto-save

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript (ES Modules)

## Project structure

js/
├── main.js # app entry + events + settings + keyboard + export/import
├── state.js # habits state + CRUD + filters + undo + import/export + daily reset
├── storage.js # localStorage (habits)
├── ui.js # render + DOM updates
├── habits-logic.js # pure habit calculations (no DOM)
├── api.js # quote + weather (API layer + display)
└── preferences.js # user preferences + persistence (theme, compact, °C/°F)

## How to run

Open with a local server (Live Server / `npx serve`) or view the live version:  
[https://salvatorepolise.github.io/productivity-dashboard/](https://salvatorepolise.github.io/productivity-dashboard/)

## Progress

- **Day 1** (1 September 2026): First version completed
- **Day 2** (2 September 2026): Added Progress Tracker + editable Coding Goal
- **Day 3** (3 September 2026): Added interactive Daily Coding Tracker
- **Day 4** (4 September 2026): Added ability to dynamically create new goals
- **Day 5** (7 September 2026): Made Habit Tracker fully dynamic (array → DOM)
- **Day 6** (8 September 2026): Improved state management + persistent habits with JSON
- **Day 7** (9 September 2026): Refactored code into clear functions + Reset feature
- **Day 8** (10 September 2026): Simplified dashboard + Habit Analytics
- **Day 9** (11 September 2026): Added Create & Delete habits
- **Day 10** (12 September 2026): Added Edit Habit → full CRUD completed
- **Day 11** (14 September 2026): Refactored events with event delegation
- **Day 12** (15 September 2026): Habit search with filter + stronger validation
- **Day 13** (16 September 2026): Habit sorting + search/sort pipeline
- **Day 14** (17 September 2026): Today's Overview statistics connected to state
- **Day 15** (18 September 2026): Habit Insights + immutable updates with spread
- **Day 16** (19 September 2026): Practiced find/some/every, kept UI minimal
- **Day 17** (21 September 2026): Connected external API for daily quote
- **Day 18** (22 September 2026): Refactored into ES Modules (state/ui/storage/api)
- **Day 19–21**: TypeScript data model + typed habit layer (separate practice)
- **Day 22** (28 September 2026): Extracted pure habit logic from UI (`habits-logic.js`)
- **Day 23** (29 September 2026): Integrated Open-Meteo weather API
- **Day 24** (30 September 2026): Separated weather API logic from UI
- **Day 25** (1 October 2026): Persistent user preferences (°C/°F + compact mode)
- **Day 26** (2 October 2026): Undo delete with temporary state + toast
- **Day 27** (3 October 2026): Status filter on derived view (search + filter + sort)
- **Day 28** (4 October 2026): Keyboard shortcuts (Ctrl/Cmd+K, N, Esc)
- **Day 29** (5 October 2026): Export / Import habits as JSON
- **Day 30** (6 October 2026): Dark mode preference + UI contrast fixes
- **Day 31** (7 October 2026): Auto-reset completed habits on new calendar day
- **Day 32** (8 October 2026): Extended daily state reset to coding minutes (local date)
- MRR: $0

---

Building in public.
