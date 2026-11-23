---
type: Feature
title: "Quick Actions FAB"
description: "Deprecated (2026-11-23) — the floating action button that opened the transaction drawer from any page. Removed because the TopBar already exposes the same action on every desktop page; the mobile header carries it instead."
tags: [feature, ui, navigation, transactions, deprecated]
created: 2026-10-26
updated: 2026-11-23
status: deprecated
sources: ["raw/archive/gsd/phases/06-fab-navigation/", "raw/2026-10-UI-refactor/2026-10-26-add-transaction.md"]
related: ["wiki/features/add-transaction-drawer/add-transaction-drawer", "wiki/features/utilities-consumption-page/utilities-consumption-page", "wiki/features/sidebar-redesign/sidebar-redesign", "wiki/features/transaction-ledger-redesign/transaction-ledger-redesign"]
---

# Feature: Quick Actions FAB

Status: deprecated (removed 2026-11-23) · shipped 2026-04-26 · simplified 2026-10-26
Priority: medium

## Description

Transaction entry used to be reachable only from the dashboard. GSD phase 06
lifted it into the layout as a floating action button, and the drawer migration
reduced it to a single circular `+` that opened
[[wiki/features/add-transaction-drawer/add-transaction-drawer]] on the expense
tab.

It is **no longer rendered**. The shell's `TopBar` CTA (`+ Nuova Operazione`)
already opens the same drawer on every desktop page, so the FAB was a third
entry point for one action. On mobile — where the `TopBar` is not rendered — the
action moved into the compact header as an icon button.

## What it used to do

`apps/web/src/components/layout/Layout.tsx` rendered a fixed circular `Fab`:

1. Bottom-right, 24px from each edge, `zIndex: 1000`.
2. Surface background with a 1px cyan border and a soft cyan shadow.
3. A `+` icon calling `openTransactionDrawer('expense')`.
4. Hidden on `/config` and on the dashboard (which has its own CTA), and only
   for authenticated users.

## Why it was removed

| Problem | Detail |
|---|---|
| Duplicate action | The TopBar CTA and the FAB called the identical store action on every desktop page. |
| Three entry points on `/utilities` | While the utilities page had its own "Nuova Bolletta / Lettura" button, one route exposed three ways to create the same movement. |
| Overlap with content | The fixed button sat above the bottom-right of dense tables and the mobile drawer footer. |

The single entry point is now `useNewTransaction()` — a hook shared by the
desktop `TopBar` CTA and the mobile header icon. On `/utilities` it seeds the
bill category and expands the utility block; elsewhere it opens a blank expense.
See [[wiki/features/utilities-consumption-page/utilities-consumption-page]].

## Requirements (historical)

- [x] Reachable from every page except Config and dashboard
- [x] Single button opening the transaction drawer
- [x] Drawer opens on the expense tab by default
- [x] Hidden for unauthenticated users
- [x] Localized accessible label
- [x] ~~Rendered by `Layout`~~ — removed 2026-11-23

## Related

- [[wiki/features/add-transaction-drawer/add-transaction-drawer]] — the surface the FAB opened
- [[wiki/features/utilities-consumption-page/utilities-consumption-page]] — route-aware preset now owned by the shared hook
- [[wiki/features/sidebar-redesign/sidebar-redesign]]
- [[wiki/features/transaction-ledger-redesign/transaction-ledger-redesign]]
- Archived GSD phase: [06-fab-navigation](../../../raw/archive/gsd/phases/06-fab-navigation/)
