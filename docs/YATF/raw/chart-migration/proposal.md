## Why

Recharts is a disjoint dependency with no theme awareness — colors, typography, and dark mode are manually maintained across 16 chart components. The app already runs on MUI v9 with MUI X Pro (date pickers). Switching to MUI X Charts brings design alignment, built-in accessibility, animation, and a composition API that matches the app's architectural patterns — all within the existing ecosystem.

## What Changes

- Replace recharts (^3.8.1) with `@mui/x-charts` across all 16 chart components
- No visual regressions — charts render the same data with the same layout
- Extract hardcoded chart colors into MUI theme tokens
- Remove `recharts` and `victory-vendor` dependencies
- Remove SVG `<defs>` gradient definitions in favor of MUI X styling

## Capabilities

### New Capabilities

- `chart-migration`: Migrate all chart rendering from recharts to MUI X Charts. No new chart types or features — the scope is a library replacement with visual parity.

### Modified Capabilities

None — no existing spec-level requirements change.

## Non-goals

- No chart type additions (no gauge, radar, heatmap, etc.)
- No layout or UX changes
- No zoom/pan/export features (requires MUI X Pro license)
- No refactoring of data fetching or state management

## Impact

- **16 files** across `src/components/`, `src/analytics/components/`, and `src/pages/`
- `package.json`: add `@mui/x-charts`, remove `recharts`
- Theme file: add chart color tokens
- Zero impact on state stores, API layer, or routing
