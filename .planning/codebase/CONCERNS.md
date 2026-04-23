# Codebase Concerns

**Analysis Date:** 2026-04-23

## Security Considerations

**Firebase Security Rules:**
- Issue: No Firestore security rules or Firebase Auth rules files found in the project
- Files: None (missing `firestore.rules`, `storage.rules`)
- Risk: Without security rules configured in Firebase Console, any authenticated user could potentially read/write/modify other users' data. The client-side auth check alone is insufficient.
- Recommendation: Implement Firestore security rules that enforce: `request.auth != null && request.auth.uid == resource.data.ownerId`

**Hardcoded Environment Variable Access:**
- Issue: All Firebase config is loaded via `getEnvVar()` in `src/lib/firebase.ts` with no fallback if missing
- Files: `src/lib/firebase.ts`
- Current mitigation: App throws error on startup if env vars missing
- Recommendation: Add graceful degradation (readonly/demo mode) if Firebase config unavailable

**Client-Side Auth Only:**
- Issue: App relies solely on client-side auth state from Firebase SDK
- Files: `src/store/useAuthStore.ts`, `src/lib/firebase.ts`
- Risk: If client-side state is manipulated, data integrity could be compromised
- Recommendation: Rely on server-side Firestore security rules as primary enforcement

---

## Error Handling Issues

**No Try-Catch Around Firestore Operations:**
- Issue: All Firestore operations in `useFinanceStore.ts` call `updateDoc`, `runTransaction`, etc. without try-catch blocks
- Files: `src/store/useFinanceStore.ts` (lines 209-831)
- Impact: Network failures or Firestore errors silently fail with no user notification
- Recommendation: Wrap all Firestore calls in try-catch and show user-facing error messages via toast/snackbar

**Silent Errors in LoginPage:**
- Issue: Login errors are caught and logged to console but user receives no feedback
- Files: `src/pages/LoginPage.tsx` (lines 28-31)
- Current: `console.error("Errore:", error.code)` - commented out user notification
- Impact: Users don't know why login failed (wrong password, network error, etc.)
- Recommendation: Display error message in UI

**No Loading States for Firestore Writes:**
- Issue: No loading indicators while waiting for Firestore to confirm writes
- Files: `src/components/modals/TransactionModal.tsx`, `src/store/useFinanceStore.ts`
- Impact: Users may click submit multiple times, or think action failed if there's delay
- Recommendation: Add loading spinner on submit button during Firestore operations

**Weak Error Handling in Sync Hook:**
- Issue: Errors logged to console but user not notified
- Files: `src/hooks/useSyncFinance.ts` (lines 82-86)
- Current: `console.error('Error in new user transaction:', error)`
- Impact: User doesn't know if initial data sync failed
- Recommendation: Add error state to store and show recovery UI

---

## Input Validation Gaps

**No Amount Validation:**
- Issue: Form doesn't validate amount > 0, negative numbers allowed
- Files: `src/components/forms/TransactionForm.tsx`, `src/components/modals/TransactionModal.tsx`
- Impact: Users can create transactions with amount = 0 or negative (though type distinguishes income/expense)
- Recommendation: Add `min={0.01}` or positive number validation

**No Date Validation:**
- Issue: No bounds checking on dates (future dates allowed, dates before account creation allowed)
- Files: `src/components/forms/TransactionForm.tsx`
- Impact: Can create transactions with dates far in past or future
- Recommendation: Add date range validation (e.g., within last 10 years)

**Hardcoded Category Logic:**
- Issue: Utility consumption fields shown based on hardcoded category name check
- Files: `src/components/forms/TransactionForm.tsx` (line 238)
- Code: `formData.category === 'Bollette' && (formData.subcategory === 'Elettricità' || formData.subcategory === 'Gas')`
- Impact: If category names change, the utility fields never show
- Recommendation: Store metadata with categories or create category types

---

## Data Integrity Concerns

**No Cascade Deletion for Accounts:**
- Issue: Can delete accounts even if transactions reference them
- Files: `src/store/useFinanceStore.ts` (lines 722-730)
- Impact: Transactions may reference non-existent accounts, causing display errors or calculation issues
- Recommendation: Warn user and optionally reassign transactions before deletion

**Migration Runs on Every Mount:**
- Issue: `_migrateToMultiAccount` runs on every app load via useEffect without checking if already done
- Files: `src/App.tsx` (lines 39-44), `src/store/useFinanceStore.ts` (lines 357-380)
- Impact: Unnecessary re-migration attempts on every session
- Recommendation: Add migration flag to persisted state or Firestore document

