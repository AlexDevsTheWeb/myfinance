<!-- refreshed: 2026-05-03 -->
# Architecture

**Analysis Date:** 2026-05-03

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     React Router                             │
│                   (App.tsx - Routes)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ LoginPage    │  │ DashboardPage│  │ Other Pages     │    │
│  │ (public)     │  │ (protected)  │  │ (protected)     │    │
│  └──────────────┘  └──────────────┘  └──────────────────┘    │
│         │                │                    │              │
│         └────────────────┼────────────────────┘              │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Zustand State Stores                    │    │
│  │  useAuthStore (user, loading, logout state)         │    │
│  │  useFinanceStore (transactions, categories, etc.)   │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│         ┌────────────────┼────────────────────┐             │
│         ▼                ▼                    ▼             │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐    │
│  │ Components  │  │   Hooks    │  │      Lib          │    │
│  │ (UI layer)  │  │ (sync/logout)│  │ (firebase/i18n) │    │
│  └─────────────┘  └─────────────┘  └───────────────────┘    │
│                          │                                   │
└──────────────────────────┼──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                          │
│         (Firestore + Firebase Auth)                          │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App.tsx` | Routing, auth state observation, protected routes | `src/App.tsx` |
| `useAuthStore` | Authentication state (user, loading, logout) | `src/store/useAuthStore.ts` |
| `useFinanceStore` | Finance data, CRUD operations, validation | `src/store/useFinanceStore.ts` |
| `useSyncFinance` | Firestore real-time sync, user initialization | `src/hooks/useSyncFinance.ts` |
| `firebase.ts` | Firebase initialization, auth, firestore refs | `src/lib/firebase.ts` |
| `main.tsx` | React entry point, provider composition | `src/main.tsx` |
| `theme.ts` | MUI dark theme configuration | `src/theme/theme.ts` |

## Pattern Overview

**Overall:** Client-side SPA with centralized state and cloud backend sync

**Key Characteristics:**
- Single Page Application (SPA) using React + Vite
- Centralized state management via Zustand
- Real-time cloud sync via Firebase Firestore
- Protected routes with authentication gate
- Optimistic UI updates with error rollback

## Layers

**UI Layer:**
- Purpose: Render application UI based on state
- Location: `src/components/`, `src/pages/`
- Contains: React components, MUI layouts, forms
- Depends on: Zustand stores
- Used by: React Router

**State Layer:**
- Purpose: Manage application state and business logic
- Location: `src/store/`
- Contains: Zustand stores with actions
- Depends on: Firebase SDK, TypeScript types
- Used by: UI components, hooks

**Data Layer:**
- Purpose: Handle persistence and sync with backend
- Location: `src/hooks/`, `src/lib/`
- Contains: Firebase hooks, Firestore config
- Depends on: Firebase SDK
- Used by: State stores

**Infrastructure Layer:**
- Purpose: Initialize external services
- Location: `src/lib/firebase.ts`, `src/lib/i18n.ts`
- Contains: Firebase app, i18n config
- Used by: Data layer, main entry

## Data Flow

### Primary Request Path

1. **Entry:** User navigates to protected route → `App.tsx` checks auth (`src/App.tsx:20`)
2. **Auth Check:** `ProtectedRoute` validates user via `useAuthStore` → redirects to login if null
3. **Data Load:** `useSyncFinance` hook fires on user change → loads Firestore data via transaction (`src/hooks/useSyncFinance.ts:68`)
4. **State Populate:** `setAll` updates `useFinanceStore` → triggers re-render
5. **UI Render:** Pages read from store, display data → mutations trigger Firestore updates

### Transaction Create Flow

1. User submits form → `TransactionModal` calls `addTransaction`
2. Validation runs via `validateTransaction` (`src/store/useFinanceStore.ts:77`)
3. Optimistic update: state updates immediately
4. Firestore `updateDoc` persists to `users/{userId}` document
5. Error: rollback state, set `saveError`

## Key Abstractions

**Zustand Store Pattern:**
- Purpose: Centralized state with async actions
- Examples: `useFinanceStore`, `useAuthStore`
- Pattern: Create store with typed interface, actions update state and persist to Firestore

**Firestore Document per User:**
- Purpose: Per-user data isolation
- Examples: `doc(db, 'users', user.uid)`
- Pattern: All user data stored in single document, sync via `onSnapshot`

**Protected Route Wrapper:**
- Purpose: Auth gate for protected pages
- Examples: `ProtectedRoute` in `src/App.tsx:20`
- Pattern: Wraps component, checks auth state, shows loading or redirects

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads index.html
- Responsibilities: Bootstrap React, apply MUI theme, i18n, router

**Route Entry:**
- Location: `src/App.tsx`
- Triggers: URL change in browser
- Responsibilities: Match route, render page or redirect

**Auth Entry:**
- Location: `src/App.tsx:47` (onAuthStateChanged)
- Triggers: Firebase auth state change
- Responsibilities: Sync auth user to Zustand store

**Data Sync Entry:**
- Location: `src/hooks/useSyncFinance.ts:58`
- Triggers: User object changes
- Responsibilities: Load or create user document, subscribe to changes

## Architectural Constraints

- **Threading:** Single-threaded JavaScript, React uses main thread for UI
- **Global state:** Two Zustand stores at module level (`useAuthStore`, `useFinanceStore`)
- **Circular imports:** None detected between stores and components
- **No test suite:** Project lacks automated tests

## Anti-Patterns

### Direct Store Mutations Without Validation

**What happens:** Some store actions bypass validation when updating existing data
**Why it's wrong:** Data integrity depends on each caller running validation first
**Do this instead:** Wrap all state mutations with validation in the store itself (`src/store/useFinanceStore.ts:316-341` shows correct pattern with `validateTransaction`)

### Tight Coupling Between Components

**What happens:** Pages directly call store actions and read state
**Why it's wrong:** Makes testing difficult, component logic mixed with business logic
**Do this instead:** Consider extracting custom hooks for complex operations

### No Error Boundaries

**What happens:** No React error boundary components to catch runtime errors
**Why it's wrong:** A component crash can take down entire app
**Do this instead:** Add error boundary at route level

## Error Handling

**Strategy:** Component-level error display + global error state in store

**Patterns:**
- `saveError` in store: Set on any Firestore operation failure, displayed in UI
- `TransactionError` component: Global error snackbar shown at root (`src/App.tsx:95`)
- Optimistic rollback: On mutation failure, state reverts to previous

## Cross-Cutting Concerns

**Logging:** Console logging for errors only, no structured logging framework

**Validation:** Store-level validation functions (`validateTransaction`, `validateRecurringTransaction`)

**Authentication:** Firebase Auth with Google Provider, persisted session via Firebase SDK

---

*Architecture analysis: 2026-05-03*