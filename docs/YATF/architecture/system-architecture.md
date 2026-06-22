---
title: "System Architecture"
tags: [architecture, system, data-flow]
created: 2026-06-22
updated: 2026-06-22
status: active
sources: ["raw/codebase/ARCHITECTURE.md"]
related: ["architecture/codebase-structure", "architecture/external-integrations", "architecture/concerns-and-tech-debt"]
---

# System Architecture

*Analysis: 2026-06-22*

## Overview

Client-side SPA with centralized Zustand state and Firebase Firestore backend sync. Layered architecture with unidirectional data flow: UI → Zustand actions → Firestore writes → Firestore snapshot → Zustand state → UI re-render.

## Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| Auth | `src/lib/firebase.ts`, `src/store/useAuthStore.ts`, `src/pages/LoginPage.tsx` | Firebase Auth + Zustand auth state |
| Entry/Providers | `src/main.tsx` | ThemeProvider, LocalizationProvider, I18nextProvider |
| Routing/Auth Gate | `src/App.tsx` | BrowserRouter, ProtectedRoute wrapper |
| Pages | `src/pages/` | 8 route components (Dashboard, Transactions, Config, Salary, Insights, Car, Utilities, Login) |
| Analytics | `src/analytics/` | 4 hooks (useNetWorth, useCategoryBreakdown, useAccountBreakdown, useMonthlyComparison) + chart components |
| Components | `src/components/` | Reusable UI (layout/, dashboard/, modals/, forms/, analysis/, common/) |
| State | `src/store/` | `useFinanceStore` (~1200 lines, ~70 actions) + `useAuthStore` (11 lines) + subdirectories (types/, validation/, sanitization/, backup/, sync/) |
| Data Persistence | `src/lib/firebase.ts`, `src/lib/converters.ts`, `src/hooks/useSyncFinance.ts` | Firebase init, FirestoreDataConverter, realtime sync |

## Data Flow

### Primary CRUD Path
1. **User action** → Layout opens TransactionModal → TransactionForm submits
2. **Store action** → `useFinanceStore.addTransaction()` called
3. **Validation** → `validateTransaction()` called; rejects with `saveError` if invalid
4. **Optimistic update** → Immediate `set()` to Zustand state
5. **Firestore write** → `updateDoc(docRef, { transactions: sanitized })`
6. **Rollback on error** → `catch` reverts state, sets `saveError`
7. **Realtime confirmation** → `onSnapshot` picks up Firestore write, syncs via `setAll`

### Startup Flow
1. `main.tsx` renders React with MUI Theme, dayjs Localization, i18next providers
2. `App.tsx` mounts → calls `useSyncFinance()`, registers `onAuthStateChanged`, runs `_migrateToMultiAccount()`
3. If unauthenticated → `/` (LoginPage). If user exists → `/dashboard`

### Recurring Check Flow
1. `checkRecurring()` scans all recurring templates
2. Iterates month-by-month from `startDate` to now
3. Creates transactions for missing months (skipping deleted instances)
4. Sets `recurringLinkId` on generated transactions

## Key Abstractions

- **Zustand Stores:** Global state + all mutation logic; `getState()` for cross-store reads
- **FirestoreDataConverter:** Type-safe Firestore serialization/deserialization in `src/lib/converters.ts`
- **Analytics Hooks:** Derived financial metrics via `useMemo` with `useFinanceStore` selectors
- **Backup Subsystem:** Full data export/import with schema validation (`src/store/backup/index.ts`, 216 lines)

## Anti-Patterns (Identified)

| Pattern | Issue |
|---------|-------|
| Zustand God Store | `useFinanceStore` ~1200 lines, ~70 actions — single monolith |
| Optimistic update without debounce | Rapid successive mutations cause multiple Firestore writes |
| Single-doc Firestore schema | All data in one `users/{userId}` doc — hits 1 MiB limit |
| Unnecessary `getState()` calls | Pattern throughout store; couples `set()` with imperative reads |

## Error Handling

- `saveError` state field — set on any Firestore failure
- `TransactionError` component in `App.tsx` — global Snackbar display
- try/catch with `console.error` — all Firebase operations wrapped
- Validation pre-check — `{ valid, error }` return pattern
- Optimistic rollback — state reverts on Firestore write failure

## Related

- [[architecture/codebase-structure]]
- [[architecture/external-integrations]]
- [[architecture/concerns-and-tech-debt]]
