---
title: "Yearly recurring transactions ignore monthOfYear — generated in wrong month"
tags: [bug, recurring, critical, fixed]
created: 2026-07-16
updated: 2026-07-16
status: fixed
severity: critical
sources: ["raw/recurring-transaction-monthofyear/recurring-transaction-monthofyear.md"]
related: ["plans/go-to-market", "architecture/system-architecture"]
---

# Bug: Yearly Recurring Transactions Ignore `monthOfYear`

Status: **fixed**
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

## Implemented Fix (PR #142)

### File: `src/store/useFinanceStore.ts` — `checkRecurring()`

**Fix 1 — Apply `monthOfYear` during target date computation** (lines 862-868):

After the existing day-of-month overflow guard, added:

```typescript
if (payload.frequency === 'yearly' && payload.monthOfYear != null) {
  const intendedMonth = payload.monthOfYear - 1;
  targetDate = targetDate.month(intendedMonth);
  if (targetDate.month() !== intendedMonth) {
    targetDate = dayjs(targetDate).date(1).month(intendedMonth).endOf('month');
  }
}
```

This sets the correct month after the day is applied, then handles day overflow in the new month (e.g., day 31 in a 30-day month snaps to end-of-month).

**Fix 2 — Auto-cleanup of existing wrong instances** (lines 826-842):

Added a one-time cleanup pass at the start of `checkRecurring()` that detects yearly-generated transactions whose date month doesn't match the template's `monthOfYear` and removes them. The subsequent generation loop then recreates them with the correct dates. The cleanup is persisted to Firestore even when no new transactions are generated.

**Migration**: The fix is transparent — it runs on the next `checkRecurring()` call (page reload or session start). Wrong instances are removed and correct ones generated automatically.

## Related

- [[wiki/plans/go-to-market]] — Phase 1.3 touched `lastGeneratedUpTo` persistence in recurring code
- [[wiki/architecture/system-architecture]] — recurring check flow in system architecture
- Source: [raw/recurring-transaction-monthofyear/recurring-transaction-monthofyear.md](raw/recurring-transaction-monthofyear/recurring-transaction-monthofyear.md)
