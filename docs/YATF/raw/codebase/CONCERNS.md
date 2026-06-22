# Codebase Concerns

**Analysis Date:** 2026-06-22

## Tech Debt

### Monolithic Zustand Store

- **Issue:** The `src/store/useFinanceStore.ts` file is **1,231 lines** — a single Zustand store handling ALL state (transactions, accounts, categories, recurring, car mileage, tires, modules, language, backup). Every action is an `async` method that optimistically updates local state then writes to Firestore. This makes the file extremely difficult to maintain, test, and reason about.
- **Files:** `src/store/useFinanceStore.ts` (entire file)
- **Impact:** Any change risks breaking unrelated features. Adding a new domain entity requires touching this single file. Reusability is zero. Testing is impractical at this size.
- **Fix approach:** Split into domain-specific stores (e.g., `useTransactionStore`, `useAccountStore`, `useRecurringStore`, `useCarStore`, `useConfigStore`) using Zustand's slice pattern or separate `create()` calls. Keep cross-domain coordination in a thin orchestration layer.

### Boilerplate Duplication — Every Action Follows Identical Pattern

- **Issue:** All ~30 async store actions follow the exact same boilerplate:
  1. Get `userId` from `useAuthStore.getState()`
  2. `set({ saveError: null, isSaving: true })`
  3. Mutate local state via `set()`
  4. Write to Firestore `doc(db, 'users', userId)` via `updateDoc`
  5. `catch` → `set({ saveError: errorMessage, isSaving: false })` and `console.error`
  
  This is copy-pasted 30+ times, creating ~600 lines of repetitive error handling.
- **Files:** `src/store/useFinanceStore.ts` (every async action)
- **Impact:** High maintenance cost. If the save pattern changes (e.g., adding retry logic, batch writes), all 30+ actions need updating. Inconsistent rollback handling — some actions revert local state on error, others don't.
- **Fix approach:** Extract a generic `withFirestore` helper that wraps the pattern: `withFirestore(userId, set, async () => { /* optimistic update */, /* firestore write */ })`.

### Redundant Duplicate Sanitization Logic

- **Issue:** Transaction/recurring sanitization is implemented in three separate places with slightly different field handling:
  - `src/store/sanitization/transaction.ts` — sanitizeTransaction()
  - `src/store/sanitization/recurring.ts` — sanitizeRecurring()
  - `src/lib/converters.ts` — `toFirestore()` method on `userDocConverter`
  
  The converter is supposed to handle Firestore serialization, but the store actions also manually sanitize before calling `updateDoc`. This double-sanitization is redundant and a source of drift.
- **Files:**
  - `src/store/sanitization/transaction.ts`
  - `src/store/sanitization/recurring.ts`
  - `src/lib/converters.ts` (lines 23-63)
- **Impact:** If a field mapping changes in one place but not the others, data can be silently corrupted on save.
- **Fix approach:** Remove standalone sanitization functions; rely solely on the Firestore converter's `toFirestore()`. The store should pass raw typed objects to Firestore.

### Dead/Commented-Out Code

- **Issue:** `src/components/dashboard/RecapCards.tsx` contains ~70 lines of commented-out JSX (lines 199-270) — an old accounts detail implementation that was replaced but never removed.
- **Files:** `src/components/dashboard/RecapCards.tsx` (lines 199-270)
- **Impact:** Code clutter. Misleading for new developers.
- **Fix approach:** Remove dead code.

### Unused Variable

- **Issue:** `src/pages/CarPage.tsx` line 283-287: `handleEditTireChange` function is declared but never used (suppressed with `@typescript-eslint/no-unused-vars`).
- **Files:** `src/pages/CarPage.tsx` (line 285)
- **Impact:** Minimal, but indicates incomplete feature — tire change editing is not wired up in the UI.
- **Fix approach:** Either wire up edit functionality or remove the function.

### Redundant Type Re-exports

- **Issue:** `src/store/useFinanceStore.ts` re-exports all types with backward-compatible aliases (e.g., `export type Category = Types.ICategory`), re-exports validation functions, and sanitization namespace. This creates a circular-looking dependency where types are re-exported from the store barrel.
- **Files:** `src/store/useFinanceStore.ts` (lines 13-34)
- **Impact:** Import confusion — components can import `Transaction` from either the store or the types module. Inconsistent import patterns.
- **Fix approach:** Remove backward-compatible aliases after verifying no external code depends on them.

