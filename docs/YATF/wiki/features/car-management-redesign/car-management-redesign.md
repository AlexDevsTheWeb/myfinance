---
title: "Car Management Redesign"
tags: [feature, frontend, car, planned]
created: 2026-06-22
updated: 2026-06-22
status: planned
sources: ["raw/SPEC.md"]
related: ["plans/car-redesign-implementation", "architecture/project-state"]
---

# Feature: Car Management Redesign

Status: planned
Priority: medium

## Description

Redesign the Car page (`src/pages/CarPage.tsx`) with a bento grid layout, add monthly average calculations for mileage tracking, and improve charts while maintaining all existing visualizations.

## Requirements

- Monthly averages displayed for current year (avg with data, avg full year)
- Historical averages per year visible (Year | Total Km | Avg/Month | Months Recorded)
- Bento grid layout applied to Mileage tab
- Bento grid layout applied to Tires tab
- Bento grid layout applied to Fuel tab
- Mileage Trend chart preserved (blue stroke #3b82f6)
- Tire Usage chart improved (replace placeholder)
- Fuel Efficiency Trend chart preserved (green stroke #10b981)
- All existing data and functionality maintained

## Design System

- Card border radius: 16px
- Card background: rgba(30, 41, 59, 0.5)
- Card border: 1px solid rgba(255,255,255,0.05)
- Gradient accents for key metric cards
- Compact typography with secondary/opacity labels
- Icon overlays with muted colors
- Striped table rows with hover states

### Mileage Tab Layout

| Box | Size | Content |
|-----|------|---------|
| Total Odometer | lg | Gradient card with total km |
| Year Stats | lg | Current year total |
| Avg With Data | md | Average (months with data) |
| Avg Full Year | md | Average (/12) |
| New Reading Form | lg | Input form |
| Statistics Table | lg | Monthly breakdown |
| Mileage Trend Chart | lg | Line chart (preserved) |

### Tires Tab Layout

| Box | Size | Content |
|-----|------|---------|
| Summer Total | md | Summer tires km |
| Winter Total | md | Winter tires km |
| Current Tires | md | Current tires km |
| New Tire Change Form | lg | Input form |
| History Table | lg | Tire change history |
| Tire Usage Chart | lg | Line chart (improved) |

### Fuel Tab Layout

| Box | Size | Content |
|-----|------|---------|
| Total Spent | md | Total fuel cost |
| Efficiency | md | €/km |
| Total Km | md | Total km driven |
| Monthly Details Table | lg | Monthly breakdown |
| Fuel Efficiency Trend Chart | lg | Line chart (preserved) |

## Implementation Notes

- Single file change: `src/pages/CarPage.tsx`
- Uses MUI Grid2 for bento layout
- Recharts for all charting
- Historical stats computed via `useMemo` over `carMileage` data

## Related

- [[wiki/plans/car-redesign-implementation]]
- [[wiki/architecture/project-state]]
- [[wiki/conventions/coding-conventions]]
