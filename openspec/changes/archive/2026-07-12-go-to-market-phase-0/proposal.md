## Why

MyFinance is approaching beta launch (issue #138). Before sharing the app with real users, several quick-fix embarrassments must be addressed: no error boundary (white screen on crash), native `alert()`/`confirm()` dialogs that look unprofessional, and missing loading states that show blank/zero data on slow connections. These are low-effort fixes with high impact on first impressions.

## What Changes

- Add a React error boundary wrapping the app to catch render crashes with a fallback UI
- Replace all native `alert()`/`confirm()` calls with MUI `Dialog`/`Snackbar` components across ConfigPage, InvestmentPage, and TransactionTable
- Add loading states (skeleton/spinner) to Dashboard, Transactions, and Investments pages during initial data sync

## Capabilities

### New Capabilities
- `error-boundary`: React error boundary with fallback UI to catch render crashes
- `mui-dialogs`: Replace native browser dialogs with MUI Dialog/Snackbar throughout the app
- `loading-states`: Loading indicators on data-driven pages during Firestore sync

### Modified Capabilities
*(none — requirements are new, not modifications)*

## Impact

- `src/main.tsx` — wrap `<App />` with `<ErrorBoundary>`
- `src/components/` — new `ErrorBoundary.tsx`, `ConfirmDialog.tsx`, `AlertSnackbar.tsx` components
- `src/pages/ConfigPage.tsx` — replace 8 × `alert()`/`confirm()` calls
- `src/pages/InvestmentPage.tsx` — replace 1 × `confirm()` call
- `src/components/dashboard/TransactionTable.tsx` — replace 1 × `confirm()` call
- `src/hooks/` — expose loading state from sync hooks (`useSyncFinance`, `useInvestmentSync`, `useBudgetSync`)
- `src/pages/DashboardPage.tsx`, `src/pages/TransactionsPage.tsx`, `src/pages/InvestmentPage.tsx` — add loading UI
