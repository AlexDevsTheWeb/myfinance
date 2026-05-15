# Codebase Concerns

**Analysis Date:** 2026-05-03

## Tech Debt

**Massive Store File:**
- Issue: `src/store/useFinanceStore.ts` is 1403 lines — violates single responsibility principle
- Files: `src/store/useFinanceStore.ts`
- Impact: Maintainability issues, bundle bloat, harder to debug, all store logic is in one file
- Fix approach: Split into separate modules: data operations (CRUD), validation, sanitization, synchronization

**Missing Test Suite:**
- Issue: No test framework configured, no test files exist
- Files: Project root — `package.json` has no test dependencies
- Impact: No regression detection, refactoring is risky, bugs can ship to production
- Fix approach: Add Vitest/Jest, write unit tests for validation functions and store actions

**Duplicate Category Definitions:**
- Issue: Categories defined in both `useFinanceStore.ts` (line 229-241) and `useSyncFinance.ts` (line 20-36)
- Files: `src/store/useFinanceStore.ts`, `src/hooks/useSyncFinance.ts`
- Impact: Hard to maintain, if one changes the other is stale
- Fix approach: Extract to shared constants or generate from single source

**No Test Coverage for Critical Paths:**
- Issue: No tests for `checkRecurring()` function which auto-generates transactions
- Files: `src/store/useFinanceStore.ts:920-1000`
- Impact: Bug could cause duplicate transactions or missed bill payments
- Fix approach: Write unit tests for recurring logic, edge cases (leap years, month boundaries)

---

## Known Bugs

**Race Condition in CheckRecurring:**
- Symptoms: `checkRecurring()` runs on every sync snapshot (line 100 in `useSyncFinance.ts`), potentially generating duplicates
- Files: `src/store/useFinanceStore.ts:920-1000`, `src/hooks/useSyncFinance.ts:98-100`
- Trigger: When remote data updates or on initial load
- Workaround: Add a debounce/throttle or use a flag to prevent multiple concurrent runs

**Sync Overwrites Local Edits:**
- Symptoms: Local optimistic updates revert when remote sync fires during user editing
- Files: `src/hooks/useSyncFinance.ts:91-102`
- Trigger: User makes changes while another window/device pushes changes
- Workaround: The code checks `hasPendingWrites` but doesn't properly merge changes

**Import Doesn't Validate Transaction Data:**
- Issue: `importAllData()` trusts imported JSON completely — no validation
- Files: `src/store/useFinanceStore.ts:1295-1363`
- Trigger: Importing a corrupted or malicious backup file
- Workaround: Add schema validation before importing

---

## Security Considerations

**Hard Fail on Missing Firebase Config:**
- Issue: App throws error immediately if any `VITE_FIREBASE_*` env var is missing
- Files: `src/lib/firebase.ts`, `src/utils/variables.utils.tsx`
- Current mitigation: None — app crashes on startup without env vars
- Recommendations: Add graceful degradation with local-only mode, show helpful error message instead of throwing

**No Rate Limiting:**
- Issue: Store actions fire individual Firebase writes — no debouncing or batching
- Files: `src/store/useFinanceStore.ts` (all async actions)
- Current mitigation: None
- Recommendations: Batch related writes, add debounce for bulk operations like `setTransactions`

**Data Exposed in Client:**
- Issue: All Firestore data loaded to client — no server-side filtering
- Files: `src/hooks/useSyncFinance.ts`
- Current mitigation: Firestore security rules (not visible in codebase)
- Recommendations: Verify Firebase security rules are strict, add field-level filtering

---

## Performance Bottlenecks

**Full Array Replacement on Each Change:**
- Problem: Every store action does `updateDoc()` with entire array (e.g., line 304, 421)
- Files: `src/store/useFinanceStore.ts` (most async actions)
- Cause: Naive implementation — easier to replace whole array than patch
- Improvement path: Use Firestore arrayUnion/arrayRemove for incremental updates where possible

