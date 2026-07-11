# Coding Conventions

**Analysis Date:** Sat Jul 11 2026

## Naming Patterns

**Files:**
- **Components:** PascalCase — `CarPage.tsx`, `TransactionForm.tsx`, `AccountCard.component.tsx`, `TransactionError.tsx`
- **Pages:** PascalCase — `DashboardPage.tsx`, `LoginPage.tsx`, `TransactionsPage.tsx`
- **Hooks:** `use*` camelCase — `useLogout.ts`, `useSyncFinance.ts`, `useNetWorth.ts`
- **Stores:** `use*Store` camelCase — `useAuthStore.ts`, `useFinanceStore.ts`, `useBudgetStore.ts`, `useInvestmentStore.ts`, `useProjectionSettingsStore.ts`
- **Libraries/utilities:** camelCase — `variables.utils.tsx`, `converters.ts`, `i18n.ts`, `firebase.ts`, `budgetEngine.ts`, `compoundInterestUtils.ts`
- **Types:** Mixed extensions — `src/store/types/` uses `.ts` (e.g., `finance.types.ts`, `investment.types.ts`, `budget.types.ts`), `src/types/` uses `.tsx` (e.g., `auth.types.tsx`, `props.types.tsx`)
- **Layout components:** PascalCase — `Layout.tsx`, `Sidebar.tsx`
- **Common components:** PascalCase with optional `.component.tsx` suffix — `YearSelector.component.tsx`, `VersionFooter.tsx`

**Functions:**
- **Components:** `React.FC<Props>` pattern, PascalCase function names
- **Hooks:** Named `export const useXxx = () => { ... }` (e.g., `usePortfolio`, `useNetWorth`, `useMarketData`)
- **Utilities:** Named `export function xxx()` or `export const xxx`
- **Helpers inside components:** camelCase — `handleSaveMileage`, `handleEditTireChange`, `handleDrawerToggle`, `handleToggleFab` (see `src/pages/CarPage.tsx`, `src/components/layout/Layout.tsx`)
- **Private/internal functions:** No underscore prefix observed, except for migration functions like `_migrateToMultiAccount` in `src/store/useFinanceStore.ts`
- **Store action creators:** camelCase, descriptive names — `addTransaction`, `updateTransaction`, `deleteTransaction`, `setDefaultAccount`, `clearSaveError`

**Variables:**
- **camelCase** everywhere — `newReading`, `selectedMonth`, `editingId`, `totalOdometer`
- **Boolean:** `is*` / `has*` / `show*` prefix — `isLoggingOut`, `hasLocalChanges`, `showSettings`, `isValid`, `isMobile`, `modalOpen`, `isSaving`, `isCheckingRecurring`
- **Constants:** UPPER_SNAKE_CASE for module-level constants — `DEFAULT_ACCOUNT`, `DEFAULT_CATEGORIES` in `src/store/defaults.ts`; `UTILITY_SUBCATEGORIES` in `src/components/forms/TransactionForm.tsx`

**Types:**
- **Interfaces:** `I` prefix — `ITransaction`, `IAccount`, `IAuthState`, `ICategory`, `INetWorthPoint`, `IDateRange`, `IRecurringTransaction`, `ICarMileageRecord`, `ITireSettings`, `IAppModules`, `IETFTransaction`, `IBrokerConfig`, `IPortfolioSnapshot`
- **Type aliases:** Plain PascalCase (backward-compat aliases in `useFinanceStore.ts` strip the `I` prefix)
  ```typescript
  // src/store/useFinanceStore.ts
  export type Transaction = Types.ITransaction;
  export type Account = Types.IAccount;
  ```
- **React Props interfaces:** PascalCase without `I` prefix — `TransactionFormProps`, `TabPanelProps`, `AccountCardProps`, `YearSelectorProps`
- **Enums/Union types:** PascalCase — `Granularity = 'monthly' | 'yearly' | 'total'`
- **Inline return types:** camelCase with PascalCase — `ValidationResult` interface (local to `TransactionForm.tsx`)
- **Firestore doc interface:** PascalCase — `UserDoc` in `src/lib/converters.ts`

```typescript
// Interface naming pattern (I prefix) — src/store/types/finance.types.ts
export interface ITransaction { /* ... */ }

// Type aliases (no prefix, backward compat) — src/store/useFinanceStore.ts
export type Transaction = Types.ITransaction;

// Props interfaces (no I prefix) — src/components/forms/TransactionForm.tsx
interface TransactionFormProps { /* ... */ }

// Inline result types — src/components/forms/TransactionForm.tsx
interface ValidationResult { isValid: boolean; errors: Record<string, string>; }

// Union types — src/analytics/types.ts
export type Granularity = 'monthly' | 'yearly' | 'total';
```

