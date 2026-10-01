---
type: Bug
title: "checkRecurring stops at today — whole month not preloaded"
description: "On the 1st of the month only day-1 recurring instances existed because checkRecurring bounded generation at today instead of end of month; fixed by generating through month end plus update/delete cascades."
resource: ""
tags: [bug, recurring, calendar, cards]
created: 2026-10-01
updated: 2026-10-01
status: fixed
sources: []
related: []
---

# Bug: checkRecurring stops at today — whole month not preloaded

## Symptom

User report (2026-10-01, first day of the month, dashboard calendar feature in review):

1. The dashboard calendar showed **only** the recurring transactions dated the 1st of the month — every other recurring instance for October was missing.
2. The card plafond widgets were **not** updated with the month's recurring expenses.

## Reproduction

1. Have a monthly recurring template with `dayOfMonth` other than 1 (e.g. Netflix on the 20th).
2. Open the app on the 1st of the month.
3. Calendar shows only day-1 recurring instances; cards miss the rest of the month's charges.

## Root cause

`checkRecurring` in `src/store/useFinanceStore.ts` bounded generation at **today**:

```ts
const now = dayjs();
while (current.isBefore(now, 'day') || current.isSame(now, 'day')) { ... }
...
if (targetDate.isAfter(now, 'day')) break;
```

On October 1st that means only instances dated ≤ Oct 1 are generated — i.e. exactly the day-1
templates. All other instances of the month are not created until their own day arrives, so any
consumer that needs the *whole month* (calendar, card billing windows, monthly expense stats)
sees an incomplete picture on the 1st.

The earlier fix (daily `useEffect` in `useSyncFinance.ts` that calls `checkRecurring()` on the
1st) only guarantees *when* the check runs — it cannot help while the check itself stops at today.

## Fix

### 1. Bound generation at end of current month

`src/store/useFinanceStore.ts` — `checkRecurring`:

```ts
const generationEnd = dayjs().endOf('month');
while (current.isBefore(generationEnd, 'day') || current.isSame(generationEnd, 'day')) { ... }
...
if (targetDate.isAfter(generationEnd, 'day')) break;
```

- Monthly templates: all instances from `startFrom` through the last day of the current month are
  generated in one run (on the 1st, that is the whole month).
- Yearly templates: an instance whose `monthOfYear` falls later in the year is still skipped
  (`break` at month end) and generated when its month arrives — unchanged semantics.
- `lastGeneratedUpTo` checkpoint and `existsInPeriod` dedup are unchanged and make the preload
  idempotent: a second run in the same month creates nothing.
- Back-fill of missed past months still works (loop starts at `lastGeneratedUpTo + 1 period`).

No calendar or card code needed changes: card windows
(`RecapCards`, `date ∈ [periodStart, periodEnd)`) and calendar day filters already include any
future date within the period. Manual future-dated transactions were already allowed by the form
(no `maxDate`), so preloading is consistent with existing balance/stat semantics.

### 2. Cascades required by preloading

Preloaded instances are future-dated *now*, so template lifecycle actions had to learn about them:

- **`updateRecurring`**: future instances (`date > today`) of the edited template are synced to the
  new `description / category / subcategory / amount / type / accountId / cardId`; future instances
  that fall outside a changed `startDate`/`endDate` are removed. Persisted via Firestore batch
  (set for synced, delete for pruned). Past instances stay untouched — they are historical record.
- **`deleteRecurring`**: future instances are removed from the store **and** deleted from the
  Firestore transactions subcollection (otherwise a reload would resurrect them). Past instances
  remain as history. No `deletedRecurringInstances` marker is needed — the template itself is gone,
  so nothing can regenerate them.

Known trade-off (accepted): a manual edit the user made to a *future* instance is overwritten the
next time the template itself is edited — the template is the source of truth for future charges.

## Tests

6 new tests in `src/store/useFinanceStore.test.ts`, pinned to a fixed clock
(`vi.useFakeTimers({ now: 2026-10-05 })`) so they are deterministic:

1. Generates instances through end of current month (Oct 20 exists on Oct 5; exactly Jan..Oct = 10;
   `lastGeneratedUpTo` checkpoint; Firestore persistence).
2. No next-month instance; idempotent second run.
3. Never duplicates when an instance already exists.
4. `updateRecurring` syncs future instance, leaves past untouched (store + Firestore).
5. `updateRecurring` prunes future instances beyond a new `endDate` (not regenerated afterwards).
6. `deleteRecurring` removes future instance (store + Firestore), keeps past.

Verification: 5 of the 6 fail on the pre-fix code (the duplicate-guard test passes both ways by
design). Full suite 159/159, `tsc -b` clean, build OK, lint at the 9-error baseline (0 new).

## Related

- [[wiki/features/first-of-month-recurring/first-of-month-recurring]]
- [[wiki/bugs/recurring-transaction-duplicates-same-period]]
