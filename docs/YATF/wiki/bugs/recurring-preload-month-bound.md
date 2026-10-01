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
could not help: the check runs on time, but its own bound stops it after one day.

Card/calendar code was innocent — their period filters already include future dates within the
period; there were simply no future instances to include.

## Fix

1. **`checkRecurring` bound → end of current month** (`src/store/useFinanceStore.ts`):
   `generationEnd = dayjs().endOf('month')` replaces `now` in both the loop condition and the
   `targetDate` break. Idempotency preserved via `lastGeneratedUpTo` + `existsInPeriod`.
   Yearly templates whose `monthOfYear` is later in the year still wait for their month.
2. **`updateRecurring` cascade**: future preloaded instances are synced to edited template fields;
   instances outside a changed `startDate`/`endDate` are pruned — persisted via Firestore batch.
   Past instances untouched.
3. **`deleteRecurring` cascade**: future instances removed from store **and** Firestore
   subcollection; past instances kept as history.

Preloaded future instances are consistent with existing semantics: manual future-dated
transactions were already allowed (no `maxDate` in the form).

## Verification

- 6 new tests in `src/store/useFinanceStore.test.ts` (clock pinned to 2026-10-05);
  **5 fail on pre-fix code**.
- Full suite 159/159, `tsc -b` clean, production build OK, lint at exact 9-error baseline.

## Related

- [[wiki/features/first-of-month-recurring/first-of-month-recurring]]
- Source: [raw/bugs/recurring-preload-month-bound/recurring-preload-month-bound.md](../../raw/bugs/recurring-preload-month-bound/recurring-preload-month-bound.md)