### `useSyncFinance` onSnapshot Doesn't Handle Optimistic Updates Well

- **Issue:** `src/hooks/useSyncFinance.ts` checks `doc.metadata.hasPendingWrites` and `storeState.isSaving` / `storeState.hasLocalChanges` to avoid overwriting optimistic local state. But if the user has multiple tabs open, a save on tab A will NOT trigger `hasPendingWrites` on tab B's listener, causing tab B to overwrite tab A's changes.
- **Files:** `src/hooks/useSyncFinance.ts` (lines 47-61)
- **Impact:** Multi-tab usage can cause data loss.
- **Fix approach:** Implement a proper last-write-wins strategy using server timestamps, or a version counter field on the document.

### `_migrateToMultiAccount` Runs on Every App Mount

- **Issue:** `src/App.tsx` line 45 calls `_migrateToMultiAccount()` in a `useEffect` on every mount. This migration was meant to be a one-time data migration, but it runs unconditionally. The function itself checks `needsMigration` (transactions without accountId), but the fact it runs on every app start is wasteful.
- **Files:**
  - `src/App.tsx` (line 45)
  - `src/store/useFinanceStore.ts` (lines 419-464)
- **Impact:** Unnecessary Firestore read + write on every page load for existing users. Migration code permanently lives in the store.
- **Fix approach:** Remove the `useEffect` call and the migration function after confirming all users have been migrated. Or gate behind a flag in Firestore.

### Large Component Files

- **Issue:** Several page/component files exceed 400 lines:
  - `src/pages/ConfigPage.tsx` — 897 lines
  - `src/pages/CarPage.tsx` — 679 lines
  - `src/components/layout/Layout.tsx` — 425 lines
- **Impact:** Hard to read, test, and maintain. ConfigPage handles 6 tabs of logic in one component.
- **Fix approach:** Split ConfigPage into tab-specific sub-components. Extract CarPage's tire/mileage/fuel logic into custom hooks.

---

## Known Bugs

### Data Loss on Category Deletion When Subcategories Exist

- **Issue:** `deleteCategory` silently returns the current state without saving when the category has subcategories (`if (cat && cat.subcategories.length > 0) return state;`). This leaves `isSaving: true` stuck — the UI will show a perpetual saving state. The UI-level guard in ConfigPage prevents this via an `alert()`, but calling `deleteCategory` programmatically or via API would cause stuck state.
- **Files:** `src/store/useFinanceStore.ts` (lines 530-534)
- **Trigger:** Programmatic call to `deleteCategory('expense', 'Casa')` (which has subcategories).
- **Workaround:** Delete all subcategories first.
- **Severity:** Medium — state gets stuck in `isSaving: true`.

### No Error Handling for Array Update Conflicts

- **Issue:** The store uses `arrayUnion()` for adding items (accounts, categories, car mileage) but uses full-array replacement for other operations. With Firestore, `arrayUnion` can cause duplicate entries if called concurrently (e.g., rapid double-click on "Add Account"). Most mutations use `updateDoc` which is NOT transactional — two concurrent saves can overwrite each other.
- **Files:** `src/store/useFinanceStore.ts` (multiple actions using `updateDoc`)
- **Trigger:** Rapid UI interactions or multi-tab usage.
- **Workaround:** None.
- **Severity:** Medium — data loss possible under race conditions.

### Firestore Doc Size Limit Risk

- **Issue:** All user data is stored in a single Firestore document (`users/{userId}`). Firestore has a **1 MiB document size limit**. As transactions grow, this will eventually be exceeded. No warning, pagination, or partition mechanism exists.
- **Files:** `src/hooks/useSyncFinance.ts`, `src/store/useFinanceStore.ts` (all writes go to single doc)
- **Trigger:** Heavy transaction history (thousands of entries with descriptions, amounts, etc.).
- **Workaround:** Not possible within current architecture.
- **Severity:** Critical — the app will silently fail to save once the limit is reached.

### Deleting Account Doesn't Clean Up Related Transactions

- **Issue:** `deleteAccount` removes the account from the accounts array but does NOT update or remove transactions that reference that `accountId`. This creates orphaned transactions pointing to a deleted account.
- **Files:** `src/store/useFinanceStore.ts` (lines 940-958)
- **Trigger:** Delete an account that has associated transactions.
- **Workaround:** Manually reassign or delete transactions first.
- **Severity:** Medium — UI will show transactions with no matching account name.

