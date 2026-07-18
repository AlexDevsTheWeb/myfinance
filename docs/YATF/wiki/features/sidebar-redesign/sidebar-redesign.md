---
type: Feature
description: "Vertical left sidebar with grouped navigation, collapsible mode, and user avatar."
title: "Sidebar Navigation Redesign"
tags: [feature, frontend, planned]
created: 2026-06-28
updated: 2026-06-28
status: planned
sources: ["raw/99-manual-review-2706/99-manual-review-2706.md"]
related: ["features/dashboard-redesign", "plans/manual-review-99-implementation"]
---

# Feature: Sidebar Navigation Redesign

Status: **implemented**
Priority: **medium**

## Description

Replace the horizontal top navigation bar with a vertical left sidebar. Group Finance (Salary, Insights) and Investments (Investments, Projections) into collapsible sections to reduce visual clutter.

## Current State

`Layout.tsx` uses:
- A top `AppBar` with direct `Button` elements for each enabled module (Car, Utilities, Invest, Budget, Projections)
- A "Finance" dropdown for Salary and Insights sub-items
- A mobile-only `SwipeableDrawer` with all items listed flat

## What Was Built

### Desktop Layout
- **Left sidebar** (permanent `Drawer`, ~240px expandable / 64px collapsed):
  - Logo/app title at top
  - **Dashboard** (always)
  - **Finance group** (collapsible): Salary, Insights, Transactions
  - **Investment group** (collapsible): Investments (if enabled), Projections
  - Budget (if enabled)
  - Car (if enabled)
  - Utilities (if enabled)
  - Separator
  - Settings
  - **Logout** (with user avatar + name at sidebar bottom)
- **Top bar** (simplified): Just logo — avatar moved to sidebar

### Mobile
- Same `Sidebar` component used in a `temporary` Drawer
- Same grouping and collapsible behavior

### Key Features
- **Collapsible mode:** Toggle button shrinks sidebar to 64px icon-only mode
- **Active route highlighting** with accent color and subtle background
- **Transactions link** added to sidebar (was missing before)
- **Avatar + user name** moved from AppBar dropdown to sidebar bottom
- CSS-animated width transitions (240px ↔ 64px)

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

- [[wiki/features/dashboard-redesign/dashboard-redesign]]
- [[wiki/plans/manual-review-99-implementation]]
- Source: [raw/99-manual-review-2706/99-manual-review-2706.md](raw/99-manual-review-2706/99-manual-review-2706.md)
