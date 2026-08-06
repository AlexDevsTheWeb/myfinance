# Implementation Plan — B-lite Scaling (issue #56)

**Status:** PLAN (2026-08-06)
**Related issue:** [#56](https://github.com/AlexDevsTheWeb/myfinance/issues/56)
**Scope:** Selected "B-lite" — 2 items now, remainder deferred to paid-tier launch.
**Branch:** `feat/YATF-56-blite` off `development` (development includes the merged #177 transactions write-back fix).

---

## Scope

**Do now (2 items):**
1. **Migrate `recurringTransactions[]` → subcollection** — closes the consistency gap left by the transactions migration; removes the second-largest array from the 1 MiB main doc.
2. **Enable Firestore offline persistence** — offline reads of already-synced data + queued writes (genuine day-to-day value for a mobile finance app).

**Defer to launch** (already tracked in go-to-market plan): virtualization/pagination, PWA service worker + installability, migrating categories/carMileage/budgetTargets (bounded by realistic use).

---

## Item 1 — Migrate recurringTransactions to subcollection

Mirrors the proven transactions migration (template: `transactions` subcollection). Consistent naming and approach.

### 1.1 Converter (`src/lib/converters.ts`)
Add a recurring doc interface + converter + refs mirroring the transaction ones:

```ts
export interface RecurringTransactionDoc {
  id: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  dayOfMonth: number;
  accountId: string;
  startDate: string;
  endDate: string | null;
  frequency: 'monthly' | 'yearly' | null;
  monthOfYear?: number | null;
  lastGeneratedUpTo?: string | null;
  cardId?: string | null;
}

export const recurringTransactionConverter: FirestoreDataConverter<RecurringTransactionDoc> = {
  toFirestore: (r) => ({ ...fields, nulls for optional }),
  fromFirestore: (snap, opts) => ({ ...fields with defaults }),
};

export function getRecurringDocRef(userId: string, id: string) {
  return doc(db, 'users', userId, 'recurringTransactions', id).withConverter(recurringTransactionConverter);
}
export function getRecurringTransactionsCollectionRef(userId: string) {
  return collection(db, 'users', userId, 'recurringTransactions').withConverter(recurringTransactionConverter);
}
```

### 1.2 Firestore rules (`firestore.rules`)
Add the recurring subcollection rule, matching the transactions rule:

```
match /users/{userId}/recurringTransactions/{recId} {
  allow read, write: if isOwner(userId);
  allow create: if isOwner(userId);
  allow delete: if isOwner(userId);
}
```

### 1.3 One-time backfill (`src/store/sync/index.ts`)
Add `backfillRecurringToSubCollection(userId)` mirroring `backfillTransactionsToSubCollection`:
- Read the raw `recurringTransactions` array from the main user doc via `runTransaction`/raw doc ref.
- Skip empty.
- For each recurring, `batch.set` to the recurring subcollection `doc(collRef, r.id)` with `sanitizeRecurring(r)` shape (or the recurring converter fields).
- Idempotent — the existing transaction backfill pattern already skips docs.
- Call it from the sync init path alongside the transaction backfill so **existing users** get migrated on next launch. New users get empty array → skip.

Primary writes now route to the subcollection; backfill guarantees migration for pre-existing data.

### 1.4 Read path — load recurring from the subcollection (`src/hooks/useSyncFinance.ts`)
- Add a second `onSnapshot` over `getRecurringsCollectionRef(user.uid)` (like the `txnsRef` snapshot at `useSyncFinance.ts:79`).
- Map docs → `recurringTransactions` sorted, then `setAll({ recurringTransactions })`.
- Guard with `hasPendingWrites`, run only after init; update `subColLoaded`/`hasCheckedRecurring` logic so `checkRecurring` still runs once when both doc + recurring subcollection are loaded.

### 1.5 Route all writes to the subcollection (`src/store/useFinanceStore.ts`)
Change every `updateDoc(docRef, { recurringTransactions: ... })` on the main doc to write the affected recurring docs to the subcollection:

| Method | Current (~line) | New behavior |
|--------|-----------------|--------------|
| `setRecurringTransactions` | :367 main-doc field | full overwrite via `writeBatch`/`runTransaction` |
| `_migrateToMultiAccount` | :492 main-doc | persist only changed recurring (missing accountId) |
| `renameCategory` | :553 | persist only matched changed recurring |
| `renameSubcategory` | :646 | persist only matched changed recurring |
| `deleteSubcategoryAndRemap` | :720 | persist only matched changed recurring |
| `moveSubcategory` | :776 | persist only matched changed recurring |
| `addRecurring` | :806 | `setDoc` the new recurring doc |
| `updateRecurring` | :835 | `setDoc` the updated recurring doc |
| `checkRecurring` | :1012-1017 | persist only changed recurring (via batch, same as transaction batch) |
| `deleteRecurring` | :1039 | `deleteDoc` the recurring doc |
| `importAllData` | :1398 main-doc + :1431 | write to subcollection via batch; state update unchanged |

Add a module-level helper `persistRecurringToSubcollection(userId, list)` (writeBatch, 400-op chunking) mirroring `persistTransactionsToSubcollection` added in #177.

### 1.6 Remove the deprecated field from writes / keep backfill reads
- The main-doc `recurringTransactions` field stays present only for legacy backfill reads; do **not** write it going forward.
- Keep `recurringTransactions` in `UserDoc`/converter **read path** for migration reads, with a deprecation note like the transactions/Brokerconfig fields. (Matches how transactions legacy field was kept until Phase D.)

---

## Item 2: Enable Firestore offline persistence

### 2.1 `src/lib/firebase.ts`
Use the modern v12 cache API so offline is on from the start:

```ts
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabSettings: persistentMultipleTabManager() }),
});
```

Replace `getFirestore(app)` with the above. `persistentMultipleTabManager` = IndexedDb cache + multi-tab safety (avoids the "another tab is open" persistence failure).

### 2.2 Verify behavior
- Offline: reads of already-synced collections (users doc, transactions, recurring, others) return cached data; writes queue via the SDK's offline write buffer.
- No code change needed for reads/writes — the SDK handles cache misses + pending writes.
- `onSnapshot` keeps working with `metadata.hasPendingWrites` checks (already handled in sync hooks).

### 2.3 Caveat
- First-ever load on a new device still requires network (no cache yet).
- Offline cache does **not** grant installability/asset caching — that stays in the PWA service-worker item (deferred).

---

## Order of work
1. converters (1.1) → rules (1.2) → backfill (1.3)
2. sync load from subcollection (1.4)
3. store write routing (1.5) + helper
4. offline persistence (2.1/2.2)
5. Cleanup: grep to confirm no main-doc `recurringTransactions:` writes remain
6. Build + lint + OKF verify
7. Use a real login to confirm recurring migration works end-to-end (backfill + snapshot)

## Verification
- `npm run build` clean; `npm run lint` no new issues.
- `firestore.rules` symlink/format: rules deploy manually by user (no infra in repo) — note in PR.
- Wiki: raw plan (this doc) → wiki plan page; feature/bug pages updated after implementation; log.md + indexes.

## Out of scope (deferred to launch)
- Transaction virtualization + server-side pagination
- PWA service worker / manifest installability
- categories / carMileage / budgetTargets subcollection migration