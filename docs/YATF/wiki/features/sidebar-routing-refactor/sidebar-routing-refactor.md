---
title: "Sidebar & Routing Refactor"
tags: [feature, sidebar, routing, navigation, implemented]
created: 2026-07-03
updated: 2026-07-03
status: implemented
sources: ["raw/sidebar-routing-refactor/sidebar-routing-refactor.md"]
related: ["features/sidebar-redesign", "features/investment-tracking-guide"]
---

# Feature: Sidebar & Routing Refactor

Status: **implemented**
Priority: **medium**

## Description

Consolidated sidebar navigation and routing to eliminate duplicate title, reduce nesting, and group related pages under tabbed views.

## Changes

### 1. Duplicate Title Removed
The app title "Yet Another Finance Tracker" was showing in both the sidebar (its canonical location) and the top AppBar. Removed from Layout.tsx AppBar.

### 2. Finance Page (`/finance`)
Created `src/pages/FinancePage.tsx` with two MUI Tabs:
- **Salary** — Previous standalone `/salary` route content
- **Insights** — Previous standalone `/insights` route content

Old routes `/salary` and `/insights` removed.

### 3. Investments Page (`/investments`)
Created `src/pages/InvestmentsPage.tsx` with two MUI Tabs:
- **Investments** — Previous standalone `/invest` route content
- **Projections** — Previous standalone `/projections` route content (still lazy-loaded)

Old routes `/invest` and `/projections` removed.

### 4. NavGroup Component Removed
The `NavGroup` collapsible component (used for Finance and Investments sub-menus) was removed from `Sidebar.tsx`. Both groups are now flat `navItem` links. This simplifies the sidebar and reduces cognitive load.

## Files

| File | Action |
|------|--------|
| `src/pages/FinancePage.tsx` | **Created** — tabbed page (Salary + Insights) |
| `src/pages/InvestmentsPage.tsx` | **Created** — tabbed page (Investments + Projections) |
| `src/App.tsx` | **Modified** — 4 old routes removed, 2 new routes added |
| `src/components/layout/Layout.tsx` | **Modified** — removed app title from AppBar, updated breadcrumb map |
| `src/components/layout/Sidebar.tsx` | **Modified** — removed NavGroup, flat links, removed Collapse import |

## Verification

- `npm run build` passes with zero type errors
- Code-splitting maintained: ProjectionsPage still lazy-loaded inside InvestmentsPage tab

## Related

- [[wiki/features/sidebar-redesign/sidebar-redesign]] — Previous sidebar work (vertical layout, collapsible mode)
- [[wiki/features/investment-tracking-guide/investment-tracking-guide]] — User guide for investment/projection features (now under `/investments`)
- Source: [raw/sidebar-routing-refactor/sidebar-routing-refactor.md](raw/sidebar-routing-refactor/sidebar-routing-refactor.md)
