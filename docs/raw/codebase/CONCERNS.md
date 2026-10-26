# Codebase Concerns

**Analysis Date:** 2026-07-11

## Technical Debt

### Monolithic Zustand Store (1250 lines)
**Severity:** High

- **Location:** `src/store/useFinanceStore.ts` (1246 lines)
- **Evidence:** This single file contains the entire finance state interface definition, all action implementations, and Firestore persistence logic for transactions, accounts, categories, subcategories, recurring transactions, car mileage, tire changes, modules, and backup/import/export. Every action follows the same boilerplate pattern (~20 lines each) — fetch userId, set error/saving state, try/catch, console.error.
- **Risk:** Near impossible to reason about, test, or modify without side effects. The file has ~50+ action methods. Any change risks breaking unrelated features. Violates Single Responsibility Principle.
- **Suggestion:** Split by domain: `useTransactionStore.ts`, `useAccountStore.ts`, `useCategoryStore.ts`, `useCarStore.ts`, `useRecurringStore.ts`. Extract the Firestore persistence boilerplate into a reusable hook or middleware.

### Oversized Config Page (1054 lines)
**Severity:** High

- **Location:** `src/pages/ConfigPage.tsx` (1054 lines)
- **Evidence:** Combines category management (with drag-and-drop), account CRUD, recurring transaction form, backup/restore UI, language settings, module toggles, projection settings, and broker settings — all in a single component with complex dialog state management.
- **Risk:** Extremely hard to maintain. The `handleOpenDialog` function alone has 4 branching paths. Any UI change risks breaking unrelated tabs.
- **Suggestion:** Split into separate page components or route-based tabs: `ConfigGeneral.tsx`, `ConfigAccounts.tsx`, `ConfigCategories.tsx`, `ConfigRecurring.tsx`, `ConfigBackup.tsx`. Each tab panel should be its own component file.

### Oversized Car Page (695 lines)
**Severity:** Medium

- **Location:** `src/pages/CarPage.tsx` (695 lines)
- **Evidence:** Combines mileage tracking UI, tire change management, fuel expense analysis carousel, year stats table, and charts in a single component.
- **Suggestion:** Extract tire management panel, fuel analysis, and mileage data table into separate components.

### Duplicate Portfolio Computation Logic
**Severity:** Medium

- **Location:**
  - `src/store/useInvestmentStore.ts` — `computeSnapshot()` (lines 55-97)
  - `src/hooks/useHistoricalSnapshots.ts` — `computeHistorySnapshot()` (lines 24-76)
  - `src/analytics/hooks/usePortfolio.ts` — inline computation (lines 28-51, 93-107)
- **Evidence:** All three locations implement nearly identical logic: iterating ETF transactions, building holdings maps with buy/sell math, computing average costs and current values. Minor variations exist (e.g., `computeHistorySnapshot` has `if (h.units <= 0) continue` guard that `computeSnapshot` lacks).
- **Risk:** Inconsistent behavior if one copy is updated but others aren't. Bug fixes must be applied in three places.
- **Suggestion:** Extract a shared `computeHoldingsFromTransactions()` utility function in `src/lib/` that accepts transactions + optional price and returns `{totalInvested, currentValue, holdings[]}`.

### `any` Types Disabled Across 19 Files
**Severity:** Medium

- **Location:** Files with eslint-disable for `no-explicit-any`:
  - `src/pages/ConfigPage.tsx`, `src/pages/CarPage.tsx`, `src/pages/InvestmentPage.tsx`, `src/pages/LoginPage.tsx`
  - `src/lib/converters.ts`
  - `src/components/forms/TransactionForm.tsx`
  - `src/components/investment/BrokerSettingsModal.tsx`, `EtfTransactionModal.tsx`, `EtfTransactionForm.tsx`
  - `src/store/sanitization/transaction.ts`, `recurring.ts`, `investment.ts`
