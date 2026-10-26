# Feature Analysis — Account deletion (users can't delete their own account/data)

**Status:** IMPLEMENTED (analyzed and resolved on 2026-08-06)
**Severity:** medium
**Related issue:** [#158](https://github.com/AlexDevsTheWeb/myfinance/issues/158)
**Related feature:** [new-user-auth-flow](../../new-user-auth-flow/new-user-auth-flow.md), [backup-restore-gaps](../../101-backup-restore-gaps/101-backup-restore-gaps.md)

---

## Summary

There is **no functionality for users to delete their own account or data**. Once a user registers via Google Auth (or email/password), there's no way to:
1. Delete their Firestore document (`users/{uid}`)
2. Clean up subcollection data (transactions, portfolio_history)
3. Unregister from Firebase Auth

**Impact:** orphaned Firestore data accumulates if users are removed from the Firebase Auth console; no GDPR compliance path (right to erasure); users who want to reset or leave the app have no option.

## Current Data Model

The Firestore schema for a user is:

- **`users/{uid}`** — the main user document. Most domain data lives here **inline** as array fields:
  `initialBalance`, `categories`, `incomeCategories`, `accounts`, `cards`, `recurringTransactions`, `carMileage`, `carInitialMileage`, `tireSettings`, `tireChanges`, `enabledModules`, `balanceStartDate`, `deletedRecurringInstances`, `etfTransactions`, `portfolioSnapshots`, `brokerAccounts`, `assetHoldings`, `cashAdjustments`, `dividendEntries`, `budgetTargets`, `pacState`, legacy `brokerConfig`.
- **`users/{uid}/transactions/{txnId}`** — subcollection of transaction documents (moved to subcollection in a prior refactor; converter in `src/lib/converters.ts`).
- **`users/{uid}/portfolio_history/{id}`** — subcollection of daily portfolio snapshots (written by `useHistoricalSnapshots.ts` / `recordPortfolioSnapshot`).

## Root Cause Analysis (gap)

### No deletion path anywhere

There is **no UI, no API, no mechanism** for account deletion:
- No "Delete Account" button in ConfigPage or anywhere in the layout.
- `useAuthStore` only tracks `user` / `loading` / `isLoggingOut` — no deletion state.
- No Firestore bulk-delete helper exists; subcollection cleanup was never considered.
- `deleteUser()` from Firebase Auth is never imported anywhere in the codebase.

### Why deletion is non-trivial here

1. **Subcollections must be deleted first.** Firestore does NOT cascade-delete: deleting `users/{uid}` does not remove `transactions` or `portfolio_history` subcollection documents. A bulk delete must explicitly iterate both subcollections.
2. **Auth account removal requires recent login.** Firebase's `deleteUser()` throws `auth/requires-recent-login` if the user signed in too long ago. We must re-authenticate first (`reauthenticateWithPopup` for Google, `reauthenticateWithCredential` + `EmailAuthProvider` for email/password).
3. **Ordering matters.** Best order: (a) re-authenticate, (b) delete subcollection docs, (c) delete `users/{uid}`, (d) `deleteUser()`, (e) clear client state + navigate to login. Deleting the auth account first would revoke the Firestore token and break the bulk delete.
4. **Local state cleanup.** The stores hold in-memory data; after deletion we must reset them and remove any `finance-storage-{uid}` localStorage so a subsequent login doesn't show ghost data.

## Proposed Fix / Resolution

1. **Add a `deleteUserAccount()` helper** (`src/lib/deleteAccount.ts`) that:
   - Re-authenticates via the user's provider (Google popup or email/password credential).
   - Bulk-deletes `users/{uid}/transactions` and `users/{uid}/portfolio_history`.
   - Deletes `users/{uid}`.
   - Calls `deleteUser(auth.currentUser)`.
   - Returns errors for UI display.
2. **Add a "Delete Account" section in ConfigPage** (danger zone in the General tab) with:
   - A confirmation dialog requiring the user to confirm (typed email or explicit double-confirm).
   - Progress/loading state and error/success `AlertSnackbar` feedback (consistent with the rest of the app).
3. **i18n keys** in `en.json` / `it.json` for the section title, warning text, confirm dialog, and success/error messages.
4. **Client cleanup** — after successful deletion, reset the finance/investment/budget stores and navigate to `/`.

## Files Modified

- `src/lib/deleteAccount.ts` — NEW: `deleteUserAccount()` orchestrator (reauth → subcollections → user doc → auth).
- `src/pages/ConfigPage.tsx` — "Delete Account" danger zone + confirm dialog + snackbar wiring.
- `src/locales/en.json`, `src/locales/it.json` — `config.deleteAccount.*` keys.
- (if needed) store reset hooks for post-deletion cleanup.

## Verification

- `npm run build` clean; `npm run lint` no new issues.
- Manual: on ConfigPage → General tab → Delete Account → confirm → account + all data removed from Firestore; user signed out and redirected to login; re-login shows a fresh empty workspace.
- Confirm `auth/requires-recent-login` path: log in via Google, wait past the recent-login window, attempt delete → re-auth popup → deletion proceeds.

## Related

- [new-user-auth-flow](../../new-user-auth-flow/new-user-auth-flow.md) — Google auth registration flow and data isolation
- [101-backup-restore-gaps](../../101-backup-restore-gaps/101-backup-restore-gaps.md) — related data-coverage work (backup/restore scope)
- `src/lib/converters.ts` — transaction/user doc converters, subcollection paths