---

## Security Considerations

### Environment Variable Validation Crash

- **Issue:** `src/utils/variables.utils.tsx` throws a hard error on `import.meta.env[name]` being undefined. This is called at module scope in `src/lib/firebase.ts` for ALL Firebase config variables. If even one env var is missing (e.g., `VITE_FIREBASE_MEASUREMENT_ID`), the entire app fails to load with a blank white screen.
- **Files:**
  - `src/utils/variables.utils.tsx`
  - `src/lib/firebase.ts` (lines 6-12)
  - `src/pages/LoginPage.tsx` (line 34 — also calls `getEnvVar` at render time for `VITE_REACT_APP_TITLE`)
- **Current mitigation:** None — the app throws at module evaluation time.
- **Recommendations:** Use graceful fallbacks for non-critical variables (like `measurementId`). Show a user-friendly error screen instead of crashing. Validate env var requirements at build time, not runtime.

### No Input Sanitization Beyond Basic Type Checks

- **Issue:** Transaction descriptions, category names, subcategory names, and account names are accepted as-is with only `.trim()` validation. No length limits, no special character filtering. While this is a single-user app, imported backup files could contain malicious payloads.
- **Files:** `src/store/validation/finance.validation.ts`
- **Current mitigation:** Only validates non-empty + type checks.
- **Recommendations:** Add max-length constraints to string fields (e.g., description max 200 chars). Sanitize imported data to prevent XSS if data is ever rendered unsafely.

### Firestore Rules Only Protect at Document Level

- **Issue:** `firestore.rules` allows read/write on `/users/{userId}` only if `request.auth.uid == userId`. This is correct for single-user-per-document, but there is no validation of the DATA being written (no field-level validation rules, no size limits, no timestamp checks).
- **Files:** `firestore.rules`
- **Current mitigation:** Basic auth-only access control.
- **Recommendations:** Add Firestore rules to validate data shape on write (e.g., `request.resource.data.transactions is list`, `request.resource.data.size() < 1000000`).

---

## Performance Bottlenecks

### Full-Array Filtering Every Render

- **Issue:** Analytics hooks (`useNetWorth`, `useCategoryBreakdown`, `useAccountBreakdown`, `useMonthlyComparison`) filter and reduce the entire `transactions` array on every render when inputs change. The DashboardPage's `useMemo` in `accountsDetail` (line 26-51) filters transactions by account, sorts, and computes running balances — all repeated computation.
- **Files:**
  - `src/analytics/hooks/useNetWorth.ts`
  - `src/analytics/hooks/useCategoryBreakdown.ts`
  - `src/analytics/hooks/useAccountBreakdown.ts`
  - `src/pages/DashboardPage.tsx` (lines 26-51)
- **Cause:** No memoization of filtered subsets. Every filter re-scan the full array.
- **Improvement path:** Derive indexed lookups (by date, by accountId) alongside the raw transactions array. Use `useMemo` with specific dependencies. Consider a Materialized View pattern or pre-computed aggregates.

### `checkRecurring` O(n*m) with 1000-Iteration Safety Counter

- **Issue:** `checkRecurring()` loops through ALL recurring transactions, and for each, iterates month-by-month from `balanceStartDate` to today — up to hundreds of iterations per recurring template. It has a `safetyCounter` that breaks at 1000, meaning worst case is `recurringCount × 1000` iterations, all computing dayjs operations, filtering deleted instances, and checking existing transactions.
- **Files:** `src/store/useFinanceStore.ts` (lines 796-882)
- **Cause:** No memoization of which months have already been generated. Full recomputation every time.
- **Improvement path:** Track the last-checked date per recurring template. Only generate transactions after that date. Store a `lastGeneratedDate` field on each recurring template.

### Charts Component Rebuilds emptyYear Object on Every Render

- **Issue:** `src/components/dashboard/Charts.tsx` creates `emptyYear` object at render level (not memoized). Though it uses `useFinanceStore` which returns stable references, the `emptyYear` is a new object every render.
- **Files:** `src/components/dashboard/Charts.tsx` (lines 10-23)
- **Cause:** `emptyYear` is not wrapped in `useMemo`.
- **Improvement path:** Memoize with `useMemo(() => { ... }, [])`.

### Date Formatting on Every Table Render

