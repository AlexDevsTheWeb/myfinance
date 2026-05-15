<!-- refreshed: 2026-05-03 -->
# Codebase Structure

**Analysis Date:** 2026-05-03

## Directory Layout

```
myfinance/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── analysis/        # Charts, analysis tables
│   │   ├── common/          # Shared components (YearSelector, VersionFooter)
│   │   ├── dashboard/       # Dashboard-specific (Charts, TransactionTable, RecapCards)
│   │   ├── forms/           # Form components (TransactionForm)
│   │   ├── layout/          # Layout wrapper (Layout)
│   │   └── modals/          # Modal dialogs (TransactionModal)
│   ├── pages/               # Route pages (Dashboard, Transactions, etc.)
│   ├── store/               # Zustand state stores
│   ├── lib/                 # External integrations (firebase, i18n, converters)
│   ├── hooks/               # Custom React hooks (useSyncFinance, useLogout)
│   ├── theme/               # MUI theme configuration
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── locales/            # i18n translation files
│   ├── assets/              # Static assets (images, icons)
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   ├── App.css              # App-level styles
│   └── version.ts           # Version info (generated)
├── public/                  # Static public assets
├── scripts/                 # Build scripts
├── .github/                 # GitHub workflows
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── eslint.config.js         # ESLint config
├── index.html               # HTML entry
├── firebase.json            # Firebase config
└── firestore.rules          # Firestore security rules
```

## Directory Purposes

**src/components/:**
- Purpose: Reusable UI building blocks
- Contains: React components organized by feature area
- Key files: `TransactionTable.tsx`, `TransactionModal.tsx`, `Charts.tsx`, `Layout.tsx`

**src/pages/:**
- Purpose: Route-level components representing app screens
- Contains: Full-page components (Dashboard, Transactions, Salary, Car, etc.)
- Key files: `DashboardPage.tsx`, `TransactionsPage.tsx`, `LoginPage.tsx`

**src/store/:**
- Purpose: Global state management
- Contains: Zustand stores with actions and state
- Key files: `useFinanceStore.ts`, `useAuthStore.ts`

**src/lib/:**
- Purpose: External service configurations and utilities
- Contains: Firebase config, i18n setup, data converters
- Key files: `firebase.ts`, `i18n.ts`, `converters.ts`

**src/hooks/:**
- Purpose: Custom React hooks for reusable logic
- Contains: Sync logic, auth helpers
- Key files: `useSyncFinance.ts`, `useLogout.ts`

**src/theme/:**
- Purpose: MUI theming configuration
- Contains: Dark theme with custom colors and typography
- Key files: `theme.ts`

**src/types/:**
- Purpose: TypeScript type definitions and interfaces
- Contains: Shared types for props, auth, finance models
- Key files: `props.types.tsx`, `auth.types.tsx`

**src/utils/:**
- Purpose: Helper functions and utilities
- Contains: Environment variable access
- Key files: `variables.utils.tsx`

**src/locales/:**
- Purpose: Internationalization translations
- Contains: JSON files for each language
- Key files: `en.json`, `it.json`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React bootstrap with providers (theme, i18n, router)
- `src/App.tsx`: Route definitions and auth state management

**Configuration:**
- `package.json`: Dependencies, scripts, version
- `src/theme/theme.ts`: MUI theme (dark mode, custom palette)
- `src/lib/firebase.ts`: Firebase initialization
- `.env`, `.env.development`, `.env.production`: Environment config

**Core Logic:**
- `src/store/useFinanceStore.ts`: All finance data operations (1225+ lines)
- `src/store/useAuthStore.ts`: Authentication state (11 lines)
- `src/hooks/useSyncFinance.ts`: Firestore real-time sync

**Testing:**
- Not present - project has no test suite

## Naming Conventions

**Files:**
- PascalCase for components: `DashboardPage.tsx`, `TransactionTable.tsx`
- camelCase for stores and hooks: `useFinanceStore.ts`, `useSyncFinance.ts`
- camelCase for utilities: `variables.utils.tsx`
- kebab-case for configs: `firebase.ts`, `eslint.config.js`

**Directories:**
- lowercase with hyphens for generic: `components/`, `pages/`, `store/`
- lowercase for specific: `dashboard/`, `forms/`, `modals/`

**Components:**
- Suffix with type: `.component.tsx` for small reusable, `.tsx` for pages
- Modal suffix: `TransactionModal.tsx`
- Form suffix: `TransactionForm.tsx`

**TypeScript:**
- Interface prefix: `IAuthState`, `Category`, `Transaction`
- Type suffix: only when needed

## Where to Add New Code

**New Feature (new page):**
- Implementation: `src/pages/{FeatureName}Page.tsx`
- Route: Add to `src/App.tsx` with ProtectedRoute wrapper

**New Component:**
- Implementation: `src/components/{area}/{ComponentName}.component.tsx`
- Usage: Import in page

**New Store Action:**
- Implementation: Add method to `useFinanceStore` interface and implementation in `src/store/useFinanceStore.ts`
- Pattern: Follow validation → optimistic update → Firestore persist → error rollback pattern

**New Hook:**
- Implementation: `src/hooks/use{Feature}.ts`
- Usage: Use in component

**New Utility:**
- Implementation: `src/utils/{name}.utils.tsx`
- Export: Barrel export pattern or direct import

**New Type:**
- Implementation: Add to appropriate file in `src/types/`

## Special Directories

**.planning/:**
- Purpose: Implementation plans and specs
- Generated: Yes (created by GSD workflow)
- Committed: Yes

**node_modules/:**
- Purpose: Dependencies
- Generated: Yes (npm install)
- Committed: No (in .gitignore)

**dist/:**
- Purpose: Build output
- Generated: Yes (npm run build)
- Committed: No (in .gitignore)

**public/:**
- Purpose: Static assets (favicons, PWA manifest)
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-05-03*