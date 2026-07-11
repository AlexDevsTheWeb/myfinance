---
title: "Coding Conventions"
tags: [conventions, coding-style, naming]
created: 2026-06-22
updated: 2026-07-11
status: active
sources: ["raw/codebase/CONVENTIONS.md", "../AGENTS.md"]
related: ["architecture/codebase-structure", "architecture/project-state"]
---

# Coding Conventions

*Analysis: 2026-07-11*

## Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| Components (reusable) | PascalCase + `.tsx` (some `.component.tsx`) | `AccountCard.component.tsx`, `TransactionForm.tsx` |
| Pages | PascalCase + `Page` suffix + `.tsx` | `DashboardPage.tsx` |
| Hooks | camelCase, `use` prefix | `useSyncFinance.ts`, `usePortfolio.ts` |
| Stores | camelCase, `use*Store` | `useFinanceStore.ts` |
| Utilities | camelCase | `variables.utils.tsx`, `budgetEngine.ts` |
| Types | PascalCase + `.types.ts`/`.types.tsx` | `finance.types.ts`, `auth.types.tsx` |
| Interfaces | `I` prefix for data models | `IAuthState`, `ITransaction`, `IETFTransaction` |
| Type aliases | PascalCase (backward-compat strip `I` prefix) | `type Transaction = Types.ITransaction` |
| Props interfaces | PascalCase, no `I` prefix | `TransactionFormProps`, `TabPanelProps` |
| Functions | camelCase, verb-noun | `addTransaction`, `deleteCategory` |
| Booleans | `is` / `has` / `show` prefix | `isSaving`, `hasLocalChanges`, `showSettings` |
| Module-level constants | UPPER_SNAKE_CASE | `DEFAULT_ACCOUNT`, `DEFAULT_CATEGORIES` |

## Import Order

1. Third-party npm packages: MUI icons, MUI core, dayjs, firebase, i18next, lucide-react, react, react-router-dom, zustand
2. Blank line
3. Internal absolute/barrel imports (from `src/analytics`, etc.)
4. Internal relative imports (descending path specificity)

No path aliases configured — all imports use relative paths.

## TypeScript Settings

- **Config:** `tsconfig.app.json` (project ref from `tsconfig.json`)
- **Target:** ES2022, **strict:** true
- **Module:** ESNext with bundler resolution
- **verbatimModuleSyntax** — requires explicit `import type`
- **noUnusedLocals**, **noUnusedParameters**, **noFallthroughCasesInSwitch**: true
- **noUncheckedSideEffectImports**: true
- **JSX:** `react-jsx` (React 19 automatic transform)
- **noEmit:** true (Vite handles bundling)

```typescript
import type { User } from 'firebase/auth';                    // type-only
import { useFinanceStore, type Transaction } from '...';       // mixed
import { type IAccount, type ICategory } from '../store/types'; // inline type
```

## ESLint

- ESLint v10 with flat config (`eslint.config.js`)
- Plugins: `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- All rules inherited from recommended configs — no custom overrides
- Suppressions at file level: `/* eslint-disable @typescript-eslint/no-explicit-any */` in 19 files
- Per-line: `// eslint-disable-next-line @typescript-eslint/no-unused-vars`
- Linting workaround: `NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs'` redirects TS resolution to TS 6 API for `@typescript-eslint`

## Error Handling Patterns

Six patterns observed:

1. **try/catch with console.error** — hooks, store actions, async operations
2. **State-based user-facing errors** — `saveError: string | null` on Zustand store, `TransactionError` renders Snackbar
3. **Validation result objects** — `{ valid: boolean; error?: string }` from validation module
4. **Form-level validation** — local `errors: Record<string, string>` object
5. **Throwing for missing env vars** — `getEnvVar()` hard stop at module init
6. **Optimistic updates with rollback** — state reverts on Firestore failure

## Logging

No structured logging library. Uses `console.error` for errors. No debug/warn/info levels observed.

## Store Pattern

- Zustand with TypeScript generics: `create<State>()((set, get) => ({...}))`
- All actions async: validate → optimistic update → Firestore `updateDoc` → error rollback
- Cross-store reads via `getState()` (not hooks, to avoid hook rules violations)
- `saveError: string | null` for user-facing error display

```typescript
// Sync hook pattern
export const useSyncFinance = () => {
  const { user } = useAuthStore();
  const setTransactions = useFinanceStore(s => s.setTransactions);

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

## Sanitization Pattern

Data sent to Firebase passes through sanitizer functions:

```typescript
export const sanitizeTransaction = (t: ITransaction): any => ({
  id: t.id,
  amount: Number(t.amount),
  consumption: (t.consumption !== undefined && String(t.consumption) !== '') ? Number(t.consumption) : null,
  // nullable fields → null coalescing
});
```

## Exports

- **Named exports** — hooks, utilities, types, validation/sanitization functions
- **Default exports** — page components, singleton layout components
- **Barrel files** — `index.ts` in store subdirs + analytics dir. Analytics hooks use explicit named re-exports; analytics components use `export { default as Name } from './Name'`

## Component Structure

```typescript
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  const { t } = useTranslation();
  const { someState } = useSomeStore();
  const [localState, setLocalState] = useState(initial);
  const computed = useMemo(() => { ... }, [deps]);
  const handleAction = () => { ... };
  return ( <JSX /> );
};
```

## MUI Styling

- Inline `sx` prop is primary styling method
- `@emotion/styled` available but not widely used
- No CSS modules, no Tailwind
- Global styles in `src/index.css` and `src/App.css`

## Known Anti-Patterns

1. **`useMemo` for side effects** in `src/components/forms/TransactionForm.tsx` — triggers `setFormErrors` inside `useMemo`, should be `useEffect`
2. **File-level `any` suppression** — `/* eslint-disable @typescript-eslint/no-explicit-any */` blocks all type checking; per-line suppressions would be safer
3. **`any` typing on `setFormData` prop** — `(data: any) => void` loses type safety

## Branch Strategy

See [[wiki/conventions/branch-strategy]] for full rules.

## Related

- [[wiki/architecture/codebase-structure]]
- [[wiki/architecture/concerns-and-tech-debt]]
