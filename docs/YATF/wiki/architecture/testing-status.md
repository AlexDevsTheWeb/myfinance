---
title: "Testing Status"
tags: [architecture, testing, quality]
created: 2026-06-22
updated: 2026-07-11
status: active
sources: ["raw/codebase/TESTING.md"]
related: ["architecture/concerns-and-tech-debt", "architecture/project-state"]
---

# Testing Status

*Analysis: 2026-07-11*

## Critical Finding: No Testing Infrastructure

This codebase has **zero testing infrastructure**:
- No test runner (Vitest, Jest, Playwright)
- No test files (`*.test.*`, `*.spec.*` — zero results)
- No test commands in `package.json`
- No test dependencies in `devDependencies`
- No test configuration files

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

| Area | What to Test | Priority |
|------|-------------|----------|
| Zustand stores | CRUD actions, cross-store interaction, optimistic rollback | High |
| Firebase sync | `useSyncFinance`, `useInvestmentSync`, `useBudgetSync` — snapshot → store | Medium |
| Auth flow | Login → logout → route protection | Medium |

### Component Tests

| Component | What to Test | Priority |
|-----------|-------------|----------|
| `TransactionForm.tsx` | Validation, field interactions, edit vs create | High |
| `TransactionError.tsx` | Renders on `saveError`, dismisses | High |
| `AccountCard.component.tsx` | Positive/negative balance | Medium |
| `TransactionTable.tsx` | Sort, filter, pagination | Medium |
| `YearSelector.component.tsx` | Year selection callback | Medium |
| `Layout.tsx` | Nav drawer, route highlighting, responsive | Medium |
| `ProtectedRoute` | Redirect on unauthenticated | Medium |
| `Charts.tsx` | Empty data handling | Low |

### E2E Flows

Login → Dashboard → Full transaction CRUD → Multi-account → Car management → Language switch → Backup/import

## Recommended Test Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

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

- [[wiki/architecture/concerns-and-tech-debt]]
- [[wiki/architecture/project-state]]
