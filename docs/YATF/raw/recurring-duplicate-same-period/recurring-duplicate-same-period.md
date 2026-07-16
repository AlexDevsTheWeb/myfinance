# Duplicate recurring transactions (5+ copies with same recurringLinkId + date)

## Symptom
After the sub-collection write fix (checkRecurring now persists to sub-collection), both monthly and yearly recurring templates accumulate duplicates on every page load. Over time, 5+ copies of the same transaction appear (same date, description, amount, recurringLinkId — different document IDs).

## Reproduction
1. Have any recurring transaction template (monthly or yearly)
2. Reload the page 5 times
3. Each reload generates a new copy of the same transactions with a new `crypto.randomUUID()` ID
4. Results in 5+ identical transactions per period

## Root Cause
**Timing race condition** between Firestore `onSnapshot` listeners:

1. UserDoc `onSnapshot` fires → calls `checkRecurring()` (guarded by `hasCheckedRecurring`)
2. Sub-collection `onSnapshot` may not have fired yet → `state.transactions = []`
3. `existsInPeriod` finds nothing (empty array) → generates new transactions for every period
4. `set()` updates store with newly generated transactions
5. Sub-collection `onSnapshot` finally fires → `setAll({ transactions: sorted })` **overwrites** store with sub-collection data (doesn't include the just-generated txs)
6. Batch write reads `getState().transactions` → gets the overwritten data → writes nothing new
7. Generated transactions are **lost** — never persisted to Firestore
8. Next page load: same cycle repeats → new `crypto.randomUUID()` IDs → duplicates accumulate

Before the sub-collection write fix, these were invisible (written to dead `UserDoc.transactions` field). The sub-collection fix exposed the pre-existing bug.

## Fix

### Fix 1 — Timing guard (`useSyncFinance.ts`)
`checkRecurring()` now only fires when **both** `hasLoaded.current` (UserDoc snapshot) AND `subColLoaded.current` (sub-collection snapshot) are true. Both `onSnapshot` handlers can trigger it — the one that fires second sees both flags are true and runs the check.

### Fix 2 — Dedup cleanup (`useFinanceStore.ts`)
Before the generation loop, deduplicates the `transactions` array by grouping by `recurringLinkId|date`. Extra copies are dropped and `hasCleanup = true` triggers a batch write that removes them from the sub-collection.

## Related
- Issue [#146](https://github.com/AlexDevsTheWeb/myfinance/issues/146)
- Previous fix: recurring-transaction-monthofyear (sub-collection write fix exposed this)
- Race condition in `useSyncFinance.ts:68-70` — `checkRecurring()` called before sub-collection data available