## Code Style

**Formatting:**
- No Prettier config detected (no `.prettierrc`, no `.editorconfig`). Formatting is implicit via ESLint + TypeScript.

**Linting:**
- **Tool:** ESLint v10 with flat config (`eslint.config.js`)
- **Plugins:** `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- **Config:** `eslint.config.js` — flat config format using `defineConfig` from `eslint/config`
  ```javascript
  // eslint.config.js — flat config
  export default defineConfig([
    globalIgnores(['dist']),
    {
      files: ['**/*.{ts,tsx}'],
      extends: [
        js.configs.recommended,
        tseslint.configs.recommended,
        reactHooks.configs.flat.recommended,
        reactRefresh.configs.vite,
      ],
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
      },
    },
  ]);
  ```
- **Rules inherited:** All recommended sets from ESLint (`@eslint/js`), TypeScript-ESLint (`typescript-eslint`), React Hooks (`eslint-plugin-react-hooks`), and React Refresh Vite preset (`eslint-plugin-react-refresh`)
- **No custom rule overrides** — all rules inherited from recommended configs
- **Per-file overrides:** `/* eslint-disable @typescript-eslint/no-explicit-any */` used at file level in:
  - `src/pages/CarPage.tsx`
  - `src/components/forms/TransactionForm.tsx`
  - `src/components/dashboard/Charts.tsx`
  - `src/lib/converters.ts`
  - Reason: MUI event handlers and Firestore data often require `any` typing
- **Suppression pattern:** `/* eslint-disable-next-line @typescript-eslint/no-unused-vars */` comments used for intentionally unused variables or future-feature stubs (e.g., `src/pages/CarPage.tsx:284`)
- **Linting workaround:** `NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs' eslint .` — the script `scripts/ts-eslint-resolve.cjs` monkeypatches `Module._resolveFilename` to redirect `typescript` resolution to `@typescript/typescript6` (TS 6 API) for `@typescript-eslint` packages, because TypeScript 7 (Go rewrite) doesn't expose the JS API

**TypeScript:**
- **Config:** `tsconfig.json` (project references) → `tsconfig.app.json`
- **Strict mode:** `"strict": true`
- **Module:** `"module": "ESNext"` with `"moduleResolution": "bundler"`
- **Verbose imports:** `"verbatimModuleSyntax": true` (requires `type` prefix for type-only imports)
- **No unused code:** `"noUnusedLocals": true`, `"noUnusedParameters": true`
- **Target:** ES2022
- **JSX:** `"react-jsx"` (React 19 automatic JSX transform)
- **NoEmit:** `"noEmit": true` (Vite handles bundling)
- **SkipLibCheck:** `"skipLibCheck": true`
- **Additional checks:** `"noFallthroughCasesInSwitch": true`, `"noUncheckedSideEffectImports": true`
- **Type import pattern:**
  ```typescript
  import type { User } from 'firebase/auth';                   // type-only import
  import { useFinanceStore, type Transaction } from '...';      // mixed import with type
  import type { IAuthState } from '../types/auth.types';       // imported type
  import { type IAccount, type ICategory } from '../store/types'; // inline type qualifier
  ```
- **`tsc` binary fix:** `scripts/fix-tsc-bin.js` runs on `postinstall` to ensure `node_modules/.bin/tsc` points to `typescript/bin/tsc` (TS 7) instead of `@typescript/old/bin/tsc` (TS 6)

## Import Organization

**Order:**
1. **Third-party npm packages** (grouped by source):
   - `@mui/*` (icons, material, x-*)
   - `dayjs`
   - `firebase/*`
   - `i18next` / `react-i18next`
   - `lucide-react`
   - `react` / `react-dom`
   - `react-router-dom`
   - `zustand`
2. **Blank line separator**
3. **Internal absolute/barrel imports** (from `src/analytics`, etc.)
4. **Internal relative imports** (descending path specificity)

**Examples:**
```typescript
// Pattern from src/pages/DashboardPage.tsx
import { DirectionsCar as CarIcon, TrendingUp, AccountBalance as BudgetIcon, Bolt as ElecIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Grid, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import AccountDetailDialog from '../components/dashboard/AccountDetailDialog';
import Charts from '../components/dashboard/Charts';
import RecapCards from '../components/dashboard/RecapCards';
```

**Path Aliases:**
- No `tsconfig` path aliases (`@/` etc.) detected. All imports use relative paths.
- Import depth varies: shallow (`../lib/`) to deep (`../../store/useFinanceStore`)

## Error Handling

**Patterns:**