**Large Initial Data Load:**
- Problem: All transactions, categories, recurring items loaded on login
- Files: `src/hooks/useSyncFinance.ts:68-86`
- Cause: No pagination or lazy loading
- Improvement path: Add pagination with cursor-based loading, load less-used modules lazily

**Filter Performance in TransactionsPage:**
- Problem: Filtering done client-side with multiple `useMemo` chains
- Files: `src/pages/TransactionsPage.tsx:40-93`
- Cause: No virtualized list, all transactions rendered in DOM
- Improvement path: Add virtualization (react-window) for large datasets

---

## Fragile Areas

**DelatedRecurringInstances Never Cleaned:**
- Files: `src/store/useFinanceStore.ts:120`, `src/store/useFinanceStore.ts:954-960`
- Why fragile: Array grows indefinitely as deleted instances accumulate
- Safe modification: Add cleanup job to purge old deleted instances (older than X months)
- Test coverage: None currently

**Date Logic in CheckRecurring:**
- Files: `src/store/useFinanceStore.ts:928-950`
- Why fragile: Complex edge cases around month boundaries, leap years, day-of-month 29-31
- Safe modification: Add comprehensive tests for edge cases
- Test coverage: Gap — only happy path tested manually

**Migration Function Called Implicitly:**
- Files: `src/store/useFinanceStore.ts:543-588`
- Why fragile: `_migrateToMultiAccount()` is called but not clear when/triggers
- Safe modification: Add explicit migration flag in user config, document trigger conditions
- Test coverage: None

---

## Scaling Limits

**Firestore Document Size:**
- Current limit: Firestore 1MB document limit
- Files: All user data stored in single document per user
- Scaled approach: Will hit limit with thousands of transactions
- Scaling path: Move transactions to subcollection, paginate access

**In-Memory State:**
- Current capacity: All data held in Zustand store
- Limit: Browser memory and device capability
- Scaling path: Virtual scrolling, lazy loading per module

**No Offline Support:**
- Current: App requires network for all operations
- Scaling path: Service worker for offline mode, queue writes for sync later

---

## Dependencies at Risk

**Firebase SDK:**
- Risk: Single source of truth - no abstraction layer — tight coupling
- Impact: Hard to migrate if Firebase pricing changes
- Migration plan: Add repository pattern, but not critical for MVP

**MUI X Date Pickers Pro:**
- Risk: Commercial license required for Pro features
- Files: `package.json:22` - using `@mui/x-date-pickers-pro`
- Migration plan: Switch to free tier or add license

---

## Missing Critical Features

**Backup Validation Versioning:**
- Problem: No way to validate backup files are compatible with current version
- Files: `src/store/useFinanceStore.ts:1365-1401`
- Missing: Version compatibility check — only checks app name, not schema version

**Data Export Format:**
- Problem: Export includes version but no schema version
- Missing: Schema version field for forward compatibility

---

## Test Coverage Gaps

**Core Store Actions:**
- What's not tested: All async actions in `useFinanceStore.ts`
- Files: `src/store/useFinanceStore.ts` (most functions)
- Risk: Silent failures, data corruption, lost writes
- Priority: High

**Validation Functions:**
- What's not tested: `validateTransaction()`, `validateRecurringTransaction()`
- Files: `src/store/useFinanceStore.ts:77-105`
- Risk: Invalid data could be saved to Firestore
- Priority: High

**Recurring Transaction Generation:**
- What's not tested: `checkRecurring()` — complex date logic
- Files: `src/store/useFinanceStore.ts:920-1000`
- Risk: Duplicate or missing transactions
- Priority: High

**Import/Export Functions:**
- What's not tested: `importAllData()`, `previewBackup()`, `exportAllData()`
- Files: `src/store/useFinanceStore.ts:1262-1401`
- Risk: Corrupted backups could corrupt user data
- Priority: Medium

**Account Deletion with Transactions:**
- What's not tested: Deleting an account that still has transactions
- Files: `src/store/useFinanceStore.ts:1058-1076`
- Risk: Orphaned transactions, broken UI
- Priority: Low

---

*Concerns audit: 2026-05-03*