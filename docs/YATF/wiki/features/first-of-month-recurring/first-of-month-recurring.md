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

## Verification
- TypeScript compilation passes (`npm run build`)
- Production build succeeds
- No breaking changes to existing recurring transaction logic