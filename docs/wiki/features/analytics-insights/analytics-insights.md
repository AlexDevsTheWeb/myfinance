---
type: Feature
title: "Analytics & Insights Charts"
description: "Shared analytics data layer under apps/web/src/analytics plus six chart components rendered on the Insights tab of /finance, migrated from Recharts to MUI X Charts."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/37"
tags: [feature, analytics, charts, frontend]
created: 2026-10-26
updated: 2026-10-26
status: implemented
sources: ["raw/archive/superpowers/2026-05-23-analytics-charts-design.md", "raw/archive/superpowers/2026-05-23-analytics-charts-branch1.md", "raw/archive/superpowers/2026-05-23-analytics-charts-branch2.md", "raw/archive/superpowers/2026-05-23-analytics-charts-branch3.md", "raw/archive/superpowers/2026-05-23-analytics-charts-branch4.md"]
related: ["wiki/decisions/chart-migration-mui", "wiki/features/responsive-chart-layout/responsive-chart-layout", "wiki/features/dashboard-redesign/dashboard-redesign", "wiki/architecture/store-architecture"]
---

# Feature: Analytics & Insights Charts

Status: implemented
Priority: medium

## Description

Issue #37 asked for more analysis views. The answer was a self-contained
`apps/web/src/analytics/` module — a shared data layer plus presentational chart
components — rendered on a dedicated **Insights** tab, and reused selectively by
the Dashboard and Investments pages.

The module is deliberately decoupled from Zustand: hooks read the stores and
return chart-ready data, components only render it.

## Architecture

```
apps/web/src/analytics/
├── index.ts                  # barrel re-export
├── types.ts                  # IAnalyticsFilters, chart data shapes
├── hooks/
│   ├── useCategoryBreakdown.ts
│   ├── useMonthlyComparison.ts
│   ├── useNetWorth.ts
│   ├── useAccountBreakdown.ts
│   ├── usePortfolio.ts        # added later — dashboard + investment page
│   └── useTaxTracking.ts      # added later — TaxPocketWidget
└── components/
    ├── CategoryPieChart.tsx
    ├── CategoryBarChart.tsx
    ├── MonthlyComparisonChart.tsx
    ├── NetWorthChart.tsx
    ├── AccountBreakdownChart.tsx
    ├── AnalyticsFilters.tsx   # exported but not rendered anywhere — dead code
    └── index.ts
```

## Where the charts appear

| Surface | Content |
|---|---|
| `/finance` → **Insights** tab (`InsightsPage`) | Category pie + bar, monthly comparison, net worth, account breakdown, `AnalysisTables`, `FinancialTrendChart`, `YearSelector` |
| Dashboard | `BentoWidgetsRow` / `ChartsRow` use `usePortfolio` |
| Investments page | `usePortfolio` for live valuations |
| Investment tax pocket widget | `useTaxTracking` for realized gains and tax due |

All Insights charts are scoped by the shared `YearSelector`. Below the
large-screen breakpoint the charts move into `InsightsChartsDialog` — see
[[wiki/features/responsive-chart-layout/responsive-chart-layout]].

## Implementation Notes

- **Design vs reality:** the 2026-05-23 design specified Recharts. Every chart
  was later migrated to **MUI X Charts** for theme-awareness — see
  [[wiki/decisions/chart-migration-mui]]. Read the archived design for intent,
  not for current API.
- **Filters:** the design described date-range presets and a granularity toggle.
  `AnalyticsFilters.tsx` exists and is exported, but nothing renders it. The
  Insights page filters by year only. Treat the filter bar as unfinished rather
  than working.
- **Budget vs Actual** was explicitly deferred out of #37 and has no page and no
  implementation.
- Charts are presentational: no Firestore access, no store writes. This is why
  the module could be migrated wholesale without touching data flow.

## Requirements (as shipped)

- [x] Shared hooks producing chart-ready data from the finance store
- [x] Category breakdown (pie + bar), monthly comparison, net worth, account breakdown
- [x] Dedicated Insights surface under `/finance`
- [x] Year-scoped filtering
- [x] Theme-aware rendering via MUI X Charts
- [ ] Interactive date-range / granularity filters (`AnalyticsFilters` unwired)
- [ ] Budget vs Actual comparison (deferred)

## Related

- [[wiki/decisions/chart-migration-mui]]
- [[wiki/features/responsive-chart-layout/responsive-chart-layout]]
- [[wiki/architecture/store-architecture]]
- Sources: [design](../../../raw/archive/superpowers/2026-05-23-analytics-charts-design.md), [branch plans](../../../raw/archive/superpowers/)
- Issue: [#37](https://github.com/AlexDevsTheWeb/myfinance/issues/37)
