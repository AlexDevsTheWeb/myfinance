<!-- refreshed: 2026-06-22 -->
# Architecture

**Analysis Date:** 2026-06-22

## System Overview

```text
┌───────────────────────────────────────────────────────────────────┐
│                        AUTH LAYER                                  │
│  LoginPage ──► Firebase Auth ──► onAuthStateChanged ──► Zustand   │
│  `src/pages/LoginPage.tsx`    `src/lib/firebase.ts`                │
└───────────────────────────┬───────────────────────────────────────┘
                            │ user
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                    ENTRY POINT / PROVIDER LAYER                     │
│  main.tsx  ThemeProvider  LocalizationProvider  I18nextProvider     │
│  `src/main.tsx`  MUI theme  dayjs adapter  i18n                     │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                      ROUTING & AUTH GATE                            │
│  App.tsx ── BrowserRouter ── Routes ── ProtectedRoute              │
│  `src/App.tsx` (line 57-103)  8 protected page routes              │
│  ProtectedRoute checks user auth, wraps in <Layout>                │
└───────────────────────────┬───────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│  PAGES LAYER      │ │  ANALYTICS       │ │ COMPONENTS LAYER     │
│  DashboardPage    │ │  useNetWorth     │ │ Layout.tsx           │
│  Transactions     │ │  useCategory     │ │ RecapCards           │
│  ConfigPage       │ │  Breakdown       │ │ Charts               │
│  SalaryPage       │ │  useAccount      │ │ TransactionTable     │
│  InsightsPage     │ │  Breakdown       │ │ TransactionModal     │
│  CarPage          │ │  Chart widgets   │ │ TransactionForm      │
│  UtilitiesPage    │ │                  │ │ AccountCard          │
│  `src/pages/`     │ │  `src/analytics/`│ │ `src/components/`    │
└────────┬─────────┘ └────────┬─────────┘ └───────────┬──────────┘
         │                    │                        │
         ▼                    ▼                        ▼
┌───────────────────────────────────────────────────────────────────┐
│                        STATE LAYER (Zustand)                       │
│                                                                     │
│  useAuthStore ──────► Auth state (user, loading, isLoggingOut)     │
│  `src/store/useAuthStore.ts`                                        │
│                                                                     │
│  useFinanceStore ───► Financial data + all CRUD actions             │
│  `src/store/useFinanceStore.ts`                                     │
│    ├─ types/          Finance type definitions (I-prefixed)         │
│    ├─ validation/     Transaction/recurring validation              │
│    ├─ sanitization/   Data sanitization for Firestore               │
│    ├─ backup/         Data export/import with validation            │
│    ├─ sync/           Firestore init + snapshot sync helpers        │
│    └─ defaults.ts     Default accounts, categories, settings        │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE LAYER                           │
│                                                                     │
│  Firebase Firestore ──► users/{userId} document                     │
│    ├─ FirestoreDataConverter (userDocConverter)                     │
│    │  `src/lib/converters.ts`                                       │
│    ├─ Firestore onSnapshot (realtime sync)                          │
│    │  `src/hooks/useSyncFinance.ts`  (line 47-61)                   │
│    └─ Firestore runTransaction (user init)                          │
│       `src/hooks/useSyncFinance.ts`  (line 24-43)                   │
│                                                                     │
│  Firebase Auth ──► Google + email/password providers                 │
│    `src/lib/firebase.ts`                                            │
└───────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App` | Auth listener, route definition, ProtectedRoute gate | `src/App.tsx` |
| `Layout` | AppBar, nav drawer, breadcrumbs, FAB for new tx, TransactionModal | `src/components/layout/Layout.tsx` |
| `LoginPage` | Google OAuth + email/password sign-in/register | `src/pages/LoginPage.tsx` |
| `DashboardPage` | Home: recap cards, net worth chart, account breakdown, tx table | `src/pages/DashboardPage.tsx` |
| `ConfigPage` | Categories, accounts, recurring, backup/restore, modules, language | `src/pages/ConfigPage.tsx` |
| `InsightsPage` | Analytics: pie/bar/line charts, net worth, monthly comparison | `src/pages/InsightsPage.tsx` |
| `useFinanceStore` | All finance CRUD (transactions, accounts, categories, recurring, car, tires, backup) | `src/store/useFinanceStore.ts` |
| `useAuthStore` | Auth state (user, loading, isLoggingOut) | `src/store/useAuthStore.ts` |
| `useSyncFinance` | Firestore init transaction + realtime snapshot subscription | `src/hooks/useSyncFinance.ts` |
| `useNetWorth` | Computed net worth time series from transactions | `src/analytics/hooks/useNetWorth.ts` |
| `useCategoryBreakdown` | Computed spending breakdown by category/subcategory | `src/analytics/hooks/useCategoryBreakdown.ts` |
| `useAccountBreakdown` | Computed per-account balance breakdown | `src/analytics/hooks/useAccountBreakdown.ts` |
| `useMonthlyComparison` | Computed month-over-month and year-over-year comparison | `src/analytics/hooks/useMonthlyComparison.ts` |
| `userDocConverter` | FirestoreDataConverter for typed read/write to users/{uid} | `src/lib/converters.ts` |

