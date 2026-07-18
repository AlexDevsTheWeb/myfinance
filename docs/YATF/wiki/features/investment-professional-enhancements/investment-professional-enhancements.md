---
type: Feature
description: "Draft: per-ticker pricing, stamp duty, capital losses tracking, fees, and privacy mode."
title: "Investment Professional Enhancements: Multi-Ticker Pricing, Tax & UX"
tags: [feature, investment, tax, pricing, ux, planned]
created: 2026-07-03
updated: 2026-07-03
status: draft
sources: ["raw/investment-report/investment-report.md"]
related: ["features/investment-tracking", "features/investment-tracking-v3", "features/multi-broker-architecture", "bugs/ticker-persistence", "features/financial-projections", "plans/italian-tax-enhancements"]
---

# Feature: Investment Professional Enhancements

Status: **draft** (planned)
Priority: **medium**

## Description

Professional-grade upgrades for the investment module: per-ticker market pricing, Italian stamp duty calculation, capital losses tracking, transaction fees, and privacy mode.

---

### 1. Per-Ticker Market Pricing (Multi-Ticker Architecture)

**Current state:** The store holds a single `currentPrice: number | null` (`useInvestmentStore.ts:22`). The `useMarketData` hook (`src/hooks/useMarketData.ts`) fetches prices via Yahoo Finance batch API but only stores the first quote's price. The `usePortfolio` hook applies this single price to ALL holdings.

**Problem:** With multiple tickers (V2+ multi-broker), each ETF has a different market price. A single price produces incorrect per-ticker valuations, return percentages, and chart data.

**Solution:**

```typescript
// Replace:
currentPrice: number | null;

// With:
currentPrices: Record<string, number>;  // ticker → price
```

- Update `useMarketData.refreshPrices()` to map API results by ticker symbol
- Update `usePortfolio` to look up per-ticker price from `currentPrices`
- Update `computeSnapshot()` in the store for per-ticker pricing
- Support batch API response parsing: `api.yfin.dev/v1/quote?symbols=TICKER1,TICKER2`

**Files affected:** `useInvestmentStore.ts`, `useMarketData.ts`, `usePortfolio.ts`, `types/investment.types.ts`

---

### 2. Italian Stamp Duty (Imposta di Bollo — 0.20%)

**Current state:** Only 26% capital gains tax is tracked. The 0.20% Italian stamp duty on portfolio value is not modeled.

**Requirements:**
- Calculate 0.20% stamp duty on total portfolio value (pro-rata or year-end)
- Display annual stamp duty impact in the TaxPocketWidget
- Duty applies to the total market value of financial assets held with an Italian intermediary
- Add a new section to the tax tracking summary showing stamp duty alongside capital gains tax

---

### 3. Capital Losses Tracking (Zainetto Fiscale)

**Current state:** The `useTaxTracking` hook only tracks positive realized gains (sells at profit). Losses are ignored.

**Requirements:**
- Track realized capital losses from sell transactions
- Italian tax rules: capital losses on ETFs can be offset against capital gains (same category) within the same tax year, or carried forward up to 4 years
- Add a "Tax Ledger" section to the TaxPocketWidget showing:
  - Current year realized gains
  - Current year realized losses
  - Net gains (gains − losses)
  - Tax due on net gains
  - Loss carry-forward balance from previous years
- Loss tracking needs per-year persistence (Firestore)

---

### 4. Transaction Fees Field

**Current state:** `IETFTransaction` (`src/store/types/investment.types.ts`) has no `fees` field. The `totalAmount = units × price` — no way to separate incidental costs.

**Requirements:**
- Add optional `fees: number` to `IETFTransaction`
- In the `EtfTransactionForm`, add a "Fees (€)" field
- The total calculation becomes: `totalAmount = (units × price) + fees`
- On sells, fees reduce realized gains (cost basis impact)
- Display fees in Transactions table and HoldingsTable

---

### 5. Privacy Mode (Eye Toggle)

**Current state:** All euro values are displayed openly. No way to mask them.

**Requirements:**
- Global toggle in the app header (eye icon button)
- When active, all absolute euro values display as `***€`
- Percentage values (return %, allocation %) remain visible
- State persisted in a lightweight context or store (not Firestore — privacy preference is local)
- Affected components: `PortfolioStats`, `CashInterestCard`, `HoldingsTable`, `TaxPocketWidget`, `ProjectionSummary`, `ProjectionChart`, dashboard stat cards

---

## Implementation Notes

- **Multi-ticker pricing** is a prerequisite for accurate per-ticker reporting — should be done first
- **Fees** and **stamp duty** both affect tax calculations and should be coordinated
- **Privacy mode** is purely UI — no data model changes needed
- **Capital losses tracking** requires a new Firestore field and potential data migration
- All features are independent enough to ship in separate waves

## Related

- [[wiki/bugs/ticker-persistence]] — Blocking bug that should be fixed before or alongside these enhancements
- [[wiki/features/investment-tracking-v3/investment-tracking-v3]] — V3 already added dividends, tax pocket, cash adjustments, CAGR
- [[wiki/features/multi-broker-architecture/multi-broker-architecture]] — V2 multi-broker foundation
- [[wiki/features/financial-projections/financial-projections]] — Projections page (privacy mode affects this too)
- Source: [raw/investment-report/investment-report.md](raw/investment-report/investment-report.md)
- Source: [raw/110-italian-tax-enhancements/110-italian-tax-enhancements.md](raw/110-italian-tax-enhancements/110-italian-tax-enhancements.md)
