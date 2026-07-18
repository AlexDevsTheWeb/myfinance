---
type: Plan
description: "Phase 12 complete — six GSD plans: multi-broker, CRUD, PAC, snapshots, inflation, ticker."
title: "Investment Tracking V2 — UX & Architecture Enhancements"
tags: [plan, investment, architecture, ux, completed]
created: 2026-06-27
updated: 2026-06-27
status: completed
gsd_phase: 12
plan_count: 6
github_issues: ["#89", "#90", "#91", "#92", "#93", "#94"]
sources: ["raw/ux-improvments/ux-improvments.md", "raw/12-investment-tracking-v2/implementation.md"]
related: ["features/investment-tracking", "features/financial-projections", "architecture/investment-tracking-architecture", "plans/investment-tracking-implementation", "features/multi-broker-architecture", "features/crud-etf-transactions", "features/historical-snapshots", "features/pac-automation", "features/tax-inflation-modeling", "features/ticker-validation"]
---

# Plan: Investment Tracking V2 — UX & Architecture Enhancements

Status: completed
Priority: medium
Completed: 2026-06-27
Branch: [feat/phase-12-investment-tracking-v2](https://github.com/AlexDevsTheWeb/myfinance/pull/95)

## Goal

Evolve the investment tracking module from a single-broker, single-ETF tool into a robust, multi-asset financial platform with automated PAC, full CRUD operations, and accurate tax/fee modeling.

## Requirements

### 1. Automation of Recurring PAC Transactions

- **Background worker** (Zustand/Firestore hook) checks current date against configured PAC day
- **Virtual ledger**: auto-generate `System-Generated Buy` transaction if the execution day has passed
- **Cash balance impact**: auto-decrement broker cash, increment invested capital
- **User confirmation UI**: notification badge *"1 automated PAC transaction pending confirmation"* — user approves or adjusts purchase price

### 2. Full CRUD for Transactions & Settings

- **Transaction table actions**: `Edit` / `Delete` icons in Holdings/Transactions table
- **Safe deletion logic**: revert units from invested capital, recalculate PMC dynamically, restore broker cash balance
- **Settings persistence**: Broker Settings modal allows full updates without wiping historical snapshots

### 3. Multi-Broker & Multi-Asset Architecture

- **Database schema refactor**: from single-object to collections (`BrokerAccount`, `AssetHolding`)
- **Account filtering**: `<Select />` dropdown to filter dashboard by broker or view "All Brokers (Aggregated)"
- **Dynamic distribution**: Donut chart scales from single-asset to multi-ETF percentage breakdown
- **TypeScript types**: refactor from single object to `BrokerAccount[]` and `AssetHolding[]`

### 4. Historical Snapshot Persistence

- **Daily/monthly task**: save computed Net Worth and ETF Value into a `portfolio_history` Firestore collection
- **Multi-device**: ensures persistent charting across devices and sessions

### 5. Smart Tax & Fee Modeling

- **Inflation toggle**: "Adjust for Inflation (2%)" in `/projections` — calculates Real Value vs Nominal Value
- **TER consideration**: future enhancement for tracking expense ratios

### 6. Yahoo Finance Ticker Validation

- **Validation regex** or test-fetch when saving broker config to ensure ticker is reachable on Yahoo Finance
- **Localized exchange support**: `.MI`, `.DE`, etc.

## Dependencies

- [[wiki/features/investment-tracking/investment-tracking]] — current implementation to extend
- [[wiki/features/financial-projections/financial-projections]] — tax modeling changes
- [[wiki/architecture/investment-tracking-architecture]] — schema refactor required
- [[wiki/plans/investment-tracking-implementation]] — prior implementation plan (completed)

## Verification

- Multi-broker configuration saves and displays correctly in dashboard
- PAC auto-generation creates transactions on schedule
- Edit/delete transactions triggers correct cascading recalculation
- Historical chart persists across page reloads
- Projections page shows inflation-adjusted values when toggle is on
- Invalid Yahoo tickers are rejected at config save time

## GitHub Issues

| # | Title | Wiki Page |
|---|-------|-----------|
| [#89](https://github.com/AlexDevsTheWeb/myfinance/issues/89) | PAC Automation | [[wiki/features/pac-automation/pac-automation]] |
| [#90](https://github.com/AlexDevsTheWeb/myfinance/issues/90) | CRUD Transactions & Settings | [[wiki/features/crud-etf-transactions/crud-etf-transactions]] |
| [#91](https://github.com/AlexDevsTheWeb/myfinance/issues/91) | Multi-Broker & Multi-Asset | [[wiki/features/multi-broker-architecture/multi-broker-architecture]] |
| [#92](https://github.com/AlexDevsTheWeb/myfinance/issues/92) | Historical Snapshots | [[wiki/features/historical-snapshots/historical-snapshots]] |
| [#93](https://github.com/AlexDevsTheWeb/myfinance/issues/93) | Tax & Inflation Modeling | [[wiki/features/tax-inflation-modeling/tax-inflation-modeling]] |
| [#94](https://github.com/AlexDevsTheWeb/myfinance/issues/94) | Ticker Validation | [[wiki/features/ticker-validation/ticker-validation]] |

## GSD Phase 12 Plans

| Plan | Wave | Description |
|------|------|-------------|
| `12-01-PLAN.md` | 1 | Multi-Broker Schema Refactor — types, store, Firestore migration |
| `12-02-PLAN.md` | 2 | Multi-Broker UI — BrokerSelect, settings modal, multi-ticker |
| `12-03-PLAN.md` | 2 | Transaction CRUD — Edit/Delete, safe cascade, PAC state |
| `12-04-PLAN.md` | 3 | Historical Snapshots — Firestore subcollection, daily debounce |
| `12-05-PLAN.md` | 4 | PAC Automation UI + Ticker Validation |
| `12-06-PLAN.md` | 5 | Projections Inflation Toggle |

See `.planning/phases/12-investment-tracking-v2/` for full plan details.

## Related

- [[wiki/features/investment-tracking/investment-tracking]]
- [[wiki/features/financial-projections/financial-projections]]
- [[wiki/architecture/investment-tracking-architecture]]
- [[wiki/plans/investment-tracking-implementation]]
- Source: [raw/ux-improvments/ux-improvments.md](raw/ux-improvments/ux-improvments.md)
