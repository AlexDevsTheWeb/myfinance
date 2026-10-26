<!-- refreshed: 2026-07-11 -->
# Architecture

**Analysis Date:** 2026-07-11

## System Overview

```text
┌───────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                            │
│        React 19 + TypeScript · MUI v6 · React Router v7              │
├───────────────────────┬───────────────────────┬───────────────────────┤
│   Pages (src/pages/)  │  Layout & Navigation  │   Shared Components   │
│   DashboardPage       │  Layout.tsx           │   TransactionModal    │
│   TransactionsPage    │  Sidebar.tsx          │   TransactionForm     │
│   FinancePage         │  Breadcrumbs           │   TransactionError    │
│   InvestmentsPage     │  FAB (+ button)        │   ...                 │
│   BudgetPage          │                       │                        │
│   CarPage             │                       │                        │
│   ... (13 total)      │                       │                        │
└───────────┬───────────┴───────────┬───────────┴────────────┬──────────┘
            │                       │                        │
            ▼                       ▼                        ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         State / Logic Layer                           │
│                   Zustand Stores · Custom Hooks                        │
├──────────────────────┬──────────────────────┬─────────────────────────┤
│  useAuthStore        │  useFinanceStore     │  useInvestmentStore     │
│  (auth state)        │  (transactions,      │  (ETF, portfolio,      │
│                      │   accounts, cats,    │   broker config,       │
│  useBudgetStore      │   recurring, car,    │   dividends, cash)     │
│  (budget targets)    │   utilities)         │                         │
│                      │                       │                         │
│  useProjection-      │  Hooks:              │  Analytics hooks:      │
│  SettingsStore        │  useSyncFinance      │  usePortfolio          │
│                      │  useInvestmentSync   │  useNetWorth           │
│                      │  useBudgetSync       │  useCategoryBreakdown  │
│                      │  useMarketData       │  useMonthlyComparison  │
│                      │  usePacAutomation    │  useAccountBreakdown   │
│                      │  useProjections      │  useTaxTracking        │
└───────────┬──────────┴───────────┬──────────┴────────────┬────────────┘
            │                      │                       │
            ▼                      ▼                       ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        Data / Persistence Layer                       │
│                Firebase · Firestore · i18n · localStorage              │
├───────────────────────────────────────────────────────────────────────┤
│  Firestore: users/{userId} (single doc with all user data)            │
│  Firestore Converter: userDocConverter (src/lib/converters.ts)        │
│  Backup/Import: JSON export via Backup module                         │
│  i18n: react-i18next with localStorage caching                        │
└───────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Auth Store | User authentication state, loading state | `src/store/useAuthStore.ts` |
| Finance Store | Core finance data (transactions, accounts, categories, recurring, car, utilities) | `src/store/useFinanceStore.ts` |
| Investment Store | ETF transactions, portfolio snapshots, broker accounts, PAC, dividends | `src/store/useInvestmentStore.ts` |
| Budget Store | Budget targets CRUD | `src/store/useBudgetStore.ts` |
| Projection Settings Store | Inflation/tax rate settings from Firestore | `src/store/useProjectionSettingsStore.ts` |
| Sync (Finance) | Firestore read/init/subscribe → calls `setAll` on finance store | `src/hooks/useSyncFinance.ts` |
| Sync (Investment) | Firestore read/init/subscribe → calls `setAll` on investment store | `src/hooks/useInvestmentSync.ts` |
| Sync (Budget) | Firestore read/init/subscribe → calls `setBudgetTargets` | `src/hooks/useBudgetSync.ts` |
| Budget Engine | Pure functions: `computeBudgetProgress`, `computeSavingsRate`, `computeBurnUpData` | `src/lib/budgetEngine.ts` |
| Analytics | Self-contained analytics hooks & chart components for insights | `src/analytics/` |
| Layout | App shell with sidebar, breadcrumbs, FAB, TransactionModal | `src/components/layout/Layout.tsx` |
| Sidebar | Navigation drawer with collapsible mode, module-aware items | `src/components/layout/Sidebar.tsx` |

## Pattern Overview

**Overall:** Single-document Firestore persistence with optimistic Zustand stores and real-time sync

**Key Characteristics:**
- All user data stored in a single Firestore document: `users/{userId}`
- Three independent Zustand stores, each synced to different slices of the same Firestore document
- Optimistic updates with Firestore write-then-rollback-on-error pattern
- Real-time sync via `onSnapshot` (Firestore listener) with pending-write guard
- Modular domain architecture: pages are thin wrappers consuming stores and hooks directly
- No traditional service layer — data operations are embedded directly in store actions
- Domain-specific sub-modules for validation, sanitization, and backup

## Layers

**Presentation Layer:**
- Purpose: Renders UI, handles user interaction
- Location: `src/pages/`, `src/components/`, `src/analytics/components/`
- Contains: React components (pages, layout, UI components, charts)
- Depends on: Zustand stores (via hooks), analytics hooks, lib utilities
- Used by: React Router (`src/App.tsx`)

**State/Logic Layer:**
- Purpose: Manages application state, computes derived data, handles business logic
- Location: `src/store/`, `src/hooks/`, `src/analytics/hooks/`
- Contains: Zustand stores with embedded async actions, React hooks for data sync, analytics hooks
- Depends on: Firebase SDK (`firebase/firestore`, `firebase/auth`), lib utilities
- Used by: All page and component files

**Data/Persistence Layer:**
- Purpose: External persistence, authentication, localization
- Location: `src/lib/`, `src/locales/`
- Contains: Firebase config + auth, Firestore converter (`userDocConverter`), backup/export utilities, i18n configuration, compound interest math, budget engine
- Depends on: Firebase SDK, dayjs, i18next
- Used by: Stores, hooks, and components

## Data Flow

### Primary Request Path — Transaction CRUD

1. User clicks "+" button in Layout FAB — opens `TransactionModal` (`src/components/layout/Layout.tsx:170-220`)
2. User fills form in `TransactionForm` (`src/components/forms/TransactionForm.tsx`) — calls `useFinanceStore.getState().addTransaction(tx)`
3. Store action validates (via `validateTransaction`), optimistically updates in-memory state, sorts transactions, sets `isSaving: true` (`src/store/useFinanceStore.ts:152-181`)
4. Store writes sanitized transactions array to Firestore via `updateDoc(docRef, { transactions: sanitized })` (`src/store/useFinanceStore.ts:169-171`)
5. On error, store rolls back: filters out the failed transaction and sets `saveError` (`src/store/useFinanceStore.ts:175-178`)
6. `TransactionError` component (`src/components/TransactionError.tsx`) listens to `saveError` and shows a Snackbar
7. Firestore `onSnapshot` in `useSyncFinance` (`src/hooks/useSyncFinance.ts:47-61`) fires for remote changes but skips if `hasPendingWrites` is true

### State Synchronization Flow (Firebase → Local)

1. User logs in → `onAuthStateChanged` in `App.tsx` sets user on `useAuthStore` (`src/App.tsx:53-59`)
2. `useSyncFinance`, `useInvestmentSync`, `useBudgetSync` each detect user and initialize:
   - `runTransaction`: read existing doc OR create default user doc (`src/hooks/useSyncFinance.ts:27-37`, `src/store/sync/index.ts:50-66`)
   - Call `setAll()` to populate store from Firestore data
3. Subscribe via `onSnapshot` for real-time remote updates (`src/hooks/useSyncFinance.ts:47-61`)
4. `checkRecurring()` is called after initial load to generate recurring transactions (`src/store/useFinanceStore.ts:787-873`)

### Analytics/Computed Data Flow

1. Pages consume raw data from Zustand stores (`useFinanceStore`, `useBudgetStore`, `useInvestmentStore`)
2. Analytics hooks compute derived data (net worth, category breakdown, portfolio stats) using `useMemo` and store selectors
3. Chart components render using analytics hook output
4. `budgetEngine.ts` (`src/lib/budgetEngine.ts`) computes budget progress using pure functions: `computeBudgetProgress`, `computeSavingsRate`, `computeHistoricalSavingsRate`, `computeBurnUpData`

**State Management:**
- Optimistic updates: all mutations apply to in-memory state first, then persist to Firestore
- Error rollback: on Firestore write failure, state reverts and `saveError` is set
- Real-time sync: `onSnapshot` listens for remote changes, guarded by `hasPendingWrites` to avoid loop
- Cross-store reads: stores access each other via `useAuthStore.getState().user?.uid` to get the current user ID
- All state is client-only during session; Firestore is the single source of truth

## Key Abstractions

**Zustand Stores:**
- Purpose: Each store manages a domain slice of user data
- Examples: `src/store/useFinanceStore.ts`, `src/store/useInvestmentStore.ts`, `src/store/useBudgetStore.ts`, `src/store/useAuthStore.ts`, `src/store/useProjectionSettingsStore.ts`
- Pattern: `create<State>()((set, get) => ({...}))` with async actions that call `set()` for optimistic updates then Firestore `updateDoc()` for persistence

**Firestore Converter (`userDocConverter`):**
- Purpose: Ensures type-safe serialization/deserialization between Firestore documents and TypeScript types
- Location: `src/lib/converters.ts`
- Pattern: `FirestoreDataConverter<UserDoc>` with `toFirestore()` and `fromFirestore()` methods that handle null checks, type coercion, and default values

**Validation Module:**
- Purpose: Validates transactions, recurring transactions, ETF transactions, broker config before persistence
- Location: `src/store/validation/`
- Files: `finance.validation.ts`, `investment.validation.ts`
- Pattern: Pure validation functions returning `{ valid: boolean; error?: string }`

**Sanitization Module:**
- Purpose: Strips non-Firestore-safe fields before writing to Firestore
- Location: `src/store/sanitization/`
- Files: `transaction.ts`, `recurring.ts`, `investment.ts`
- Pattern: Pure functions that map objects to Firestore-compatible shapes

**Backup Module:**
- Purpose: Export/import all user data as JSON, with validation before import
- Location: `src/store/backup/index.ts`
- Pattern: Creates `BackupData` with version metadata; validates with `validateBackupData`; supports both file and object import

**Analytics Module:**
- Purpose: Self-contained analytics subsystem with hooks and chart components
- Location: `src/analytics/`
- Files: `hooks/` (6 hooks), `components/` (6 chart components), `types.ts`
- Pattern: Hooks accept filter configs, return derived data; chart components render MUI X-Charts

**Sync Module:**
- Purpose: Shared Firestore initialization and document reference
- Location: `src/store/sync/index.ts`
- Functions: `getDefaultUserConfig()`, `getUserDocRef(userId)`, `initializeUserData(userId, onDataLoaded)`

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads the Vite-bundled app
- Responsibilities: Initializes React root, wraps App in ThemeProvider (MUI), LocalizationProvider (MUI X-date), I18nextProvider, CssBaseline

**React Router Entry:**
- Location: `src/App.tsx`
- Responsibilities: Defines all routes, renders ProtectedRoute wrapper, initializes sync hooks and data migration on mount, renders global TransactionError Snackbar

**Authentication Entry:**
- Location: `src/pages/LoginPage.tsx`
- Triggers: User navigates to `/`
- Responsibilities: Provides Google OAuth (via Firebase `signInWithPopup`) and email/password auth

## Architectural Constraints

- **Threading:** Single-threaded (React SPA). All async operations use Promise-based Firestore calls.
- **Global state:** Five Zustand stores at module level — `useAuthStore`, `useFinanceStore`, `useInvestmentStore`, `useBudgetStore`, `useProjectionSettingsStore`. All are singletons.
- **Cross-store coupling:** Stores access each other via `getState()` (e.g., `useAuthStore.getState().user?.uid`). This creates implicit dependencies: finance/investment/budget stores depend on auth store for the user ID.
- **Firestore document size limit:** All user data lives in a single `users/{userId}` document (max 1 MiB). This is a hard scaling limit — large transaction histories could hit this.
- **Circular imports:** Avoided via selective `getState()` calls instead of direct import of store creation functions.
- **No API layer:** All data persistence is direct Firestore calls inside store actions. No REST/gRPC layer exists.

## Anti-Patterns

### Firestore Array Mutation via Full Rewrite

**What happens:** Instead of using Firestore `arrayUnion`/`arrayRemove` for adding/removing items from arrays, the code reads the entire array, modifies it in memory, replaces the Firestore field with the entire new array via `updateDoc`.
**Why it's wrong:** Writes the entire array field on every mutation, increasing bandwidth and Firestore write costs. Also creates race conditions if multiple clients modify different parts of the same array.
**Do this instead:** Use `arrayUnion`/`arrayRemove` for simple add/remove operations. Full rewrites are currently used in `addTransaction`, `updateTransaction`, `deleteTransaction`, and many others in `src/store/useFinanceStore.ts`.

### State + Actions in Same File

**What happens:** Store type definitions (`interface FinanceState`), state initialization, and all action implementations are in a single 1200+ line file (`src/store/useFinanceStore.ts`).
**Why it's wrong:** Makes the file hard to navigate, test, and maintain. Business logic is scattered across one massive file.
**Do this instead:** Split actions into separate files (e.g., `src/store/actions/transactionActions.ts`, `src/store/actions/accountActions.ts`, etc.) and compose them into the store, similar to how validation is already split into `src/store/validation/`.

### Cross-Store Access via getState()

**What happens:** Stores call `useAuthStore.getState().user?.uid` at the start of nearly every action to get the current user ID.
**Why it's wrong:** Creates tight coupling between stores at runtime. If the auth store shape changes, all other stores break.
**Do this instead:** Pass the `userId` as a parameter, or use a middleware that injects it. Alternatively, use a single combined store or React context for the user ID.

## Error Handling

**Strategy:** Optimistic updates with error rollback. Each async action sets `isSaving: true`, catches errors, reverts state, and sets `saveError`. 

**Patterns:**
- Store-level `saveError: string | null` — set on write failure, cleared via `clearSaveError()`
- Global `TransactionError` component (`src/components/TransactionError.tsx`) renders a `Snackbar` with error message from `useFinanceStore`
- `console.error` logging for all caught errors
- Validation guards: `validateTransaction`/`validateRecurringTransaction` block invalid data before state mutation

## Cross-Cutting Concerns

**Logging:** `console.error` throughout stores and hooks. No structured logging or monitoring.

**Validation:** Pure validation functions in `src/store/validation/`. Called before state mutations in store actions. Covers transactions, recurring transactions, ETF transactions, broker config/accounts, cash adjustments, dividend entries.

**Authentication:** Firebase Auth with `onAuthStateChanged` listener in `src/App.tsx:53-59`. `ProtectedRoute` component wraps all authenticated routes. Google OAuth via `signInWithPopup` + `GoogleAuthProvider`. Email/password auth via `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`.

**Internationalization:** `react-i18next` with `i18next-browser-languagedetector`. Two locales: `it` (`src/locales/it.json`) and `en` (`src/locales/en.json`). Fallback to Italian. Dayjs locale synced with i18n language.

**Theme:** MUI dark theme with custom chart colors in `src/theme/theme.ts`. Indigo primary (`#5b6cb8`), dark slate backgrounds.

---

*Architecture analysis: 2026-07-11*
