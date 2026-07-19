---
type: Plan
title: "Daily Historical Portfolio Chart"
description: "Replace snapshot-based chart with daily time series computed from historical ticker prices and transaction history."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/160"
tags: [plan, investment, chart, research]
created: 2026-07-19
updated: 2026-07-19
status: draft
sources: ["raw/daily-historical-chart/daily-historical-chart.md"]
related: ["wiki/features/dynamic-portfolio-chart/dynamic-portfolio-chart", "wiki/features/investment-tracking/investment-tracking", "wiki/features/investment-tracking-guide/investment-tracking-guide"]
---

# Plan: Daily Historical Portfolio Chart

Status: draft
Priority: low

## Goal

Replace the current snapshot-based portfolio chart with a daily historical time series. For each day in the selected range (1M/6M/1Y/ALL), fetch the actual closing price of each held ticker, compute how many units were held on that day, and plot a continuous daily curve.

This converts the chart from point-based (one dot per snapshot event) to a proper time series showing both ticker performance and portfolio value evolution.

## What Was Built (Phase 1 — Snapshot Fix)

Issue [#160](https://github.com/AlexDevsTheWeb/myfinance/issues/160) delivered:

- Per-ticker current pricing via `prices` map in store
- Snapshot recomputation on price refresh (values update with current market)
- Snapshots created automatically on "Refresh Prices" (accumulates points)
- Historical snapshots loaded from Firestore subcollection on page load
- Tooltip fix (marks visible, `trigger="item"`)

These improvements make the existing snapshot chart functional. The daily historical chart is the next evolution.

## Design

See [raw spec](raw/daily-historical-chart/daily-historical-chart.md) for full design, data model, API research, and implementation plan.

### Key Decisions Needed

1. **API** — Yahoo Finance v8 chart API (needs CORS proxy) vs a paid service like FMP
2. **Cache strategy** — Session vs localStorage vs Firestore for historical prices
3. **Replacement or hybrid** — Replace snapshots entirely or keep for ALL range

### API Options Ranked

| Rank | Option | Cost | CORS | Reliability |
|------|--------|------|------|-------------|
| 1 | Yahoo Finance v8 + CORS proxy | Free | Needs proxy | Good |
| 2 | Financial Modeling Prep | Free tier | Yes | Medium |
| 3 | Alpha Vantage | Free tier | Yes | Good |
| 4 | yfin.dev (quote only) | Free | Yes | No history |

## Related

- [[wiki/features/dynamic-portfolio-chart/dynamic-portfolio-chart]] — Phase 1 implementation (snapshot-based)
- [[wiki/features/investment-tracking/investment-tracking]] — Base investment tracking
- [[wiki/features/investment-tracking-guide/investment-tracking-guide]] — User guide
- GitHub: [#160](https://github.com/AlexDevsTheWeb/myfinance/issues/160)
- Source: [raw/daily-historical-chart/daily-historical-chart.md](raw/daily-historical-chart/daily-historical-chart.md)
