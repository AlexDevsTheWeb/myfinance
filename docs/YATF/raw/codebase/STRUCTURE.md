# Codebase Structure

**Analysis Date:** 2026-06-22

## Directory Layout

```
myfinance/
├── src/                          # Application source
│   ├── main.tsx                  # Entry point: React root + providers
│   ├── App.tsx                   # Router, auth listener, protected routes
│   ├── App.css                   # Minimal global app styles
│   ├── index.css                 # Global CSS reset / base styles
│   │
│   ├── pages/                    # Top-level route components (8 pages)
│   │   ├── LoginPage.tsx         #   (/) - Auth entry (Google OAuth + email/password)
│   │   ├── DashboardPage.tsx     #   (/dashboard) - Home: recap, charts, tx table
│   │   ├── TransactionsPage.tsx  #   (/transactions) - Full transaction list
│   │   ├── AnalysisPage.tsx      #   (/analysis) - Annual/monthly analysis tables
│   │   ├── InsightsPage.tsx      #   (/insights) - Deep analytics with charts
│   │   ├── SalaryPage.tsx        #   (/salary) - Salary tracking
│   │   ├── CarPage.tsx           #   (/car) - Car mileage & tire management
│   │   ├── UtilitiesPage.tsx     #   (/utilities) - Utility bill tracking
│   │   └── ConfigPage.tsx        #   (/config) - Settings, categories, accounts, backup
│   │
│   ├── components/               # Reusable UI components
│   │   ├── layout/
│   │   │   └── Layout.tsx        #   App shell: AppBar, nav drawer, breadcrumbs, FAB
│   │   ├── dashboard/
│   │   │   ├── RecapCards.tsx    #   Balance/income/expense summary cards
│   │   │   ├── AccountCard.component.tsx  # Individual account card with sparkline
│   │   │   ├── Charts.tsx        #   Cash flow area chart (12-month)
│   │   │   └── TransactionTable.tsx # Recent transactions table
│   │   ├── modals/
│   │   │   └── TransactionModal.tsx # Modal wrapper for transaction add/edit
│   │   ├── forms/
│   │   │   └── TransactionForm.tsx   # Reusable transaction/recurring form with validation
│   │   ├── analysis/
│   │   │   ├── AnalysisTables.tsx        # Yearly income/expense tables
│   │   │   └── FinancialTrendChart.tsx   # Trend chart for a selected year
│   │   ├── common/
│   │   │   ├── YearSelector.component.tsx # Year dropdown selector
│   │   │   └── VersionFooter.tsx         # Build version footer
│   │   └── TransactionError.tsx          # Global save error banner
│   │
│   ├── store/                    # State management (Zustand)
│   │   ├── useFinanceStore.ts    # Central finance store: all CRUD + state (~1200+ lines)
│   │   ├── useAuthStore.ts       # Auth state store (11 lines)
│   │   ├── defaults.ts           # Default values for accounts, categories, settings, modules
│   │   ├── types/
│   │   │   ├── index.ts          # Re-exports finance.types
│   │   │   └── finance.types.ts  # All I-prefixed interfaces for finance data
│   │   ├── validation/
│   │   │   ├── index.ts          # Re-exports validation functions
│   │   │   └── finance.validation.ts # validateTransaction, validateRecurringTransaction
│   │   ├── sanitization/
│   │   │   ├── index.ts          # Re-exports sanitization functions
│   │   │   ├── transaction.ts    # sanitizeTransaction for Firestore
│   │   │   └── recurring.ts      # sanitizeRecurring for Firestore
│   │   ├── backup/
│   │   │   └── index.ts          # Backup/restore: createBackup, validateBackupData, parseBackup, previewBackup
│   │   └── sync/
│   │       └── index.ts          # Firestore init helpers: getDefaultUserConfig, getUserDocRef, initializeUserData
│   │
│   ├── analytics/                # Derived analytics computations & chart components
│   │   ├── index.ts              # Barrel: re-exports types, hooks, components
│   │   ├── types.ts              # Analytics-specific types (IAnalyticsFilters, ICategoryBreakdown, etc.)
│   │   ├── hooks/
│   │   │   ├── index.ts          # Re-exports all analytics hooks
│   │   │   ├── useNetWorth.ts    # Net worth time series (monthly balance)
│   │   │   ├── useCategoryBreakdown.ts # Spending breakdown by category/subcategory
│   │   │   ├── useAccountBreakdown.ts  # Per-account balance percentages
│   │   │   └── useMonthlyComparison.ts # Month-over-month & year-over-year
│   │   └── components/
│   │       ├── index.ts          # Re-exports all analytics chart components
│   │       ├── NetWorthChart.tsx
│   │       ├── CategoryPieChart.tsx
│   │       ├── CategoryBarChart.tsx
│   │       ├── MonthlyComparisonChart.tsx
│   │       ├── AccountBreakdownChart.tsx
│   │       └── AnalyticsFilters.tsx   # Date range, granularity, category filter UI
│   │
│   ├── hooks/                    # Shared React hooks
│   │   ├── useSyncFinance.ts     # Firestore init + realtime snapshot sub
│   │   └── useLogout.ts          # Sign out + localStorage cleanup + redirect
│   │
│   ├── lib/                      # Library initialization & configuration
│   │   ├── firebase.ts           # Firebase app init, Auth, Firestore, Google provider
│   │   ├── i18n.ts               # i18next config with dayjs locale sync
│   │   └── converters.ts         # FirestoreDataConverter for UserDoc (typing + serialization)
│   │
│   ├── types/                    # Shared TypeScript interfaces
│   │   ├── auth.types.tsx        # IAuthState interface (user, loading, isLoggingOut)
│   │   └── props.types.tsx       # ITabPanelProps
│   │
│   ├── theme/
│   │   └── theme.ts              # MUI dark theme with custom palette, typography, component overrides
│   │
│   ├── locales/                  # i18n translation JSON files
│   │   ├── it.json               # Italian translations (primary, fallback)
│   │   └── en.json               # English translations
│   │
│   ├── utils/
│   │   └── variables.utils.tsx   # getEnvVar: typed access to Vite env variables
│   │
│   └── assets/
│       └── react.svg             # Default Vite React logo
│
├── public/                       # Static assets served by Vite
├── dist/                         # Production build output (gitignored)
├── scripts/
│   └── generate-version.js       # Pre-build script: writes version info
├── docs/                         # Documentation files
├── .planning/                    # GSD planning artifacts
├── .github/                      # GitHub config (workflows, etc.)
├── .firebase/                    # Firebase local cache (gitignored)
│
├── package.json                  # Dependencies, scripts (v2026.2.1)
├── tsconfig.json                 # TS project references root
├── tsconfig.app.json             # TS config for app source
├── tsconfig.node.json            # TS config for scripts/config
├── vite.config.ts                # Vite build config
├── eslint.config.js              # ESLint flat config
├── firebase.json                 # Firebase hosting config
├── firestore.rules               # Firestore security rules
├── .nvmrc                        # Node version requirement
├── .versionrc                    # standard-version config
├── .env                          # Local environment variables (gitignored — never read)
├── .env.development              # Dev environment variables (gitignored)
├── .env.production               # Production environment variables (gitignored)
├── index.html                    # Vite HTML entry point
├── AGENTS.md                     # Dev agent instructions (build, branch workflow, firebase setup)
└── README.md                     # Project readme
```

