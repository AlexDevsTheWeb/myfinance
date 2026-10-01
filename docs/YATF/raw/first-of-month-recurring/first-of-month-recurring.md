---
type: Feature
title: "First-day-of-month recurrent transaction loading"
description: "Automatically load/generate all recurrent transactions on the first day of each month with the correct date"
resource: ""
tags: [feature, recurring]
created: 2026-10-01
updated: 2026-10-01
status: implemented
sources: []
related: []
---

# Feature: First-day-of-month recurrent transaction loading

## Description
On the first day of each month, all of the user's recurrent transactions are automatically loaded/generated with the correct date. This ensures that when the user opens the app on the 1st of any month, all recurring transaction instances for that month are already available.

## Implementation
- Added a daily check in `src/hooks/useSyncFinance.ts` that triggers `checkRecurring()` when it's the first day of the month
- The check uses the existing 5-second throttle guard (`lastRecurringCheck`) to prevent rapid repeated calls
- The effect runs on app mount and then once per day via `setInterval`
- On the first day of the month (midnight onward), `checkRecurring()` generates any pending recurrent transaction instances for the new month

## Verification
- TypeScript compilation passes (`npm run build`)
- Build produces a production bundle successfully
- The existing `checkRecurring()` function already handles deduplication via `lastGeneratedUpTo` and Firestore-side dedup
- No race conditions introduced — the 5-second throttle from the existing guard prevents duplicate runs