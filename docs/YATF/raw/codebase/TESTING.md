# Testing Patterns

**Analysis Date:** Mon Jun 22 2026

## Test Framework

**No test framework is configured.** This codebase has zero test infrastructure.

| Item | Status |
|------|--------|
| Test runner | Not detected |
| Assertion library | Not detected |
| Test configuration file | Not detected (`jest.config.*`, `vitest.config.*`, `playwright.config.*` all absent) |
| Test files | None found (`src/**/*.test.*`, `src/**/*.spec.*` returned empty) |
| Test dependencies in `package.json` | None — `devDependencies` contain only ESLint, TypeScript, Vite, and type packages |

**Evidence:**
- `src/**/*.test.*` → 0 results
- `src/**/*.spec.*` → 0 results
- `jest.config.*` → 0 results
- `vitest.config.*` → 0 results
- `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
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
    "@vitejs/plugin-react": "^6.0.2",
    "eslint": "^10.4.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.6.0",
    "standard-version": "^9.5.0",
    "typescript": "~6.0.3",
    "typescript-eslint": "^8.59.3",
    "vite": "^8.0.13"
  }
  ```
  No `vitest`, `jest`, `react-testing-library`, `cypress`, `playwright`, or any testing package.

- **AGENTS.md explicit statement:** *"No test suite exists in this repo"*

## What Would Need Testing

Based on codebase analysis, these areas would be candidates for testing:

### Unit Tests

| Area | Files | What to test |
|------|-------|--------------|
| Validation | `src/store/validation/finance.validation.ts` | `validateTransaction`, `validateRecurringTransaction` — pure functions with clear inputs/outputs |
| Sanitization | `src/store/sanitization/transaction.ts`, `src/store/sanitization/recurring.ts` | `sanitizeTransaction`, `sanitizeRecurring` — data transformation functions |
| Firestore converters | `src/lib/converters.ts` | Firestore data <-> type mapping |
| Analytics hooks | `src/analytics/hooks/useNetWorth.ts`, `src/analytics/hooks/useMonthlyComparison.ts`, `src/analytics/hooks/useCategoryBreakdown.ts`, `src/analytics/hooks/useAccountBreakdown.ts` | PURE — all use `useMemo` with `useFinanceStore` data, deterministic output from same inputs |
| Env utilities | `src/utils/variables.utils.tsx` | `getEnvVar` — simple getter with error on undefined |
| Store defaults | `src/store/defaults.ts` | Constants validation |
| Backup validation | `src/store/backup/index.ts` | `validateBackupData` — complex validation logic |

### Integration Tests

| Area | What to test |
|------|--------------|
| Zustand stores | `useFinanceStore` actions (add/update/delete operations), cross-store interaction (`useAuthStore` + `useFinanceStore`) |
| Firebase sync | `useSyncFinance` hook: Firestore snapshot → store state, transaction initialization |
| Auth flow | `useLogout` + `onAuthStateChanged` + route protection |

### Component Tests

| Component | What to test |
|-----------|-------------|
| `TransactionForm.tsx` | Form validation (amount/description/category/subcategory), field interactions, edit vs create mode |
| `TransactionModal.tsx` | Open/close behavior, form population from existing transaction |
| `TransactionError.tsx` | Renders on `saveError`, dismisses on action or auto-hide |
| `YearSelector.component.tsx` | Year button click → callback |
| `AccountCard.component.tsx` | Correct display for positive/negative balance |
| `RecapCards.tsx` | Account detail aggregation, toggle account details |
| `TransactionTable.tsx` | Sorting, filtering, pagination, edit/delete actions |
| `Layout.tsx` | Navigation drawer, route-based active state, FAB quick-add |
| `ProtectedRoute` (in `App.tsx`) | Redirect when not authenticated |

### E2E Tests

| Flow | What to test |
|------|-------------|
| Login → Dashboard | Google Auth sign-in, protected route redirect |
| Full transaction CRUD | Create → edit → delete transaction |
| Multi-account management | Add account, switch default, delete |
| Car management | Add mileage reading, tire change, fuel efficiency view |
| Data persistence | Changes persist across page navigation and refresh |
| Language switch | UI language toggles between Italian and English |
| Backup/import | Export data then re-import verifies restoration |

## Recommended Test Setup

If tests are added, the following would align with the existing tech stack:

- **Runner:** `vitest` (native ESM, Vite integration, same `@vitejs/plugin-react` ecosystem)
- **Assertions:** Vitest built-in (Jest-compatible API)
- **DOM Testing:** `@testing-library/react` + `@testing-library/jest-dom` (industry standard for React 19 with MUI)
- **Component rendering:** Happy DOM (jsdom-like, works with ESM) since there's no Node/CJS dependency
- **Config location:** `vitest.config.ts` at project root, extending `vite.config.ts` settings
- **Mock strategy:** `vi.mock()` for Firebase auth/firestore (already imported via `src/lib/firebase.ts`), `zustand` stores can be tested directly without mocking by seeding state

### Recommended package additions to `devDependencies`:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Recommended test scripts:
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
├── __tests__/              # Unit/integration tests co-located
│   ├── store/
│   │   └── validation.test.ts
│   └── utils/
│       └── variables.test.ts
├── components/
│   ├── __tests__/          # Component tests near their code
│   │   └── TransactionForm.test.tsx
│   ├── forms/
│   │   └── TransactionForm.tsx
```

---

*Testing analysis: Mon Jun 22 2026*
