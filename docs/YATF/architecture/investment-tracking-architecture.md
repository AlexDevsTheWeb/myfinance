---
title: "Investment Tracking Architecture"
tags: [architecture, investment, data-flow, firestore, planned]
created: 2026-06-26
updated: 2026-06-26
status: planned
sources: [".planning/phases/10-investment-tracking/10-RESEARCH.md"]
related: ["features/investment-tracking", "plans/investment-tracking-implementation", "architecture/system-architecture"]
---

# Architecture: Investment Tracking

## Overview

The investment tracking feature extends the existing MyFinance architecture (7-layer) with an investment domain module. It follows the same patterns as existing domain modules (finance, car, utilities) with a standalone Zustand store, Firestore array fields in the user document, and Recharts for visualization.

## Data Flow

```
User Action → React Component → useInvestmentStore (Zustand)
                                    │
                          ┌─────────┴─────────┐
                          ▼                   ▼
                   Optimistic Update    Firestore (updateDoc)
                          │                   │
                          └─────────┬─────────┘
                                    ▼
                          Re-sync via onSnapshot
                                    │
                                    ▼
                              UI Re-render
```

## Firestore Schema

Extends the existing `users/{userId}` document with three new fields:

```typescript
interface UserDoc {
  // ... existing fields (transactions, accounts, categories, etc.)

  etfTransactions: IETFTransaction[];
  portfolioSnapshots: IPortfolioSnapshot[];
  brokerConfig: IBrokerConfig;
}
```

- **`etfTransactions[]`** — Array of ETF buy/sell records (same pattern as `transactions[]`)
- **`portfolioSnapshots[]`** — Time-series snapshots for portfolio value charting (1 per ETF transaction)
- **`brokerConfig`** — Single map object with broker settings

## Transaction Classification

| Type | Enum Value | Expense Impact | Net Worth Impact |
|------|-----------|---------------|------------------|
| Regular expense | `'expense'` | ✅ Counted | ✅ Decreases |
| Income | `'income'` | ❌ Excluded | ✅ Increases |
| Internal transfer | `'transfer'` | ❌ Excluded | ❌ No impact |

Key rule: Transfers are pure asset reallocation. Money moves between accounts within the same user's net worth — balance changes must cancel out.

## Store Architecture

**`useInvestmentStore.ts`** (standalone, matching `useFinanceStore.ts` pattern):
- State: `etfTransactions[]`, `portfolioSnapshots[]`, `brokerConfig`, `currentPrice`, `lastPriceUpdate`
- CRUD: `addEtfTransaction`, `updateEtfTransaction`, `deleteEtfTransaction`, `addPortfolioSnapshot`, `setBrokerConfig`, `setCurrentPrice`
- Each write: validate → optimistic update → Firestore `updateDoc` → rollback on error
- Auto-record portfolio snapshot after each ETF transaction

**`useInvestmentSync.ts`** (Firestore real-time sync):
- `onSnapshot` subscription to user document
- Syncs only investment fields (not all finance fields)
- Skips pending writes to avoid overwriting optimistic updates

## Component Tree

```
App.tsx
  └── Layout.tsx
        └── InvestmentPage.tsx (route: /invest)
              ├── Tabs: Cash Balance | Invested Capital
              │
              ├── Cash Balance Tab ──────────────┬── CashInterestCard
              │                                   └── PortfolioLineChart
              │
              └── Invested Capital Tab ─┬── "Add Transaction" Button
                                         ├── EtfTransactionModal
                                         │     └── EtfTransactionForm
                                         ├── PortfolioStats (3 metric cards)
                                         ├── HoldingsTable
                                         ├── AllocationDonutChart
                                         └── PortfolioLineChart
```

## Market Data Integration

- **API**: `https://api.yfin.dev/v1/quote?symbols={TICKER}` (CORS-friendly Yahoo Finance proxy)
- **Rate limit**: 40 requests/second (free, no API key)
- **Trigger**: Manual "Refresh" button on InvestmentPage (not auto-polling)
- **Storage**: Price cached in `useInvestmentStore.currentPrice` + `lastPriceUpdate` timestamp
- **Display**: "Prices delayed up to 15 min" disclaimer

## Charting Architecture

| Chart | Component | Library | Data Source |
|-------|-----------|---------|-------------|
| Portfolio value line | `PortfolioLineChart` | Recharts AreaChart | `portfolioSnapshots[]` filtered by time range |
| Asset allocation donut | `AllocationDonutChart` | Recharts PieChart | Computed from `etfTransactions[]` aggregated by ticker |

## Related

- [[features/investment-tracking]]
- [[plans/investment-tracking-implementation]]
- [[architecture/system-architecture]]
- [[architecture/tech-stack]]
