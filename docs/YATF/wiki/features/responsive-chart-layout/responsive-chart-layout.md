---
type: Feature
title: "Responsive Chart Layout"
description: "Salary + Insights pages switch between inline charts (wide viewport) and full-screen dialog (compact viewport) at 2000px breakpoint."
tags: [feature, frontend, responsive]
created: 2026-07-26
updated: 2026-07-26
status: implemented
sources: ["raw/responsive-chart-layout/responsive-chart-layout.md"]
related: ["wiki/features/sidebar-routing-refactor/sidebar-routing-refactor", "wiki/bugs/charts-ui"]
---

# Feature: Responsive Chart Layout

Status: implemented
Priority: medium

## Description

Salary and Insights pages (tabs under `/finance`) now use `useMediaQuery('(min-width: 2000px)')` to switch between two layouts:
- **Large viewport (≥2000px):** Charts render inline next to tables in a two-column grid, as before.
- **Compact viewport (<2000px):** Tables render full-width. Charts open as full-screen dialogs via an "Open" button (`OpenInFull` icon) in the card header.

## Motivation

- MacBook Pro 14"/16" (~1800px wide) cramped charts and pushed content below the fold. The compact layout gives tables more space.
- 2K monitors (2560px) have enough room for the inline chart layout.
- Breakpoint of 2000px cleanly separates the two use cases.

## Implementation

### Salary Page (`src/pages/SalaryPage.tsx`)
- YoY comparison table extracted into a `yoyTable` variable.
- **Large:** Two-column grid — table `lg:7` + `LineChart` `lg:5`.
- **Compact:** Full-width table with "Monthly Salary Trend" button → `SalaryChartDialog`.

### Insights Page (`src/pages/InsightsPage.tsx`)
- `AnalyticsFilters` removed — date pickers, granularity/category selects no longer needed.
- Data hooks (`useCategoryBreakdown`, `useNetWorth`, `useAccountBreakdown`, `useMonthlyComparison`) lifted to page level with sensible defaults (current selectedYear, monthly granularity, all categories).
- **Large:** Two-column grid — `AnalysisTables` + `FinancialTrendChart` (`lg:7`) on left, 5 charts on right (`lg:5`).
- **Compact:** Full-width `AnalysisTables` with "Charts" button → `InsightsChartsDialog`.

### New Components
- `src/components/salary/SalaryChartDialog.tsx` — full-screen `Dialog` with `LineChart`.
- `src/components/insights/InsightsChartsDialog.tsx` — full-screen `Dialog` with 6 charts in a `Grid`.

## Files Changed
- `src/pages/SalaryPage.tsx` — responsive layout, extracted table, dialog state.
- `src/pages/InsightsPage.tsx` — responsive layout, removed AnalyticsFilters, data hooks at page level.
- `src/components/salary/SalaryChartDialog.tsx` — **new**.
- `src/components/insights/InsightsChartsDialog.tsx` — **new**.

## Future
- Replicate this responsive pattern to other chart-heavy pages: Investments, Car, Budget.
