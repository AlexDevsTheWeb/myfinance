---
title: "Investment Tracking Implementation Plan"
tags: [plans, implementation, investment, broker, frontend, completed]
created: 2026-06-26
updated: 2026-06-26
status: completed
sources: [".planning/phases/10-investment-tracking/"]
related: ["features/investment-tracking", "architecture/investment-tracking-architecture", "architecture/project-state"]
---

# Plan: Investment Tracking Implementation

Status: completed

## Goal

Implement ETF portfolio tracking, broker account integration (Trade Republic), investment strategy workflow (income → internal transfer → PAC), portfolio charts, and live market data — all with proper asset-vs-expense separation.

## Implementation Order

The phase is organized in 4 waves with 6 execution plans:

### Wave 1 — Data Foundation

**Plan 10-01: Types + Schema + Converter**
- Create `src/store/types/investment.types.ts` with `IETFTransaction`, `IPortfolioSnapshot`, `IBrokerConfig`, `IInvestmentHolding`, `IPortfolioPoint`
- Extend `ITransaction.type` union: `'income' | 'expense' | 'transfer'`
- Extend `IAppModules` with `investmentTracking` toggle
- Add `Extraordinary Income` to `DEFAULT_INCOME_CATEGORIES`
- Create `DEFAULT_BROKER_CONFIG` default
- Extend Firestore `UserDoc` with `etfTransactions[]`, `portfolioSnapshots[]`, `brokerConfig`
- Fix `fromFirestore` converter to accept `'transfer'` type (previously fell back to `'expense'`)
- Update backup types for investment fields

### Wave 2 — Store + Transaction Flow

**Plan 10-02: Investment Store**
- Create `useInvestmentStore.ts` (standalone Zustand store)
- State: `etfTransactions`, `portfolioSnapshots`, `brokerConfig`, `currentPrice`, `lastPriceUpdate`, `isSaving`, `saveError`
- CRUD actions: `addEtfTransaction`, `updateEtfTransaction`, `deleteEtfTransaction`, `addPortfolioSnapshot`, `setBrokerConfig`, `setCurrentPrice`
- Optimistic update pattern with Firestore persistence and rollback
- Validation (`investment.validation.ts`) and sanitization (`sanitization/investment.ts`) modules
- `calcAccruedInterest()` utility: `cashBalance * (rate / 100) / 12`
- Auto-record portfolio snapshot after ETF transaction add
- Firestore sync hook (`useInvestmentSync.ts`)

**Plan 10-03: Transaction Flow**
- Update `finance.validation.ts` to accept `'transfer'` as valid type
- Update `TransactionForm.tsx` to support `'transfer'` type with source/destination account fields
- Update `TransactionModal.tsx` to handle `'transfer'` classification

### Wave 3 — Broker Config + Portfolio Page

**Plan 10-04: Broker Settings Modal**
- Create `BrokerSettingsModal.tsx` with fields: broker name, lump-sum amount, monthly PAC, ticker, interest rate
- Wired to `useInvestmentStore.setBrokerConfig`
- Accessible from InvestmentPage header

**Plan 10-05: Portfolio Page**
- Create `EtfTransactionForm.tsx` — manual ETF buy/sell entry (ticker, type, units, price, total, date, account, notes)
- Create `EtfTransactionModal.tsx` — dialog wrapper with validation
- Create `usePortfolio.ts` hook — 11 computed values (totalInvested, currentValue, totalReturn, chartData, holdings, etc.)
- Create `PortfolioStats.tsx` — 3 metric cards (Total Invested, Current Value, Total Return)
- Create `PortfolioLineChart.tsx` — Recharts AreaChart with 1M/6M/1Y/ALL time range selector
- Create `AllocationDonutChart.tsx` — Recharts PieChart for asset allocation
- Create `HoldingsTable.tsx` — ETF position detail table
- Create `CashInterestCard.tsx` — cash balance with accrued interest display
- Create `InvestmentPage.tsx` — tabbed dashboard (Cash Balance / Invested Capital)

### Wave 4 — Integration

**Plan 10-06: Market Data + Routing + i18n**
- Create `useMarketData.ts` hook — fetch live ETF price from `api.yfin.dev`
- Update analytics hooks (`useNetWorth`, `useAccountBreakdown`) to exclude `'transfer'` from expense calcs
- Add `/invest` route in `App.tsx` with `ProtectedRoute`
- Add "Investments" nav link in `Layout.tsx`
- Call `useInvestmentSync()` in `App.tsx`
- Add ~30 EN/IT translation keys for investment UI
- Add `investmentTracking` toggle switch to `ConfigPage.tsx` (module disabled by default)

## Key Design Decisions

- **Standalone store** — Not merging into already-large `useFinanceStore.ts` (matches domain store pattern from `STRUCTURE.md`)
- **Transfer type safety** — Existing analytics hooks check `=== 'expense'` which naturally excludes `'transfer'`. TypeScript union ensures compile-time safety
- **Market data**: `api.yfin.dev` — CORS-friendly Yahoo Finance proxy, 40 req/s free, no API key needed
- **PAC execution**: Manual via ETF transaction form (automated scheduling deferred)
- **PMC calculation**: Average cost basis with proportional reduction on sell: `totalCost * (1 - sellRatio)`

## Verification

- `npm run build` must pass with zero type errors
- All TypeScript type unions correctly include `'transfer'`
- Converter round-trips `'transfer'` type without falling back to `'expense'`
- Existing analytics pages show no regression (transfers excluded from spending)

## Related

- [[wiki/features/investment-tracking/investment-tracking]]
- [[wiki/architecture/investment-tracking-architecture]]
- [[wiki/architecture/project-state]]
- [[wiki/architecture/tech-stack]]
