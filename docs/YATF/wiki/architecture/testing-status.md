---
type: Architecture
description: "Current testing infrastructure status — Vitest Phase 1 landed (78 pure-logic tests); Phases 2-4 planned for store actions, investment logic, components & sync hooks."
title: "Testing Status"
tags: [architecture, testing, quality]
created: 2026-06-22
updated: 2026-08-27
status: active
sources: ["raw/codebase/TESTING.md"]
related: ["architecture/concerns-and-tech-debt", "architecture/project-state", "features/test-infrastructure/test-infrastructure"]
---

# Testing Status

*Analysis: 2026-07-11 — **updated 2026-08-24**: Vitest infrastructure landed; see [[wiki/features/test-infrastructure/test-infrastructure]].*

## Current State (2026-08-27)

Vitest ^4 + jsdom is live (`npm test` / `npm run test:watch`):
- **7 test files / 78 tests, all green** — finance validation, investment validation, sanitization ×3, budget engine, compound interest utils
- Firebase SDK mocked via `vi.mock`; tests colocated beside source; characterization-first approach
- `npm run build` typechecks test files too — ambient `vitest/globals` types configured in tsconfig
- Phase 1 landed 2026-08-27 (PR #179 merged to development)
- Remaining: store actions (Phase 2), investment logic (Phase 3), components & sync hooks (Phase 4)

## Priority Test Areas

### Unit Tests — Pure Functions (Highest Priority)

These have deterministic inputs/outputs and no external dependencies:

| Area | Files | What to Test | Priority |
|------|-------|--------------|----------|
| Validation | `src/store/validation/finance.validation.ts` | `validateTransaction`, `validateRecurringTransaction` | High |
| Investment validation | `src/store/validation/investment.validation.ts` | `validateEtfTransaction`, `validateBrokerConfig`, `validateBrokerAccount`, `validateTicker`, `validateCashAdjustment`, `validateDividendEntry` | High |
| Sanitization | `src/store/sanitization/` | `sanitizeTransaction`, `sanitizeRecurring`, `sanitizeInvestment` | High |
| Firestore converters | `src/lib/converters.ts` | `toFirestore` / `fromFirestore` — data ↔ type mapping (278 lines) | High |
| Budget engine | `src/lib/budgetEngine.ts` | `computeBudgetProgress` | High |
| Store defaults | `src/store/defaults.ts` | Constants correctness | Medium |
| Backup validation | `src/store/backup/index.ts` | `validateBackupData` | Medium |
| Env utilities | `src/utils/variables.utils.tsx` | `getEnvVar` | Medium |
| Analytics hooks | `src/analytics/hooks/` | All `useMemo`-based computations (useNetWorth, usePortfolio, etc.) | Medium |

### Integration Tests

| Area | What to Test | Phase | Priority |
|------|-------------|-------|----------|
| `useFinanceStore` actions | Transaction/recurring CRUD, category rename+remap, multi-account migration, `checkRecurring` generation, account/card CRUD, error rollback | 2 | High |
| `useInvestmentStore` actions | ETF CRUD, broker CRUD, cash adjustments, dividends, PAC, snapshot lifecycle | 3 | High |
| `useBudgetStore` actions | Budget target CRUD | 3 | Medium |
| Firebase sync hooks | `useSyncFinance`, `useInvestmentSync`, `useBudgetSync` — snapshot → store, migration, orphan cleanup | 4 | Medium |

**Firestore fake design (Phase 2):** In-memory Map-based storage keyed by path strings. Supports `.withConverter()` pattern, `writeBatch` queuing with `.commit()` flush, `onSnapshot` callback invocation. Lives at `src/test/firestore-fake.ts`.

**Store testing approach:** Zustand stores tested directly via `useXStore.getState().action()` — no store mocking needed. Each test mocks `../lib/firebase` to re-export the fake `db`.

### Component Tests

| Component | What to Test | Phase | Priority |
|-----------|-------------|-------|----------|
| `TransactionForm.tsx` | Validation, field interactions, edit vs create | 4 | High |
| `TransactionError.tsx` | Renders on `saveError`, dismisses | 4 | High |
| `AccountCard.component.tsx` | Positive/negative balance | 4 | Medium |
| `ProtectedRoute` | Redirect on unauthenticated | 4 | Medium |

**Component test requirements (Phase 4):** i18n wrapper (`I18nextProvider`), MUI `ThemeProvider` wrapper, added to `src/test/setup.ts`.

### E2E Flows

Login → Dashboard → Full transaction CRUD → Multi-account → Car management → Language switch → Backup/import

## Recommended Test Setup

✅ **Done 2026-08-24** — vitest, jsdom, @testing-library/* and coverage-v8 are installed; `test`/`test:watch` scripts exist; mock strategy below adopted (Firebase mocked at module level).

### Mock Strategy
- **Firebase:** Mock `firebase/firestore` at module level with `vi.mock()`
- **Zustand stores:** Test directly via `useXStore.getState().action()` — no mocking needed
- **Components:** Wrap in `ThemeProvider` for MUI compatibility

## TypeScript vs Testing

TypeScript strict mode provides compile-time safety but cannot catch:
- Logical errors in validation/sanitization
- Incorrect Firestore data mapping
- UI rendering bugs
- State management edge cases
- User interaction flows

## Related

- [[wiki/features/test-infrastructure/test-infrastructure]]
- [[wiki/architecture/concerns-and-tech-debt]]
- [[wiki/architecture/project-state]]