- **Evidence:** 19 explicit eslint-disable directives for `no-explicit-any`. The converters file uses `any` extensively as a type escape for Firestore data deserialization. ConfigPage has `const handleOpenDialog = (config: any)` and `const renderExplodedList = (cats: any[], ...)`.
- **Risk:** Type coverage gaps mean refactoring tools can't catch errors. Bugs from incorrect type assumptions at runtime.
- **Suggestion:** Replace `any` with proper types throughout. For Firestore deserialization, use Zod schemas or similar runtime validation. For dialog config, create a proper discriminated union type.

### Missing Test Suite
**Severity:** High

- **Location:** Entire project
- **Evidence:** No test config files (`jest.config.*`, `vitest.config.*`). No `*.test.*` or `*.spec.*` files found. Confirmed in `AGENTS.md`: "No test suite exists in this repo".
- **Risk:** Zero regression protection. Any PR or refactor risks silent breakage. The large store files are particularly risky to modify without tests.
- **Suggestion:** Add Vitest (already in Vite ecosystem). Start with unit tests for validation functions in `src/store/validation/`, then add store action tests, then component tests for critical paths.

### Duplicate Sync Hooks with Race Conditions
**Severity:** High

- **Location:**
  - `src/hooks/useSyncFinance.ts` (65 lines)
  - `src/hooks/useInvestmentSync.ts` (121 lines)
  - `src/hooks/useBudgetSync.ts` (61 lines)
- **Evidence:** Three separate `useEffect` hooks all independently call `runTransaction` and `onSnapshot` on the same Firestore document (`users/{userId}`). Each writes partial data (`transactions`, `etfTransactions`, `budgetTargets`) using `updateDoc`. The Finance sync runs `setAll(data)` which can overwrite state that other hooks just updated. The `useFinanceStore.importAllData` writes ALL fields including investment/budget data in a single call.
- **Risk:** Concurrent Firestore writes to the same document can cause data loss. If two hooks trigger `updateDoc` simultaneously, one write can overwrite fields the other just set.
- **Suggestion:** Use a single Firestore document listener with a unified sync mechanism. Consider using Firestore transactions for all writes, or switch to a subcollection-per-domain model.

---

## Security Considerations

### Firestore Rules Lacking Field-Level Validation
**Severity:** Medium

- **Location:** `firestore.rules`
- **Evidence:** Rules only check `isOwner(userId)` for read/write on `users/{userId}` and its subcollections. No validation of document structure, field types, or value ranges.
- **Risk:** A compromised client could write arbitrary data (e.g., negative amounts, invalid types, oversized arrays). No server-side enforcement of data integrity.
- **Suggestion:** Add Firestore rules to validate document structure and field types (e.g., `request.resource.data.keys().hasAll(['transactions', 'accounts', ...])`, validate that amounts are numbers).

### Environment Variable Throws on Missing
**Severity:** Low

- **Location:** `src/utils/variables.utils.tsx` (line 4)
- **Evidence:** `getEnvVar` throws `Error` if any env var is undefined. In `src/lib/firebase.ts`, all 7 `VITE_FIREBASE_*` vars use this, so app crashes on startup if any is missing.
- **Risk:** User-facing crash instead of graceful degradation.
- **Suggestion:** Provide default fallbacks where possible, or show a user-friendly error screen.

### VITE_REACT_APP_TITLE Undocumented Env Var
**Severity:** Low

- **Location:** `src/pages/LoginPage.tsx:34`, `src/components/layout/Sidebar.tsx:49`
- **Evidence:** Uses `getEnvVar('VITE_REACT_APP_TITLE')` but this variable is not documented in `AGENTS.md` alongside the Firebase vars.
- **Risk:** New developers don't know this variable is required. If missing, the entire app crashes.
- **Suggestion:** Either document it in `AGENTS.md` or make it optional with a fallback title.

### Firestore Rules Missing Subcollection for Cash/Dividends
**Severity:** Low

