---
type: Feature
title: "Test Infrastructure (Vitest)"
description: "Layered Vitest test infrastructure with jsdom, colocated characterization tests, and mocked-Firebase strategy — Phase 1 (pure logic) complete."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/127"
tags: [feature, testing, quality]
created: 2026-08-24
updated: 2026-08-27
status: in-progress
sources: ["raw/test-infrastructure/test-infrastructure.md"]
related: ["wiki/architecture/testing-status", "wiki/conventions/testing-guide", "wiki/features/budget-savings-engine/budget-savings-engine", "wiki/features/financial-projections/financial-projections", "wiki/features/tax-inflation-modeling/tax-inflation-modeling", "wiki/decisions/typescript-7-upgrade"]
---

# Feature: Test Infrastructure (Vitest)

Status: in-progress (Phase 1 of 4 complete)
Priority: high

## Description

Test infrastructure so the app can keep evolving without manually re-checking the same flows. Layered and incremental: each phase lands independently on issue [#127](https://github.com/AlexDevsTheWeb/myfinance/issues/127).

## Requirements

- Vitest ^4 runner reusing the installed Vite 8 toolchain; standalone `vitest.config.ts`
- jsdom environment, `globals: true`, shared setup in `src/test/setup.ts`
- Tests colocated as `<file>.test.ts(x)` next to the module under test
- Firebase SDK always mocked (`vi.mock`) — fast, no emulator, no network
- Local-only execution (no CI in scope yet)

## Phase Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| 1 — Pure logic | Validation, sanitization, budget engine, compound interest | ✅ landed (78 tests / 7 files) |
| 2 — Store actions | Firestore in-memory fake + `useFinanceStore` action tests | ⬜ next |
| 3 — Investment logic | Pure calc tests + `useInvestmentStore` action tests | ⬜ |
| 4 — Components & sync hooks | RTL wrappers, sync hook tests, component tests | ⬜ |

### Phase 2 — Store Actions (Mocked Firestore SDK)

**Infrastructure:**
- `src/test/firestore-fake.ts` — in-memory Map-based fake for `doc`, `collection`, `getDocs`, `writeBatch`, `setDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `runTransaction`, `arrayUnion`
- Must support `.withConverter()` pattern from `src/lib/converters.ts`
- `writeBatch` fake: tracks `.set()`, `.update()`, `.delete()` calls, flushes on `.commit()`
- `src/test/mock-auth.ts` — mock `useAuthStore` returning fixed `uid` (`'test-user-123'`)
- `vi.mock('../lib/firebase')` in each test file to re-export fake `db`

**Test targets (`useFinanceStore.test.ts`):**

| Category | Actions | What to Verify |
|----------|---------|----------------|
| Transaction CRUD | `addTransaction`, `updateTransaction`, `deleteTransaction` | Optimistic state update, Firestore persist, validation gate, error rollback |
| Recurring CRUD | `addRecurring`, `updateRecurring`, `deleteRecurring` | Validate → sanitize → persist → trigger `checkRecurring()` |
| Category ops | `addCategory`, `renameCategory`, `deleteCategory` | Cascade rename into transactions + recurringTransactions sub-collections |
| Subcategory ops | `addSubcategory`, `renameSubcategory`, `deleteSubcategory`, `deleteSubcategoryAndRemap`, `moveSubcategory` | Cascade to sub-collections; `deleteSubcategory` does NOT remap; `moveSubcategory` updates parent category |
| Multi-account migration | `_migrateToMultiAccount` | Assigns default `accountId` to all transactions/recurring lacking one |
| `checkRecurring` | `checkRecurring` | Generates missing transactions for each month/year, handles yearly frequency + `monthOfYear`, dedup, orphan cleanup, 5s debounce guard |
| Account CRUD | `addAccount`, `updateAccount`, `deleteAccount`, `setDefaultAccount` | `arrayUnion` for add; full array overwrite for update/delete/setDefault |
| Card CRUD | `addCard`, `updateCard`, `deleteCard` | Same pattern as accounts |
| Budget actions | `setCategories`, `setIncomeCategories`, `setTransactions`, `setRecurringTransactions` | Batch write to Firestore, state sorted correctly |
| Error paths | All CRUD actions | `saveError` set on Firestore failure, optimistic state reverts |

**Approach:** Zustand stores tested directly via `useFinanceStore.getState().action()` — no store mocking needed. Each test file calls `vi.mock('../../lib/firebase')` to intercept the Firestore dependency.

### Phase 3 — Investment Logic

**Pure calculation tests (no store/Firestore):**
- `computeSnapshot` — internal function computing `totalInvested`, `currentValue`, `holdings` from ETF transactions + prices. Test buy/sell ratio, average cost, return percentage.
- `calcAccruedInterest` — `cashBalance * (annualRate / 100) / 12`
- `migrateBrokerConfig` — legacy `IBrokerConfig` → `BrokerAccount[]` conversion
- `migrateEtfTransactions` — broker assignment from legacy transactions
- `migrateTickerSymbols` — `SWDA*` → `EUNL` ticker consolidation

**Store action tests (`useInvestmentStore.test.ts`):**

| Category | Actions | What to Verify |
|----------|---------|----------------|
| ETF CRUD | `addEtfTransaction`, `updateEtfTransaction`, `deleteEtfTransaction` | Validation, optimistic sort, Firestore persist, snapshot recomputation |
| Broker CRUD | `addBrokerAccount`, `updateBrokerAccount`, `deleteBrokerAccount` | Validate, persist full array, rollback on error |
| Legacy config | `setBrokerConfig` | Maps to `BrokerAccount[]`, stores both legacy and new format |
| Cash adjustments | `addCashAdjustment`, `deleteCashAdjustment` | Validate, persist array, rollback on error |
| Dividends | `addDividendEntry`, `deleteDividendEntry` | Validate, persist array, rollback on error |
| PAC | `confirmPacTransaction`, `dismissPacTransaction` | Creates ETF transaction from pending, clears state |
| Snapshots | `takeSnapshot`, `loadHistoricalSnapshots`, `recomputeSnapshots` | Today dedup, price propagation, sub-collection read |

### Phase 4 — Components & Sync Hooks

**Infrastructure additions to `src/test/setup.ts`:**
- i18n wrapper (`I18nextProvider` with `i18next` instance)
- MUI `ThemeProvider` wrapper (using project theme from `src/theme/`)
- Firestore fake auto-registration for sync hook tests

**Sync hook tests:**

| Hook | What to Verify |
|------|----------------|
| `useSyncFinance` | Initial user doc creation (new user), `onSnapshot` doc sync, transaction subcollection listener, recurring subcollection listener, orphan cleanup, `checkRecurring` triggering, `hasPendingWrites` skip, `isSaving`/`hasLocalChanges` guard |
| `useInvestmentSync` | `migrateBrokerConfig`, `migrateEtfTransactions`, `migrateTickerSymbols`, `onSnapshot` for investment data, historical snapshot loading |
| `useBudgetSync` | Budget target sync from Firestore document |

**Component tests (React Testing Library):**

| Component | What to Test |
|-----------|-------------|
| `TransactionForm.tsx` | Validation, field interactions, edit vs create mode |
| `TransactionError.tsx` | Renders on `saveError`, dismisses on click |
| `AccountCard.component.tsx` | Positive/negative balance display |
| `ProtectedRoute` | Redirect on unauthenticated |

## Implementation Notes

- **TS 7 quirk:** `tsc -b` typechecks all of `src/` including test files → ambient types `vitest/globals` + `@testing-library/jest-dom` added to `tsconfig.app.json`; `vitest.config.ts` typechecked via `tsconfig.node.json`.
- **Characterization-first:** tests pin existing behavior; every plan-literal deviation exposed a real implementation fact (PAC cash-cap via `Math.min(monthlyPac, currentBrokerCash)`, required `BudgetTarget` fixture fields).
- **Tautology fix (user-sanctioned):** the planned inflation test asserted `0 === 0`; rewritten to exact deflated values (1200 → 1176 = `round(1200/1.02)`) so it can fail on regression.
- **Lint gotcha:** bare `npx eslint <file>` crashes on TS (TS7/TS6 override issue) — use the project lint script or `NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs'`.
- Deferred minors recorded in the raw source: band-edge boundaries (100%/70%), NaN pass-through, lower CAGR clamp, `monthOfYear: 0` truthiness drop.
- **Follow-up round (2026-08-24):** band edges pinned with 4 boundary tests; `monthOfYear: 0` investigated and confirmed **not a bug** (domain is 1–12; dropping falsy input is correct — preserving it would wrap `monthOfYear - 1` to the previous December); NaN pass-through root-caused to the **validators**, not sanitizers — every numeric guard used comparisons (`<= 0`, `< 0`, `=== 0`) that are vacuously false for NaN/Infinity, letting non-finite amounts pass validation and crash at Firestore write. Fixed with `Number.isFinite` guards across both validator modules (+10 tests).

## Related

- [[wiki/conventions/testing-guide]] — how to use this infrastructure day-to-day
- [[wiki/architecture/testing-status]] — superseded "no test suite exists" analysis
- [[wiki/features/budget-savings-engine/budget-savings-engine]] — budgetEngine under test
- [[wiki/features/financial-projections/financial-projections]] — projection engine under test
- [[wiki/features/tax-inflation-modeling/tax-inflation-modeling]] — inflation adjustment verified by the fixed test
- [[wiki/decisions/typescript-7-upgrade]] — TS7 build/typecheck constraints that shaped config
- Source: [raw/test-infrastructure/test-infrastructure.md](raw/test-infrastructure/test-infrastructure.md)
