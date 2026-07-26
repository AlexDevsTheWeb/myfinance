## Why

MyFinance is approaching beta launch (#138 Phase 0: ✅). Before sharing the app with real users, three data integrity issues must be fixed: transactions stored as an array in a single Firestore doc (1 MiB limit, full rewrites, no pagination), PAC automation state only in localStorage (lost on browser clear, no cross-device sync), and a race condition in `checkRecurring()` that can generate duplicate recurring transactions.

## What Changes

- Migrate transactions from `users/{uid}` array field to `users/{uid}/transactions/{txnId}` sub-collection with dual-write migration, backfill script, and legacy removal
- Move PAC state (`pendingPacTransaction`, `lastPacGenerationDate`, per-broker tracking) from localStorage + Zustand memory to Firestore `pacState` field
- Fix recurring transaction race condition with Firestore-side dedup (`lastGeneratedUpTo`), session debounce, and timestamp-based cooldown

## Capabilities

### New Capabilities

- `transaction-sub-collection`: Migrate transactions from array field to Firestore sub-collection with dual-write migration path
- `pac-state-persistence`: Persist PAC automation state to Firestore instead of localStorage
- `recurring-dedup`: Firestore-side dedup + session debounce for `checkRecurring()` race condition

### Modified Capabilities

*(none — requirements are new, not modifications to existing capabilities)*

## Impact

- `src/store/useFinanceStore.ts` — rewrite `addTransaction`, `updateTransaction`, `deleteTransaction`; update `checkRecurring`
- `src/store/useInvestmentStore.ts` — persist `pacState`; update `confirmPacTransaction`
- `src/hooks/usePacAutomation.ts` — read/write Firestore instead of localStorage
- `src/hooks/useSyncFinance.ts` — add sub-collection listener for transactions
- `src/lib/converters.ts` — add `TransactionDoc`, `PacState` types; remove legacy `transactions` array
- `src/store/types/finance.types.ts` — add `lastGeneratedUpTo` to `IRecurringTransaction`
- `firestore.rules` — add rules for `transactions` sub-collection
- New: one-time migration script (array → sub-collection backfill)

## Non-goals

- NOT adding pagination to transactions (becomes trivial after sub-collection but out of scope)
- NOT splitting the single user doc into multiple docs (sub-collections only for transactions)
- NOT adding cross-device testing infrastructure
- NOT adding tests for existing transaction code