- **Location:** `firestore.rules`
- **Evidence:** The rules define `match /users/{userId}/dividends/{entryId}` and `match /users/{userId}/tax_events/{eventId}` but the actual app stores dividend entries inside the main user document (`data.dividendEntries`), not in a subcollection. This mismatch means the subcollection rules are likely unused/unnecessary.
- **Suggestion:** Clean up unused rule paths or restructure data to use subcollections properly.

---

## Performance Bottlenecks

### All Data Loaded in Memory
**Severity:** Medium

- **Location:** All pages
- **Evidence:** No pagination, windowing, or lazy loading for any data. `TransactionsPage.tsx` does client-side pagination but loads ALL transactions into memory first. The entire user document (transactions, accounts, categories, etc.) is loaded as a single Firestore document.
- **Risk:** With years of transactions (thousands), the app will become sluggish. Firestore document size limit is 1 MiB — a power user with many transactions could approach this.
- **Suggestion:** Implement Firestore pagination with `limit` + `startAfter` for transactions. Consider subcollections for high-volume data.

### Static Date Range Memo in Dashboard
**Severity:** Low

- **Location:** `src/pages/DashboardPage.tsx` (line 60)
- **Evidence:** `const currentDateRange = React.useMemo(() => ({...}), []);` — empty dependency array means the date range is computed once and never updates. If the page stays open past midnight, it still shows yesterday's data.
- **Suggestion:** Use a state initialized on mount or a `useRef` that updates on interval.

### Inefficient Firestore Write Pattern
**Severity:** Medium

- **Location:** All store files — `src/store/useFinanceStore.ts`, `useInvestmentStore.ts`, `useBudgetStore.ts`
- **Evidence:** Every mutation action follows the pattern: `set(state)` → optimistic update → `updateDoc(docRef, { entireArray: sanitizedEntireArray })`. Even adding one transaction writes the entire transactions array back to Firestore.
- **Risk:** For users with large datasets, this is wasteful network usage. Concurrent edits from different tabs/devices will overwrite each other.
- **Suggestion:** Use `arrayUnion`/`arrayRemove` where possible (already used for `addAccount`, `addCarMileage`, `addCategory` but not for transactions). Consider subcollection-per-entity model.

---

## Fragile Areas

### Backup/Import Reliability
**Severity:** High

- **Location:** `src/store/useFinanceStore.ts` — `importAllData` (lines 1141-1239)
- **Evidence:** The import function does a single `updateDoc` call that atomically replaces ALL user data. If the call fails (network issue), the document could be in an inconsistent state. The investment and budget store updates (lines 1222-1232) are not wrapped in a transaction with the main update.
- **Risk:** A failed import could corrupt the user's entire financial data.
- **Suggestion:** Use a Firestore transaction for the entire import. Add a backup-before-restore mechanism. Show progress indicators.

### Fire-and-Forget Subcollection Writes
**Severity:** Medium

- **Location:** `src/hooks/useHistoricalSnapshots.ts` — `recordPortfolioSnapshot()`
- **Evidence:** Called as fire-and-forget from `useInvestmentStore.ts` (lines 156-158, 240-242) with `.catch()` but no retry logic.
- **Risk:** If the subcollection write fails (rate limiting, network), the snapshot is silently lost.
- **Suggestion:** Implement a retry queue for subcollection writes, or include snapshot data in the main document update transaction.

### Migration Code in Sync Hooks
**Severity:** Medium

- **Location:** `src/hooks/useInvestmentSync.ts` — `migrateBrokerConfig()` (lines 14-37)
- **Evidence:** Migration runs every time the hook initializes. Uses `updateDoc` fire-and-forget with `.catch(() => {})` for the migration write.
- **Risk:** Silent failures during migration. Migration fires on every page load/refresh.
- **Suggestion:** Add a migration version field to the user document. Only run migration if version < target. Log migration failures properly.

### PAC Automation Uses localStorage
**Severity:** Medium

