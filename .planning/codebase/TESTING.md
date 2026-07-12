# Testing Patterns

**Analysis Date:** Sat Jul 11 2026

## Test Framework

**No test framework is configured.** This codebase has zero test infrastructure.

| Item | Status |
|------|--------|
| Test runner | Not detected |
| Assertion library | Not detected |
| Test configuration file | Not detected (`jest.config.*`, `vitest.config.*`, `playwright.config.*` all absent) |
| Test files | None found (`src/**/*.test.*`, `src/**/*.spec.*` returned empty) |
| Test directories | None found (`__tests__/`, `__snapshots__/` absent) |
| Test dependencies in `package.json` | None — `devDependencies` contain only ESLint, TypeScript, Vite, `standard-version`, and type packages |
| Prettier/formatter config | None detected (no `.prettierrc`, no `.editorconfig`) |

**Evidence:**
- `src/**/*.test.*` → 0 results
- `src/**/*.spec.*` → 0 results
- `jest.config.*` → 0 results
- `vitest.config.*` → 0 results
- `playwright.config.*` → 0 results
- `**/__tests__/**` → 0 results
- `**/__snapshots__/**` → 0 results

- `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs' eslint .",
    "preview": "vite preview",
    "postinstall": "node scripts/fix-tsc-bin.js"
  }
}
```
  No test, coverage, or test-watch scripts exist.

- `devDependencies` in `package.json`:
  ```json
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/node": "^25.8.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@typescript/typescript6": "^6.0.2",
    "@vitejs/plugin-react": "^6.0.2",
    "eslint": "^10.4.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "standard-version": "^9.5.0",
    "typescript": "^7.0.1-rc",
    "typescript-eslint": "^8.59.3",
    "vite": "^8.0.13"
  }
  ```
  No `vitest`, `jest`, `@testing-library/*`, `cypress`, `playwright`, `mocha`, `chai`, or any testing package.

- **AGENTS.md explicit statement (line 43):** *"No test suite exists in this repo"*

## Why There Are No Tests

Based on project structure and AGENTS.md, the project appears to be a personal finance app that has grown organically. Test infrastructure was never set up, possibly because:

1. Personal project with a single developer
2. Firebase backend reduces need for local API testing
3. TypeScript strict mode provides some compile-time safety
4. ESLint catches certain categories of bugs

## What Would Need Testing

### Unit Tests — Pure Functions (Highest Priority)

These functions have deterministic inputs/outputs and no external dependencies, making them ideal for unit tests:

| Area | Files | What to test | Priority |
|------|-------|--------------|----------|
| Validation | `src/store/validation/finance.validation.ts` | `validateTransaction`, `validateRecurringTransaction` — pure functions, 27 lines combined | High |
| Investment validation | `src/store/validation/investment.validation.ts` | `validateEtfTransaction`, `validateBrokerConfig`, `validateBrokerAccount`, `validateTicker`, `validateCashAdjustment`, `validateDividendEntry` | High |
| Sanitization | `src/store/sanitization/transaction.ts`, `src/store/sanitization/recurring.ts`, `src/store/sanitization/investment.ts` | Data transformation functions that normalize types for Firestore | High |
| Firestore converters | `src/lib/converters.ts` | `toFirestore` / `fromFirestore` — Firestore data <-> type mapping, 278 lines | High |
| Sync utilities | `src/lib/budgetEngine.ts` | `computeBudgetProgress` — pure computation function | High |
| Env utilities | `src/utils/variables.utils.tsx` | `getEnvVar` — simple getter with error on undefined | Medium |
| Store defaults | `src/store/defaults.ts` | Constants correctness and completeness | Medium |
| Backup validation | `src/store/backup/index.ts` | `validateBackupData` — complex validation logic | Medium |
| Analytics hooks | `src/analytics/hooks/useNetWorth.ts`, `useMonthlyComparison.ts`, `useCategoryBreakdown.ts`, `useAccountBreakdown.ts`, `usePortfolio.ts` | PURE — all use `useMemo` with store data; deterministic output from same inputs | Medium |

### Integration Tests

| Area | What to test | Priority |
|------|--------------|----------|
| Zustand stores | `useFinanceStore` actions (add/update/delete operations), cross-store interaction (`useAuthStore` + `useFinanceStore`), optimistic update rollback | High |
| Firebase sync | `useSyncFinance` hook: Firestore snapshot → store state, transaction initialization | Medium |
| Auth flow | `useLogout` + `onAuthStateChanged` + `ProtectedRoute` redirect logic | Medium |
| Investment sync | `useInvestmentSync` hook integration | Medium |
| Budget sync | `useBudgetSync` hook integration | Medium |

### Component Tests

| Component | What to test | Priority |
|-----------|-------------|----------|
| `TransactionForm.tsx` | Form validation (amount/description/category/subcategory), field interactions, fill from description autocomplete, edit vs create mode | High |
| `TransactionError.tsx` | Renders on `saveError`, dismisses on action or auto-hide | High |
| `TransactionModal.tsx` | Open/close behavior, form population from existing transaction | Medium |
| `YearSelector.component.tsx` | Year button click → callback, active year highlighting | Medium |
| `AccountCard.component.tsx` | Correct display for positive/negative balance, different account types | Medium |
| `RecapCards.tsx` | Account detail aggregation, toggle account details, income/expense/balance display | Medium |
| `TransactionTable.tsx` | Sorting, filtering, pagination, edit/delete actions | Medium |
| `Layout.tsx` | Navigation drawer, route-based active state, FAB quick-add, mobile responsiveness | Medium |
| `ProtectedRoute` (in `App.tsx`) | Redirect when not authenticated, loading state during auth check | Medium |
| `Charts.tsx` | Renders chart components, handles empty data gracefully | Low |
| `AnalysisPage.tsx` | Filter interactions, data aggregation correctness | Low |

