---
type: Bug
title: "Month not preloaded — checkRecurring generated only instances dated ≤ today"
description: "On the 1st of the month the calendar showed only day-1 recurring instances and cards missed the month's charges because checkRecurring bounded generation at today instead of end of month."
resource: ""
tags: [bug, recurring, calendar, cards, dashboard]
created: 2026-10-01
updated: 2026-10-01
status: fixed
severity: major
sources: ["raw/bugs/recurring-preload-month-bound/recurring-preload-month-bound.md"]
related: ["wiki/features/first-of-month-recurring/first-of-month-recurring.md"]
---

# Bug: Month not preloaded — generation stops at today

Status: **fixed**
Severity: **major**

## Symptom

On the first day of the month the dashboard calendar showed only the recurring transactions dated
the 1st — every other recurring instance of the month was missing. The card plafond widgets were
not updated with the month's recurring expenses either.

## Reproduction

1. Monthly recurring template with `dayOfMonth ≠ 1` (e.g. the 20th).
2. Open the app on the 1st of the month.
3. Calendar shows only day-1 instances; cards miss the month's remaining charges.

## Root Cause Analysis

`checkRecurring` bounded its generation loop at **today**:

```ts
const now = dayjs();
while (current.isBefore(now, 'day') || current.isSame(now, 'day')) { ... }
if (targetDate.isAfter(now, 'day')) break;
```

On the 1st, only instances dated ≤ today exist — exactly the day-1 templates. The daily
first-of-month trigger added in [[wiki/features/first-of-month-recurring/first-of-month-recurring]]
could not help: the check runs on the day, but its own bound stops it after one day.

**Second root cause — the trigger defeated itself on mount.** On the 1st, the daily
`checkFirstOfMonth` effect runs *synchronously before any Firestore snapshot delivers templates*,
so `checkRecurring()` executed with an **empty template list** — a "successful" no-op that stamped
the 5s throttle (`lastRecurringCheck`). The data-loaded init call fired tens–hundreds of ms later
(warm cache) → throttled away, and `hasCheckedRecurring` was already burned → **no generation for
the whole session**. Any other day the daily effect returned at `date() !== 1` without calling,
so no stamp — the feature only broke on its own day. Reloading never helped: the race is
guaranteed on every mount on the 1st. (Cold first load of the day took >5s, which is how day-1
instances were created earlier under the old bound.) Compounding it, `unsubRecs` set
`recurringSubColLoaded = true` *before* its `hasPendingWrites` return, so the flag could read
true while the store still had no templates.

Card/calendar code was innocent — their period filters already include future dates within the
period; there were simply no future instances to include.

## Fix

1. **`checkRecurring` bound → end of current month** (`src/store/useFinanceStore.ts`):
   `generationEnd = dayjs().endOf('month')` replaces `now` in both the loop condition and the
   `targetDate` break. Idempotency preserved via `lastGeneratedUpTo` + `existsInPeriod`.
   Yearly templates whose `monthOfYear` is later in the year still wait for their month.
2. **Kill the mount race** (throttle burn): `checkRecurring` returns when the template list is
   empty — *before* stamping `lastRecurringCheck`; `checkFirstOfMonth` skips until
   `recurringSubColLoaded` (init call sites already gate on it, and the interval still covers a
   tab crossing midnight into the 1st); `unsubRecs` sets `recurringSubColLoaded` only after the
   `hasPendingWrites` return, so the flag means "templates are in the store".
3. **`updateRecurring` cascade**: future preloaded instances are synced to edited template fields;
   instances outside a changed `startDate`/`endDate` are pruned — persisted via Firestore batch.
   Past instances untouched.
4. **`deleteRecurring` cascade**: future instances removed from store **and** Firestore
   subcollection; past instances kept as history.

Preloaded future instances are consistent with existing semantics: manual future-dated
transactions were already allowed (no `maxDate` in the form).

## Verification

- 7 new tests in `src/store/useFinanceStore.test.ts` (clock pinned to 2026-10-05), including a
  dedicated mount-race regression (empty run doesn't stamp the throttle); **6 fail on fully
  pre-fix code**.
- Full suite 162/162, `tsc -b` clean, production build OK, lint at exact 9-error baseline.

## Related

- [[wiki/features/first-of-month-recurring/first-of-month-recurring]]
- Source: [raw/bugs/recurring-preload-month-bound/recurring-preload-month-bound.md](../../raw/bugs/recurring-preload-month-bound/recurring-preload-month-bound.md)
