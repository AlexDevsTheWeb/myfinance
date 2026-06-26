---
title: "Investment Tracking & Broker Integration"
tags: [feature, investment, broker, implemented]
created: 2026-06-26
updated: 2026-06-26
status: implemented
sources: ["raw/81-tax-refund/import.md", "raw/81-tax-refund/tr-code.md"]
related: ["architecture/project-state", "architecture/tech-stack", "plans/investment-tracking-implementation", "architecture/investment-tracking-architecture"]
---

# Feature: Investment Tracking & Broker Integration

Status: implemented
Priority: medium

## Description

Track ETF portfolio holdings, render performance charts, and manage a dynamic investment strategy workflow for broker accounts (e.g., Trade Republic). The system supports income logging, internal transfers to broker accounts, automated monthly PAC allocation into accumulating ETFs, and portfolio reporting — all while keeping asset reallocation strictly separate from expense tracking.

## Requirements

### Data Ingestion (Transactions)
- Manual form: `Date`, `Ticker/ISIN`, `Shares`, `Price per Share`, `Fees`
- CSV/PDF file parser: drag-and-drop to extract transaction rows from broker statements

### Live Market Data
- Fetch current and historical close prices via public financial API (Yahoo Finance, Alpha Vantage)
- Refresh on portfolio view init or manual "Refresh" button to prevent rate-limiting

### Investment Strategy Workflow
- **Income Logging:** Log extraordinary funds (category: `Extraordinary Income`) as inflow to the main bank account
- **Internal Transfer:** Record lump-sum transfer from bank to broker — classified as `Internal Transfer`, never as an expense. Decreases bank balance, increases broker cash balance atomically
- **PAC Allocation:** Monthly automated deduction from broker cash balance to invested capital (accumulating ETF). Track ETF units owned and average cost basis (PMC)
- **Net Worth Integrity:** Net worth must remain unchanged by internal transfers — pure asset reallocation

### Configurable User Parameters
- Broker name (e.g., Trade Republic, Scalable Capital)
- Initial lump-sum inflow amount
- Monthly PAC amount
- Target asset / ticker (e.g., SWDA.MI)
- Active interest rate (%) — annual yield on uninvested cash balance

### Charting & Metrics
- **Total Invested:** Σ(Shares × Purchase Price)
- **Current Value:** Σ(Total Shares Owned × Live Market Price)
- **Total Return (% and Absolute):** Current Value − Total Invested
- **Line Chart:** Historical portfolio value over time (1M, 6M, 1Y, ALL)
- **Donut Chart:** Asset allocation breakdown

### UI/UX
- Configuration modal/form for dynamic PAC parameters
- Broker view split into "Cash Balance" (with accrued interest) and "Invested Capital" (ETF value) — use MUI Tabs or Cards
- "Monthly Spending" chart/KPI must strictly filter out `Internal Transfer` transactions
- MUI components + Recharts for all charting

## Implementation Notes

- All transfers between accounts are asset movements: never flagged as expenses
- Implement utility function/store selector for monthly accrued interest on cash balance
- Implement PMC (Prezzo Medio di Carico) — average cost basis calculation for ETF units
- Database schema / Zustand store slices needed for `etf_transactions` and `portfolio_snapshots`
- Internal transfer must be handled atomically in the Zustand store
- Feature is gated behind `IAppModules.investmentTracking` (disabled by default). Enable it in **Settings → Active Modules → Investment Tracking** to reveal the nav link

## Planning (Phase 10)

Phase 10 implements this feature in 6 plans across 4 waves:

| Wave | Plans | Scope |
|------|-------|-------|
| 1 | 10-01 | **Data Foundation** — Types, Firestore schema extension, converter fix, defaults |
| 2 | 10-02, 10-03 | **Store + Transaction Flow** — Zustand store, 'transfer' type transaction forms |
| 3 | 10-04, 10-05 | **Broker Config + Portfolio Page** — Settings modal, ETF entry form, charts, tabbed dashboard |
| 4 | 10-06 | **Integration** — Market data API, routing, nav, analytics filter, i18n, ConfigPage toggle |

### Architecture Highlights

- **Standalone store**: `useInvestmentStore.ts` following domain store pattern
- **Firestore schema**: Extends existing user doc with `etfTransactions[]`, `portfolioSnapshots[]`, `brokerConfig`
- **Transaction type**: New `'transfer'` value extends `ITransaction.type` union — excluded from all expense calculations
- **Market data**: Browser-side fetch from `api.yfin.dev` (CORS-friendly Yahoo Finance proxy, 40 req/s free tier)
- **Charts**: Recharts AreaChart (portfolio line) + PieChart (allocation donut), dark theme
- **No new npm packages**: All dependencies (MUI, Recharts, Zustand, Firebase, dayjs) already in project

## Related

- [[plans/investment-tracking-implementation]]
- [[architecture/investment-tracking-architecture]]
- [[architecture/project-state]]
- [[architecture/tech-stack]]
- [[conventions/coding-conventions]]
