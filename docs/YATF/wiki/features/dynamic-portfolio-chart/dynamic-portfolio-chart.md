---
type: Feature
title: "Dynamic Portfolio Chart — Live Market Valuation"
description: "Recompute portfolio chart from live market prices, fix tooltip labels, and display per-holding unit counts on hover."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/160"
tags: [feature, investment, chart, planned]
created: 2026-07-19
updated: 2026-07-19
status: planned
sources: ["raw/dynamic-portfolio-chart/dynamic-portfolio-chart.md"]
related: ["wiki/features/investment-tracking/investment-tracking", "wiki/architecture/investment-tracking-architecture", "wiki/features/investment-tracking-guide/investment-tracking-guide", "wiki/features/historical-snapshots/historical-snapshots", "wiki/bugs/broker-transaction-filter"]
---

# Feature: Dynamic Portfolio Chart

Status: planned
Priority: medium

## Description

The Portfolio Value line chart currently displays static snapshot data computed at transaction time. This feature makes the chart dynamic: when market prices are refreshed, all historical snapshots are recalculated using current per-ticker prices, so the entire chart line updates to reflect real market conditions.

## Problem

- `currentPrice` is a single number applied to all tickers
- `portfolioSnapshots[]` are static — computed once and never updated
- `refreshPrices` fetches per-ticker data but stores only one price
- The chart misleadingly shows transaction-time values, not market valuations
- **Tooltip bug**: series labels don't appear on hover; marks hidden when data >1 point
- **No units display**: chart data (`IPortfolioPoint`) has no per-holding breakdown for tooltip

## Solution

1. Store **per-ticker prices** (`Record<string, number>`) instead of a single `currentPrice`
2. `refreshPrices` stores all fetched quotes in the prices map
3. After price refresh, **recompute all snapshots**: each snapshot's holdings have unit counts, so `currentValue = Σ(holding.units × prices[ticker])`
4. Live portfolio stats also use per-ticker prices
5. Extend `IPortfolioPoint` with `holdings[]` array for per-ticker units/price display
6. Fix tooltip rendering: keep marks visible, ensure `ChartsTooltip` renders labels correctly, add custom tooltip content with per-holding breakdown

## Implementation

See [raw analysis](raw/dynamic-portfolio-chart/dynamic-portfolio-chart.md) for full impact analysis.

**Scope:** ~8 files modified, 2 new store actions, 2 schema changes, 1 UI fix. No new dependencies.

## Related

- [[wiki/features/investment-tracking/investment-tracking]] — Base investment tracking feature
- [[wiki/architecture/investment-tracking-architecture]] — Current architecture with single-price limitation
- [[wiki/features/historical-snapshots/historical-snapshots]] — Snapshot persistence that needs recalculation
- [[wiki/features/investment-tracking-guide/investment-tracking-guide]] — User guide documenting the current limitation
- [[wiki/bugs/broker-transaction-filter/broker-transaction-filter]] — Broker filter bug; chart "always grows" because snapshots mirror invested until prices are refreshed
- GitHub: [#160](https://github.com/AlexDevsTheWeb/myfinance/issues/160)
- Source: [raw/dynamic-portfolio-chart/dynamic-portfolio-chart.md](raw/dynamic-portfolio-chart/dynamic-portfolio-chart.md)
