---
title: "Dashboard Redesign"
tags: [feature, frontend, planned]
created: 2026-06-28
updated: 2026-06-28
status: implemented
sources: ["raw/99-manual-review-2706/99-manual-review-2706.md"]
related: ["features/sidebar-redesign", "bugs/car-statistics-year", "plans/manual-review-99-implementation"]
---

# Feature: Dashboard Redesign

Status: **implemented**
Priority: **high**

## Description

✅ Split the overloaded dashboard into a focused overview page and move account details into a dedicated dialog. Added more useful charts (investment portfolio, budget progress) and module overview stat cards.

## Sub-Features

### A. Dashboard Split

**Current state:** `DashboardPage.tsx` has RecapCards, recent transactions (`TransactionTable` with `limit={8}`), account cards (gated by toggle), and three chart components — all in one page.

**Target:**
- **Dashboard** (`DashboardPage.tsx`): Keep title, mileage reminder, RecapCards. Replace recent transactions with richer charts. Add investment portfolio summary (if `investmentTracking` enabled) and budget progress (if `budgetTracking` enabled). The existing FAB in `Layout.tsx` already provides quick income/expense insertion.
- **Transactions page** (`TransactionsPage.tsx`): Already fully featured with filters, category chart, and paginated list. No changes needed — just remove the redundant `TransactionTable` from the dashboard.

### B. Account Detail Dialog

**Current state:** AccountCards (per-account balance, sparkline history) and NetWorthChart/AccountBreakdownChart sit on the dashboard, toggled by `accountDetails` state.

**Target:**
- Extract into a full-screen `AccountDetailDialog` component
- Triggered from a button in RecapCards or dashboard header
- Shows all account cards, NetWorthChart, and AccountBreakdownChart in a dedicated dialog

### C. Additional Charts

**Current state:** Dashboard only shows NetWorthChart, AccountBreakdownChart, and cash flow trend.

**Target (conditional on enabled modules):**
- Investment portfolio value over time (from `portfolio_history` snapshots)
- Budget savings rate gauge and burn-up trend
- Module overview stat cards (investments, budget, car mileage, utilities)

### D. Module Overview Stat Cards

**New:** A row of compact `StatCard` mini-components below the dashboard header, showing:
- **Investments:** Current portfolio value + return % (links to `/invest`)
- **Budget:** Savings rate % (links to `/budget`)
- **Car:** Latest odometer reading (links to `/car`)
- **Utilities:** Monthly bill total (links to `/utilities`)
- Each card is conditionally rendered based on enabled modules

## Requirements

- Dashboard must always allow quick income/expense insertion (FAB exists, just ensure visibility)
- AccountDetailDialog should be full-screen with close button
- Conditional charts only render when their module is enabled
- Remove the `accountDetails` toggle from RecapCards
- Overview stat cards show key metrics for each enabled module with navigation links

## Implementation Notes

- `DashboardPage.tsx` — strip `TransactionTable`, `AccountCard` blocks; add conditional chart sections and `StatCard` inline component
- New file: `src/components/dashboard/AccountDetailDialog.tsx` — full-screen dialog
- `RecapCards.tsx` — replace account details toggle with dialog trigger button
- Reuse existing analytics hooks (`useNetWorth`, `useAccountBreakdown`) and budget components
- StatCard computes investment return %, budget savings rate, car latest odometer, and monthly utility bills from store data

## Related

- [[wiki/features/sidebar-redesign/sidebar-redesign]]
- [[wiki/plans/manual-review-99-implementation]]
- Source: [raw/99-manual-review-2706/99-manual-review-2706.md](raw/99-manual-review-2706/99-manual-review-2706.md)