## Pattern Overview

**Overall:** Single-page application (SPA) with Zustand-based state management and Firebase backend. The app follows a **layered architecture** with unidirectional data flow: UI → Zustand actions → Firestore writes → Firestore snapshot → Zustand state → UI re-render.

**Key Characteristics:**
- **Global state via Zustand stores** — Two stores: `useAuthStore` (simple, 3 fields) and `useFinanceStore` (large, ~50KB+ with ~70 actions)
- **Optimistic updates with rollback** — Store mutations happen immediately (`set`), then Firestore write is attempted; on error, the state is reverted (e.g., `addTransaction` at line 184-187)
- **Realtime sync via Firestore `onSnapshot`** — Changes from other devices/tabs propagate through Firestore snapshot listener in `useSyncFinance.ts` (line 47-61)
- **Computed analytics via `useMemo` hooks** — Analytics hooks derive data from `useFinanceStore` transactions using `useMemo`; no separate cache
- **Firestore document per user** — All user data stored in a single Firestore doc `users/{userId}` (denormalized, no subcollections)
- **Modular store subdirectories** — `types/`, `validation/`, `sanitization/`, `backup/`, `sync/` organized as folders under `src/store/`

## Layers

**Auth Layer:**
- Purpose: Authenticate users and provide user identity to the app
- Location: `src/lib/firebase.ts`, `src/store/useAuthStore.ts`, `src/pages/LoginPage.tsx`
- Contains: Firebase Auth init, Google auth provider, Zustand auth store
- Depends on: Firebase Auth SDK (`firebase/auth`)
- Used by: `App.tsx` (onAuthStateChanged listener at line 49), `Layout.tsx`, `useSyncFinance.ts`

**Entry Point / Provider Layer:**
- Purpose: Bootstrap React app with providers (theme, date localization, i18n)
- Location: `src/main.tsx`
- Contains: `ThemeProvider`, `LocalizationProvider` (dayjs), `I18nextProvider`
- Depends on: MUI, dayjs, i18next
- Used by: `App.tsx`

**Routing / Auth Gate Layer:**
- Purpose: Route handling and auth-protected route wrapper
- Location: `src/App.tsx`
- Contains: `BrowserRouter`, `Routes`, `ProtectedRoute` wrapper
- Depends on: `react-router-dom`, `useAuthStore`
- Used by: All page components

**Pages Layer:**
- Purpose: Top-level route components; orchestrate layout and data
- Location: `src/pages/`
- Contains: 8 page components (Dashboard, Transactions, Config, Salary, Insights, Car, Utilities, Login)
- Depends on: `useFinanceStore`, `useAuthStore`, analytics hooks, dashboard component composites
- Used by: App.tsx routes

**Analytics Layer:**
- Purpose: Compute derived financial data (net worth, category breakdown, account breakdown, monthly comparison)
- Location: `src/analytics/`
- Contains: Custom hooks (`useNetWorth`, `useCategoryBreakdown`, etc.) and chart components
- Depends on: `useFinanceStore` (read-only), Recharts, MUI
- Used by: `DashboardPage`, `InsightsPage`

