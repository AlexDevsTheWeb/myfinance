# Bug: `monthOfYear` ignored in `checkRecurring()` — Yearly recurrent transactions generated in wrong month

## Discovery

Cannot see Google One subscription (yearly recurrence). Investigation reveals yearly recurrent transactions are generated in the wrong month because `monthOfYear` is never read during generation.

## Affected File

`src/store/useFinanceStore.ts:804-922` — `checkRecurring()`

## Root Cause

At line 837:

```ts
let targetDate = current.date(payload.dayOfMonth);
```

This sets the **day** of the target date but keeps whatever **month** `current` is in. The `payload.monthOfYear` field is **never read**.

For yearly transactions, `current` advances by year only, so the month stays fixed to whatever month `current` started in (derived from `startDate` or `balanceStartDate`, whichever is later).

Since `startDate` defaults to `dayjs().format('YYYY-MM-DD')` (today's date at template creation) per `TransactionForm.tsx:325`, a yearly subscription like Google One created in July gets generated as July 15 instead of March 15 — even though `monthOfYear: 3` is stored correctly in Firestore.

## Data Flow

```
Template: { startDate: "2026-07-16", monthOfYear: 3, dayOfMonth: 15, frequency: "yearly" }

checkRecurring():
  startFrom = dayjs("2026-07-16")          // July
  current = July 2026
  targetDate = current.date(15)             // 2026-07-15  ← WRONG
  // monthOfYear = 3 should have been used  // should be 2026-03-15
```

The Dashboard (`DashboardPage.tsx:57-60`) filters by current month only:
```ts
const currentDateRange = {
  start: dayjs().startOf('month').format('YYYY-MM-DD'),
  end: dayjs().endOf('month').format('YYYY-MM-DD'),
};
```

So a yearly transaction generated in the wrong month is invisible in the current month's dashboard.

## Secondary Issues

### 1. `lastGeneratedUpTo` stripped by sanitizer

`src/store/sanitization/recurring.ts:9-22` does not include `lastGeneratedUpTo` in the sanitized output. So on every Firestore write, the field is stripped. On page reload, `checkRecurring()` re-scans from `startDate` instead of resuming from the last generated period.

Already partially addressed by go-to-market Phase 1.3 (#138) — but worth verifying the fix is complete.

### 2. Yearly dedup blocks correct re-generation

At `useFinanceStore.ts:862-864`, the dedup check for yearly transactions matches by **year** only:
```ts
if (payload.frequency === 'yearly') {
    return dayjs(t.date).year() === targetDate.year();
}
```

This means: after fixing the `monthOfYear` bug, any existing incorrectly-dated transaction for the same year will block the correct one from being generated.

## Proposed Fix

### Fix 1: Use `monthOfYear` in `checkRecurring()`

In `src/store/useFinanceStore.ts`, after line 837, apply `monthOfYear` for yearly transactions:

```ts
let targetDate = current.date(payload.dayOfMonth);
if (payload.frequency === 'yearly' && payload.monthOfYear != null) {
  targetDate = targetDate.month(payload.monthOfYear - 1);
}
```

The existing overflow guard at line 838-840 still applies:
```ts
if (targetDate.month() !== current.month()) {
  targetDate = current.endOf('month');
}
```

This must be adjusted: instead of checking against `current.month()`, check against the **intended** month:
```ts
const intendedMonth = payload.frequency === 'yearly' && payload.monthOfYear != null
  ? payload.monthOfYear - 1
  : current.month();
if (targetDate.month() !== intendedMonth) {
  targetDate = dayjs(targetDate).endOf('month');
}
```

### Fix 2: Regenerate existing yearly transactions

After Fix 1 lands, existing yearly transactions with wrong dates need to be corrected. Two approaches:

**Approach A — Delete and regenerate:**
- For each recurring template, delete all generated instances where the year matches but the date is wrong (date doesn't match `monthOfYear`/`dayOfMonth`)
- Then let `checkRecurring()` regenerate them correctly

**Approach B — Fix dates in place:**
- Find all transactions with `recurringLinkId` where the date doesn't match the template's `monthOfYear`/`dayOfMonth`
- Update the date field to the correct month+day (preserving the year)

## Files to Modify

| File | Change |
|------|--------|
| `src/store/useFinanceStore.ts:837-840` | Read `monthOfYear` when computing `targetDate` for yearly transactions |
| (optional) `src/store/sanitization/recurring.ts` | Verify `lastGeneratedUpTo` is persisted (check Go-to-Market fix) |

## Verification

1. Create a yearly recurring transaction with `monthOfYear` ≠ current month
2. Navigate to the target month in the dashboard
3. The generated transaction should appear in the correct month
4. Monthly recurring transactions should be unaffected
