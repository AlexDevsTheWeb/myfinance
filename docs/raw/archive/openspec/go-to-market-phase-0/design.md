## Context

MyFinance has 0 error handling for render crashes, uses native `alert()`/`confirm()` dialogs in 3 pages, and lacks loading indicators on all data-driven pages. These are quick fixes (estimated ~5h total) that dramatically improve the beta user experience.

## Goals / Non-Goals

**Goals:**
- Catch any render crash with a friendly error UI instead of white screen
- Replace all native browser dialogs with MUI components
- Show loading indicators (skeleton/spinner) on Dashboard, Transactions, Investments during initial Firestore sync

**Non-Goals:**
- Do not rewrite sync hooks or change data flow architecture
- Do not add loading states to ConfigPage or BudgetPage (lower traffic, existing "isSaving" is sufficient)
- Do not refactor large files beyond the dialog replacements

## Decisions

### 1. Error Boundary: Class component wrapping App

**Chosen:** A simple `ErrorBoundary` class component at `src/components/ErrorBoundary.tsx` wrapping `<App />` in `main.tsx`. Fallback UI is a centered Paper with error icon, message, and retry button that resets error state and reloads.

**Alternatives considered:** react-error-boundary library — not worth the dependency for ~40 lines of code.

### 2. Dialog replacement: Two reusable components

**Chosen:**
- `ConfirmDialog` — MUI `<Dialog>` with title, message, confirm/cancel buttons. Replaces `window.confirm()`.
- `AlertSnackbar` — MUI `<Snackbar>` + `<Alert>` for simple notifications. Replaces `alert()`.

Both live in `src/components/shared/`. They follow existing patterns (check similar components like `TransactionError.tsx`).

### 3. Loading states: Extend sync hooks with loading flag

**Chosen:** Add an `isLoading` boolean to each sync hook (`useSyncFinance`, `useInvestmentSync`, `useBudgetSync`). Initially `true`, set to `false` after first successful snapshot. Pages read this flag to show `CircularProgress` or `Skeleton` before data.

**Why not a global loading state:** Each page loads independently (finance vs investment vs budget). A global flag would delay all pages unnecessarily.

## Risks / Trade-offs

- **[Low] Error boundary catches dev errors too** — during development, crashes show the fallback instead of the React error overlay. Mitigation: only wrap in production, or keep in dev and add a "Show details" expand in the fallback.
- **[Low] Existing sync hooks pattern** — hooks return data directly without a loading wrapper. Adding `isLoading` changes the return type. Mitigation: extend return type with `isLoading` flag rather than wrapping in a state object — minimal consumer changes.
- **[Low] BudgetPage skipped** — the plan skips BudgetPage loading states. If users report confusion, add in a follow-up.