- **Issue:** `TransactionTable` calls `dayjs(t.date).format('LL')` for every row on every render. With hundreds of transactions, this creates significant GC pressure.
- **Files:** `src/components/dashboard/TransactionTable.tsx` (line 92)
- **Cause:** No pre-formatting of dates.
- **Improvement path:** Format dates once when adding transactions, or use a memoized date formatter.

---

## Fragile Areas

### Recurring Transaction Engine

- **Why fragile:** The `checkRecurring` logic (`src/store/useFinanceStore.ts` lines 796-882) is complex date arithmetic with multiple edge cases (yearly frequency, month boundary handling, deletedInstances array, duplicate prevention). The safety counter at 1000 iterations is a hack — if a user has many recurring templates over many years, this could timeout or produce incorrect results. The function is called from three places: `useSyncFinance` onSnapshot, and after add/update recurring. There's no way to preview what transactions will be generated before they're saved.
- **Files:** `src/store/useFinanceStore.ts` (lines 796-882)
- **Safe modification:** Add unit tests for date boundary conditions before modifying. Extract into a pure function `generateRecurringTransactions(state, untilDate)`.
- **Test coverage:** Zero — no tests exist in the project.

### Date Handling Spread Across 25+ Files

- **Why fragile:** All date comparisons use `dayjs()` scattered across the codebase. There's no centralized date utility. Different components use different formats (`'YYYY-MM-DD'`, `'LL'`, `'YYYY-MM'`, `unix()` timestamps). The `balanceStartDate` is a string stored in multiple representations.
- **Files:** 25+ files across `src/pages/`, `src/components/`, `src/hooks/`, `src/store/`, `src/analytics/`
- **Safe modification:** Create a `src/lib/dates.ts` utility with standardized helpers (`formatDate`, `toDayjs`, `isSameMonth`, etc.) and migrate all callers.
- **Test coverage:** Zero.

### Import/Backup Data Overwrites Without Merge

- **Why fragile:** `importAllData` completely replaces ALL Firestore fields with the imported data. There is no merge strategy, no conflict resolution, no undo. A mistaken import can permanently erase all current data. The backup format has two version formats (v1 `{ version, data }` and legacy `{ state }`), adding complexity.
- **Files:** `src/store/useFinanceStore.ts` (lines 1150-1225), `src/store/backup/index.ts`
- **Safe modification:** Add a "merge" mode that appends/overlays rather than replaces. At minimum, confirm the user understands this is destructive.
- **Test coverage:** Zero.

### Firestore Timestamp/Null Handling Discrepancies

