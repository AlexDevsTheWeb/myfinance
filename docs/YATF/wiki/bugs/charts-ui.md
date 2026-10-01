---
type: Bug
title: "Charts UI — layout, padding, and label cutoff issues"
description: "All charts across the app have formatting issues: too much left padding, labels cut off, pie labels too far from the pie, and one broken navigation link."
tags: [bug, ui, charts]
created: 2026-07-26
updated: 2026-10-01
status: fixed
severity: major
sources: ["raw/bugs/charts-ui/charts-ui.md"]
related: ["wiki/decisions/chart-migration-mui", "wiki/architecture/tech-stack"]
---

# Bug: Charts UI — layout, padding, and label cutoff

Status: **fixed**
Severity: **major**

## Symptom

All charts across the app share three recurring formatting issues:
1. **Too much empty space on the left** — y-axis margin reserves more space than labels need
2. **Labels cut off** — x-axis labels at the right edge and pie chart labels are clipped by the container/SVG viewport
3. **Pie chart legend too far from the pie** — legend at the bottom has excessive gap

Additionally, the **Investments button** on the dashboard navigates to `/invest` (no route) instead of `/investments`.

## Pages / Charts Affected

| Page | Charts |
|------|--------|
| Home | Cash Flow Trend, Portfolio Value, Account Breakdown |
| Transactions | Spending by Category |
| Finance — Salary | Monthly Salary Trend |
| Finance — Insights | All charts |
| Investments — Cash Balance | Portfolio Value |
| Investments — Invested Capital | Allocation, Portfolio Value |
| Car | All charts (all tabs) |
| Utilities | All charts (all tabs) |

## Root Cause

MUI X Charts v9 renders an `<svg>` element with `overflow: hidden` by default. Any label text extending outside the SVG viewport (due to insufficient `margin` space) gets clipped — the container CSS can't override this.

`margin` prop values were set inconsistently during the Recharts → MUI X migration (`docs/YATF/wiki/decisions/chart-migration-mui`):

- `left: 50` or `left: 60` on line/bar charts left excess padding for shorter y-axis values
- `bottom: 30` on charts **with** legends clipped the legend text (needs ~50px)
- `right: 10` clipped the last x-axis tick label
- Pie chart `outerRadius` (100–110) didn't fill available vertical space, leaving a gap to the legend

## Fix

### Root cause 1: SVG `overflow: hidden` clips labels

MUI X Charts SVG elements have `overflow: hidden` as an inline style. Adding `sx={{ overflow: 'visible' }}` on the component didn't override it because MUI applies both inline styles and CSS-in-JS classes in a way that `overflow: hidden` still wins.

**Fix:** Added `overflow: 'visible'` + `'& svg': { overflow: 'visible !important' }` on every chart's container `<Box>` — the `!important` CSS selector forces the SVG to stop clipping content outside its viewport.

Applied to all 16 chart containers (composition + convenience components).

### Root cause 2: Pie chart legend bottom margin was fixed at 100px

The Speding by Category chart (and other pie charts) calculated total height dynamically based on legend items: `chartHeight = 300 + ceil(n/2) * 24`. But the `margin={{ bottom: 100 }}` was a fixed 100px regardless of how many legend rows existed. With 12+ categories, the legend needs 144+ px but only 100px was allocated → legend items clipped at the bottom.

**Fix:** Made bottom margin dynamic — `margin={{ bottom: Math.max(100, legendHeight + 20) }}` where `legendHeight = Math.ceil(data.length / 2) * 24`. Also increased `outerRadius: 100-110 → 120` to reduce visual gap.

Files: `CategoryPieChart.tsx`, `AccountBreakdownChart.tsx`, `AllocationDonutChart.tsx`

### Root cause 3: Excess left margin

`left: 50` on line/bar charts allocated more padding than y-axis labels needed.

**Fix:** Reduced to `left: 30-35` on most charts, `left: 60` on large-value charts (portfolio/projections).

### Navigation fix

`DashboardPage.tsx:137` — `navigate('/invest')` → `navigate('/investments')`

## 2026-10-01 follow-up — dashboard chart heights + hidden axis labels

Reported on the dashboard: **Cash Flow Trend rendered shorter than Portfolio Value** (280px vs
300px) and **some axis strings were not visible at all**.

### Root cause (three layers)

1. **Height mismatch** — `Charts.tsx` used `280`, `PortfolioLineChart.tsx` used `300`.
2. **Labels ellipsized or auto-hidden by MUI X Charts v9** (the "invisible strings"):
   - `shortenLabels()` ellipsizes each tick label to the space available around its tick, and
     `tickLabelInterval: 'auto'` **drops labels that would overlap** the previous one
     (`ChartsXAxis.js`: "If two tick labels are closer than this minimum gap, one of them will
     be hidden"). `disableTicks` only hides tick *marks* — labels still render.
   - `margin.left` was `15` (July WIP commit `b7e4f39` "started fix charts positions" shrank it
     from 35) → y-axis value labels had ~15px → ellipsized to fragments.
   - 12 × "MMM YYYY" x-labels (~52px each) don't fit a half-width card (~500px drawing width)
     → every other month label was auto-hidden.
3. **Legend overflowed the fixed box** — passing `height` to `ChartsDataProvider` fixes the SVG
   height, but `ChartsWrapper` still stacks the HTML legend (`auto` grid row) *outside* the SVG,
   so total content exceeded the fixed-height `<Box>` and spilled past the Paper edge.

### Fix (both `Charts.tsx` and `PortfolioLineChart.tsx`)

- **Equal heights:** both containers fixed at **320px** (same structure → same visual height).
- **Removed the `height` prop** from `ChartsDataProvider` — v9 then measures the container
  instead: `ChartsWrapper` gets `extendVertically` (→ `height: 100%`) automatically when no
  height prop is set, and `ChartsLayerContainer` (wrapping the SVG) is `height: 100%` of the
  chart grid cell, observed via ResizeObserver. The legend now sits **inside** the box (grid
  row `auto`) and the chart cell = box − legend — nothing overflows.
- **Margins:** `{ left: 60, bottom: 60 }` (was 15/20 and 50) — room for y-axis values and
  rotated date labels.
- **Rotated x labels:** `tickLabelStyle: { angle: -45, textAnchor: 'end' }` — horizontal
  footprint of each rotated label is `textLength × cos45°` (~37px for "Oct 2025"), so all 12
  months fit the half-width card without overlap; dense portfolio ranges still sub-sample
  sensibly.

### Verification

- `tsc -b` clean, production build OK, lint at exact 9-error baseline
- 162/162 tests

## Verification

- `npm run build` passes (0 type errors)
- All charts render with correct spacing
- Investment button navigates to `/investments`

## Related

- [[wiki/decisions/chart-migration-mui]] — the migration that introduced these margins
- [[wiki/architecture/tech-stack]] — `@mui/x-charts ^9.2.0`
- Source: [raw/bugs/charts-ui/charts-ui.md](raw/bugs/charts-ui/charts-ui.md)
