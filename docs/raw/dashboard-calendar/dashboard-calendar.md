---
type: Feature
title: "Dashboard calendar view"
description: "Month calendar on the home page showing all transactions of the month, live-updating on every insert"
resource: ""
tags: [feature, dashboard, calendar]
created: 2026-10-01
updated: 2026-10-01
status: implemented
sources: []
related: []
---

# Dashboard calendar view

## Request
Add a calendar view in the home page (Dashboard) with all the transactions of the month, updating every time the user inserts a new transaction.

## Design decisions
- **Component**: `src/components/dashboard/MonthCalendar.tsx`, placed in a full-width Dashboard row after the Charts/Portfolio row.
- **Calendar widget**: MUI X `DateCalendar` (already a dependency via `@mui/x-date-pickers`, `LocalizationProvider` already set up in `main.tsx`).
- **Custom day cells**: `slots={{ day: CalendarDay }}` wraps `PickerDay`; each cell shows the day number plus up to three dots — green (income), red (expense), blue (transfer) — driven by a `DayTotalsContext` map.
- **Day detail panel**: clicking a day shows the selected date, day income/expense totals, and the list of that day's transactions (icon, description, category · subcategory, signed amount).
- **Live updates**: the component reads `transactions` from `useFinanceStore` (Zustand). Every insert/update/delete (`addTransaction`, Firestore `onSnapshot`, `checkRecurring` back-fill) changes the store → memoized `totalsByDay`/`dayTransactions` recompute → calendar re-renders. No manual refresh path exists or is needed.
- **Localization**: new `dashboard.calendar.*` keys in `src/locales/it.json` + `en.json`; weekday headers localized by passing `adapterLocale` ('it'/undefined) to `LocalizationProvider` via a new `src/components/AppProviders.tsx` (react-refresh lint requires the component outside `main.tsx`; also subscribes to `languageChanged` so switching language re-renders the picker locale).
- **Test harness**: `renderWithProviders` in `src/test/test-utils.tsx` now wraps `LocalizationProvider` so date-picker components can be unit-tested.

## Follow-up (2026-10-01) — calendar flush against the charts row

Reported: the calendar was not respecting the spacing used by the rest of the page (Paper touching the charts above).

Root cause: MUI Grid v9's `spacing` prop is implemented as CSS `gap` **inside a container only**
(`@mui/system/Grid/gridGenerator.js:163` — `gap: var(--rowSpacing) var(--columnSpacing)`).
It creates no space between sibling containers. On the dashboard, every section container
carries its own `mb: 3` (title `mb: 3`, alerts `mb: 3`, stat cards `mb: 3`, recap cards
`mb: 3`) except the charts container — which only had `mt: 0`, and the calendar container
also `mt: 0` → 0px between them while every other section gap is 24px.

Fix: `DashboardPage.tsx` charts container `sx={{ mt: 0 }}` → `sx={{ mt: 0, mb: 3 }}` — restores
the page's one-mechanism spacing pattern (each container owns its bottom gap).

## Verification
- `tsc -b` clean; `vite build` ✓; `npm test` 153/153; `npm run lint` unchanged vs development (9 pre-existing errors, 0 new).
- Follow-up: `tsc -b` clean; `npm test` 162/162; lint baseline 9 errors / 11 warnings.
