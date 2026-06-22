# Coding Conventions

**Analysis Date:** Mon Jun 22 2026

## Naming Patterns

**Files:**
- **Components:** PascalCase — `CarPage.tsx`, `TransactionForm.tsx`, `AccountCard.component.tsx`, `TransactionError.tsx`
- **Pages:** PascalCase — `DashboardPage.tsx`, `LoginPage.tsx`, `TransactionsPage.tsx`
- **Hooks:** `use*` camelCase — `useLogout.ts`, `useSyncFinance.ts`, `useNetWorth.ts`
- **Stores:** `use*Store` camelCase — `useAuthStore.ts`, `useFinanceStore.ts`
- **Libraries/utilities:** camelCase — `variables.utils.tsx`, `converters.ts`, `i18n.ts`, `firebase.ts`
- **Types:** camelCase with `.types.tsx` extension — `auth.types.tsx`, `finance.types.ts`, `props.types.tsx`
- **Layout components:** PascalCase — `Layout.tsx`
- **Common components:** PascalCase with optional `.component.tsx` suffix — `YearSelector.component.tsx`, `VersionFooter.tsx`

**Functions:**
- **Components:** `React.FC<Props>` pattern, PascalCase function names
- **Hooks:** Named `export const useXxx = () => { ... }`
- **Utilities:** Named `export function xxx()` or `export const xxx`
- **Helpers inside components:** camelCase — `handleSaveMileage`, `handleEditTireChange` (see `src/pages/CarPage.tsx`)
- **Private/internal functions:** No underscore prefix observed

**Variables:**
- **camelCase** everywhere — `newReading`, `selectedMonth`, `editingId`, `totalOdometer`
- **Boolean:** `is*` / `has*` / `show*` prefix — `isLoggingOut`, `hasLocalChanges`, `showSettings`, `isValid`, `isMobile`, `modalOpen`
- **Constants:** UPPER_SNAKE_CASE for module-level constants — `DEFAULT_ACCOUNT`, `DEFAULT_CATEGORIES` in `src/store/defaults.ts`

**Types:**
- **Interfaces:** `I` prefix — `ITransaction`, `IAccount`, `IAuthState`, `ICategory`, `INetWorthPoint`, `IDateRange`
- **Type aliases:** Plain PascalCase (backward-compat aliases in `useFinanceStore.ts` strip the `I` prefix)
- **React Props interfaces:** PascalCase without `I` prefix — `TransactionFormProps`, `TabPanelProps`, `AccountCardProps`
- **Enums/Union types:** PascalCase — `Granularity = 'monthly' | 'yearly' | 'total'`

```typescript
// Interface naming pattern (I prefix) — src/store/types/finance.types.ts
export interface ITransaction { /* ... */ }

// Type aliases (no prefix, backward compat) — src/store/useFinanceStore.ts
export type Transaction = Types.ITransaction;

// Props interfaces (no I prefix) — src/components/forms/TransactionForm.tsx
interface TransactionFormProps { /* ... */ }

// Union types — src/analytics/types.ts
export type Granularity = 'monthly' | 'yearly' | 'total';
```

## Code Style

**Formatting:**
- No Prettier config detected (no `.prettierrc`). Formatting is implicit via ESLint + TypeScript.

