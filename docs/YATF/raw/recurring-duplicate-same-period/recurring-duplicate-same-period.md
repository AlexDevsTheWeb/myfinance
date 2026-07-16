# Duplicate recurring transactions generated alongside manually-added entries

## Symptom
After the sub-collection write fix (checkRecurring now persists to sub-collection), both monthly and yearly recurring templates generate duplicate transactions alongside manually-added ones. Exact duplicates: same date, description, category, amount, same account.

## Root Cause
`checkRecurring()` has a dedup check `existsInPeriod` that only matches by `recurringLinkId`:

```typescript
const existsInPeriod = transactions.some(t => {
  if (t.recurringLinkId !== payload.id) return false;
  // date check...
});
```

Manually-added transactions from the CRUD form have `recurringLinkId: null`. The dedup check skips them entirely. So if a user manually added "Netflix — 15.99€" in July, `checkRecurring()` doesn't recognize it and generates an auto transaction for July on top of it.

Before the sub-collection fix, these auto-generated duplicates would disappear on page reload (written to dead field). Now they persist in the sub-collection, making them permanent.

## Fix
Broaden `existsInPeriod` to match either:
1. Same `recurringLinkId` (existing check), OR
2. Same `description` + `amount` in the same period (for manual transactions)

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
Two manually-added transactions with same description and amount but different categories in the same month would prevent auto-generation for that period. In practice, this is unlikely — same description + amount + period almost always means a genuine manual entry of what the template was supposed to generate.

## Related
- Issue [#146](https://github.com/AlexDevsTheWeb/myfinance/issues/146)
- Previous fix: recurring-transaction-monthofyear (sub-collection write fix exposed this)