- **Why fragile:** The `userDocConverter.toFirestore()` converts `undefined` to `null` for Firestore (which doesn't support `undefined`), but `fromFirestore()` reads `null` back as `undefined` or empty string. The sanitization functions also handle null differently. This mismatch could cause data corruption if a field is `undefined` in the store but `null` in Firestore.
- **Files:**
  - `src/lib/converters.ts` (both `toFirestore` and `fromFirestore`)
  - `src/store/sanitization/transaction.ts`
- **Safe modification:** Standardize on `null` for "no value" throughout the app, and ensure both directions handle it consistently.

---

## Scaling Limits

### Single-Document Firestore Architecture

- **Current capacity:** ~400-800 KiB for a moderate user with 3-5 years of transactions (estimated ~3000-5000 transactions).
- **Limit:** Firestore's **1 MiB per document** hard cap. Once the user hits this, all writes will fail silently. There is no monitoring or warning.
- **Scaling path:** As a short-term fix, store transactions in a Firestore subcollection (`users/{userId}/transactions`). Long-term, consider Sharded timestamps or monthly document partitions.
- **Affected files:** All files that read/write `db` — essentially the entire data layer.

### No Pagination for Firestore Reads

- **Current behavior:** The sync hook (`useSyncFinance`) loads the ENTIRE user document into memory via `onSnapshot`. This includes all transactions, all recurring templates, all accounts, etc. As the document grows, memory usage grows linearly.
- **Limit:** Browser memory for a single JS object. With 1 MiB of data plus React re-render overhead, this could cause jank on slow devices.
- **Scaling path:** When moving to subcollections, implement cursor-based pagination or windowed loading.

### All Transactions Loaded for Every Page

- **Current behavior:** Every page reads from the global `useFinanceStore().transactions` array — which contains ALL user transactions. Filtering happens client-side. With 10,000+ transactions, the initial load and every filter operation will be slow.
- **Impact:** DashboardPage, TransactionsPage, InsightsPage, SalaryPage, CarPage, UtilitiesPage all iterate the full array.
- **Scaling path:** Implement server-side filtering via Firestore queries, or pre-compute aggregates on write.

---

## Dependencies at Risk

### `@dnd-kit/sortable` v10 vs `@dnd-kit/core` v6

- **Risk:** The `@dnd-kit` ecosystem has drastic version mismatches: `@dnd-kit/core` is at `^6.3.1` but `@dnd-kit/sortable` is at `^10.0.0`. These are likely incompatible — the sortable package API may not match core v6. `@dnd-kit/utilities` is at `^3.2.2` further complicating the version matrix. The ConfigPage only uses `useDraggable`/`useDroppable` from core (not sortable presets), so `@dnd-kit/sortable` may be unused.
- **Impact:** Build may break if npm resolves them incorrectly. Unnecessary bundle size from potentially incompatible versions.
- **Migration plan:** Either upgrade all to v10 consistently, or remove `@dnd-kit/sortable` if unused, or downgrade to match core's v6.

### `standard-version` devDependency

- **Risk:** `standard-version` is at `^9.5.0` (published 2022) — it's effectively deprecated in favor of `commit-and-tag-version` or `release-please`. No active maintenance.
- **Impact:** Will eventually break with new Node.js versions.
- **Migration plan:** Replace with `commit-and-tag-version` or use GitHub Actions + `release-please`.

### `@mui/x-date-pickers-pro` License Risk

- **Risk:** `@mui/x-date-pickers-pro` (`^9.2.0`) is a **paid/proprietary** MUI X package that requires a commercial license. If the team does not have an active MUI X Pro license, this creates a legal/compliance risk.
- **Impact:** Legal exposure if unlicensed. Also redundant given `@mui/x-date-pickers` (community) is already installed.
- **Migration plan:** Verify whether the `-pro` features are actually used (the codebase only uses `DatePicker` which is available in the community version). Remove `@mui/x-date-pickers-pro` if unused.

---

## Test Coverage Gaps

- **Entire codebase has zero tests.** No test framework, no test files, no `vitest.config` or `jest.config`.
- **Files:** Entire `src/` directory.
- **Risk:** Every refactor or bug fix risks regression. The recurring transaction engine (arguably the most complex logic) has zero safety net.
- **Priority:** High — the store file alone has 30+ data mutation methods, all with async Firestore side effects, none tested.
- **Critical untested paths:**
  - `checkRecurring` — date boundary logic, duplicate prevention, yearly vs monthly
  - `importAllData` — backup parsing, version handling, validation
  - All filter/sort logic in analytics hooks
  - `deleteSubcategoryAndRemap` — transaction reassignment

## Missing Critical Features

### Error Boundaries

- **Issue:** No React Error Boundaries anywhere. If any component throws during render, the entire app crashes with a white screen. The `LoginPage` calls `getEnvVar()` at render time — if `VITE_REACT_APP_TITLE` is missing, the whole login fails.
- **Affects:** All routes/pages.
- **Priority:** High.

### Offline Support

- **Issue:** The app requires Firestore connectivity for all operations. There is no offline queue, no local caching strategy, no "you're offline" banner. If the network drops, mutations silently fail (the `catch` just sets `saveError`).
- **Affects:** All CRUD operations.
- **Priority:** Medium — for a financial app, offline resilience is important.

### Loading States / Skeletons

- **Issue:** Initial data load from Firestore shows a full-screen `CircularProgress` (in `ProtectedRoute`), but page-level loading states are absent. When `isSaving` is true, only the backup export button is disabled. Transaction list shows stale data until Firestore responds.
- **Affects:** Dashboard, Transactions page, Insights.
- **Priority:** Low — functional but poor UX during slow connections.

### Data Validation on Write

- **Issue:** Validation only checks a few required fields (`description`, `amount > 0`, some required strings). No check for:
  - Max string lengths
  - Valid category/subcategory existence
  - Valid accountId existence
  - Date ranges (e.g., transaction date before birth of user)
  - Duplicate transaction detection
- **Files:** `src/store/validation/finance.validation.ts`
- **Priority:** Medium.

### No CI/CD Pipeline

- **Issue:** No `.github/workflows/` directory exists. There is no automated linting, type-checking, or build verification on commits/PRs.
- **Affects:** Code quality and team collaboration.
- **Priority:** Low for a solo project, but should be added if multi-contributor.

---

*Concerns audit: 2026-06-22*