- **Location:** `src/hooks/usePacAutomation.ts` (line 49)
- **Evidence:** PAC generation tracking uses `localStorage` (`pac_last_{brokerId}`), which is device-specific and doesn't sync across devices.
- **Risk:** If a user opens the app on two devices, PAC generation could fire on each, or miss on one. The store-level `lastPacGenerationDate` is a partial backup but only stores the most recent generation date across all brokers.
- **Suggestion:** Store PAC last-generation date per broker in Firestore (within the broker account data or a separate field).

### Alert for User Feedback
**Severity:** Low

- **Location:** `src/pages/ConfigPage.tsx` (lines 319, 333, 439, 442, 459)
- **Evidence:** Uses browser `alert()` and `window.confirm()` for success/error messages instead of MUI Snackbar or Dialog components.
- **Risk:** Poor UX. Blocking dialogs disrupt workflow. No way to customize styling.
- **Suggestion:** Replace `alert()` with MUI Snackbar for success/error toasts. Replace `confirm()` with MUI Dialog.

---

## Missing Critical Features

### No Error Boundary
**Severity:** High

- **Location:** `src/App.tsx`
- **Evidence:** No React `<ErrorBoundary>` wrapping the app or routes. A runtime error in any component will unmount the entire app tree and show a white screen.
- **Suggestion:** Add a top-level `<ErrorBoundary>` with a fallback UI. Consider per-route boundaries for major sections.

### No Offline Support
**Severity:** Medium

- **Location:** `src/lib/firebase.ts`
- **Evidence:** Firestore initialized without `enableMultiTabIndexedDbPersistence()` or any offline cache configuration. All reads/writes require network.
- **Risk:** Complete loss of functionality when offline. Mobile users on unreliable connections will experience constant errors.
- **Suggestion:** Enable Firestore offline persistence. Adjust the sync hooks to handle PendingWrites metadata properly.

### No Loading/Empty States in Most Pages
**Severity:** Medium

- **Location:** `src/pages/BudgetPage.tsx`, `src/pages/DashboardPage.tsx`, `src/pages/TransactionsPage.tsx`, and others
- **Evidence:** Pages render immediately with store data that could be empty or not yet loaded from Firestore. No `loading` state checks, no skeleton loaders, no empty state messages for users with no data.
- **Risk:** Poor first-run experience. Users see empty screens with no guidance.
- **Suggestion:** Add loading skeletons, empty state illustrations, and onboarding guidance for new users.

### AnalysisPage is a Dead Redirect
**Severity:** Low

- **Location:** `src/pages/AnalysisPage.tsx` (redirects to `/insights`), `src/App.tsx` (no `/insights` route)
- **Evidence:** `AnalysisPage` redirects to `/insights` via `<Navigate to="/insights" replace />`, but App.tsx has no route for `/insights`. The redirect leads to a blank page or 404.
- **Suggestion:** Either add the `/insights` route pointing to `InsightsPage`, or make AnalysisPage redirect to a valid route.

### Empty Context Directory
**Severity:** Low

- **Location:** `src/context/`
- **Evidence:** The `src/context/` directory exists but is empty. This is dead boilerplate waste.
- **Suggestion:** Remove the empty directory or populate it if a context is planned.

### Commented-Out Code in LoginPage
**Severity:** Low

- **Location:** `src/pages/LoginPage.tsx` (lines 22, 30)
- **Evidence:** Contains commented-out `console.log("Account creato con successo!")` and `alert("Errore: " + error.message)` — leftover development artifacts.
- **Suggestion:** Remove commented-out code.

---

## Test Coverage Gaps

### Zero Test Coverage
**Severity:** High

- **Location:** Entire codebase
- **What's not tested:** All store actions, validation logic, Firestore sync hooks, page components, analytics hooks, utility functions.
- **Risk:** Any change to the large monolithic files (`useFinanceStore.ts`, `ConfigPage.tsx`) could introduce regressions without any automated detection.
- **Priority:** High

---

*Concerns audit: 2026-07-11*
