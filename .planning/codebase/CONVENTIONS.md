# Coding Conventions

**Analysis Date:** 2026-04-23

## Naming Patterns

**Files:**
- Components: PascalCase with `.component.tsx` suffix (e.g., `YearSelector.component.tsx`)
- Pages: PascalCase with `Page.tsx` suffix (e.g., `DashboardPage.tsx`)
- Hooks: camelCase with `.ts` extension (e.g., `useSyncFinance.ts`)
- Stores: camelCase with `use` prefix and `Store.ts` suffix (e.g., `useAuthStore.ts`)
- Utils: camelCase with `.utils.tsx` suffix (e.g., `variables.utils.tsx`)
- Types: PascalCase with `.types.tsx` suffix (e.g., `auth.types.tsx`)

**Interfaces:**
- Prefix with `I` (e.g., `IAuthState`, `IProps`)

**Functions/Variables:**
- camelCase for functions and variables

**Constants:**
- camelCase or SCREAMING_SNAKE_CASE (e.g., `drawerWidth = 240`)

## Code Style

**Formatting:**
- Tool: ESLint with `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- No Prettier configuration detected (no `.prettierrc*` files)
- No enforced formatting on commit

**Linting:**
- Config: `eslint.config.js` using flat config format
- Ignores: `dist` directory
- Extends: recommended configs for JS, TypeScript, React Hooks, React Refresh

**Indentation:**
- Based on ESLint defaults (likely 2 spaces - standard for Vite/React projects)

## Import Organization

**Order (as observed in files):**
1. Third-party library imports (`react`, `firebase`, `mui`, etc.)
2. Relative imports (`./`, `../`)
3. Type imports with `import type` syntax

**Pattern:**
```typescript
import { useState } from 'react';
import { Box, Button } from '@mui/material';
import type { User } from 'firebase/auth';
import Layout from './components/layout/Layout';
import { useAuthStore } from './store/useAuthStore';
```

**No path aliases configured** (no `tsconfig.json` path mappings beyond defaults)

## Component Structure

**React Components:**
```typescript
// Functional components with explicit FC type annotation
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks first
  const [state, setState] = useState();
  
  // Handlers
  const handleClick = () => { ... };
  
  // Render
  return ( ... );
};

export default ComponentName;
```

**Props Pattern:**
- Interface-based props defined in `src/types/props.types.tsx`
- `React.FC` typing with explicit interface

## Styling Approach

**Framework:** MUI Emotion (CSS-in-JS)

**Pattern:**
- MUI `sx` prop for inline styles (preferred for simple styles)
- MUI `styled()` API for reusable styled components
- Direct CSS-in-JS via `@mui/styled` or `@emotion/styled`

**Theme:**
- Dark mode via MUI `createTheme`
- Custom palette: Indigo primary (`#6366f1`), Pink secondary (`#ec4899`)
- Font: Inter
- Border radius: 12px default
- Defined in `src/theme/theme.ts`

**Example:**
```typescript
<Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
  <Typography variant="h4" sx={{ fontWeight: 800 }}>
    Title
  </Typography>
</Box>
```

## State Management

**Library:** Zustand v5

**Pattern:**
```typescript
import { create } from 'zustand';
import type { IState } from '../types/state.types';

export const useStore = create<IState>((set) => ({
  // State
  items: [],
  // Actions
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

**Stores location:** `src/store/`

## TypeScript Usage

**Strict mode:** Likely enabled (standard in modern React projects)

**Type imports:**
```typescript
import type { User } from 'firebase/auth';  // Preferred for type-only imports
import { create } from 'zustand';            // Runtime imports
```

**Type definitions location:** `src/types/`

## Error Handling

**Approach:** Firebase error handling via try/catch in hooks (e.g., `useLogout.ts`)

**Loading states:** Managed via Zustand stores with `loading` boolean

**No centralized error boundary detected**

## Commit Conventions

**Pre-commit hooks:** None configured (no Husky, no lint-staged)

**Commit commands:** Manual via git

**Lint command:** `npm run lint` - runs ESLint on entire project

---

*Convention analysis: 2026-04-23*