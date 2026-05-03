# Coding Conventions

**Analysis Date:** 2026-05-03

## Naming Patterns

**Files:**
- Components use `.component.tsx` suffix for reusable UI components: `AccountCard.component.tsx`, `YearSelector.component.tsx`
- Regular `.tsx` for pages and non-reusable components: `TransactionsPage.tsx`, `TransactionTable.tsx`
- Hooks use `use*.ts` pattern: `useSyncFinance.ts`, `useLogout.ts`
- Stores use `use*Store.ts` pattern: `useFinanceStore.ts`, `useAuthStore.ts`
- Utils use `.utils.tsx` suffix: `variables.utils.tsx`
- Types use `.types.tsx` suffix: `props.types.tsx`, `auth.types.tsx`
- Lib files use plain `.ts`: `firebase.ts`, `converters.ts`, `i18n.ts`

**Interfaces:**
- Use `I` prefix for interfaces: `IAuthState`, `ITabPanelProps`
- PascalCase: `AccountCardProps`, `FinanceState`

**Functions:**
- camelCase: `getEnvVar`, `validateTransaction`, `sanitizeTransaction`
- Verb-noun pattern: `setUser`, `addTransaction`, `deleteCategory`

**Variables:**
- camelCase: `isSaving`, `saveError`, `initialBalance`
- Boolean prefixes: `isPositive`, `isDefault`, `isLoggingOut`

## Code Style

**Formatting:**
- ESLint 9 with flat config (`eslint.config.js`)
- TypeScript strict mode enabled (`tsconfig.app.json`)
- ESM with `verbatimModuleSyntax` (requires explicit `import type`)
- 2-space indentation

**Linting:**
- Extends: `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Ignores: `dist` directory
- Browser globals enabled

**TypeScript Settings:**
- Target: ES2022
- Strict: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `noFallthroughCasesInSwitch`: true
- JSX: `react-jsx`

## Import Organization

**Order:**
1. External libraries (React, Firebase, etc.)
2. MUI and icon imports
3. Third-party utilities (Zustand, dayjs, i18next, etc.)
4. Internal lib imports (`../lib/firebase`)
5. Store imports (`../store/useFinanceStore`)
6. Type imports (`../types/auth.types`)
7. Component-specific imports

**Path Aliases:**
- None configured (uses relative paths)

**Example:**
```typescript
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import { create } from 'zustand';
import dayjs from 'dayjs';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import type { IAuthState } from '../types/auth.types';
```

## Error Handling

**Patterns:**
- Error state stored in Zustand store (`saveError` field)
- User-facing errors via MUI Snackbar/Alert components
- Development errors logged to console with context
- Error messages extracted from caught exceptions: `err instanceof Error ? err.message : 'Failed to ...'`

**Example from `useFinanceStore.ts`:**
```typescript
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
  set({ saveError: errorMessage, isSaving: false });
  console.error('addTransaction error:', err);
}
```

**Error Display:**
- `TransactionError.tsx` component listens to `saveError` from store
- Shows Snackbar with Alert for user notification

## Logging

**Framework:** Console logging (`console.error`, `console.log`)

**Patterns:**
- Error logging includes action context: `console.error('addTransaction error:', err)`
- No structured logging library configured

## Comments

**When to Comment:**
- Complex logic explains the "why" (e.g., comment at line 87 in `useFinanceStore.ts`: "NOTE: No date validation per D-01")
- eslint-disable comments for specific known issues: `// eslint-disable-next-line @typescript-eslint/no-explicit-any`

**JSDoc/TSDoc:**
- Minimal usage in codebase
- Interfaces typically self-documenting

## Function Design

**Size:** Large store functions (~50-100 lines for complex operations like `checkRecurring`)

**Parameters:** Typed explicitly, no optional chaining in critical paths

**Return Values:**
- Validation returns object: `{ valid: boolean; error?: string }`
- Store actions return void (async)

## Module Design

**Exports:**
- Named exports for hooks and utilities: `export const useFinanceStore = create<FinanceState>()`
- Default exports for React components: `export default AccountCard`

**Barrel Files:** None (no `index.ts` barrel exports)

**Store Pattern:**
- Zustand with TypeScript generics: `create<FinanceState>()`
- Interface defined in store file
- All actions are async (sync local state + Firestore write)

---

*Convention analysis: 2026-05-03*