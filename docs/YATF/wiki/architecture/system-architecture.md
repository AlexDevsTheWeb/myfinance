---
type: Architecture
description: "System overview, component responsibilities, and end-to-end data flow."
title: "System Architecture"
tags: [architecture, system, data-flow]
created: 2026-06-22
updated: 2026-07-11
status: active
sources: ["raw/codebase/ARCHITECTURE.md"]
related: ["architecture/codebase-structure", "architecture/external-integrations", "architecture/concerns-and-tech-debt"]
---

# System Architecture

*Analysis: 2026-07-11*

## Overview

Client-side SPA with centralized Zustand state and Firebase Firestore backend sync. 4-layer architecture with unidirectional data flow: UI → Zustand actions → Firestore writes → Firestore snapshot → Zustand state → UI re-render.

```text
┌───────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                            │
│        React 19 + TypeScript · MUI v9 · React Router v7              │
├───────────────────────┬───────────────────────┬───────────────────────┤
│   Pages (14 total)    │  Layout & Navigation  │   Shared Components   │
└───────────┬───────────┴───────────┬───────────┴────────────┬──────────┘
            │                       │                        │
            ▼                       ▼                        ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         State / Logic Layer                           │
│                   Zustand Stores · Custom Hooks                        │
├──────────────────────┬──────────────────────┬─────────────────────────┤
│  useAuthStore        │  useFinanceStore     │  useInvestmentStore     │
│  useBudgetStore      │  useProjection-      │  8 hooks               │
│                      │  SettingsStore       │                        │
└───────────┬──────────┴───────────┬──────────┴────────────┬────────────┘
            │                      │                       │
            ▼                      ▼                       ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        Data / Persistence Layer                       │
│                Firebase · Firestore · i18n · localStorage              │
├───────────────────────────────────────────────────────────────────────┤
│  Firestore: users/{userId} (single doc) + 4 subcollections            │
│  Firestore Converter: userDocConverter (src/lib/converters.ts)        │
│  Backup/Import: JSON export via Backup module                         │
└───────────────────────────────────────────────────────────────────────┘
```

## Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| Presentation | `src/pages/`, `src/components/`, `src/analytics/components/` | Renders UI, handles user interaction |
| State/Logic | `src/store/`, `src/hooks/`, `src/analytics/hooks/` | State management + business logic + derived data |
| Data/Persistence | `src/lib/`, `src/locales/` | Firebase config, Firestore converter, i18n, utilities |

## Pages (14 total)

| Route | Page | Tab Nesting |
|-------|------|-------------|
| `/` | LoginPage | — |
| `/dashboard` | DashboardPage | — |
| `/transactions` | TransactionsPage | — |
| `/finance` | FinancePage | Tabs: SalaryPage + InsightsPage |
| `/investments` | InvestmentsPage | Tabs: InvestmentPage + ProjectionsPage |
| `/budget` | BudgetPage | — |
| `/car` | CarPage | — |
| `/utilities` | UtilitiesPage | — |
| `/config` | ConfigPage | — |
| `/analysis` | AnalysisPage | Redirects to `/insights` (dead — no route exists) |

## Stores (5 Zustand)

| Store | Responsibility | Lines |
|-------|---------------|-------|
| `useFinanceStore` | Core finance: transactions, accounts, categories, recurring, car, utilities, backup | ~1250 |
| `useInvestmentStore` | ETF transactions, portfolio snapshots, broker accounts, PAC, dividends | ~585 |
| `useBudgetStore` | Budget targets CRUD | ~100 |
| `useAuthStore` | Auth state (uid, loading) | 11 |
| `useProjectionSettingsStore` | Inflation/tax rate settings from Firestore | 71 |

## Hooks (8)

| Hook | Purpose |
|------|---------|
| `useSyncFinance` | Finance → Firestore sync (init + realtime listener) |
| `useInvestmentSync` | Investment → Firestore sync (+ broker migration) |
| `useBudgetSync` | Budget → Firestore sync |
| `useMarketData` | Fetches stock prices from yfin.dev API |
| `useHistoricalSnapshots` | Records daily portfolio snapshots to subcollection |
| `usePacAutomation` | Auto-generates recurring PAC transactions |
| `useProjections` | Financial projection calculations |
| `useLogout` | Sign out handler |

## Data Flow

### Primary CRUD Path
1. **User action** → Layout opens TransactionModal → TransactionForm submits
2. **Store action** → `useFinanceStore.addTransaction()` called
3. **Validation** → `validateTransaction()` called; rejects with `saveError` if invalid
4. **Optimistic update** → Immediate `set()` to Zustand state
5. **Firestore write** → `updateDoc(docRef, { transactions: sanitized })`
6. **Rollback on error** → `catch` reverts state, sets `saveError`
7. **Realtime confirmation** → `onSnapshot` picks up Firestore write, syncs via `setAll`

### State Sync Flow (Firebase → Local)
1. `useSyncFinance`, `useInvestmentSync`, `useBudgetSync` each detect user
2. `runTransaction`: read existing doc OR create default user doc
3. Call `setAll()` to populate stores from Firestore data
4. Subscribe via `onSnapshot` for real-time remote updates
5. `checkRecurring()` called after initial load

### Analytics/Computed Data Flow
1. Pages consume raw data from Zustand stores via selectors
2. Analytics hooks compute derived data using `useMemo`
3. Chart components render MUI X Charts using hook output
4. `budgetEngine.ts` computes budget progress, savings rate, burn-up data

## Key Abstractions

- **Zustand Stores:** Global state with async actions; `getState()` for cross-store reads
- **FirestoreDataConverter (`userDocConverter`):** Type-safe serialization in `src/lib/converters.ts`
- **Validation Module:** Pure functions in `src/store/validation/` returning `{ valid, error? }`
- **Sanitization Module:** Strips non-Firestore-safe fields before writes in `src/store/sanitization/`
- **Backup Module:** JSON export/import with version metadata and validation
- **Analytics Module:** 6 hooks + 6 chart components in `src/analytics/`
- **Sync Module:** Shared Firestore initialization in `src/store/sync/index.ts`

## Anti-Patterns (Identified)

| Pattern | Issue |
|---------|-------|
| Zustand God Store | `useFinanceStore` ~1250 lines — single monolith violating SRP |
| Firestore Array Full Rewrite | Writes entire array on every mutation instead of `arrayUnion`/`arrayRemove` |
| State + Actions in Same File | Type definitions and all actions co-located in one massive file |
| Cross-Store `getState()` | Stores call `useAuthStore.getState().user?.uid` creating tight coupling |
| Single-doc Firestore schema | All data in one `users/{userId}` doc — 1 MiB limit risk |

## Error Handling

- `saveError` state field on `useFinanceStore` — set on any Firestore failure
- `TransactionError` component in `App.tsx` — global Snackbar display
- try/catch with `console.error` — all Firebase operations wrapped
- Validation pre-check — `{ valid, error }` return pattern from validation module
- Optimistic rollback — state reverts on Firestore write failure

## Related

- [[wiki/architecture/codebase-structure]]
- [[wiki/architecture/external-integrations]]
- [[wiki/architecture/concerns-and-tech-debt]]
