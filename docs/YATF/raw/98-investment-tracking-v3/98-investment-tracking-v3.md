# [FEATURE] Investment Tracking V3: Dividend, Tax, and Performance Enhancements

> Source: GitHub Issue [#98](https://github.com/AlexDevsTheWeb/myfinance/issues/98)
> State: OPEN
> Labels: feature
> Created: 2026-06-27

## Context

Version 3 upgrades investment tracking to a compliant wealth management tool.

## Features

### 1. Automated Dividend & Interest Ledger
- Create dividend/interest payout transactions that increase broker cash without affecting units
- UI badge highlighting for cash-inflow events

### 2. Realized Capital Gains Tax Tracking
- Calculate 26% Italian capital gains tax on gains
- Add "Tax Pocket" dashboard widget for year-over-year tax liabilities

### 3. Dynamic Performance Prefill
- Match portfolio returns in projections simulation
- Bridge invest/projection with real performance data

### 4. Disconnected Cash Adjustments
- Add cash deposit/withdrawal transactions
- Track external cash flows separate from lump sum

## Related

- [[wiki/features/investment-tracking/investment-tracking]] — V1 base feature
- [[wiki/features/multi-broker-architecture/multi-broker-architecture]] — V2 multi-broker foundation
- [[wiki/features/historical-snapshots/historical-snapshots]] — V2 snapshot persistence
- [[wiki/features/tax-inflation-modeling/tax-inflation-modeling]] — Inflation adjustment (related to tax/gains)
- [[wiki/features/financial-projections/financial-projections]] — Projections simulation (bridging with performance prefill)
- [[wiki/architecture/investment-tracking-architecture]] — Architecture docs
- [[wiki/plans/investment-tracking-v2-enhancements]] — V2 plan reference