## Directory Purposes

**`src/pages/`:**
- Purpose: Top-level route components that compose layout, data, and child components into complete views
- Contains: 8 page components, one per route
- Key files: `DashboardPage.tsx`, `ConfigPage.tsx` (897 lines — largest page), `InsightsPage.tsx`
- New pages go here and must be registered in `App.tsx` Routes

**`src/components/`:**
- Purpose: Reusable UI components organized by domain/feature
- Contains: Subdirectories for `layout/`, `dashboard/`, `modals/`, `forms/`, `analysis/`, `common/`
- Key files: `Layout.tsx` (425 lines — App shell), `TransactionForm.tsx` (388 lines — reusable form with validation)
- Components typically use MUI `@mui/material` primitives and access stores directly via `useFinanceStore()`

**`src/store/`:**
- Purpose: All state management, CRUD logic, data validation, sanitization, backup, and sync helpers
- Contains: Two Zustand stores + domain-organized subdirectories
- Key files: `useFinanceStore.ts` (~1200+ lines — the largest file), `useAuthStore.ts` (11 lines)
- Subdirectories: `types/`, `validation/`, `sanitization/`, `backup/`, `sync/` — each with an `index.ts` barrel export

**`src/analytics/`:**
- Purpose: Derived financial computations encapsulated as React hooks, plus chart visualization components
- Contains: 4 custom hooks (`useNetWorth`, `useCategoryBreakdown`, `useAccountBreakdown`, `useMonthlyComparison`), 6 chart components, shared types, barrel index
- Pattern: Hooks read from `useFinanceStore` and compute via `useMemo`; chart components are thin recharts wrappers

**`src/hooks/`:**
- Purpose: Shared React hooks that don't belong to a specific domain
- Contains: `useSyncFinance.ts` (Firestore sync lifecycle), `useLogout.ts` (auth sign-out + cleanup)

**`src/lib/`:**
- Purpose: Third-party library initialization and configuration
- Contains: `firebase.ts` (Firebase SDK setup), `i18n.ts` (i18next config), `converters.ts` (Firestore type converter)

**`src/types/`:**
- Purpose: Shared TypeScript interfaces used across the app
- Contains: `auth.types.tsx`, `props.types.tsx`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React root render with all providers (Theme, Localization, I18n)
- `src/App.tsx`: Router definition (BrowserRouter), auth state listener, protected route gate
- `index.html`: Vite HTML entry (root `<div>` in `<body>`)

