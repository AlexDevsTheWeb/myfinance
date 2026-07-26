# Responsive Chart Layout — Salary + Insights Pages

## Context

The Salary page (`/finance` tab 0) and Insights page (`/finance` tab 1) had charts inline next to tables in a two-column grid layout. On smaller/mid-size screens (e.g., MacBook Pro 1800px), charts were cramped and pushed below the fold. On large screens (e.g., 2K monitor 2560px), the inline layout works well.

## Changes

### Salary Tab

- Extracted the YoY comparison table and trend chart into a responsive layout using MUI `useMediaQuery('(min-width: 2000px)')`.
- **≥2000px (large):** Original two-column layout — table (`lg:7`) + inline "Monthly Salary Trend" `LineChart` (`lg:5`).
- **<2000px (compact):** Full-width table with a "Monthly Salary Trend" button (icon `OpenInFull`) in the card header. Opens a full-screen `SalaryChartDialog` with the `LineChart`.
- Created `src/components/salary/SalaryChartDialog.tsx` — full-screen `Dialog` with `AppBar`, close button, and `LineChart` filling the body.
- Removed unused `BarChartIcon`, `LineChart`, `axisClasses` imports from SalaryPage (re-added conditionally for inline mode).
- The `yoyTable` JSX extracted into a variable to avoid duplication between the two layouts.

### Insights Tab

- Removed `AnalyticsFilters` (date pickers, granularity/category selects) entirely — user deemed them unnecessary.
- Same responsive pattern: `useMediaQuery('(min-width: 2000px)')`.
- **≥2000px (large):** Two-column layout — `AnalysisTables` + `FinancialTrendChart` (`lg:7`) on left, 5 charts on right (`lg:5`): `CategoryPieChart`, `CategoryBarChart`, `MonthlyComparisonChart`, `NetWorthChart`, `AccountBreakdownChart`.
- **<2000px (compact):** Full-width `AnalysisTables` with a "Charts" button. Opens `InsightsChartsDialog` — full-screen dialog containing all 6 charts in a grid.
- Created `src/components/insights/InsightsChartsDialog.tsx` — accepts pre-computed chart data as props, renders 6 charts in a responsive grid.
- Data hooks (`useCategoryBreakdown`, `useNetWorth`, `useAccountBreakdown`, `useMonthlyComparison`) lifted to `InsightsPage` level and passed as props to both inline and dialog rendering. Filters use sensible defaults (current selectedYear, monthly granularity, all categories).

### Breakpoint Decision

Threshold: **`(min-width: 2000px)`** — chosen because:
- MacBook Pro 14"/16" typically has ~1800px horizontal resolution → gets compact layout (dialog)
- 2K monitors (2560px) → get inline layout
- 1920px monitors → get compact layout (dialog)

## Files Changed

- `src/pages/SalaryPage.tsx` — responsive layout, table extraction, dialog state
- `src/pages/InsightsPage.tsx` — responsive layout, removed AnalyticsFilters, data hooks at page level
- `src/components/salary/SalaryChartDialog.tsx` — **new:** full-screen dialog for Salary trend chart
- `src/components/insights/InsightsChartsDialog.tsx` — **new:** full-screen dialog for Insights charts

## Future

This responsive pattern (button → full-screen dialog for charts on compact screens, inline on large screens) should be replicated to other pages with chart-heavy layouts:
- Investment pages
- Car page
- Budget page