**Linting:**
- **Tool:** ESLint v10 with flat config (`eslint.config.js`)
- **Plugins:** `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- **Config:** `eslint.config.js`
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
- **Rules inherited:** All recommended sets from ESLint, TypeScript-ESLint, React Hooks, and React Refresh Vite preset
- **Per-file overrides:** `/* eslint-disable @typescript-eslint/no-explicit-any */` used in component files that need `any` for MUI event handlers (`src/pages/CarPage.tsx`, `src/components/forms/TransactionForm.tsx`, `src/components/dashboard/Charts.tsx`)
- **Suppression pattern:** `/* eslint-disable-next-line @typescript-eslint/no-unused-vars */` comments used for intentionally unused variables or future-feature stubs (e.g., `src/pages/CarPage.tsx:284`)

**TypeScript:**
- **Config:** `tsconfig.app.json`
- **Strict mode:** `"strict": true`
- **Module:** `"module": "ESNext"` with `"moduleResolution": "bundler"`
- **Verbose imports:** `"verbatimModuleSyntax": true` (requires `type` prefix for type-only imports)
- **No unused code:** `"noUnusedLocals": true`, `"noUnusedParameters": true`
- **Target:** ES2022
- **JSX:** `"react-jsx"` (React 19 automatic JSX transform)
- **NoEmit:** `"noEmit": true` (Vite handles bundling)
- **Type import pattern:**
  ```typescript
  import type { User } from 'firebase/auth';            // type-only import
  import { useFinanceStore, type Transaction } from '...'; // mixed import with type
  import type { IAuthState } from '../types/auth.types';  // imported type
  ```

## Import Organization

**Order:**
1. **Third-party npm packages** (descending alphabetical):
   - MUI icons (`@mui/icons-material`)
   - MUI core (`@mui/material`, `@mui/x-date-pickers`)
   - Other npm (`dayjs`, `firebase/*`, `i18next`, `lucide-react`, `react`, `react-dom`, `react-i18next`, `react-router-dom`, `recharts`, `zustand`)
2. **Blank line separator**
3. **Internal absolute/barrel imports** (from `src/analytics`, etc.)
4. **Internal relative imports** (descending path specificity)

**Examples:**
```typescript
// Pattern from src/pages/CarPage.tsx
import { Edit as EditIcon, ... } from '@mui/icons-material';
import { Box, Button, ... } from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Line, ... } from 'recharts';

import { YearSelector } from '../components/common/YearSelector.component';
import { useFinanceStore, type CarMileageRecord } from '../store/useFinanceStore';
```

**Path Aliases:**
- No `tsconfig` path aliases (`@/` etc.) detected. All imports use relative paths.
- Import depth varies: shallow (`../lib/`) to deep (`../../store/useFinanceStore`)

## Error Handling

**Patterns:**

1. **try/catch with console.error** — hooks and async operations:
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

## Logging

**Framework:** No structured logging library. Uses `console.error` and `console.log` scattered in catch blocks.

**Patterns:**
```typescript
console.error('Error in initializeUser transaction:', error);
console.error('Error logging out:', error);
```

**Guideline (inferred):** `console.error` is the default for error cases; no debug/warn/info level usage observed.

## Comments

**When to Comment:**
- Section dividers in long components (e.g., `// Mileage State`, `// Tire State`, `// Fuel Categories helper`)
- Justifying ESLint suppressions — `// Note: handleEditTireChange not currently used but kept for future edit feature`
- Inline explanations for non-obvious logic — `// Historical averages for all years`, `// Sparkline Chart`
- Module-level doc comments: `/** Store types - re-export with I prefix */`
- Design decision markers — `// Date validation: LENIENT per D-01 - no bounds enforced`

**JSDoc/TSDoc:**
- Lightly used. Seen on barrel re-export files in `src/store/`:
  ```typescript
  /**
   * Store types - re-export from finance.types with I prefix
   */
  ```
- No TSDoc on component props or function signatures in the examined files

## Function Design

**Size:** Varies widely. Utility functions are short (1–27 lines); page-level components can be 600+ lines.

**Parameters:** Simple parameters preferred; objects used for 3+ related params (e.g., React props interfaces).

**Return Values:**
- React components → `React.FC<Props>` or function components with explicit `React.ReactNode`
- Hooks → named function returning value/array
- Validation → `{ valid: boolean; error?: string }` tuple-like object
- Store actions → void (mutate Zustand state internally)

**Side effects:**
- Zustand stores use `getState()` for cross-store reads (not hooks, to avoid hook rules violations)
- `useEffect` used for firebase subscriptions, store initialization, and lifecycle setup
- `useMemo` heavily used for derived data (computed statistics, filtered/sorted arrays)

## Module Design

**Exports:**
- **Named exports** — hooks, utilities, types, validation functions
  ```typescript
  export const useLogout = () => { ... };
  export function useNetWorth(...) { ... }
  export const sanitizeTransaction = (t: ITransaction): any => { ... };
  ```
- **Default exports** — page components, components that serve as singletons
  ```typescript
  export default CarPage;
  export default App;
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
  - `src/analytics/hooks/index.ts` — named re-exports of each hook
  - `src/analytics/components/index.ts` — `export { default as X } from './X'` 
  - `src/store/types/index.ts` — re-exports types from `finance.types.ts`
  - `src/store/validation/index.ts` — re-exports validation functions
  - `src/store/sanitization/index.ts` — re-exports sanitization functions
- **Pattern for barrel re-exports:** explicit named re-exports (not `export *`), to maintain control over the API surface

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
- **Zustand** for global state (`useFinanceStore`, `useAuthStore`)
- **local state** with `useState` for UI concerns (modals, editing flags, form state)
- **Derived state** with `useMemo` — significant use across pages
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
- Global styles in `src/index.css`

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

---

*Convention analysis: Mon Jun 22 2026*
