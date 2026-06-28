---
title: "Manual Review #99 — Implementation Plan"
tags: [plan, ui, frontend]
created: 2026-06-28
updated: 2026-06-28
status: draft
sources: ["raw/99-manual-review-2706.md"]
related: ["features/dashboard-redesign", "features/sidebar-redesign", "bugs/car-statistics-year"]
---

# Plan: Manual Review #99 Implementation

Status: **draft**
Priority: **high**

## Goal

Implement all 7 work items from the 27-06-2026 manual review: dashboard split, account dialog, more charts, vertical sidebar, car statistics bug fix, complete translations, and padding reduction.

---

## Wave 1: Low-Effort Fixes (P0)

### 1.1 Car Statistics Year Bug
**Files:** `src/locales/en.json`, `src/locales/it.json`
**Change:** Replace `{year}` with `{{year}}` and `{title}` with `{{title}}` in keys `car.statistics`, `utilities.total`, `insights.financialTrendTitle`
**Verification:** Navigate to `/car` → heading shows "Statistics 2026"

### 1.2 Hardcoded Strings → Translations
**Files:** `src/components/layout/Layout.tsx`, `src/locales/en.json`, `src/locales/it.json`
**Changes:**
- "Finance" → new key `nav.finance`
- "Impostazioni" → `t('navigation.config')`
- "Logout" → `t('common.logout')`
- "Dashboard" breadcrumb → `t('navigation.dashboard')`
- "New Income" → new key `common.newIncome`
- "New Expense" → new key `common.newExpense`
- "Accounts Detail" → `t('dashboard.accountsDetail')`

---

## Wave 2: Padding Reduction (P1)

### 2.1 Reduce Card Padding System-wide
**Files:** ~20 component files
**Pattern:** Reduce `p: 3` → `p: 1.5` (24px → 12px), `p: 2.5` → `p: 1.5`, `p: 2` → `p: 1.5`/`p: 1`
**Components affected:**
- `dashboard/RecapCards.tsx`, `dashboard/Charts.tsx`, `dashboard/AccountCard.component.tsx`
- `investment/CashInterestCard.tsx`, `investment/PortfolioStats.tsx`, `investment/HoldingsTable.tsx`
- `investment/AllocationDonutChart.tsx`, `investment/PortfolioLineChart.tsx`
- `investment/TaxPocketWidget.tsx`, `investment/PacConfirmationDialog.tsx`
- `projections/ProjectionControls.tsx`, `projections/ProjectionSummary.tsx`, `projections/ProjectionChart.tsx`
- `modals/TransactionModal.tsx`, `budget/BudgetTargetDialog.tsx`
- `CarPage.tsx` Card components
- Various dialog `DialogActions` with `p: 3`
**Approach:** Do all changes in a single pass for consistency.

---

## Wave 3: Account Detail Dialog (P1)

### 3.1 Create AccountDetailDialog
**New file:** `src/components/dashboard/AccountDetailDialog.tsx`
- Full-screen `Dialog` with `maxWidth="xl"` and `fullScreen`
- Shows `AccountCard` for each account (extracted from current dashboard)
- Shows `NetWorthChart` and `AccountBreakdownChart`
- Close button / escape to dismiss

### 3.2 Update Dashboard
**Modify:** `src/pages/DashboardPage.tsx`
- Remove `accountDetails` state toggle
- Remove `AccountCard` rendering block
- Add dialog open state + trigger

### 3.3 Update RecapCards
**Modify:** `src/components/dashboard/RecapCards.tsx`
- Replace `onToggleAccountDetails` prop with `onOpenAccountDialog`

---

## Wave 4: Dashboard Charts & Split (P2)

### 4.1 Strip TransactionTable from Dashboard
**Modify:** `src/pages/DashboardPage.tsx`
- Remove `<TransactionTable onEdit={handleEditTransaction} limit={8} />`
- Remove associated `editModalOpen`/`editTransaction`/`editType` state (if only used by the table)

### 4.2 Add Conditional Charts
**Modify:** `src/pages/DashboardPage.tsx`
- If `investmentTracking` enabled: show portfolio value trend chart
- If `budgetTracking` enabled: show savings rate gauge + burn-up trend
- Monthly income vs expense comparison (reuse analytics pattern)
- All placed in the now-vacated left column (7/12)

---

## Wave 5: Vertical Sidebar (P3)

### 5.1 Create Sidebar Component
**New file:** `src/components/layout/Sidebar.tsx`
- MUI `Drawer` with `variant="permanent"` for desktop
- Groups: Dashboard, Finance (Salary, Insights), Investment (Investments, Projections), Budget, Car, Utilities, Settings, Logout
- Collapsible groups with expand/collapse icons
- Active route highlighting

### 5.2 Simplify Layout
**Modify:** `src/components/layout/Layout.tsx`
- Replace top AppBar navigation buttons with sidebar
- Keep simplified AppBar: logo + user avatar only
- Remove "Finance" dropdown
- Update mobile drawer content to match new grouping

### 5.3 Adjust Main Content Area
**Modify:** `src/components/layout/Layout.tsx`
- Add left margin/offset for the permanent drawer
- Ensure breadcrumbs, container, and FAB still work correctly

---

## Verification

| Item | How to Verify |
|------|--------------|
| Bug fix | `/car` page shows "Statistics 2026" not "Statistics {year}" |
| Translations | All hardcoded strings use `t()` keys; check both EN and IT locales |
| Padding | Cards have 12px padding maximum; visual density increased |
| Account dialog | Click button → full-screen dialog with accounts and charts |
| Dashboard split | No transaction table on dashboard; `/transactions` has full table |
| Added charts | Conditional charts visible when modules enabled |
| Sidebar | Left sidebar visible on desktop with grouped navigation |

## Dependencies

- Waves 1–2 are independent and can be parallelized
- Wave 3 must come before Wave 4 (dialog extraction before dashboard cleanup)
- Wave 5 is independent of the other waves
