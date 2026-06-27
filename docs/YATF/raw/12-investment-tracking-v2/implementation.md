# Phase 12 Implementation Results

**Branch:** `feat/phase-12-investment-tracking-v2`
**PR:** https://github.com/AlexDevsTheWeb/myfinance/pull/95
**Date:** 2026-06-27
**Duration:** ~30 min (6 plans, 24 execution commits)
**Build:** `npm run build` passes

## Overview

Phase 12 evolved the investment tracking module from single-broker to multi-broker architecture, added full CRUD lifecycle for ETF transactions, persistent historical snapshots in Firestore, PAC automation with user confirmation, inflation-adjusted projections, and ticker validation.

## Plan 01: Multi-Broker Schema Refactor

**Commits:** `0b49be8`, `15fb5d6`, `4f96573`
**Files modified:** 11

### What changed
- **Types:** `BrokerAccount` and `AssetHolding` interfaces added to `investment.types.ts`. `IBrokerConfig` marked `@deprecated` with migration comment.
- **Defaults:** `DEFAULT_BROKER_ACCOUNTS` (array with one default Trade Republic account) replaces `DEFAULT_BROKER_CONFIG` (kept for migration).
- **Store:** `brokerAccounts[]`, `assetHoldings[]`, `selectedBrokerId`, `brokerTransactions` added to state. CRUD actions: `addBrokerAccount`, `updateBrokerAccount`, `deleteBrokerAccount`, `setSelectedBroker`. PAC state fields: `pendingPacTransaction`, `lastPacGenerationDate`. Legacy `setBrokerConfig` also writes to `brokerAccounts[0]` for backward compat.
- **Migration:** `migrateBrokerConfig()` in `useInvestmentSync.ts` detects old `brokerConfig`, converts to `BrokerAccount[]`, fire-and-forget writes to Firestore. `migrationAttempted` ref ensures run-once.
- **Validation:** `validateBrokerAccount()` validates name, amounts, interest rate range.
- **Sanitization:** `sanitizeBrokerAccount`/`sanitizeBrokerAccounts` for Firestore-safe writes.

### Decisions
- Plain-object naming (no `I-` prefix) for V2 types to distinguish from legacy
- `setBrokerConfig` bridges to `brokerAccounts[0]` so Plan 2's UI isn't required yet
- `converters.ts` keeps `brokerConfig` as optional legacy field during migration window

## Plan 02: Multi-Broker UI Layer

**Commits:** `fa77b8e`, `5881008`, `580ccf9`
**Files created:** 1 (`BrokerSelect.tsx`)
**Files modified:** 7

### What changed
- **BrokerSelect.tsx:** New MUI Select component with "All Brokers (Aggregated)" default option + per-broker items, wired via `selectedBrokerId`/`setSelectedBroker`.
- **BrokerSettingsModal.tsx:** Rewritten to dual-mode (list mode ↔ form mode). Add/edit/delete broker accounts with UUID-based ids. Delete uses confirmation dialog (D-09 safe delete).
- **usePortfolio.ts:** Refactored to filter transactions by `selectedBrokerId`. Returns per-broker or aggregated `totalInvested`, `currentValue`, `holdings`, `cashBalance`, `brokerName`.
- **useMarketData.ts:** Updated to fetch prices for all held tickers across all brokers using comma-separated yfin.dev batch call. Keeps single aggregated price for backward compat.
- **InvestmentPage.tsx:** BrokerSelect in page header next to Settings. PAC badge notification placeholder.
- **Locale keys:** 10 new keys per locale for broker CRUD operations.

### Decisions
- Removed ticker field from multi-broker form (ticker association via `assetHoldings`)
- Single aggregated price kept — multi-ticker price storage deferred to future
- `interestRate` added to `usePortfolio` return for `CashInterestCard`

## Plan 03: Transaction CRUD (Edit/Delete)

**Commits:** `2584442`, `c260880`, `f7fa171`
**Files modified:** 6

### What changed
- **HoldingsTable.tsx:** Edit/Delete MUI icon buttons per row, conditionally rendered (`onEdit || onDelete` callbacks).
- **EtfTransactionModal.tsx:** Edit mode via optional `editTransaction` prop — pre-fills all fields, switches title, calls `updateEtfTransaction` instead of `addEtfTransaction`.
- **EtfTransactionForm.tsx:** Broker Account select dropdown from `brokerAccounts` store state.
- **deleteEtfTransaction cascade:** Find transaction → guard if null → optimistic remove → persist to Firestore → recompute portfolio snapshot → persist snapshot.
- **PAC state:** `pendingPacTransaction`, `lastPacGenerationDate`, `addPendingPacTransaction`, `confirmPacTransaction`, `dismissPacTransaction` added to store.

### Decisions
- Edit opens modal with most recent transaction for the holding's ticker
- Delete uses `window.confirm` (no MUI dialog dependency)
- `brokerId` optional in `EtfTransactionFormData` for backward compat

## Plan 04: Historical Snapshots Subcollection

**Commits:** `242e1d0`, `8e14e86`, `7d005d4`
**Files created:** 1 (`useHistoricalSnapshots.ts`)
**Files modified:** 4

