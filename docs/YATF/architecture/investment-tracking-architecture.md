---
title: "Investment Tracking Architecture"
tags: [architecture, investment, data-flow, firestore, active]
created: 2026-06-26
updated: 2026-06-26
status: active
sources: [".planning/phases/10-investment-tracking/10-RESEARCH.md"]
related: ["features/investment-tracking", "features/investment-tracking-guide", "plans/investment-tracking-implementation", "plans/investment-tracking-v2-enhancements", "architecture/system-architecture"]
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

## Firestore Schema (V1 — Phase 10)

V1 stored investment data in the `users/{userId}` document:

```typescript
interface UserDoc {
  etfTransactions: IETFTransaction[];
  portfolioSnapshots: IPortfolioSnapshot[];
  brokerConfig: IBrokerConfig;           // V1: single broker
}
```

## Firestore Schema (V2 — Phase 12)

V2 refactored to collection-based types with subcollection persistence:

```typescript
interface UserDoc {
  etfTransactions: IETFTransaction[];
  portfolioSnapshots: IPortfolioSnapshot[];  // Still written (dual-write)
  brokerConfig?: IBrokerConfig;              // @deprecated — kept for migration reads
  brokerAccounts: BrokerAccount[];           // V2: multi-broker
  assetHoldings: AssetHolding[];             // V2: multi-asset
}

// /users/{uid}/portfolio_history/ subcollection
interface HistorySnapshot {
  date: string;
  totalInvested: number;
  currentValue: number;
  cashBalance: number;
  netWorth: number;
  holdings: { ticker: string; units: number; avgCost: number; price: number; value: number }[];
  createdAt: Timestamp;
}
```

- **`brokerAccounts[]`** — Array of `BrokerAccount` objects (id, name, baseLumpSum, monthlyPacAmount, interestRate)
- **`assetHoldings[]`** — Array of `AssetHolding` objects (ticker, brokerId, units)
- **`portfolio_history/`** — Firestore subcollection for persistent historical chart data (daily debounced, max 1 per day)

## Transaction Classification

| Type | Enum Value | Expense Impact | Net Worth Impact |
|------|-----------|---------------|------------------|
| Regular expense | `'expense'` | ✅ Counted | ✅ Decreases |
| Income | `'income'` | ❌ Excluded | ✅ Increases |
| Internal transfer | `'transfer'` | ❌ Excluded | ❌ No impact |

Key rule: Transfers are pure asset reallocation. Money moves between accounts within the same user's net worth — balance changes must cancel out.

## Store Architecture (V2)

**`useInvestmentStore.ts`** (standalone, matching `useFinanceStore.ts` pattern):
- State: `etfTransactions[]`, `portfolioSnapshots[]`, `brokerAccounts[]`, `assetHoldings[]`, `selectedBrokerId`, `currentPrice`, `lastPriceUpdate`, `pendingPacTransaction`, `lastPacGenerationDate`
- CRUD: `addEtfTransaction`, `updateEtfTransaction`, `deleteEtfTransaction` (safe cascade), `addPortfolioSnapshot`, `setBrokerConfig` (legacy), `setCurrentPrice`, `setSelectedBroker`, `addBrokerAccount`, `updateBrokerAccount`, `deleteBrokerAccount`, `addPendingPacTransaction`, `confirmPacTransaction`, `dismissPacTransaction`
- Each write: validate → optimistic update → Firestore `updateDoc` → rollback on error (or safe cascade for delete)
- Dual-write: existing `portfolioSnapshots[]` array + fire-and-forget `portfolio_history/` subcollection write via [[features/historical-snapshots]]

**`useInvestmentSync.ts`** (Firestore real-time sync):
- `onSnapshot` subscription to user document
- Syncs only investment fields (not all finance fields)
- Skips pending writes to avoid overwriting optimistic updates

## Component Tree (V2)

```
App.tsx
  └── Layout.tsx
        └── InvestmentPage.tsx (route: /invest)
              ├── Tabs: Cash Balance | Invested Capital
              │
              ├── BrokerSelect (MUI Select filter — new in V2)
              │   options: "All Brokers (Aggregated)" | per-broker
              │
              ├── PAC Badge (conditionally shown — new in V2)
              │   └── PacConfirmationDialog (Confirm/Dismiss)
              │
              ├── Cash Balance Tab ──────────────┬── CashInterestCard
              │                                   └── PortfolioLineChart
              │
              └── Invested Capital Tab ─┬── "Add Transaction" Button
                                         ├── EtfTransactionModal (supports Edit mode in V2)
                                         │     └── EtfTransactionForm (brokerId select in V2)
                                         ├── BrokerSettingsModal (multi-broker CRUD in V2)
                                         ├── PortfolioStats (3 metric cards)
                                         ├── HoldingsTable (Edit/Delete actions in V2)
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

## V2 Migration Layer

The `useInvestmentSync.ts` hook includes `migrateBrokerConfig()` that detects old `brokerConfig` objects on first load and converts them to `brokerAccounts[]`. Key design:

- **Run-once guard:** `migrationAttempted` ref prevents duplicate migration within a session.
- **Idempotent:** Checks `Array.isArray(data.brokerAccounts)` first — if already migrated, skips.
- **Fire-and-forget:** Writes migrated data to Firestore asynchronously.
- **Legacy field:** `brokerConfig` kept as optional field in converters for backward-compatible reads.

## Integration with Other Phase 12 Features

| Feature | Connection |
|---------|------------|
| [[features/multi-broker-architecture]] | Foundation — types, store, migration |
| [[features/crud-etf-transactions]] | Edit/delete on V2 store, safe cascade |
| [[features/historical-snapshots]] | Firestore subcollection triggers from store actions |
| [[features/pac-automation]] | PAC state in V2 store, confirmation dialog |
| [[features/tax-inflation-modeling]] | Independent — pure projection computation |
| [[features/ticker-validation]] | Validation at broker config save time |

## Related

- [[features/investment-tracking]]
- [[features/investment-tracking-guide]]
- [[features/multi-broker-architecture]]
- [[features/crud-etf-transactions]]
- [[features/historical-snapshots]]
- [[features/pac-automation]]
- [[features/ticker-validation]]
- [[plans/investment-tracking-implementation]]
- [[plans/investment-tracking-v2-enhancements]]
- [[architecture/system-architecture]]
- [[architecture/tech-stack]]
