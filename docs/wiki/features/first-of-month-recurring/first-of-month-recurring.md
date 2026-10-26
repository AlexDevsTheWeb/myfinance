---
type: Feature
title: "First-day-of-month recurrent transaction loading"
description: "Automatically load/generate all recurrent transactions on the first day of each month with the correct date"
resource: ""
tags: [feature]
created: 2026-10-01
updated: 2026-10-01
status: implemented
sources: ["raw/first-of-month-recurring/first-of-month-recurring.md"]
related: []
---

# Feature: First-day-of-month recurrent transaction loading

Status: implemented
Priority: medium

## Description
On the first day of each month, all of the user's recurrent transactions are automatically loaded/generated with the correct date. This ensures that when the user opens the app on the 1st of any month, all recurring transaction instances for that month are already available.

## Implementation Details
- Modified `src/hooks/useSyncFinance.ts` to add a daily check that triggers `checkRecurring()` when it's the first day of the month
- The check leverages the existing 5-second throttle guard (`lastRecurringCheck`) to prevent rapid repeated calls
- The effect runs on app mount and then once per day via `setInterval`
- On the first day of the month, `checkRecurring()` generates any pending recurrent transaction instances for the new month using the existing recurring transaction generation logic

## Technical Changes
- `src/hooks/useSyncFinance.ts`: Added `useEffect` with daily date check that calls `checkRecurring()` if:
  - Current day is the 1st of the month
  - At least 5 seconds have passed since the last `checkRecurring` call (existing throttle guard)
- The existing `checkRecurring()` in `src/store/useFinanceStore.ts` handles:
  - Deduplication via `lastGeneratedUpTo` field
  - Firestore-side dedup to prevent duplicate transactions
  - Yearly recurring month-of-year correction
  - End date handling

## Full-month preload (2026-10-01 follow-up)

The first implementation only *triggered* the check on the 1st — `checkRecurring` itself still
bounded generation at `today`, so on the 1st only day-1 instances existed (reported as missing
calendar/card data). See [[wiki/bugs/recurring-preload-month-bound]].

- `checkRecurring` now bounds generation at `generationEnd = dayjs().endOf('month')` — the whole
  current month is preloaded in one run; `lastGeneratedUpTo` + `existsInPeriod` keep it idempotent.
- Mount-race hardening (the 1st-of-month trigger used to burn itself): `checkRecurring` returns
  when the template list is empty *before* stamping the 5s throttle; `checkFirstOfMonth` skips
  until `recurringSubColLoaded`; `unsubRecs` sets that flag only for non-pending snapshots.
  See [[wiki/bugs/recurring-preload-month-bound]] for the full race analysis.
- Calendar and cards needed **no changes** — their period filters already include future dates
  within the period.
- Lifecycle cascades added because instances are now future-dated:
  - `updateRecurring` syncs future instances to edited template fields and prunes those outside a
    changed `startDate`/`endDate` (past instances untouched).
  - `deleteRecurring` removes future instances from store **and** Firestore; past kept as history.
- Known trade-off: a manual edit to a *future* instance is overwritten when the template itself is
  next edited (template = source of truth for future charges).

## Verification
- TypeScript compilation passes (`npm run build`)
- Production build succeeds
- 162/162 tests — 7 new preload/cascade/mount-race tests (clock pinned to 2026-10-05), 6 red on fully pre-fix code
- Lint at exact 9-error baseline (0 new)
- No breaking changes to existing recurring transaction logic