**Components Layer:**
- Purpose: Reusable UI components (dashboard widgets, transaction modal/form, layout shell, analysis tables)
- Location: `src/components/`
- Contains: `Layout`, `RecapCards`, `Charts`, `TransactionTable`, `TransactionModal`, `TransactionForm`, `AccountCard`, `AnalysisTables`, `FinancialTrendChart`, `YearSelector`, `VersionFooter`, `TransactionError`
- Depends on: `useFinanceStore`, MUI, lucide-react, recharts

**State Layer (Zustand):**
- Purpose: Global state management for auth + finance data; all CRUD logic lives here
- Location: `src/store/`
- Contains:
  - `useFinanceStore.ts` — Central store with full CRUD for all entities; each action: validate → optimistic update → Firestore write → rollback on error
  - `useAuthStore.ts` — Minimal store (3 fields, 3 setters)
  - `types/` — TypeScript interfaces (all `I`-prefixed)
  - `validation/` — `validateTransaction`, `validateRecurringTransaction`
  - `sanitization/` — Firestore-safe field coercions for transactions and recurring
  - `backup/` — JSON export/import with validation preview
  - `sync/` — Firestore init + snapshot helper functions
  - `defaults.ts` — Default accounts, categories, settings, modules
- Depends on: Firebase Firestore (`firebase/firestore`), dayjs, i18n
- Used by: All page and component files