**No Transaction Validation Before Save:**
- Issue: Can save transaction with empty description, missing required fields
- Files: `src/components/modals/TransactionModal.tsx` (line 107)
- Current: Button disabled when fields missing, but no explicit validation on submit
- Impact: Partial data could be saved
- Recommendation: Add explicit validation function before calling addTransaction

---

## Missing Features

**No Test Suite:**
- Issue: No test files or testing framework configured
- Files: Project lacks `*.test.*`, `*.spec.*`, `jest.config.*`, `vitest.config.*`
- Impact: No regression detection, difficult to refactor safely
- Recommendation: Add Vitest or Jest with RTL for component and store testing

**No React Error Boundaries:**
- Issue: No error boundaries to catch rendering errors
- Files: Missing from component tree
- Impact: Single component error crashes entire app
- Recommendation: Add error boundary around routes

**No Undo/Confirmation for Deletes:**
- Issue: No confirmation dialog before deleting transactions/accounts/categories
- Files: `src/components/modals/TransactionModal.tsx`, store delete functions
- Impact: Accidental delete requires data reload to recover
- Recommendation: Add confirmation dialogs or undo toast

**No Offline Support:**
- Issue: No service worker or offline detection
- Files: Not implemented
- Impact: App fully dependent on network for Firestore
- Recommendation: Add offline indicator and queue for sync

---

## Deprecated / Fragile Patterns

**Commented-Out Console Logs:**
- Issue: Multiple commented-out console.log statements throughout code
- Files: `src/hooks/useSyncFinance.ts` (lines 74-76, 92-94), `src/pages/LoginPage.tsx` (line 22)
- Impact: Cluttered code, unclear which logs are intentional
- Recommendation: Remove or properly guard debug logs

**Mixed Italian/English:**
- Issue: UI labels in Italian, some code comments in English
- Files: Throughout components
- Impact: Harder to maintain, not accessible to non-Italian speakers
- Recommendation: Either fully localize or use consistent language

**eslint-disable for any:**
- Issue: `eslint-disable @typescript-eslint/no-explicit-any` on multiple lines
- Files: `src/components/forms/TransactionForm.tsx` (line 1)
- Impact: Type safety bypassed
- Recommendation: Define proper types instead of using `any`

---

## Performance Concerns

**Large State Updates:**
- Issue: Operations like `setCategories()` replace entire array instead of atomic updates
- Files: `src/store/useFinanceStore.ts`
- Impact: Large category lists cause full re-renders
- Recommendation: Consider atomic Firestore updates or subcollections

**No Pagination on Initial Load:**
- Issue: All transactions loaded at once from Firestore
- Files: `src/hooks/useSyncFinance.ts`, `src/store/useFinanceStore.ts`
- Impact: Performance degrades with large transaction history
- Recommendation: Implement Firestore query pagination (limit + cursor)

**Memo Gaps in Components:**
- Issue: Some computed values not memoized (e.g., descriptionOptions in TransactionForm)
- Files: `src/components/forms/TransactionForm.tsx` (lines 33-40)
- Impact: Unnecessary recalculations on each render
- Recommendation: Ensure all computed values use useMemo

---

## Dependencies at Risk

**Firebase SDK Version:**
- Package: `firebase` ^12.9.0
- Risk: Major version could have breaking changes
- Impact: Future updates may require code changes
- Recommendation: Pin exact version, test thoroughly on updates

**MUI X Date Pickers Pro:**
- Package: `@mui/x-date-pickers-pro` ^8.27.0
- Risk: Pro version may require license for production use
- Impact: Potential licensing issues
- Recommendation: Verify license compliance

---

## Technical Debt

**Duplicate Default Config:**
- Issue: Default user config defined in both `useSyncFinance.ts` and `useFinanceStore.ts`
- Files: `src/hooks/useSyncFinance.ts` (lines 10-49), `src/store/useFinanceStore.ts` (lines 171-207)
- Impact: Hard to maintain, configs may drift
- Recommendation: Extract to shared constants file

**Missing Index Files:**
- Issue: No barrel exports for modules
- Files: No `index.ts` files for directories
- Impact: Longer import paths
- Recommendation: Add barrel exports for `store/`, `components/`, `pages/`

**No Pre-Commit Hooks:**
- Issue: No husky or lint-staged configured
- Files: Missing from `package.json`
- Impact: Code quality depends on developer discipline
- Recommendation: Add pre-commit lint and format checks

---

*Concerns audit: 2026-04-23*