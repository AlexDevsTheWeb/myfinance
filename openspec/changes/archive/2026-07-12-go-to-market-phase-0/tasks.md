## 1. Error Boundary

- [x] 1.1 Create `src/components/ErrorBoundary.tsx` class component with `componentDidCatch` and `getDerivedStateFromError`
- [x] 1.2 Wrap `<App />` in `src/main.tsx` with `<ErrorBoundary>`

## 2. MUI Dialogs

- [x] 2.1 Create `src/components/shared/ConfirmDialog.tsx` — reusable MUI Dialog for confirmations
- [x] 2.2 Create `src/components/shared/AlertSnackbar.tsx` — reusable MUI Snackbar for alerts
- [x] 2.3 Replace native dialogs in `src/pages/ConfigPage.tsx` — 8 instances (4 alert, 4 confirm)
- [x] 2.4 Replace `window.confirm()` in `src/pages/InvestmentPage.tsx` — 1 instance
- [x] 2.5 Replace `window.confirm()` in `src/components/dashboard/TransactionTable.tsx` — 1 instance

## 3. Loading States

- [x] 3.1 Add `isLoading` flag to `useSyncFinance` hook — start `true`, set `false` after first snapshot
- [x] 3.2 Add `isLoading` flag to `useInvestmentSync` hook — start `true`, set `false` after first snapshot
- [x] 3.3 Add loading indicator to `DashboardPage` — show `CircularProgress` while `isLoading`
- [x] 3.4 Add loading indicator to `TransactionsPage` — show `CircularProgress` while `isLoading`
- [x] 3.5 Add loading indicator to `InvestmentPage` — show `CircularProgress` while `isLoading`
