---
title: "checkRecurring generates duplicates alongside manually-added transactions"
tags: [bug, recurring, critical, fixed]
created: 2026-07-16
updated: 2026-07-16
status: fixed
severity: critical
sources: ["raw/recurring-duplicate-same-period/recurring-duplicate-same-period.md"]
related: ["wiki/bugs/recurring-transaction-monthofyear"]
---

# Bug: checkRecurring Generates Duplicates Alongside Manually-Added Transactions

Status: **fixed**
Severity: **critical**

## Symptom

After the sub-collection write fix (checkRecurring now persists to sub-collection), both monthly and yearly recurring templates generate duplicate transactions alongside manually-added ones. Exact duplicates: same date, description, category, amount, account.

## Reproduction

1. Have a recurring template for e.g. "Netflix — 15.99€" monthly
2. Manually add a transaction with the same description and amount for a given month
3. Reload the page — `checkRecurring()` generates an auto duplicate for that month
4. The duplicate persists across reloads (sub-collection write)

## Root Cause

`checkRecurring()`'s `existsInPeriod` dedup check in `src/store/useFinanceStore.ts` matches transactions by `recurringLinkId` only:

```typescript
const existsInPeriod = transactions.some(t => {
  if (t.recurringLinkId !== payload.id) return false;
  // date check...
});
```

Manually-added transactions from the CRUD form have `recurringLinkId: null`. The check skips them entirely, so the generation loop doesn't recognize a manual entry as covering the period.

Before the sub-collection fix (PR #145), these auto-generated duplicates vanished on page load (written to legacy dead field). Now they persist permanently.

## Fix

Broadened `existsInPeriod` in `src/store/useFinanceStore.ts:889` to also match transactions with the same `description` and `amount` in the same period, regardless of `recurringLinkId`:

```typescript
const existsInPeriod = transactions.some(t => {
  if (t.recurringLinkId === payload.id) {
    if (payload.frequency === 'yearly') {
      return dayjs(t.date).year() === targetDate.year();
    }
    return dayjs(t.date).isSame(targetDate, 'month');
  }
  if (t.description === payload.description && Math.abs(t.amount) === Math.abs(payload.amount)) {
    if (payload.frequency === 'yearly') {
      return dayjs(t.date).year() === targetDate.year();
    }
    return dayjs(t.date).isSame(targetDate, 'month');
  }
  return false;
});
```

## Tradeoff

Two manually-added transactions with same description and amount but different categories in the same month would suppress auto-generation for that period. In practice, this is unlikely — same description + amount + period almost always means a genuine manual entry.

## Related

- [[wiki/bugs/recurring-transaction-monthofyear]] — the sub-collection write fix that exposed this
- Issue [#146](https://github.com/AlexDevsTheWeb/myfinance/issues/146)
- Source: [raw/recurring-duplicate-same-period/recurring-duplicate-same-period.md](raw/recurring-duplicate-same-period/recurring-duplicate-same-period.md)
