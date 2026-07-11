---
title: "Decision: Migrate from Recharts to MUI X Charts"
tags: [decision, charts, ui, migration]
created: 2026-07-11
updated: 2026-07-11
status: accepted
sources: ["raw/chart-migration/proposal.md", "raw/chart-migration/design.md", "raw/chart-migration/tasks.md"]
related: ["architecture/tech-stack", "architecture/system-architecture"]
---

# Decision: Migrate from Recharts to MUI X Charts

Status: **accepted**
Date: 2026-07-11

## Context

The app rendered 16 charts using `recharts ^3.8.1`. Every chart had hardcoded hex colors, SVG `<defs>` gradients, and manual dark-mode styling — none integrated with MUI's theme system. The app already used MUI v9 and MUI X Pro (date pickers).

Decision was driven by an OpenSpec change ([`chart-migration`](raw/chart-migration/proposal.md)).

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **MUI X Charts** (chosen) | Theme-aware, built-in a11y and animation, same ecosystem as MUI v9, composition API, responsive by default | Learning curve for composition API, some recharts patterns (React nodes in tooltip) need rework |
| **Keep Recharts** | No migration cost | Disjoint ecosystem, manual theming, outdated dependency |

## Decision

**Migrate all 16 chart components** from Recharts to MUI X Charts in 3 phased waves:
1. **Wave 1** (8 easy): Simple standalone charts — sparklines, donuts, basic bars
2. **Wave 2** (6 medium): Charts with gradients, dual-axis, or interactive controls
3. **Wave 3** (2 hard): Complex composition (`FinancialTrendChart`) and dynamic rendering (`SalaryPage`)

## Design Decisions

| Decision | Choice |
|----------|--------|
| Component pattern | `ChartsDataProvider` + `ChartsSurface` (not `ChartsContainer`) — needed for `ChartsLegend` support |
| Theme colors | Extracted to `chart` namespace in `theme.ts` (primary, income, expense, palette array) |
| SVG gradients | Replaced with MUI X `fill` patterns via `slotProps` |
| Tooltips | Custom via `slots.tooltip` slot components |
| Responsive containers | Removed `<ResponsiveContainer>` — MUI X is responsive by default |

## Consequences

1. **16 files migrated** across `src/components/`, `src/analytics/components/`, and `src/pages/`
2. **Dependencies removed:** `recharts` and `victory-vendor` uninstalled
3. **Theme cohesion:** Chart colors now come from MUI theme tokens — light/dark mode works automatically
4. **Bundle size:** Removal of recharts (~130KB) + victory-vendor (~70KB) offsets MUI X Charts addition

## Related

- [[wiki/architecture/tech-stack]]
- [[wiki/architecture/system-architecture]]
- Source: [raw/chart-migration/](raw/chart-migration/)