**Configuration:**
- `package.json`: Dependencies, npm scripts, version
- `vite.config.ts`: Vite build configuration
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`: TypeScript project references
- `eslint.config.js`: ESLint flat config (v10)
- `firebase.json`: Firebase hosting configuration
- `firestore.rules`: Firestore security rules
- `.nvmrc`: Node.js version requirement
- `scripts/generate-version.js`: Pre-build version injection

**Core Logic:**
- `src/store/useFinanceStore.ts`: All CRUD operations (transactions, accounts, categories, recurring, car, tires, backup)
- `src/store/useAuthStore.ts`: Auth state management
- `src/hooks/useSyncFinance.ts`: Firestore sync lifecycle
- `src/lib/converters.ts`: Firestore document serialization

**Theming:**
- `src/theme/theme.ts`: MUI dark theme (muted indigo primary, dark slate background, Inter font)

**Testing:**
- Not applicable — no test suite exists in this repo

## Naming Conventions

**Files:**
- **React components:** `PascalCase.tsx` — e.g., `DashboardPage.tsx`, `Layout.tsx`, `RecapCards.tsx`
- **React hooks:** `camelCase.ts` — e.g., `useSyncFinance.ts`, `useLogout.ts`, `useNetWorth.ts`
- **Utilities/helpers:** `camelCase.ts` or `camelCase.tsx` — e.g., `variables.utils.tsx`, `converters.ts`
- **Stores:** `camelCase.ts` — e.g., `useFinanceStore.ts`, `useAuthStore.ts`
- **Types:** `camelCase.types.tsx` — e.g., `auth.types.tsx`, `finance.types.ts`
- **Config files:** `kebab-case.*` — e.g., `vite.config.ts`, `tsconfig.app.json`
- **Locales:** Language code: `it.json`, `en.json`

**Directories:**
- **Component subdirectories:** `kebab-case` — `dashboard/`, `modals/`, `forms/`, `analysis/`, `common/`, `layout/`
- **Store subdirectories:** `kebab-case` — `types/`, `validation/`, `sanitization/`, `backup/`, `sync/`

**Component Naming:**
- **Page components:** `{Name}Page.tsx` — matches the route they serve
- **Regular components:** `{Name}.tsx` — e.g., `Layout.tsx`, `RecapCards.tsx`, `Charts.tsx`
- **Modal components:** `{Name}Modal.tsx` — e.g., `TransactionModal.tsx`
- **Form components:** `{Name}Form.tsx` — e.g., `TransactionForm.tsx`
- **Chart components:** `{Name}Chart.tsx` — e.g., `NetWorthChart.tsx`, `CategoryPieChart.tsx`
- **Common components:** `{Name}.component.tsx` — e.g., `AccountCard.component.tsx`, `YearSelector.component.tsx`

## Where to Add New Code

**New Feature (e.g., new financial module):**
- Primary code: `src/pages/{FeatureName}Page.tsx`
- Components: `src/components/{feature-name}/`
- Store logic: Add to `src/store/useFinanceStore.ts` OR (preferred) create `src/store/use{Feature}Store.ts`
- Types: Add interfaces to `src/store/types/finance.types.ts`
- Route registration: Add `<Route>` in `src/App.tsx` (line 58-99)
- Navigation: Add nav link in `src/components/layout/Layout.tsx` drawer (line 87-120)
- Locales: Add translation keys to `src/locales/{it,en}.json`

**New Component:**
- Implementation: `src/components/{domain}/{ComponentName}.tsx`
- If reusable across domains: `src/components/common/{ComponentName}.component.tsx`
- Always import types from `src/store/types/` or `src/types/`

**New Analytics / Chart:**
- Hook: `src/analytics/hooks/use{Computation}.ts` — pattern: read from `useFinanceStore`, compute with `useMemo`
- Component: `src/analytics/components/{Name}Chart.tsx` — recharts wrapper
- Types: `src/analytics/types.ts`
- Register in barrel files: `src/analytics/hooks/index.ts`, `src/analytics/components/index.ts`, `src/analytics/index.ts`

**New Utility Function:**
- Shared helpers: `src/utils/{domain}.utils.ts` or `src/utils/{domain}.utils.tsx`
- Avoid adding to `src/lib/` (reserved for third-party lib init)

**New Store / State:**
- Simple store: `src/store/use{Name}Store.ts` — follow `useAuthStore.ts` pattern (11 lines)
- Complex store: Create subdirectory `src/store/{name}/` with `types/`, `validation/`, etc.
- Avoid adding to `useFinanceStore.ts` — prefer domain-specific stores to prevent god-store growth

**New Hook:**
- `src/hooks/use{Name}.ts` — only for hooks shared across components/pages
- Domain-specific hooks live in their domain folder (e.g., `src/analytics/hooks/`)

## Special Directories

**`.planning/`:**
- Purpose: GSD planning artifacts (codebase maps, phase plans, roadmaps)
- Generated: Yes (by `/gsd-map-codebase`, `/gsd-plan-phase`)
- Committed: Yes (shared planning state)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No (`.gitignore`)

**`dist/`:**
- Purpose: Production build output
- Generated: Yes (by `npm run build`)
- Committed: No (`.gitignore`)

**`.firebase/`:**
- Purpose: Firebase local emulator cache
- Generated: Yes
- Committed: No (`.gitignore`)

---

*Structure analysis: 2026-06-22*
