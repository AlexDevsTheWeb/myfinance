---
title: "Sidebar Navigation Redesign"
tags: [feature, frontend, planned]
created: 2026-06-28
updated: 2026-06-28
status: planned
sources: ["raw/99-manual-review-2706.md"]
related: ["features/dashboard-redesign", "plans/manual-review-99-implementation"]
---

# Feature: Sidebar Navigation Redesign

Status: **planned**
Priority: **medium**

## Description

Replace the horizontal top navigation bar with a vertical left sidebar. Group Finance (Salary, Insights) and Investments (Investments, Projections) into collapsible sections to reduce visual clutter.

## Current State

`Layout.tsx` uses:
- A top `AppBar` with direct `Button` elements for each enabled module (Car, Utilities, Invest, Budget, Projections)
- A "Finance" dropdown for Salary and Insights sub-items
- A mobile-only `SwipeableDrawer` with all items listed flat

## Target

### Desktop Layout
- **Left sidebar** (permanent `Drawer`, ~240px):
  - Logo/app title at top
  - **Dashboard** (always)
  - **Finance group** (collapsible):
    - Salary
    - Insights
  - **Investment group** (collapsible):
    - Investments (if `investmentTracking` enabled)
    - Projections
  - Budget (if `budgetTracking` enabled)
  - Car (if `carManagement` enabled)
  - Utilities (if `utilityTracker` enabled)
  - Separator
  - Settings
  - Logout
- **Top bar** (simplified): Just logo + user avatar with dropdown menu

### Mobile
- Keep the existing `SwipeableDrawer` pattern (already works well)
- Update drawer content to match new grouping

## Requirements

- Sidebar items use icons + labels
- Finance and Investment groups are collapsible with expand/collapse chevron
- Active route highlighted in sidebar
- "Dashboard" is the home/default selection
- Logout is visually separated (red or with a divider)
- FAB (New Income/New Expense) stays in layout unchanged

## Implementation Notes

- Extract sidebar into `src/components/layout/Sidebar.tsx`
- Simplify AppBar to just logo + user menu in `Layout.tsx`
- Use MUI `Drawer` (variant `permanent` for desktop, `temporary` for mobile)
- Group items use `ListSubheader` or nested `List` with `Collapse`

## Related

- [[features/dashboard-redesign]]
- [[plans/manual-review-99-implementation]]
- Source: [raw/99-manual-review-2706.md](raw/99-manual-review-2706.md)