1. **try/catch with console.error** — hooks, store actions, and async operations:
   ```typescript
   // src/hooks/useLogout.ts
   try {
     await signOut(auth);
     navigate('/');
   } catch (error) {
     console.error('Error logging out:', error);
   }
   ```

2. **State-based user-facing errors** — Zustand store tracks `saveError` string:
   ```typescript
   // src/store/useFinanceStore.ts (state)
   saveError: string | null;

   // src/components/TransactionError.tsx — renders in Snackbar
   export function TransactionError() {
     const { saveError, clearSaveError } = useFinanceStore();
     return (
       <Snackbar open={!!saveError} autoHideDuration={6000} onClose={handleClose}>
         <Alert severity="error" variant="filled">{saveError}</Alert>
       </Snackbar>
     );
   }
   ```

3. **Validation with result objects** — `{ valid: boolean; error?: string }`:
   ```typescript
   // src/store/validation/finance.validation.ts
   export function validateTransaction(t: ITransaction): { valid: boolean; error?: string } {
     if (!t.description?.trim()) {
       return { valid: false, error: 'Description is required' };
     }
     return { valid: true };
   }
   ```

4. **Form-level validation** — local `errors` object (`Record<string, string>`):
   ```typescript
   // src/components/forms/TransactionForm.tsx
   interface ValidationResult { isValid: boolean; errors: Record<string, string>; }
   function validateTransactionForm(...): ValidationResult { ... }
   ```

5. **Throwing for missing env vars** — hard stop at init:
   ```typescript
   // src/utils/variables.utils.tsx
   export const getEnvVar = (name: string) => {
     const value = import.meta.env[name];
     if (value === undefined) {
       throw new Error(`Environment variable ${name} is not defined.`);
     }
     return value;
   };
   ```

6. **Firebase errors** — caught but no structured user messaging beyond `saveError`

7. **Optimistic updates with rollback** — store actions update local state immediately, then revert on Firestore failure:
   ```typescript
   // src/store/useFinanceStore.ts
   set((state) => {
     const reverted = state.transactions.filter(t => t.id !== transaction.id);
     return { saveError: errorMessage, isSaving: false, hasLocalChanges: false, transactions: reverted };
   });
   ```

## Logging

**Framework:** No structured logging library. Uses `console.error` and `console.log` scattered in catch blocks.

**Patterns:**
```typescript
console.error('addTransaction error:', err);
console.error('Error in initializeUser transaction:', error);
```

**Guideline (inferred):** `console.error` is the default for error cases; no debug/warn/info level usage observed.

## Comments

**When to Comment:**
- Section dividers in long components (e.g., `// Mileage State`, `// Tire State`, `// Fuel Categories helper`)
- Justifying ESLint suppressions — `// Note: handleEditTireChange not currently used but kept for future edit feature`
- Inline explanations for non-obvious logic — `// Historical averages for all years`, `// Sparkline Chart`
- Module-level doc comments: `/** Store types - re-export with I prefix */`, `/** Finance validation functions */`
- Design decision markers — `// Date validation: LENIENT per D-01 - no bounds enforced`
- Deprecation markers — `/** @deprecated Legacy field — kept for backward-compatible reads during migration */` in `src/lib/converters.ts`

**JSDoc/TSDoc:**
- Lightly used. Seen on:
  - Barrel re-export files in `src/store/` — `/** Store types - re-export with I prefix */`
  - Validation functions — `/** Finance validation functions */` above `validateTransaction`
  - Deprecated fields — `@deprecated` tag on legacy `brokerConfig` field

- No TSDoc on component props or function signatures in the examined files

## Function Design

**Size:** Varies widely. Utility functions are short (1–27 lines); page-level components can be 600+ lines.

**Parameters:** Simple parameters preferred; objects used for 3+ related params (e.g., React props interfaces).

**Return Values:**
- React components → `React.FC<Props>` or function components with explicit `React.ReactNode`
- Hooks → named function returning value/array (e.g., `usePortfolio()` returns computed portfolio data)
- Validation → `{ valid: boolean; error?: string }` tuple-like object
- Store actions → void (mutate Zustand state internally and update Firestore)
- Store sync actions → `Promise<boolean>` (e.g., `importAllData` returns success/failure)

**Side effects:**
- Zustand stores use `getState()` for cross-store reads (not hooks, to avoid hook rules violations)
- `useEffect` used for firebase subscriptions, store initialization, and lifecycle setup
- **`useMemo` for side effects (anti-pattern):** `src/components/forms/TransactionForm.tsx` uses `useMemo` to call `setFormErrors(validation.errors)` — `useMemo` should only compute values, not trigger state updates; should use `useEffect` instead
- `useMemo` heavily used for derived data (computed statistics, filtered/sorted arrays)

