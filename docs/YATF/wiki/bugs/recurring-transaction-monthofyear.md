---
title: "Yearly recurring transactions ignore monthOfYear — generated in wrong month"
tags: [bug, recurring, critical, open]
created: 2026-07-16
updated: 2026-07-16
status: open
severity: critical
sources: ["raw/recurring-transaction-monthofyear/recurring-transaction-monthofyear.md"]
related: ["plans/go-to-market", "architecture/system-architecture"]
---

# Bug: Yearly Recurring Transactions Ignore `monthOfYear`

Status: **open**
Severity: **critical**

## Symptom

Yearly recurring transactions (e.g., Google One subscription) are generated in the wrong month. The template stores `monthOfYear: 3` (March) correctly, but the generated transaction lands in whatever month `startDate` or `balanceStartDate` falls in — typically the month the template was created.

The transaction is invisible in the current month's dashboard since it was generated for a different month.

## Reproduction

1. Create a yearly recurring transaction with `monthOfYear` set to March and `startDate` in July
2. Wait for `checkRecurring()` to run (or reload the page)
3. Observe: the generated transaction has date July 15, not March 15
4. Navigate to March in the dashboard — no transaction appears

## Root Cause

`src/store/useFinanceStore.ts:837` — `checkRecurring()` never reads `payload.monthOfYear`:

```typescript
let targetDate = current.date(payload.dayOfMonth);
// monthOfYear is never read — month stays at current.month()
```

For yearly transactions, `current` advances by year only, so the month is permanently fixed to the starting month.

## Impact

- Yearly subscriptions (Google One, domain renewals, insurance, etc.) appear in the wrong month
- Budget tracking, dashboard views, and analysis pages show incorrect monthly data
- All users with yearly recurring templates are affected
- The data is stored correctly in Firestore — it's purely a generation-time bug

## Proposed Fix

### Fix 1: Apply `monthOfYear` during target date computation

In `src/store/useFinanceStore.ts`, after line 837:

```typescript
let targetDate = current.date(payload.dayOfMonth);
if (payload.frequency === 'yearly' && payload.monthOfYear != null) {
  targetDate = targetDate.month(payload.monthOfYear - 1);
}
```

Adjust the overflow guard to use the **intended month** rather than `current.month()`:

```typescript
const intendedMonth = payload.frequency === 'yearly' && payload.monthOfYear != null
  ? payload.monthOfYear - 1
  : current.month();
if (targetDate.month() !== intendedMonth) {
  targetDate = dayjs(targetDate).endOf('month');
}
```

### Fix 2: Regenerate existing incorrectly-dated transactions

After Fix 1, existing yearly transactions need correction. Options:

- **A — Delete & regenerate**: Remove generated instances with wrong dates; let `checkRecurring()` recreate them correctly
- **B — Fix dates in place**: Update transaction dates to match template's `monthOfYear`/`dayOfMonth`

Approach A is cleaner — it works automatically after `checkRecurring()` runs, since the dedup for yearly is by year only. Delete the wrong instances and the next run fills them in correctly.

## Related

- [[wiki/plans/go-to-market]] — Phase 1.3 touched `lastGeneratedUpTo` persistence in recurring code
- [[wiki/architecture/system-architecture]] — recurring check flow in system architecture
- Source: [raw/recurring-transaction-monthofyear/recurring-transaction-monthofyear.md](raw/recurring-transaction-monthofyear/recurring-transaction-monthofyear.md)