**Data Persistence Layer:**
- Purpose: Firebase integration — auth + Firestore read/write + realtime sync
- Location: `src/lib/firebase.ts`, `src/lib/converters.ts`, `src/hooks/useSyncFinance.ts`
- Contains: Firebase app init, Firestore `userDocConverter` (with `fromFirestore`/`toFirestore`), realtime sync hook
- Depends on: Firebase SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`)
- Used by: `useSyncFinance`, `useFinanceStore` actions, `LoginPage`

## Data Flow

### Primary Request Path (CRUD)

1. **User action** — User clicks "Add Transaction" button in `Layout.tsx` (line 54-58) → opens `TransactionModal` → fills `TransactionForm.tsx` → submits
2. **Store action invoked** — `useFinanceStore.addTransaction(transaction)` called (line 161-190)
3. **Validation** — `validateTransaction()` called (line 166); rejects with `saveError` if invalid
4. **Optimistic update** — Immediate `set()` to Zustand state (line 174-177): transaction added and sorted descending by date; `hasLocalChanges` set to true
5. **Firestore write** — `updateDoc(docRef, { transactions: sanitized })` (line 178-182); data sanitized via `Sanitization.sanitizeTransaction` (converts undefined → null, coerces types for Firestore)
6. **Rollback on error** — `catch` block (line 183-189) reverts the transaction from state; sets `saveError`
7. **Realtime confirmation** — `useSyncFinance`'s `onSnapshot` (line 47-61) picks up the Firestore write, but skips processing because `hasPendingWrites` is true for local writes; after server confirms, snapshot fires again with `hasPendingWrites: false` → `setAll(data)` syncs state

### Data Initialization Flow

1. `useSyncFinance()` called in `App.tsx` (line 42)
2. On `user` change, runs `initializeUser()` (line 24-43):
   - Uses `runTransaction` to atomically read-or-create the `users/{userId}` doc (line 27-37)
   - If doc exists: `setAll(data)` populates store from Firestore
   - If doc does not exist: creates doc with defaults from `getDefaultUserConfig()` and sets store
3. Subscribes to `onSnapshot` (line 47-61) for realtime updates from other devices

### App Startup Flow

1. `main.tsx` renders React app with MUI ThemeProvider, LocalizationProvider (dayjs), I18nextProvider
2. `App.tsx` mounts:
   - Calls `useSyncFinance()` — starts Firestore sync (only fires when user is authenticated)
   - Calls `_migrateToMultiAccount()` once (line 44-46) — legacy migration: adds `accountId` to transactions/recurring that lack it
   - Registers `onAuthStateChanged` listener (line 49-54) — sets user in auth store, reveals/hides ProtectedRoute
3. User lands on `/` (LoginPage) if unauthenticated, or is redirected to `/dashboard` if user exists

### Recurring Transaction Check Flow

1. Triggered manually in `checkRecurring()` action (line 796-882) — called after recurring add/update and after Firestore snapshot sync
2. Scans all recurring transactions; for each, iterates months/years from `startDate` to now
3. Creates new transactions for months where no transaction exists (and instance not deleted)
4. Sets `recurringLinkId` on generated transactions for tracking/deletion
5. Writes all new transactions to Firestore

**State Management:**
- Zustand stores are the single source of truth for both auth and finance data
- Finance state is fully overwritten on each Firestore snapshot via `setAll(data)` (line 1140)
- No Redux, no Context API beyond MUI's theme provider
- `useAuthStore` uses `getState()` pattern for cross-store reads (finance store reads auth user ID)
- `useFinanceStore` uses `getState()` for reading current state during async Firestore writes

## Key Abstractions

**Zustand Stores:**
- Purpose: Global state + all mutation logic (optimistic CRUD, validation, sanitization, Firestore persistence)
- Examples: `src/store/useFinanceStore.ts`, `src/store/useAuthStore.ts`
- Pattern: Single-argument `create<TSchema>()((set) => ({...}))` with `set()` for state mutation and `getState()` for cross-store reads

**FirestoreDataConverter (userDocConverter):**
- Purpose: Type-safe Firestore document serialization/deserialization for `users/{uid}`
- File: `src/lib/converters.ts` (line 22-168)
- Pattern: `FirestoreDataConverter<UserDoc>` with `toFirestore()` that coerces nullables, and `fromFirestore()` that validates/restores each field with defaults

**Analytics Hooks:**
- Purpose: Derive computed financial metrics from raw transactions (no separate cache layer)
- Examples: `src/analytics/hooks/useNetWorth.ts`, `src/analytics/hooks/useCategoryBreakdown.ts`
- Pattern: `useMemo` with `useFinanceStore()` selector, recalculates when transactions change

**Backup Subsystem:**
- Purpose: Full data export/import with schema validation and preview
- Files: `src/store/backup/index.ts` (216 lines)
- Pattern: `createBackup()` serializes store state → `downloadBackup()` triggers browser download; `parseBackup()` with `validateBackupData()` error collection

## Entry Points

**`main.tsx`:**
- Location: `src/main.tsx`
- Triggers: `npm run dev` / `npm run build` → Vite HTML entry → ReactDOM.createRoot
- Responsibilities: Mount React app with all providers (theme, date adapter, i18n)

**`App.tsx`:**
- Location: `src/App.tsx`
- Triggers: Initial mount + auth state changes
- Responsibilities: Route registration, auth listener, protected route gate, migration hook, sync finance hook

**`useSyncFinance.ts`:**
- Location: `src/hooks/useSyncFinance.ts`
- Triggers: `user` identity changes in auth store
- Responsibilities: Firestore doc init (runTransaction), realtime snapshot subscription

## Architectural Constraints

- **Threading:** Single-threaded (React + browser main thread). All async work uses Promises; Firestore writes fire-and-forget with `.catch()` error handling
- **Global state:** Two Zustand singletons (`useAuthStore`, `useFinanceStore`) — both module-level stores created at import time. `useFinanceStore` is very large (~50+ KB after 1200+ lines of actions)
- **Circular imports:** `useFinanceStore` imports from `useAuthStore` (line 6) and `useAuthStore` does not import from `useFinanceStore` — no cycles detected. `useSyncFinance` imports both stores — this is the convergence point
- **Firestore document size limit:** Single `users/{uid}` doc contains all user data (transactions, accounts, recurring, categories, car, etc.). As transaction count grows, this will approach Firestore's 1 MiB document size limit
- **No test suite:** Per `AGENTS.md`: "No test suite exists in this repo"
- **No pre-commit hooks:** Per `AGENTS.md`

## Anti-Patterns

### Zustand God Store

**What happens:** `useFinanceStore` (`src/store/useFinanceStore.ts`) is a single Zustand store containing ~70 state fields + actions, spanning 1200+ lines. It manages transactions, accounts, categories, recurring, car mileage, tire changes, backup/import, and module toggling — everything in one monolithic store.

**Why it's wrong:** Violates separation of concerns. A change to any store action requires understanding the entire file. Bundle splitting is impossible. The store file is already capped at 50KB output during reading (line 1199). Testing is impractical.

**Do this instead:** Split into domain-specific stores (e.g., `useTransactionStore`, `useAccountStore`, `useCarStore`, `useConfigStore`) and compose them. Each store is independently testable and changeable.

### Optimistic Update Without Debounce

**What happens:** Each store action (e.g., `addTransaction` at line 161-190) does an immediate `set()` and then `await updateDoc()` for Firestore. Rapid successive mutations cause multiple Firestore writes and potential race conditions between optimistic state and snapshot sync.

**Why it's wrong:** Firestore writes are expensive; each action writes the full array (e.g., all transactions) instead of individual document writes. The `hasLocalChanges` / `isSaving` flags (line 133-136) attempt to gate this but can be unreliable.

**Do this instead:** Batch local mutations and debounce Firestore writes, or use Firestore's native array operations more aggressively.

### Single-Doc Firestore Schema

**What happens:** All user data in one Firestore document at `users/{userId}` (`src/lib/converters.ts` line 22-168). The `userDocConverter` serializes/deserializes arrays of transactions, accounts, recurring, categories, car records, and tire changes into a single document.

**Why it's wrong:** Firestore's 1 MiB document size limit will be hit as transaction history grows. Writing any single field requires rewriting the entire document (due to `updateDoc` with full arrays). Concurrent writes from multiple devices are prone to conflicts.

**Do this instead:** Use subcollections (`users/{userId}/transactions/{txId}`, `users/{userId}/accounts/{accountId}`) for growing data, and keep only metadata in the parent doc.

### Unnecessary `getState()` Calls

**What happens:** Multiple actions read current state via `useFinanceStore.getState()` between `set()` and Firestore writes (e.g., line 179 `useFinanceStore.getState().transactions`). This is a pattern throughout the store.

**Why it's wrong:** Creates a hard coupling between the reactive `set()` call and the imperative `getState()` read. If state structure changes between these calls (the `set` callback's closure captures the wrong value), bugs can occur.

**Do this instead:** Use `set` callback's `state` parameter for all reads during mutation, and refactor to keep writes as a single atomic operation.

## Error Handling

**Strategy:** Error-first with optimistic rollback

**Patterns:**
- **`saveError` state field** — All actions set `saveError` on failure (`useFinanceStore.ts` line 136)
- **`clearSaveError()` action** — Resets error state (line 1142)
- **`TransactionError` component** — Rendered in `App.tsx` (line 101) to display global save errors
- **try/catch with console.error** — All Firebase operations wrapped; errors logged to console
- **Validation pre-check** — `validateTransaction()` / `validateRecurringTransaction()` called before any mutation; returns `{ valid, error }` pattern
- **No user-facing error notifications** — Errors are set in state but not surfaced via toast/snackbar; only `TransactionError` component handles them

## Cross-Cutting Concerns

**Logging:** Console-based only (`console.error` in all catch blocks). No structured logging, no remote error reporting.

**Validation:** Located in `src/store/validation/finance.validation.ts`. Two functions: `validateTransaction` and `validateRecurringTransaction`. Returns `{ valid: boolean, error?: string }`. Called at the start of every CRUD action in `useFinanceStore`.

**Authentication:** Firebase Auth with Google OAuth (`signInWithPopup`) and email/password (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`). Auth state persisted via `onAuthStateChanged` listener in `App.tsx` (line 49).

**Internationalization:** i18next with `react-i18next`. Two locales in `src/locales/` (Italian `it.json`, English `en.json`). Fallback language is Italian. Language detected via localStorage then navigator. Syncs dayjs locale.

---

*Architecture analysis: 2026-06-22*
