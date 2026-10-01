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

Two independent defects — the second one made the first unreachable in practice:

### 1. Generation bounded at `today` (logic bug)

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

### 2. First-of-month mount race burns the only run (throttle bug)

Even after fixing the bound, the 1st-of-month trigger defeated itself:

1. On mount, `useSyncFinance` effect #1 registers Firestore listeners and starts `initializeUser`
   (both async), then effect #2 — the daily `checkFirstOfMonth` — runs **synchronously before any
   snapshot callback can deliver data**. On the 1st it calls `checkRecurring()` with an
   **empty `recurringTransactions` array** (a valid no-op run).
2. That empty run reaches the success path and stamps `lastRecurringCheck` (the 5s throttle).
3. Snapshots arrive tens–hundreds of ms later (warm IndexedDB cache); the data-loaded init call
   sites (finally / doc / txns) fire `checkRecurring()` **within 5s → throttled away**, and
   `hasCheckedRecurring` was already set to `true` before the call — so **nothing retries for the
   rest of the session**.
4. On any day ≠ 1, `checkFirstOfMonth` returns at `date() !== 1` without calling → no stamp →
   init path runs normally → back-fill worked on ordinary days. The feature only broke on its own
   day. (Cold first load of the day took >5s, which is how day-1 instances were created earlier
   under the old bound.)

Secondary defect in the same area: `unsubRecs` set `recurringSubColLoaded = true` *before* its
`hasPendingWrites` return, so the flag could be true while the store still had no templates.

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

### 1b. Kill the first-of-month mount race (throttle bug)

- `checkRecurring` now returns immediately when `recurringTransactions` is empty — **before**
  stamping `lastRecurringCheck` — so a mis-timed pre-load run can never throttle the real run.
- `checkFirstOfMonth` (daily effect) skips when `recurringSubColLoaded` is false: it must not run
  before recurring data has been delivered. Mount coverage is already provided by the init call
  sites, which gate on `recurringSubColLoaded`; the interval still covers a long-lived tab
  crossing midnight into the 1st.
- `unsubRecs` now sets `recurringSubColLoaded` only for **non-pending** snapshots — the flag means
  "templates are in the store", matching what the gating call sites assume.

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

7 new tests in `src/store/useFinanceStore.test.ts`, pinned to a fixed clock
(`vi.useFakeTimers({ now: 2026-10-05 })`) so they are deterministic:

1. Generates instances through end of current month (Oct 20 exists on Oct 5; exactly Jan..Oct = 10;
   `lastGeneratedUpTo` checkpoint; Firestore persistence).
2. No next-month instance; idempotent second run.
3. Never duplicates when an instance already exists.
4. `updateRecurring` syncs future instance, leaves past untouched (store + Firestore).
5. `updateRecurring` prunes future instances beyond a new `endDate` (not regenerated afterwards).
6. `deleteRecurring` removes future instance (store + Firestore), keeps past.
7. **Mount race**: an empty pre-load run does not stamp `lastRecurringCheck`, so the
   data-loaded run <5s later still generates the month (fails without fix 1b).

Verification: 6 of the 7 fail on the fully pre-fix code (the duplicate-guard test passes both
ways by design). Full suite 162/162, `tsc -b` clean, build OK, lint at the
9-error baseline (0 new).

## Related

- [[wiki/features/first-of-month-recurring/first-of-month-recurring]]
- [[wiki/bugs/recurring-transaction-duplicates-same-period]]
