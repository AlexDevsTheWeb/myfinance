---
title: "Coding Conventions"
tags: [conventions, coding-style, naming]
created: 2026-06-22
updated: 2026-06-22
status: active
sources: ["raw/codebase/CONVENTIONS.md", "../AGENTS.md"]
related: ["architecture/codebase-structure", "architecture/project-state"]
---

# Coding Conventions

*Analysis: 2026-06-22*

## Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| Components (reusable) | PascalCase + `.component.tsx` | `AccountCard.component.tsx` |
| Pages | PascalCase + `.tsx` | `DashboardPage.tsx` |
| Hooks | camelCase + `use*.ts` | `useSyncFinance.ts` |
| Stores | camelCase + `use*Store.ts` | `useFinanceStore.ts` |
| Utilities | camelCase + `.utils.tsx` | `variables.utils.tsx` |
| Types | PascalCase + `.types.tsx` | `auth.types.tsx` |
| Interfaces | `I` prefix for data models | `IAuthState`, `ITransaction` |
| Props interfaces | PascalCase (no `I` prefix) | `TransactionFormProps` |
| Functions | camelCase, verb-noun | `addTransaction`, `deleteCategory` |
| Booleans | `is` / `has` / `show` prefix | `isSaving`, `hasLocalChanges`, `showSettings` |
| Constants (module-level) | UPPER_SNAKE_CASE | `DEFAULT_ACCOUNT`, `DEFAULT_CATEGORIES` |

## Import Order

1. Third-party npm packages (descending alpha: MUI icons, MUI core, dayjs, firebase, i18next, lucide-react, react, recharts, zustand)
2. Blank line
3. Internal barrel imports (from `src/analytics` etc.)
4. Internal relative imports (descending path specificity)

No path aliases configured — all imports use relative paths.

## TypeScript Settings

- **Config:** `tsconfig.app.json`
- Target: ES2022, Strict: true
- Module: ESNext with bundler resolution
- `verbatimModuleSyntax` — requires explicit `import type`
- `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`: true
- JSX: `react-jsx` (React 19 automatic transform)
- `noEmit`: true (Vite handles bundling)

```typescript
import type { User } from 'firebase/auth';              // type-only
import { useFinanceStore, type Transaction } from '...'; // mixed import
```

## ESLint

- ESLint v10 with flat config (`eslint.config.js`)
- Plugins: `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Suppressions: `// eslint-disable-next-line @typescript-eslint/no-explicit-any` for MUI event handlers

## Error Handling Pattern

```typescript
// Store action pattern (repeated 30+ times)
try {
  set({ isSaving: true, saveError: null });
  // optimistic update via set()
  // Firestore write via updateDoc()
} catch (err) {
  set({ saveError: err instanceof Error ? err.message : 'Failed', isSaving: false });
  console.error('actionName error:', err);
}
```

## Store Pattern

- Zustand with TypeScript generics: `create<FinanceState>()`
- All actions async: validate → optimistic update → Firestore persist → error rollback
- Cross-store reads via `getState()` (not hooks)
- `saveError: string | null` field for user-facing error display

## Exports

- **Named exports** — hooks, utilities, types, validation functions
- **Default exports** — page components, singleton components
- **Barrel files** — `index.ts` in store subdirs + analytics dir, explicit re-exports (not `export *`)

## Component Structure

```typescript
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  const { t } = useTranslation();
  const [localState, setLocalState] = useState(initial);
  const computed = useMemo(() => { ... }, [deps]);
  const handleAction = () => { ... };
  return ( <JSX /> );
};
```

## Branch Strategy

See [[wiki/conventions/branch-strategy.md]] for full rules.

TL;DR: Never commit to `development`/`main` directly. Branch as `feat/YATF-{n}` or `fix/YATF-{n}`. PR to `development`.

## Related

- [[wiki/architecture/codebase-structure]]
- [[wiki/architecture/concerns-and-tech-debt]]