### What changed
- **useHistoricalSnapshots.ts:** Exports `recordPortfolioSnapshot(userId)` that writes to `/users/{uid}/portfolio_history/` Firestore subcollection with `HistorySnapshot` shape (date, totalInvested, currentValue, cashBalance, netWorth, holdings array).
- **Daily debounce:** Queries for existing today's snapshot before writing — max 1 per day per user.
- **Firestore rules:** `match /users/{userId}/portfolio_history/{snapshotId}` with `allow read, write: if isOwner(userId)`.
- **Store triggers:** `addEtfTransaction` and `deleteEtfTransaction` call `recordPortfolioSnapshot` fire-and-forget after successful persistence.

### Decisions
- Fire-and-forget strategy: subcollection write is non-blocking, main transaction independent
- Dual-write approach: existing `portfolioSnapshots` array continues alongside new subcollection
- Daily debounce prevents duplicates from rapid transactions

## Plan 05: PAC Automation + Ticker Validation

**Commits:** `17df984`, `15925ec`, `a8519c2`
**Files created:** 2 (`usePacAutomation.ts`, `PacConfirmationDialog.tsx`)
**Files modified:** 5

### What changed
- **usePacAutomation.ts:** Init hook checks each broker's `monthlyPacAmount > 0`, compares current date vs PAC day (default 1st), checks `localStorage` + `lastPacGenerationDate` for duplicate month. `useRef` guard prevents HMR duplicate execution (Pitfall 2 fix). Generates pending PAC via `addPendingPacTransaction`. Only one pending PAC at a time.
- **PacConfirmationDialog.tsx:** MUI Dialog showing broker name, amount, date. Confirm/Dismiss buttons. Confirm calls `confirmPacTransaction` (creates buy with "System-Generated Buy" description), Dismiss calls `dismissPacTransaction`.
- **InvestmentPage.tsx:** PAC badge notification ("PAC Pending" button with warning badge) when `pendingPacTransaction` is set. `usePacAutomation()` called on mount.
- **validateTicker:** Regex `/^[A-Z0-9]{1,10}(\.[A-Z]{2,3})?$/i` — allows US stocks (AAPL) and European ETFs (SWDA.MI, VWCE.DE). Blocking pre-check in `BrokerSettingsModal` (blocks save on invalid ticker).
- **validateTickerWithApi:** Non-blocking API test-fetch that shows warning but allows save to proceed.
- **Locale keys:** 13 new keys per locale for PAC and ticker validation.

### Decisions
- PAC day default = 1st of month; per-broker config deferred
- Triple guard for duplicate prevention: `useRef` → `localStorage` → `lastPacGenerationDate`
- Ticker regex permissive (covers all common formats), blocking on regex, non-blocking on API

## Plan 06: Inflation-Adjusted Projections

**Commits:** `acb9f78`, `110b1d6`, `7b701ad`
**Files modified:** 8

### What changed
- **projection.types.ts:** `IProjectionInput` extended with `adjustForInflation?: boolean` (default false) and `inflationRate?: number` (default 0.02).
- **compoundInterestUtils.ts:** `generateFinancialProjection` applies per-month inflation adjustment when toggle is on: `monthlyInflation = (1 + annual)^(1/12) - 1`, applied as divisor per snapshot based on `monthIndex`.
- **useProjections.ts:** `setInflationToggle(enabled)` function. Dual snapshot computation: nominal snapshots always computed with `adjustForInflation: false`.
- **ProjectionControls.tsx:** MUI Switch "Adjust for Inflation (2%)" via `onInflationToggle` callback.
- **ProjectionChart.tsx:** Third `nominalValue` dashed red Area line when inflation is on.
- **ProjectionSummary.tsx:** "Real Final Capital" MetricCard (red `#ef4444`) when inflation is on.
- **Locale keys:** 4 new keys per locale for inflation feature.

### Decisions
- Inflation applied as divisor to nominal values per-month (Pitfall 5 fix)
- Tax remains on nominal gains — inflation adjustment does not affect tax
- When inflation is on, `netWorth` line shows real value; `nominalValue` dashed overlay shows original
- Dual snapshot computation (nominal + real) for chart overlay

## Summary Statistics

| Metric | Value |
|--------|-------|
| Plans | 6 |
| Commits | 24 execution + 6 planning/docs |
| Files created | 4 |
| Files modified | ~30 |
| New types | `BrokerAccount`, `AssetHolding`, `HistorySnapshot` |
| Store actions added | `addBrokerAccount`, `updateBrokerAccount`, `deleteBrokerAccount`, `setSelectedBroker`, `addPendingPacTransaction`, `confirmPacTransaction`, `dismissPacTransaction` |
| Hooks added/updated | `usePacAutomation`, `useHistoricalSnapshots`, `usePortfolio` (refactored), `useMarketData` (updated), `useProjections` (updated) |
| Components created | `BrokerSelect`, `PacConfirmationDialog` |
| Requirements | REQ-MULTI, REQ-CRUD, REQ-PAC, REQ-SNAP, REQ-TAX, REQ-TICKER |
