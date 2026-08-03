---
type: Bug
title: "ETF Total Return stuck at €0 — market price provider dead"
description: "Total Return on the Invested Capital tab stays 0 because the price provider (api.yfin.dev) was dead, so prices never load and current value falls back to avg cost. Fixed by switching to the Yahoo Finance chart API with Xetra-first (.DE) venue resolution, and consolidating SWDA/EUNL (same fund, ISIN IE00B4L5Y983) onto the EUNL ticker."
tags: [bug, investment, pricing, yahoo, portfolio, ticker]
created: 2026-08-03
updated: 2026-08-03
status: fixed
severity: major
sources: ["raw/bugs/etf-pricing-total-return/etf-pricing-total-return.md"]
related: ["wiki/features/dynamic-portfolio-chart/dynamic-portfolio-chart.md", "wiki/features/ticker-validation/ticker-validation.md", "wiki/features/multi-broker-architecture/multi-broker-architecture.md", "wiki/bugs/broker-transaction-filter.md"]
---

# Bug: ETF Total Return stuck at €0

Status: **fixed**
Severity: **major**

## Symptom

On **Investments** → **Invested Capital**, Total Return is permanently `+€0,00 (+0.0 %)` and the portfolio never reflects real ETF market value — current value always equals invested cost, and the Portfolio Value chart "always grows".

## Reproduction

1. Record ETF transactions for any fund.
2. Open **Invested Capital** → Total Return shows `0` regardless of price movement.
3. Refresh Prices never changes anything.

## Root Cause Analysis

1. **Dead price provider** — `useMarketData.ts` called `api.yfin.dev/v2/...`, a domain that no longer exists (DNS `NXDOMAIN`). Every quote request failed, `prices` stayed empty, and `usePortfolio` fell back to `currentPrice = prices[ticker] ?? avgCost` → `currentValue === totalInvested` → return always 0.
2. **Wrong default venue for German-listed funds** — Trade Republic executes on the Lang & Schwarz Exchange (Hamburg, Yahoo suffix `.HM`), but Trade Republic **displays the reference (Xetra) price**. Yahoo's `.HM` quotes are frequently stale (observed hours old / pre-open), while `.DE` (Xetra) is current. Example: Trade Republic app `126.04 €` == Yahoo `EUNL.DE` `126.045 €`, vs stale `EUNL.HM` `125.32 €`.
3. **SWDA and EUNL are the same fund** — iShares Core MSCI World USD (Acc), ISIN `IE00B4L5Y983`, WKN `A0RPWH`. The app defaulted to `SWDA.MI` (Milan listing) but Trade Republic sells the Xetra listing (`EUNL`); keeping both produced two holdings rows for one fund.

## Fix

1. Switched the provider to **Yahoo Finance chart API** — `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`, no key required, drop-in.
2. **Xetra-first candidate order** `[.DE, .HM, .F, .MI]` — bare `EUNL` now resolves to `EUNL.DE` (matches Trade Republic's displayed price); `.HM` kept only as a fallback for Hamburg-only tickers.
3. **Default ticker → `EUNL`** (`src/store/defaults.ts`) + idempotent `migrateTickerSymbols()` in `useInvestmentSync.ts` renames legacy `SWDA`/`SWDA.<venue>` transactions to `EUNL` (persisted once on load).
4. Prices are keyed by the **raw transaction ticker** (`prices[ticker] = quote`), so holdings lookups always match after resolution.

Verified resolution (2026-08-03): `EUNL` → `EUNL.DE` 126.045 € == Trade Republic app; `SWDA` → `SWDA.MI` 126.03 €; `VWCE` → `VWCE.DE` 165 €. Build clean, no new lint issues.

## Related

- [[wiki/features/dynamic-portfolio-chart/dynamic-portfolio-chart]] — chart depends on the manual price refresh
- [[wiki/features/ticker-validation/ticker-validation]] — ticker validation against the same Yahoo API
- [[wiki/features/multi-broker-architecture/multi-broker-architecture]] — per-broker holdings and pricing
- [[wiki/bugs/broker-transaction-filter]] — the sibling brokerId bug this branch also fixed
- Source: [raw/bugs/etf-pricing-total-return/etf-pricing-total-return.md](raw/bugs/etf-pricing-total-return/etf-pricing-total-return.md)
