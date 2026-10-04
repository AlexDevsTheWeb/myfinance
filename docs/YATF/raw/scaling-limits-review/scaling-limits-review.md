# Scaling Limits Review — Issue #56 Validity Check + transactions[] write-back regression fix

**Status:** ANALYZED + PARTIALLY FIXED (2026-08-06)
**Related issue:** [#56](https://github.com/AlexDevsTheWeb/myfinance/issues/56)
**Related decisions:** [firestore-rate-limiting](../../wiki/decisions/firestore-rate-limiting.md), [saas-readiness](../saas-readiness/saas-readiness.md)
**Related concerns:** [CONCERNS.md](../codebase/CONCERNS.md)

---

## Summary

Re-validated issue #56 "[SCALING] Scaling limits" against the current codebase. The issue has 3 sub-concerns. A **new regression** was found inside concern 1: several store actions still write the full `transactions` array back to the legacy `transactions` field on the main `users/{uid}` doc — dead data that re-bloats the doc toward the 1 MiB Firestore limit and never reaches the subcollection.

## Concern-by-concern validity

### 1. Firestore 1 MiB document limit — PARTIALLY ADDRESSED (+ regression now fixed)

**Already migrated (good):**
- Transactions → `users/{uid}/transactions` subcollection. Rules: `firestore.rules:34-38`; refs in `src/lib/converters.ts:61-67`; idempotent backfill `backfillTransactionsToSubCollection()` in `src/store/sync/index.ts:56-100`.
- `portfolio_history` → subcollection with server-side pagination `limit(365)` (`src/store/useInvestmentStore.ts:405-407`).
- Reads of transactions now come exclusively from the subcollection (`onSnapshot(txnsRef)` in `src/hooks/useSyncFinance.ts:79-115`). `UserDoc` (`src/lib/converters.ts:80-104`) no longer has a `transactions` field.

**Regression (fixed in this pass):**
- 5 actions still did `updateDoc(docRef, { ..., transactions: <full array>, ... })`:
  - `_migrateToMultiAccount` (`useFinanceStore.ts:471`)
  - `renameCategory` (`:530`)
  - `renameSubcategory` (`:620`)
  - `deleteSubcategoryAndRemap` (`:691`)
  - `moveSubcategory` (`:744`)
- Impact: re-creates the bloated `transactions[]` array field in the main user doc (1 MiB limit risk, write amplification) AND the rename/move/remap never reached the subcollection — so renames would be silently lost on reload.
- **Fix:** each action now computes only the `changedTransactions` (the subset matching the rename/remap predicate) and persists them to the subcollection via a new module-level helper `persistTransactionsToSubcollection()` (`writeBatch`, chunked at 400 ops). The main-doc `updateDoc` no longer includes `transactions`.

**Still open for concern 1:**
- Unbounded arrays still on the main doc: `recurringTransactions[]`, `categories[]`, `carMileage[]`, `budgetTargets[]`.
- No server-side pagination for transactions (`onSnapshot` loads all docs; client-side `.slice()` only).

### 2. In-memory state — STILL VALID

- All transactional data loaded fully into Zustand (`useSyncFinance.ts:79-115` `setAll({ transactions: deduped })`).
- `TransactionsPage.tsx:108-111` uses client-side `slice()` only; `TransactionTable.tsx:74-133` plain MUI table, no virtualization.
- No lazy loading / infinite scroll anywhere.

### 3. No offline support — STILL VALID

- No service worker / PWA plugin (`vite.config.ts` plugins = `[react()]` only).
- No Firestore offline persistence (`src/lib/firebase.ts:26` `getFirestore(app)` bare).
- `site.webmanifest` exists but no `sw.js`; `pwa-strategy` decision documented, unimplemented.

## Issue #56 overall status

- **Concern 1:** largely addressed (transactions subcollected) — remaining risk is non-transaction arrays + missing pagination.
- **Concern 2 & 3:** still open.
- **Verdict:** issue stays open; the worst case (1 MiB transactions array regression) is now fixed.

## Files Modified

- `src/store/useFinanceStore.ts` — `persistTransactionsToSubcollection()` helper + fixed `_migrateToMultiAccount`, `renameCategory`, `renameSubcategory`, `deleteSubcategoryAndRemap`, `moveSubcategory`.

## Verification

- `npm run build` clean.
- `npm run lint` — no new issues (same pre-existing 19 problems before/after).
- OKF check passes.

## Related

- `wiki/decisions/firestore-rate-limiting.md` — sibling scaling/abuse analysis
- `wiki/plans/go-to-market.md` — launch track for remaining scale work
- `wiki/architecture/concerns-and-tech-debt.md` — Firestore write pattern / rules validation notes
