---
title: "Investment Tracking V2 — UX & Architecture Enhancements"
tags: [plan, investment, architecture, ux]
created: 2026-06-27
updated: 2026-06-27
status: draft
sources: ["raw/ux-improvments.md"]
related: ["features/investment-tracking", "features/financial-projections", "architecture/investment-tracking-architecture", "plans/investment-tracking-implementation"]
---

# Plan: Investment Tracking V2 — UX & Architecture Enhancements

Status: draft
Priority: medium

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

- [[features/investment-tracking]] — current implementation to extend
- [[features/financial-projections]] — tax modeling changes
- [[architecture/investment-tracking-architecture]] — schema refactor required
- [[plans/investment-tracking-implementation]] — prior implementation plan (completed)

## Verification

- Multi-broker configuration saves and displays correctly in dashboard
- PAC auto-generation creates transactions on schedule
- Edit/delete transactions triggers correct cascading recalculation
- Historical chart persists across page reloads
- Projections page shows inflation-adjusted values when toggle is on
- Invalid Yahoo tickers are rejected at config save time

## Related

- [[features/investment-tracking]]
- [[features/financial-projections]]
- [[architecture/investment-tracking-architecture]]
- [[plans/investment-tracking-implementation]]
- Source: [raw/ux-improvments.md](raw/ux-improvments.md)
