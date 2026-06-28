---
title: "Investment Tracking V3: Dividend, Tax & Performance"
tags: [feature, investment, tax, dividend, planned]
created: 2026-06-28
updated: 2026-06-28
status: in-progress
sources: ["raw/98-investment-tracking-v3/issue.md"]
related: ["features/investment-tracking", "features/multi-broker-architecture", "features/historical-snapshots", "features/tax-inflation-modeling", "features/financial-projections", "features/crud-etf-transactions", "features/pac-automation", "architecture/investment-tracking-architecture", "plans/investment-tracking-v3-implementation"]
---

# Feature: Investment Tracking V3: Dividend, Tax & Performance Enhancements

Status: planned
Priority: high

## Description

Version 3 upgrades investment tracking to a compliant wealth management tool with automated dividend/interest tracking, Italian capital gains tax (26%) calculation, performance-linked projections, and disconnected cash adjustment capabilities.

## Sub-features

### 1. Automated Dividend & Interest Ledger

Record dividend/interest payouts as transactions that increase broker cash without affecting ETF unit counts. UI badges distinguish inflow events.

**Requirements:**
- New transaction type `dividend` / `interest` in the investment store
- Payout increases broker cash balance, does not modify `AssetHolding` unit counts
- UI badge/chip on broker cards highlighting recent cash-inflow events
- Historical dividend data entry (manual, with optional future API auto-fetch)

### 2. Realized Capital Gains Tax Tracking

Italian 26% capital gains tax applied to realized gains (sell transactions). Dashboard widget for year-over-year tax liability.

**Requirements:**
- Calculate 26% tax on realized gains (sell price − average cost basis × units sold)
- "Tax Pocket" widget summarizing YTD tax liabilities
- Per-broker and aggregated tax views
- Tax year filtering (2026, 2027, etc.)

### 3. Dynamic Performance Prefill

Bridge real portfolio performance data into the Financial Projections simulator instead of parametric assumptions.

**Requirements:**
- Option to prefill projection inputs with actual broker returns (CAGR, volatility)
- Link between time range in portfolio view and projection simulation
- User toggle: "Use real performance" vs "Manual parameters"

### 4. Disconnected Cash Adjustments

Support external cash deposits/withdrawals to/from broker accounts that are not tied to the original lump-sum transfer flow.

**Requirements:**
- New transaction type `cash_adjustment` (deposit/withdrawal)
- Separate tracking from internal transfers
- Audit trail for external cash flows

## Related

- [[features/investment-tracking]] — V1 base feature (broker config, ETF tracking, strategy workflow)
- [[features/multi-broker-architecture]] — V2 multi-broker foundation
- [[features/historical-snapshots]] — V2 daily portfolio snapshot persistence
- [[features/pac-automation]] — V2 recurring PAC transactions
- [[features/crud-etf-transactions]] — V2 edit/delete ETF transactions
- [[features/tax-inflation-modeling]] — Related tax/inflation projection features
- [[features/financial-projections]] — Projections simulation (bridging with performance prefill)
- [[architecture/investment-tracking-architecture]] — Architecture & data flow
- [[plans/investment-tracking-v3-implementation]] — Implementation plan
- Source: [raw/98-investment-tracking-v3/issue.md](raw/98-investment-tracking-v3/issue.md)
