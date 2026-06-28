---
title: "Manual Review #99 — Implementation Plan"
tags: [plan, ui, frontend]
created: 2026-06-28
updated: 2026-06-28
status: completed
sources: ["raw/99-manual-review-2706.md"]
related: ["features/dashboard-redesign", "features/sidebar-redesign", "bugs/car-statistics-year"]
---

# Plan: Manual Review #99 Implementation

Status: **completed**
Priority: **high**

## Goal

Implement all 7 work items from the 27-06-2026 manual review: dashboard split, account dialog, more charts, vertical sidebar, car statistics bug fix, complete translations, and padding reduction.

---

## ✅ Wave 1: Low-Effort Fixes (P0)

### 1.1 Car Statistics Year Bug — ✅ Done
**Files:** `src/locales/en.json`, `src/locales/it.json`
**Change:** Replace `{year}` with `{{year}}` and `{title}` with `{{title}}` in keys `car.statistics`, `utilities.total`, `insights.financialTrendTitle`
**Commit:** a6eb836

### 1.2 Hardcoded Strings → Translations — ✅ Done
**Files:** `src/components/layout/Layout.tsx`, `src/locales/en.json`, `src/locales/it.json`
**Changes:**
- "Finance" → new key `nav.finance`
- "Impostazioni" → `t('navigation.config')`
- "Logout" → `t('common.logout')`
- "Dashboard" breadcrumb → `t('navigation.dashboard')`
- "New Income" → new key `common.newIncome`
- "New Expense" → new key `common.newExpense`
- "Accounts Detail" → `t('dashboard.accountsDetail')`
**Commit:** a6eb836

---

## ✅ Wave 2: Padding Reduction (P1)

### 2.1 Reduce Card Padding System-wide — ✅ Done
**Files:** ~20 component files
**Pattern:** Reduce `p: 3` → `p: 1.5` (24px → 12px), `p: 2.5` → `p: 1.5`, `p: 2` → `p: 1.5`/`p: 1`
**Commit:** 5285b66

---

## ✅ Wave 3: Account Detail Dialog (P1)

### 3.1 Create AccountDetailDialog — ✅ Done
**New file:** `src/components/dashboard/AccountDetailDialog.tsx`
- Full-screen `Dialog` with `maxWidth="xl"` and `fullScreen`
- Shows `AccountCard` for each account (extracted from current dashboard)
- Shows `NetWorthChart` and `AccountBreakdownChart`
- Close button / escape to dismiss

### 3.2 Update Dashboard — ✅ Done
**Modify:** `src/pages/DashboardPage.tsx`
- Remove `accountDetails` state toggle
- Remove `AccountCard` rendering block
- Add dialog open state + trigger

### 3.3 Update RecapCards — ✅ Done
**Modify:** `src/components/dashboard/RecapCards.tsx`
- Replace `onToggleAccountDetails` prop with `onOpenAccountDialog`
**Commit:** a6eb836

---

## ✅ Wave 4: Dashboard Charts & Split (P2)

### 4.1 Strip TransactionTable from Dashboard — ✅ Done
**Modify:** `src/pages/DashboardPage.tsx`
- Remove `<TransactionTable onEdit={handleEditTransaction} limit={8} />`
- Remove associated `editModalOpen`/`editTransaction`/`editType` state

### 4.2 Add Conditional Charts — ✅ Done
**Modify:** `src/pages/DashboardPage.tsx`
- If `investmentTracking` enabled: `PortfolioLineChart` with time range selector
- If `budgetTracking` enabled: `SavingsRateGauge` + `BulletChart` snapshots
- All placed in the now-vacated left column (7/12)

### 4.3 Add Module Overview Stat Cards — ✅ Done
**New:** Inline `StatCard` component in `DashboardPage.tsx`
- Row of 4 compact cards after the header, before the main grid
- Conditional per enabled module: Investments, Budget, Car, Utilities
- Each card shows key metric (value/rate/km/total) with accent color
- Clicking navigates to the respective module page
**Commit:** b7cda29

---

## ✅ Wave 5: Vertical Sidebar (P3)

### 5.1 Create Sidebar Component — ✅ Done
**New file:** `src/components/layout/Sidebar.tsx`
- MUI `Drawer` with `variant="permanent"` for desktop
- Groups: Dashboard, Finance (Salary, Insights, Transactions), Investment (Investments, Projections), Budget, Car, Utilities, Settings, Logout
- Collapsible groups with expand/collapse icons
- Active route highlighting with accent color

### 5.2 Simplify Layout — ✅ Done
**Modify:** `src/components/layout/Layout.tsx`
- Replace top AppBar navigation buttons with sidebar
- Keep simplified AppBar: logo only (avatar moved to sidebar)
- Remove "Finance" dropdown
- Update mobile drawer to use same Sidebar component

### 5.3 Adjust Main Content Area — ✅ Done
**Modify:** `src/components/layout/Layout.tsx`
- Add left margin/offset for the permanent drawer
- Ensure breadcrumbs, container, and FAB still work correctly

### 5.4 Sidebar Improvements — ✅ Done
- **Transactions link:** Added to Finance group (was missing)
- **Collapsible mode:** Toggle button shrinks sidebar to 64px icon-only
- **Avatar + user name:** Moved from AppBar dropdown to sidebar bottom
- CSS-animated width transitions
**Commit:** cac51e9

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
