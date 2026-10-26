## 1. Setup

- [x] 1.1 Install `@mui/x-charts` package
- [x] 1.2 Add chart color tokens to `src/theme/theme.ts` (primary, income, expense, palette array)
- [x] 1.3 Read current recharts chart source files to establish baseline rendering

## 2. Wave 1 — Easy Charts (simple standalone charts)

- [x] 2.1 Migrate `AccountCard.component.tsx` — sparkline LineChart to MUI X `<LinePlot>` with minimal config, dynamic Y-axis domain
- [x] 2.2 Migrate `ComparisonBarChart.tsx` — simple grouped `<BarPlot>` with two bars
- [x] 2.3 Migrate `CategoryBarChart.tsx` — horizontal `<BarPlot>` with `layout=\"vertical\"` equivalent
- [x] 2.4 Migrate `BurnUpLineChart.tsx` — `<AreaPlot>` with SVG gradient and dashed overlay line
- [x] 2.5 Migrate `NetWorthChart.tsx` — `<AreaPlot>` with dynamic gradient color based on positive/negative
- [x] 2.6 Migrate `AllocationDonutChart.tsx` — `<PiePlot>` donut with `innerRadius`/`outerRadius`
- [x] 2.7 Migrate `AccountBreakdownChart.tsx` — `<PiePlot>` donut with 6-color palette
- [x] 2.8 Migrate `CategoryPieChart.tsx` — `<PiePlot>` donut with dynamic height based on legend rows, empty state

## 3. Wave 2 — Medium Charts (charts with gradients, dual-axis, or interactive controls)

- [x] 3.1 Migrate `Charts.tsx` (dashboard) — dual `<AreaPlot>` with SVG gradients and EUR tick formatter
- [x] 3.2 Migrate `MonthlyComparisonChart.tsx` — 3-series grouped `<BarPlot>` with EUR tooltip
- [x] 3.3 Migrate `PortfolioLineChart.tsx` — `<AreaPlot>` with time-range filter buttons (1M/6M/1Y/ALL)
- [x] 3.4 Migrate `ProjectionChart.tsx` — `<AreaPlot>` with custom tooltip slot component, conditional 3rd area
- [x] 3.5 Migrate `UtilitiesPage.tsx` inline chart — dual Y-axis LineChart (consumption + unit cost)
- [x] 3.6 Migrate `CarPage.tsx` inline charts — 3 LineCharts (mileage, tire wear, fuel cost)

## 4. Wave 3 — Hard Charts (complex composition and dynamic rendering)

- [x] 4.1 Migrate `FinancialTrendChart.tsx` — `<ComposedChart>` with `<AreaPlot>` + `<LinePlot>`, custom dots, `activeDot`, SVG gradient, memoized data, tooltip slot
- [x] 4.2 Migrate `SalaryPage.tsx` inline chart — dynamic multi-year line generation via `map()`, custom tooltip slot component replacing React-nodes-in-formatter pattern

## 5. Cleanup and Verification

- [x] 5.1 Remove `recharts` and `victory-vendor` from `package.json` and run `npm uninstall`
- [x] 5.2 Verify all chart imports use `@mui/x-charts` exclusively
- [x] 5.3 Run `npm run build` to confirm no type or bundling errors
- [ ] 5.4 Visual check: compare each migrated chart against the original in light and dark mode
- [x] 5.5 Remove any remaining recharts-related code (utilities, types, helpers)