## Module Design

**Exports:**
- **Named exports** — hooks, utilities, types, validation functions
  ```typescript
  export const useLogout = () => { ... };
  export function useNetWorth(...) { ... }
  export const sanitizeTransaction = (t: ITransaction): any => { ... };
  ```
- **Default exports** — page components, layout components, singleton components
  ```typescript
  export default CarPage;
  export default App;
  export default TransactionForm;
  ```
- **Mixed** — Some components have both named and default:
  ```typescript
  // YearSelector.component.tsx
  export const YearSelector: React.FC<YearSelectorProps> = ({ ... }) => { ... };
  // (no default export)

  // AccountCard.component.tsx
  const AccountCard: React.FC<AccountCardProps> = ({ ... }) => { ... };
  export default AccountCard;
  ```

**Barrel Files:**
- Used extensively for module aggregation:
  - `src/analytics/index.ts` — `export * from './types'`, `export * from './hooks'`, `export * from './components'`
  - `src/analytics/hooks/index.ts` — explicit named re-exports of each hook (`export { useCategoryBreakdown } from './useCategoryBreakdown'`)
  - `src/analytics/components/index.ts` — `export { default as X } from './X'` pattern
  - `src/store/types/index.ts` — re-exports types from individual type files
  - `src/store/validation/index.ts` — explicit named re-exports of validation functions
  - `src/store/sanitization/index.ts` — re-exports sanitization functions
- **Pattern for barrel re-exports:**
  - Analytics hooks: explicit named re-exports (not `export *`) for fine-grained control
  - Analytics components: `export { default as Name } from './Name'` 
  - Store types: typically re-exported through `useFinanceStore.ts` via `export * from './types'` pattern
  - Store validation/sanitization: explicit named re-exports

## React Conventions

**Component Structure:**
```typescript
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks at top
  const { t } = useTranslation();
  const { someState } = useSomeStore();

  // State
  const [localState, setLocalState] = useState(initial);

  // Memos
  const computed = useMemo(() => { ... }, [deps]);

  // Handlers
  const handleAction = () => { ... };

  // Render
  return ( <JSX /> );
};
```

**State Management:**
- **Zustand** for global state (`useFinanceStore`, `useAuthStore`, `useBudgetStore`, `useInvestmentStore`, `useProjectionSettingsStore`)
- **local state** with `useState` for UI concerns (modals, editing flags, form state, snackbars)
- **Derived state** with `useMemo` — significant use across pages (dashboard aggregations, analytics computations, filtered lists)
- **No Redux, no Context providers** beyond MUI ThemeProvider and i18n I18nextProvider

**i18n Pattern:**
```typescript
const { t } = useTranslation();
// Usage in JSX
<Typography>{t('car.settings')}</Typography>
```

**MUI Styling:**
- Inline `sx` prop is the primary styling method
- `@emotion/styled` available but not widely used
- No CSS modules, no Tailwind, no scoped stylesheets
- Global styles in `src/index.css` and `src/App.css`

## Sanitization Pattern

Data sent to Firebase passes through sanitizer functions that normalize types:

```typescript
// src/store/sanitization/transaction.ts
export const sanitizeTransaction = (t: ITransaction): any => {
  return {
    id: t.id,
    amount: Number(t.amount),
    consumption: (t.consumption !== undefined && String(t.consumption) !== '') ? Number(t.consumption) : null,
    // ... nullable fields get null coalescing
  };
};
```

## Sync Hook Pattern

Hooks that sync Firebase data to Zustand stores follow a consistent pattern:

```typescript
// src/hooks/useSyncFinance.ts
export const useSyncFinance = () => {
  const { user } = useAuthStore();
  const setTransactions = useFinanceStore(s => s.setTransactions);
  // ... other store setters

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // populate store from Firestore data
      }
    });
    return () => unsub();
  }, [user]);
};
```

## Known Anti-Patterns

1. **`useMemo` for side effects** in `src/components/forms/TransactionForm.tsx:104-106`:
   ```typescript
   useMemo(() => {
     setFormErrors(validation.errors);
   }, [validation.errors]);
   ```
   Should use `useEffect` instead, as `useMemo` is for value memoization, not triggering state updates.

2. **`/* eslint-disable @typescript-eslint/no-explicit-any */` at file level** — blocks all type checking for `any` usage in the file. A more targeted approach (per-line suppressions) would be safer.

3. **`any` typing on `setFormData` prop** in `TransactionForm.tsx:26` — the `setFormData` callback is typed as `(data: any) => void`, losing type safety on form data updates.

---

*Convention analysis: Sat Jul 11 2026*
