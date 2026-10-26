# Car Management Redesign Specification

**Date:** 2026-05-02

## Overview

- Redesign Car page with bento grid layout
- Add monthly averages for mileage tracking
- Improve charts and maintain all existing visualizations

---

## Part 1: Monthly Averages

### Current Year (selected year)

Display two average calculations:

1. **Average with data** = total km / months with readings
   - Formula: `yearStats.totalKmYear / yearStats.monthlyData.length`
   
2. **Average full year** = total km / 12
   - Formula: `yearStats.totalKmYear / 12`

### All Years

Create a summary showing historical data per year:
- Year | Total Km | Avg/Month | Months Recorded

---

## Part 2: Bento Grid Layout

### Design System

**Card styles:**
- Border radius: 16px
- Background: rgba(30, 41, 59, 0.5)
- Border: 1px solid rgba(255,255,255,0.05)
- Gradient accents for key metrics

**Stat cards:**
- Compact typography
- Secondary/opacity labels
- Icon overlays with muted colors

**Tables:**
- Striped rows
- Hover states
- Action buttons for edit

### Mileage Tab Layout

| Box | Size | Content |
|-----|-----|---------|
| Total Odometer | lg (spans full) | Total km with gradient card |
| Year Stats | lg | Total Km current year |
| Avg With Data | md | Average km (months with data) |
| Avg Full Year | md | Average km (/12) |
| Form | lg | New Reading Form |
| Table | lg | Statistics by month |
| Chart | lg | Mileage Trend (preserved) |

### Tires Tab Layout

| Box | Size | Content |
|-----|-----|---------|
| Summer Total | md | Summer tires km |
| Winter Total | md | Winter tires km |
| Current Tires | md | Current tires km |
| Form | lg | New Tire Change Form |
| Table | lg | History Table |
| Chart | lg | Tire Usage (improved) |

### Fuel Tab Layout

| Box | Size | Content |
|-----|-----|---------|
| Total Spent | md | Total fuel cost |
| Efficiency | md | €/km |
| Total Km | md | Total km driven |
| Table | lg | Monthly Details |
| Chart | lg | Fuel Efficiency Trend |

---

## Part 3: Charts

### Mileage Trend (preserved)
- Line chart showing km per month
- Blue stroke (#3b82f6)

### Tire Usage (improved)
- Replace current placeholder with visualization
- Show summer/winter usage over time

### Fuel Efficiency Trend (preserved)
- Line chart showing €/km per month
- Green stroke (#10b981)

---

## Files to Modify

| File | Action |
|------|--------|
| `src/pages/CarPage.tsx` | Complete redesign |

---

## Acceptance Criteria

- [ ] Monthly averages displayed for current year
- [ ] Historical averages per year visible
- [ ] Bento grid layout applied to Mileage tab
- [ ] Bento grid layout applied to Tires tab
- [ ] Bento grid layout applied to Fuel tab
- [ ] Mileage Trend chart preserved
- [ ] Tire Usage chart improved
- [ ] Fuel Efficiency Trend chart preserved
- [ ] All existing data and functionality maintained