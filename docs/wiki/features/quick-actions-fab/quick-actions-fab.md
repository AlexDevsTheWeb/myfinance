---
type: Feature
title: "Quick Actions FAB"
description: "A single circular floating action button in the app layout that opens the global Add Transaction drawer from any page except the dashboard and Config."
tags: [feature, ui, navigation, transactions]
created: 2026-10-26
updated: 2026-10-26
status: implemented
sources: ["raw/archive/gsd/phases/06-fab-navigation/", "raw/2026-10-UI-refactor/2026-10-26-add-transaction.md"]
related: ["wiki/features/add-transaction-drawer/add-transaction-drawer", "wiki/features/sidebar-redesign/sidebar-redesign", "wiki/features/transaction-ledger-redesign/transaction-ledger-redesign"]
---

# Feature: Quick Actions FAB

Status: implemented (2026-04-26) · simplified 2026-10-26
Priority: medium

## Description

Transaction entry used to be reachable only from the dashboard. GSD phase 06
lifted the entry point into the layout. Since the
[[wiki/features/add-transaction-drawer/add-transaction-drawer]] landed, the FAB is
a **single circular button** rather than a two-action menu: the type is chosen
inside the drawer, so a menu in front of it was one click too many.

## Behaviour

`apps/web/src/components/layout/Layout.tsx` renders a fixed circular `Fab`:

1. Bottom-right, 24px from each edge, `zIndex: 1000`.
2. Surface background with a 1px cyan border and a soft cyan shadow.
3. A `+` icon; clicking it calls `openTransactionDrawer('expense')`, which opens
   the drawer with the expense tab preselected.

Visibility rules — the FAB is **hidden** on:

- `/config` (no transactions belong there)
- the dashboard (which exposes its own primary CTA)

It requires an authenticated user.

## Implementation Notes

- The trigger is state, not a component: `useUiStore.openTransactionDrawer()` is
  the single entry point shared with the dashboard CTA and the ledger row menu.
- It is a MUI `Fab` rather than a `Button` stack — the previous expandable menu
  (New Income / New Expense) was removed when the drawer introduced the type tabs.
- The label comes from i18n (`transactions.drawer.fabLabel`) — see
  [[wiki/features/localization/localization]].

## Requirements (as shipped)

- [x] Reachable from every page except Config and dashboard
- [x] Single button opening the transaction drawer
- [x] Drawer opens on the expense tab by default
- [x] Hidden for unauthenticated users
- [x] Localized accessible label

## Related

- [[wiki/features/add-transaction-drawer/add-transaction-drawer]]
- [[wiki/features/sidebar-redesign/sidebar-redesign]]
- [[wiki/features/transaction-ledger-redesign/transaction-ledger-redesign]]
- Archived GSD phase: [06-fab-navigation](../../../raw/archive/gsd/phases/06-fab-navigation/)
