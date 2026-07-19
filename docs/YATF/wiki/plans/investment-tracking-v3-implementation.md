---
type: Plan
description: "V3 implementation plan: dividend tracking, capital gains tax, cash adjustments, performance prefill."
title: "Investment Tracking V3 — Implementation Plan"
tags: [plan, investment, tax, dividend, draft]
created: 2026-06-28
updated: 2026-06-28
status: completed
sources: ["raw/98-investment-tracking-v3/98-investment-tracking-v3.md"]
related: ["features/investment-tracking-v3", "features/investment-tracking", "features/multi-broker-architecture", "features/historical-snapshots", "features/tax-inflation-modeling", "features/financial-projections", "architecture/investment-tracking-architecture"]
---

# Plan: Investment Tracking V3 — Dividend, Tax & Performance Enhancements

Status: draft

## Goal

Upgrade the investment tracking module from portfolio tracking to a compliant wealth management system covering dividend/interest income, Italian capital gains tax (26%), performance-linked projections, and disconnected cash adjustments.

## Architecture Analysis

The V3 features build on the existing V2 foundation. Key integration points:

### 1. Automated Dividend & Interest Ledger

**Type system:** Add `DividendEntry` interface to `investment.types.ts` alongside existing `BrokerAccount`/`AssetHolding`. Each dividend entry records: `{ brokerId, ticker, amount, date, type: "dividend" | "interest", notes? }`. No unit changes — only cash impact.

**Store:** Add `dividendEntries[]` to `useInvestmentStore`. "Add dividend" action increases the broker's `cashBalance` field without touching `assetHoldings[].units`. A `dividendTotal(brokerId)` selector aggregates YTD inflows.

**UI:**
- `DividendFormModal.tsx` — form to add dividend/interest entries
- `DividendBadge.tsx` — chip on broker cards showing +€X this month
- Integrate into existing `BrokerDetailsPanel` or broker card layout

**Firestore:** `/users/{uid}/dividends/` subcollection or array field. Given the V2 pattern, a subcollection is preferred for scalability.

### 2. Realized Capital Gains Tax Tracking

**Calculation:** Realized gain = sale proceeds − (avg cost basis × units sold). The 26% Italian tax = gain × 0.26. Average cost basis (PMC) already computed in `usePortfolio.ts`.

**Store:** Add `taxLiabilities[]` with `{ year, brokerId, realizedGain, taxDue, paid: boolean }`. Compute on sell transactions automatically.

**UI — "Tax Pocket" widget:**
- Summary card: total realized gains YTD, total tax due
- Per-year breakdown table
- Per-broker filter (reuse `BrokerSelect`)
- Placement: Dashboard or Investment page sidebar

**Tax year:** Use `dayjs` to group transactions by year. Allow switching between 2026, 2027, etc.

### 3. Dynamic Performance Prefill

**Bridge:** The Financial Projections simulator (`useProjectionEngine.ts`) currently uses manual CAGR/volatility inputs. Add an optional "Prefill from Portfolio" button that reads `usePortfolio()` returns to populate the sliders.

**Requirements:**
- Compute portfolio CAGR from historical snapshots (`HistoricalSnapshot[]` in `useHistoricalSnapshots.ts`)
- Pass as optional param to the projections engine
- Add a toggle: "Use Real Performance" ↔ "Manual"

### 4. Disconnected Cash Adjustments

**Type system:** Extend the existing transaction flow — add `cashAdjustment` transaction type in the investment store alongside `buy`/`sell`/`dividend`.

**Store action:** `addCashAdjustment(brokerId, amount, type: "deposit" | "withdrawal", date, notes)`. Adjusts `cashBalance` without touching units.

**UI:** Simple form in broker detail view: amount selector, date picker, notes field.

## Implementation Order (Recommended)

| Order | Feature | Dependencies | Effort |
|-------|---------|-------------|--------|
| 1 | Disconnected Cash Adjustments | None | Small |
| 2 | Automated Dividend & Interest Ledger | Cash Adjustments (shares pattern) | Medium |
| 3 | Realized Capital Gains Tax Tracking | Dividend ledger, PMC computation | Medium |
| 4 | Dynamic Performance Prefill | Historical snapshots, Projections engine | Medium |

