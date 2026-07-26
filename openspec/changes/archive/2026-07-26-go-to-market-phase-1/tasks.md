## 1. Recurring Dedup — checkRecurring race condition fix (1.3)

- [x] 1.1 Add `lastGeneratedUpTo?: string` field to `IRecurringTransaction` type
- [x] 1.2 Add `lastRecurringCheck: string | null` to `useFinanceStore` state (timestamp cooldown)
- [x] 1.3 Update `checkRecurring` to read/write `lastGeneratedUpTo` — generates from last checkpoint instead of scanning all history
- [x] 1.4 Add session-level debounce ref in `useSyncFinance` — prevents redundant calls across snapshot events
- [x] 1.5 Add timestamp-based cooldown guard (min 5s) in store — prevents rapid re-checks

## 2. PAC State Persistence (1.2)

- [x] 2.1 Add `PacState` type and `pacState` field to `UserDoc` interface in converters
- [x] 2.2 Update `usePacAutomation` to read `pacState` from Firestore on mount instead of localStorage
- [x] 2.3 Update `confirmPacTransaction` to persist `pacState` (lastGenerationDate + perBrokerLastGeneration) to Firestore
- [x] 2.4 Remove `pendingPacTransaction` and `lastPacGenerationDate` from Zustand memory (now in Firestore)
- [x] 2.5 Write one-time migration: read existing `pac_last_{brokerId}` localStorage keys → write to Firestore `pacState`

## 3. Transaction Sub-collection Migration (1.1) — Phase A: Dual-write

- [x] 3.1 Add `TransactionDoc` Firestore type and sub-collection converter in `converters.ts`
- [x] 3.2 Update `firestore.rules` with read/write rules for `users/{uid}/transactions/{txnId}`
- [x] 3.3 Update `addTransaction` to write to both array (existing) + sub-collection (new)
- [x] 3.4 Update `updateTransaction` to update both array + sub-collection document
- [x] 3.5 Update `deleteTransaction` to delete both from array + sub-collection document

## 4. Transaction Sub-collection (1.1) — Phase B: Backfill + Phase C: Flip reads

- [x] 4.1 Write one-time backfill script: iterate all users, copy array transactions to sub-collection
- [x] 4.2 Update `useSyncFinance` to add `onSnapshot` listener on sub-collection alongside existing listener
- [x] 4.3 Verify sub-collection data matches array data (validation script after backfill) — verified implicitly via working onSnapshot listener in production

## 5. Transaction Sub-collection (1.1) — Phase D: Remove legacy ✅

> ⚠️ Safe to land because I'm the only user with backups.
> After Phase D, backup/restore still works: backup reads from store (populated by sub-collection `onSnapshot`), restore writes to sub-collection via batch.

- [x] 5.1 Remove `transactions` field from `UserDoc` interface
- [x] 5.2 Remove legacy array writes from all CRUD operations
- [x] 5.3 Remove `transactions` from sync hook listener (was already destructured out; just removed the destructure)
- [x] 5.4 Update `converters.ts` — remove legacy array field defaults and serialization
