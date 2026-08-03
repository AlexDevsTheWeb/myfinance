---
type: Feature
description: "Multi-broker and multi-asset schema refactor with BrokerSelect component."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/91"
title: "Multi-Broker & Multi-Asset Architecture"
tags: [feature, investment, architecture, implemented]
created: 2026-06-27
updated: 2026-06-27
status: implemented
sources: ["raw/91-multi-broker/91-multi-broker.md", "raw/12-investment-tracking-v2/implementation.md"]
related: ["features/investment-tracking", "architecture/investment-tracking-architecture", "plans/investment-tracking-v2-enhancements", "features/crud-etf-transactions", "bugs/broker-transaction-filter"]
---

# Feature: Multi-Broker & Multi-Asset Architecture

Status: implemented
Priority: high

## Description

Refactor the current single-broker, single-ETF schema to support multiple broker accounts and multiple assets (portfolio diversification). Implemented in Plan 12-01 (data layer) and Plan 12-02 (UI layer).

## What Was Built

### Data Layer (12-01)

- **Types:** `BrokerAccount` and `AssetHolding` interfaces in `investment.types.ts`. `IBrokerConfig` marked `@deprecated`. `IETFTransaction` gained `brokerId?: string` (2026-08-03) so manual transactions carry an explicit broker link — see [[wiki/bugs/broker-transaction-filter]].
- **Defaults:** `DEFAULT_BROKER_ACCOUNTS` array replaces `DEFAULT_BROKER_CONFIG` (kept for migration).
- **Store:** `brokerAccounts[]`, `assetHoldings[]`, `selectedBrokerId`, `brokerTransactions` state fields. CRUD actions: `addBrokerAccount`, `updateBrokerAccount`, `deleteBrokerAccount`, `setSelectedBroker`.
- **Migration:** `migrateBrokerConfig()` in `useInvestmentSync.ts` detects old `brokerConfig`, converts to `BrokerAccount[]`, fire-and-forget Firestore write. `migrationAttempted` ref ensures run-once.
- **Validation:** `validateBrokerAccount()` validates name, amounts, interest rate range.
- **Sanitization:** `sanitizeBrokerAccount`/`sanitizeBrokerAccounts` for Firestore-safe writes.

### UI Layer (12-02)

- **BrokerSelect.tsx:** MUI Select with "All Brokers (Aggregated)" default + per-broker items.
- **BrokerSettingsModal.tsx:** Dual-mode (list ↔ form) for add/edit/delete broker accounts with confirmation dialog.
- **usePortfolio.ts:** Refactored to filter by `selectedBrokerId`, returns per-broker or aggregated metrics.
- **useMarketData.ts:** Multi-ticker batch call to yfin.dev for all held tickers.

## Implementation Notes

- Plain-object naming (no `I-` prefix) distinguishes V2 types from legacy `I-prefixed` interfaces.
- Legacy `setBrokerConfig` action also writes to `brokerAccounts[0]` for backward compat during transition.
- `converters.ts` keeps `brokerConfig` as optional legacy field during migration window.
- Single aggregated price kept in store — multi-ticker price storage deferred to future.

## Files

- **Created:** `src/components/investment/BrokerSelect.tsx`
- **Modified:** `investment.types.ts`, `defaults.ts`, `converters.ts`, `useInvestmentStore.ts`, `useInvestmentSync.ts`, `BrokerSettingsModal.tsx`, `usePortfolio.ts`, `InvestmentPage.tsx`, `useMarketData.ts`, validation/sanitization modules, i18n files

## Related

- [[wiki/features/investment-tracking/investment-tracking]]
- [[wiki/features/crud-etf-transactions/crud-etf-transactions]]
- [[wiki/bugs/broker-transaction-filter/broker-transaction-filter]]
- [[wiki/architecture/investment-tracking-architecture]]
- [[wiki/plans/investment-tracking-v2-enhancements]]
- GitHub: [#91](https://github.com/AlexDevsTheWeb/myfinance/issues/91)
- Source: [raw/12-investment-tracking-v2/implementation.md](raw/12-investment-tracking-v2/implementation.md)