**Rationale:** Cash adjustments are the simplest and provide the foundational pattern (cash-only transactions) that dividends reuse. Tax tracking depends on understanding realized gains (sell transactions) and benefits from dividend data. Performance prefill is last as it bridges two systems.

## Files Likely to Change

- `src/types/investment.types.ts` — new interfaces
- `src/store/useInvestmentStore.ts` — new state + actions
- `src/hooks/usePortfolio.ts` — tax calculation extensions
- `src/hooks/useProjectionEngine.ts` — prefill bridge
- `src/components/investment/` — new UI components
- i18n files (`en.json`, `it.json`)
- `firestore.rules` — new subcollection rules

## Dependencies

- [[wiki/features/investment-tracking/investment-tracking]] — V1 base
- [[wiki/features/multi-broker-architecture/multi-broker-architecture]] — V2 multi-broker foundation
- [[wiki/features/historical-snapshots/historical-snapshots]] — V2 snapshot persistence (needed for performance prefill)
- [[wiki/features/crud-etf-transactions/crud-etf-transactions]] — Transaction edit/delete patterns
- [[wiki/features/financial-projections/financial-projections]] — Projections engine (prefill target)
- [[wiki/architecture/investment-tracking-architecture]] — Current architecture reference

## Wave 4 Analysis: Dynamic Performance Prefill

This bridges real portfolio returns into the Financial Projections simulator, completing the 4th V3 sub-feature.

### Current State

- `useProjections` already has a prefill `useEffect` that reads `brokerConfig` from the investment store — it prefills `monthlyPac`, `initialLumpSum`, `cashAnnualRate`
- It does **not** prefill `etfAnnualReturn` — that's the remaining gap
- `usePortfolio` returns `totalReturnPercent` and `portfolioSnapshots[]` (time series) but **no CAGR** or annualized return is computed anywhere

### What's Needed

| Layer | Change |
|-------|--------|
| `compoundInterestUtils.ts` | Add `computeCAGR(snapshots)` — annualized return from portfolio snapshot time series |
| `useProjections.ts` | Add `useRealPerformance` toggle + CAGR prefill from `portfolioSnapshots`; when enabled, overrides `etfAnnualReturn` |
| `ProjectionControls.tsx` | Add "Use Real Performance" switch, gray out ETF slider when active, show computed CAGR |
| `ProjectionsPage.tsx` | Wire the toggle through |
| i18n | Keys already exist in EN/IT from V3 commit (`useRealPerformance`, `manualParameters`) |

### CAGR Computation Logic

From sorted `portfolioSnapshots`, find earliest and latest entries with `totalInvested > 0`. Compute:

```
cagr = (endValue / startValue)^(1 / years) - 1
```

Where:
- `startValue` = total invested at earliest snapshot
- `endValue` = currentValue + cashBalance at latest snapshot
- `years` = fractional years between earliest and latest snapshot dates

Clamped to 0–20% range for sanity. Returns `null` if fewer than 2 snapshots or portfolio age < 1 month.

### UX Flow

1. User opens Projections page
2. If portfolio has 2+ snapshots with `totalInvested > 0`, a "Use Real Performance" switch appears below the ETF return slider
3. Switch OFF (default): everything works as before — manual slider control
4. Switch ON: the ETF return slider value is locked to the computed CAGR, shown as "Using real portfolio: X.X%"
5. User can toggle back to manual anytime

## Verification

1. Manual: Add dividend entry → broker cash increases, units unchanged
2. Manual: Sell with gain → tax pocket shows 26% of realized gain
3. Manual: Projections page → "Use Real Performance" prefill works
4. Manual: Cash adjustment → broker cash changes, no unit changes
5. TypeScript: `npm run build` passes
6. Lint: `npm run lint` passes

## Related

- [[wiki/features/investment-tracking-v3/investment-tracking-v3]] — feature page
- [[wiki/architecture/investment-tracking-architecture]] — architecture docs
- Source: [raw/98-investment-tracking-v3/98-investment-tracking-v3.md](raw/98-investment-tracking-v3/98-investment-tracking-v3.md)
