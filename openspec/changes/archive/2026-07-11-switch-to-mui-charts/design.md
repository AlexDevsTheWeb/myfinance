## Context

The app renders 16 charts across components, analytics pages, and inline page views using recharts ^3.8.1. Every chart has hardcoded hex colors, SVG `<defs>` gradients, and manual dark-mode styling — none of which integrate with MUI's theme system. The app already uses MUI v9 and MUI X Pro (date pickers).

MUI X Charts (Community) provides bar, line, area, pie, scatter, and radar chart types — covering all current recharts usage. Its composition API (`ChartsDataProvider` + `<BarPlot>` / `<LinePlot>` / `<AreaPlot>`) replaces recharts' monolithic chart components.

## Goals / Non-Goals

**Goals:**
- Replace all 16 recharts chart instances with MUI X Charts equivalents
- Achieve visual parity — same data, layout, tooltips, and responsiveness
- Extract hardcoded chart colors into MUI theme tokens
- Remove `recharts` and `victory-vendor` from dependencies
- Remove all SVG `<defs>` gradient definitions

**Non-Goals:**
- No new chart types or features
- No layout or UX changes
- No zoom/pan/export (requires Pro license)
- No data layer or state management changes

## Decisions

1. **Phased migration by complexity** — Migrate in 3 waves: Easy (8 simple charts) → Medium (6 moderate charts) → Hard (2 complex charts). Each wave independently testable. Recharts and MUI X coexist during transition.

2. **Use `ChartsDataProvider` + `ChartsSurface` pattern** (not `ChartsContainer`) — `ChartsContainer` can't render `<ChartsLegend>` (HTML element) inside it. Since most charts have legends, the provider+surface pattern is the correct approach.

3. **Theme color tokens** — Extract current hardcoded colors into a `chart` namespace in `theme.ts`:
   ```
   chart: {
     primary: '#5b6cb8',
     income: '#10b981',
     expense: '#ef4444',
     palette: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', ...]
   }
   ```
   This eliminates duplicated hex values across 16 files.

4. **Replace SVG gradients with MUI X `fill` patterns** — MUI X supports SVG fill via `slotProps` on plot components. Use `fill: { type: 'linearGradient', ... }` or direct theme color references instead of `<defs>` elements.

5. **Custom tooltip via `slots.tooltip`** — MUI X uses slot-based customization. The single custom `CustomTooltip` component (ProjectionChart) and all tooltip formatters (EUR, k/M abbreviation) become slot components.

6. **React-nodes-in-tooltip pattern** (SalaryPage) — MUI X `slots.tooltip` receives a component that renders inside the tooltip. Convert the recharts `formatter` returning React nodes into a full custom tooltip slot component.

7. **Dual Y-axis** (UtilitiesPage) — MUI X supports multiple yAxis via `yAxis` array prop with `axisId`. Map left/right axis IDs to separate axis configurations.

8. **Responsive containers** — MUI X Charts are responsive by default. Remove `<ResponsiveContainer>` wrappers.

## Risks / Trade-offs

- **[Migration time]** ↔ **Mitigation**: Phased waves + coexistence. Roll back per-file if issues arise.
- **[Visual regression in edge cases]** ↔ **Mitigation**: Each chart has a before/after visual checklist (data rendering, tooltip, legend, empty state, dark mode).
- **[SalaryPage tooltip React nodes]** ↔ **Mitigation**: Slot-based tooltip component. If MUI X tooltip slots can't fully replicate the inline React node pattern, restructure as a custom tooltip component that receives the same data.
- **[Bundle size increase]** ↔ **Mitigation**: Removing recharts (~130KB) + victory-vendor (~70KB) offsets MUI X Charts. Likely net neutral or negative.
- **[ComposedChart migration (FinancialTrendChart)]** ↔ **Mitigation**: MUI X composition API (`<AreaPlot>` + `<LinePlot>` under one `ChartsDataProvider`) handles this natively. The risk is in mapping the specific dot/activeDot styling.

## Open Questions

- Does MUI X tooltip slot API fully support rendering arbitrary React elements (SalaryPage case)?
- Can MUI X `fill` styling accept the same linear gradient definitions as SVG `<defs>`, or must gradients be re-encoded?
- What is the exact bundle size impact after removing recharts and adding @mui/x-charts?
