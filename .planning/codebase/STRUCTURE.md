# Codebase Structure

**Analysis Date:** 2026-04-23

## Directory Layout

```
[project-root]/
├── public/                    # Static assets
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── analysis/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── modals/
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                  # Firebase configuration
│   ├── pages/                # Route page components
│   ├── store/                # Zustand state stores
│   ├── theme/                # MUI theme configuration
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── App.tsx               # Main app with routing
│   ├── App.css               # App-level CSS
│   ├── index.css             # Global styles
│   └── main.tsx              # React entry point
├── .env                      # Environment variables template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite build config
└── eslint.config.js        # ESLint config
```

## Directory Purposes

**`src/components/`:**
- Contains: Reusable React components organized by feature area
- Key files: TransactionForm, TransactionModal, Layout, Charts, TransactionTable

**`src/pages/`:**
- Contains: Route-level page components rendered byreact-router
- Key files: DashboardPage, TransactionsPage, ConfigPage, LoginPage

**`src/store/`:**
- Contains: Zustand state management stores
- Key files: useFinanceStore.ts (main data), useAuthStore.ts (auth state)

**`src/hooks/`:**
- Contains: Custom React hooks for cross-cutting concerns
- Key files: useSyncFinance.ts (Firestore sync), useLogout.ts (auth logout)

**`src/lib/`:**
- Contains: External library configurations
- Key files: firebase.ts (Firebase init), converters.ts (Firestore converters)

**`src/theme/`:**
- Contains: MUI theme customization
- Key files: theme.ts (custom Material-UI theme)

**`src/types/`:**
- Contains: TypeScript type definitions
- Key files: auth.types.tsx, props.types.tsx

**`src/utils/`:**
- Contains: Utility functions
- Key files: variables.utils.tsx (env var accessor)

**`public/`:**
- Contains: Static assets (favicons, app icons)
- Generated: No

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React app bootstrap, MUI ThemeProvider wrapping
- `src/App.tsx`: BrowserRouter setup, route definitions, ProtectedRoute

**Configuration:**
- `src/lib/firebase.ts`: Firebase app, auth, firestore, google provider initialization
- `src/theme/theme.ts`: MUI theme with dark mode, custom palette
- `src/utils/variables.utils.tsx`: Environment variable getter with error handling

**Core Logic:**
- `src/store/useFinanceStore.ts`: All finance data operations (transactions, categories, accounts, recurring, car, utilities)
- `src/hooks/useSyncFinance.ts`: Firestore real-time sync, new user initialization
- `src/components/forms/TransactionForm.tsx`: Transaction/reccurring form with autocomplete

**Testing:**
- No test suite exists in this repo

## Naming Conventions

**Files:**
- PascalCase for components: `TransactionForm.tsx`, `DashboardPage.tsx`
- camelCase for stores/hooks/utils: `useFinanceStore.ts`, `useSyncFinance.ts`, `variables.utils.tsx`
- kebab-case for common components: `YearSelector.component.tsx`

**Directories:**
- kebab-case: `components/dashboard`, `pages`, `store`

**Types:**
- PascalCase: `Transaction`, `Account`, `Category`, `RecurringTransaction`

## Where to Add New Code

**New Feature:**
- Primary code: `src/pages/` (new page component)
- Component logic: `src/components/` (reusable parts)
- Data layer: `src/store/useFinanceStore.ts` (new store actions)

**New Component/Module:**
- Implementation: `src/components/` subdirectory by feature
- Example: `src/components/new-feature/`

**Utilities:**
- Shared helpers: `src/utils/`
- Type definitions: `src/types/`

## Special Directories

**`public/`:**
- Purpose: Static assets served as-is
- Generated: No (manual favicon setup)
- Committed: Yes

**`src/store/`:**
- Purpose: Client-side state persistence via Zustand persist middleware
- Note: Uses localStorage as intermediate cache

**`.env` files:**
- Purpose: Environment variable configuration
- Required keys: VITE_FIREBASE_* (7 keys), VITE_REACT_APP_TITLE
- NEVER committed: Contains Firebase credentials

---

*Structure analysis: 2026-04-23*