### E2E Tests

| Flow | What to test | Priority |
|------|-------------|----------|
| Login → Dashboard | Google Auth sign-in, protected route redirect after auth, loading state | Medium |
| Full transaction CRUD | Create → verify on dashboard → edit → delete → verify removal | Medium |
| Multi-account management | Add account, switch default, delete | Low |
| Car management | Add mileage reading, tire change, fuel efficiency view | Low |
| Data persistence | Changes persist across page navigation and refresh | Low |
| Language switch | UI language toggles between Italian and English | Low |
| Backup/import | Export data then re-import verifies restoration | Low |
| Recurring transactions | Recurring generation from existing patterns, delete recurring instances | Low |

## Recommended Test Setup

If tests are added, the following would align with the existing tech stack:

### Runner: Vitest

**Rationale:**
- The project uses Vite (`vite.config.ts` with `@vitejs/plugin-react`)
- Vitest has native ESM support, same ecosystem as Vite
- Zero-config integration with existing Vite setup
- Jest-compatible API (familiar patterns)
- Fast watch mode with native TypeScript support

### Recommended package additions to `devDependencies`:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Vitest config (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
```

### Test setup file (`src/test/setup.ts`):
```typescript
import '@testing-library/jest-dom';
```

### Recommended test scripts additions to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Recommended directory structure:
```
src/
├── __tests__/                 # Unit/integration tests
│   ├── store/
│   │   ├── validation/
│   │   │   └── finance.validation.test.ts
│   │   │   └── investment.validation.test.ts
│   │   ├── sanitization/
│   │   │   └── transaction.test.ts
│   │   │   └── recurring.test.ts
│   │   └── backup/
│   │       └── backup.test.ts
│   ├── lib/
│   │   └── converters.test.ts
│   │   └── budgetEngine.test.ts
│   └── utils/
│       └── variables.test.ts
├── components/
│   ├── __tests__/             # Component tests near their code
│   │   ├── TransactionForm.test.tsx
│   │   ├── TransactionError.test.tsx
│   │   ├── AccountCard.test.tsx
│   │   └── YearSelector.test.tsx
│   ├── forms/
│   │   └── TransactionForm.tsx
│   └── dashboard/
│       └── RecapCards.tsx
└── test/
    ├── setup.ts               # Global test setup
    ├── mocks/                 # Shared mocks
    │   ├── firebase.ts        # Firebase mock
    │   └── store.ts           # Zustand store factory
    └── fixtures/              # Test fixtures
        ├── transactions.ts
        ├── accounts.ts
        └── categories.ts
```

### Mock Strategy

**Firebase:**
- Mock `firebase/firestore` at module level using `vi.mock('firebase/firestore', ...)`
- `src/lib/firebase.ts` exports `auth` and `db` — mock both for tests
- Sync hooks (`useSyncFinance`, etc.) can be tested by mocking the Firestore `onSnapshot` callback

**Zustand stores:**
- Zustand stores can be tested directly by calling `useFinanceStore.getState()` and `useFinanceStore.getState().addTransaction(...)` — no mocking needed
- For component tests, wrap in a `StoreProvider` that pre-seeds store state
- Use `act()` from `@testing-library/react` to wrap store mutations

**MUI components:**
- MUI v9 components work with `@testing-library/react` and jsdom
- No special mocking needed for MUI components, but `@mui/material/styles` may need `ThemeProvider` wrapping in test renders

### Testing Pattern Examples

**Validation function test:**
```typescript
// src/__tests__/store/validation/finance.validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateTransaction } from '../../store/validation/finance.validation';

describe('validateTransaction', () => {
  it('returns valid for a complete transaction', () => {
    const result = validateTransaction({
      id: '1',
      description: 'Salary',
      amount: 3000,
      date: '2026-07-01',
      category: 'Lavoro',
      subcategory: 'Stipendio',
      accountId: 'acc-1',
      type: 'income',
    });
    expect(result.valid).toBe(true);
  });

  it('returns invalid when description is empty', () => {
    const result = validateTransaction({
      id: '1',
      description: '   ',
      amount: 3000,
      date: '2026-07-01',
      category: 'Lavoro',
      subcategory: 'Stipendio',
      accountId: 'acc-1',
      type: 'income',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Description is required');
  });
});
```

**Component test (with store provider):**
```typescript
// src/components/__tests__/TransactionError.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionError } from '../TransactionError';
import { useFinanceStore } from '../../store/useFinanceStore';

describe('TransactionError', () => {
  it('renders Snackbar when saveError is set', () => {
    useFinanceStore.setState({ saveError: 'Something went wrong' });
    render(<TransactionError />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not render when saveError is null', () => {
    useFinanceStore.setState({ saveError: null });
    const { container } = render(<TransactionError />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

## Current Type Safety vs Testing

The project's TypeScript configuration (`tsconfig.app.json`) provides compile-time correctness guarantees that partially substitute for test coverage:

| Setting | What it prevents |
|---------|-----------------|
| `"strict": true` | Null/undefined access, implicit any, unchecked indexing |
| `"noUnusedLocals": true` | Dead code accumulation |
| `"noUnusedParameters": true` | Unused function parameters |
| `"noFallthroughCasesInSwitch": true` | Switch statement bugs |
| `"noUncheckedSideEffectImports": true` | Accidental side-effect imports |
| `"verbatimModuleSyntax": true` | Type vs value import discipline |

However, TypeScript cannot catch:
- Logical errors in validation/sanitization functions
- Incorrect Firestore data mapping
- UI rendering bugs
- State management edge cases (e.g., optimistic update rollback correctness)
- User interaction flows

---

*Testing analysis: Sat Jul 11 2026*
