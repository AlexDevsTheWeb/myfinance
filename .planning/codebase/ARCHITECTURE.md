# Architecture

**Analysis Date:** 2026-04-23

## Pattern Overview

**Overall:** Client-side SPA with Firebase backend (Auth + Firestore)

**Key Characteristics:**
- Single Page Application (SPA) using React 19 with TypeScript
- Real-time Firestore synchronization via `onSnapshot` listeners
- Protected routes with authentication gating
- Modular app architecture with enableable features (car management, utility tracker)

## Layers

**Entry Layer:**
- Location: `src/App.tsx`
- Contains: BrowserRouter setup, route definitions, ProtectedRoute wrapper
- Triggers: Firebase auth state changes, app initialization on mount

**Authentication Layer:**
- Location: `src/store/useAuthStore.ts`, `src/hooks/useSyncFinance.ts`
- Contains: Firebase Auth integration, user session management
- Depends on: Firebase Auth
- Used by: ProtectedRoute, Layout component

**State Management Layer:**
- Location: `src/store/useFinanceStore.ts`, `src/store/useAuthStore.ts`
- Contains: Zustand stores for finance data and auth state
- Depends on: Firebase Firestore, Auth
- Used by: All components reading/writing application data

**Data Synchronization Layer:**
- Location: `src/hooks/useSyncFinance.ts`
- Contains: Real-time Firestore sync with `onSnapshot`, new user initialization via transactions
- Depends on: Firestore, Auth store
- Used by: Finance store for bi-directional sync

**UI Components Layer:**
- Location: `src/components/`
- Contains: Dashboard components, forms, modals, layout, analysis charts
- Depends on: Finance store, MUI components
- Used by: Page components

**Page Layer:**
- Location: `src/pages/`
- Contains: Route page components (Dashboard, Transactions, Config, etc.)
- Depends on: UI components, layout
- Used by: App.tsx routes

## Data Flow

**Authentication Flow:**
1. User visits app → `App.tsx` mounts
2. Firebase `onAuthStateChanged` listener activates
3. Auth state updates `useAuthStore` → `loading: false`
4. ProtectedRoute checks user existence

**Data Sync Flow:**
1. User authenticates → `useSyncFinance` hook triggers
2. `onSnapshot` listener attaches to user document in Firestore
3. Firestore document loads into Zustand store via `setAll()`
4. `checkRecurring()` processes recurring transactions

**Write Flow:**
1. User submits transaction form
2. Form component calls store action (e.g., `addTransaction`)
3. Store action updates local Zustand state immediately (optimistic)
4. Store action calls Firestore `updateDoc` to persist
5. `onSnapshot` detects remote change → updates local state (redundant but ensures consistency)

**Recurring Transaction Flow:**
1. App loads → `checkRecurring()` runs
2. Iterates all recurring transactions
3. Checks if instance needed for current period
4. Generates transaction if not deleted and not already created
5. Saves to Firestore with `recurringLinkId` for tracking

## State Management

**Approach:** Zustand with persist middleware + Firestore as backend of record

**Finance Store (`useFinanceStore.ts`):**
- Stores: transactions, accounts, categories, recurringTransactions, carMileage, tireSettings, enabledModules, balanceStartDate
- Pattern: Each action updates local state + writes to Firestore in single operation
- Sync: `onSnapshot` listens to Firestore, ignores local writes via metadata check

**Auth Store (`useAuthStore.ts`):**
- Stores: user (Firebase User object), loading, isLoggingOut
- Pattern: Simple state holder, updated by Firebase auth listener

## Routing Structure

**Public Routes:**
- `/` → LoginPage

**Protected Routes (require authentication):**
- `/dashboard` → DashboardPage (overview with recap cards, charts, recent transactions)
- `/transactions` → TransactionsPage (full transaction list with filters)
- `/salary` → SalaryPage (income vs expense analysis)
- `/analysis` → AnalysisPage (detailed category breakdown)
- `/config` → ConfigPage (settings, account management, categories)
- `/car` → CarPage (vehicle tracking - only if enabledModules.carManagement)
- `/utilities` → UtilitiesPage (utility consumption - only if enabledModules.utilityTracker)

**Route Guards:**
- ProtectedRoute wrapper checks user + loading state
- Conditional rendering for module-gated routes (checks enabledModules)

## Key Abstractions

**Transaction Model:**
- Purpose: Represents a financial transaction
- File: `src/store/useFinanceStore.ts` (lines 20-33)
- Fields: id, date, description, category, subcategory, amount, type, accountId, recurringLinkId, consumption, readingDateStart, readingDateEnd

**Account Model:**
- Purpose: Financial accounts for multi-account tracking
- Fields: id, name, initialBalance, isDefault

**Category Model:**
- Purpose: Expense/income categorization
- Fields: name, subcategories[]

**RecurringTransaction Model:**
- Purpose: Recurring income/expense templates
- Fields: id, description, category, subcategory, amount, type, dayOfMonth, accountId, startDate, endDate, frequency

## Entry Points

**App Initialization:**
- Location: `src/main.tsx`
- Triggers: ReactDOM.render with ThemeProvider, CssBaseline, App component
- Responsibilities: MUI theme setup, global CSS, app bootstrap

**Authenticated Entry:**
- Location: `src/App.tsx`
- Triggers: Auth state resolved, ProtectedRoute passes
- Responsibilities: Route rendering, Layout wrapping

**Data Entry:**
- Location: `src/hooks/useSyncFinance.ts`
- Triggers: User object available from auth
- Responsibilities: Initialize new user in Firestore, attach real-time listener

## Error Handling

**Strategy:** Silent failures with console.error logging

**Patterns:**
- Store actions check for user existence before Firestore operations
- Try/catch in user initialization transaction
- onSnapshot ignores pending writes to prevent sync loops

## Cross-Cutting Concerns

**Logging:** `console.error` for critical failures only

**Validation:** MUI Form validation in TransactionForm, type checks in store actions

**Authentication:** Firebase Auth with Google provider, ProtectedRoute guards

---

*Architecture analysis: 2026-04-23*