---
type: Feature
title: "Quick Actions FAB"
description: "A single expandable floating action button in the app layout that opens New Income or New Expense from any page except the dashboard and Config."
tags: [feature, ui, navigation, transactions]
created: 2026-10-26
updated: 2026-10-26
status: implemented
sources: ["raw/archive/gsd/phases/06-fab-navigation/"]
related: ["wiki/features/sidebar-redesign/sidebar-redesign", "wiki/features/transaction-layout-improvement/transaction-layout-improvement"]
---

# Feature: Quick Actions FAB

Status: implemented (2026-04-26)
Priority: medium

## Description

Transaction entry used to be reachable only from the dashboard. GSD phase 06
lifted the entry points into the layout so that **New Income** and **New
Expense** are one click away from every data page.

## Behaviour

`apps/web/src/components/layout/Layout.tsx` renders a fixed bottom-right stack:

1. A single `+` button toggles the menu.
2. Expanded state shows **New Income** (green, upward arrow) and **New Expense**
   (red, downward arrow), each with a short fade-in animation.
3. Selecting either opens `TransactionModal` with the right type preselected.

Visibility rules — the FAB is **hidden** on:

- `/config` (no transactions belong there)
- the dashboard (which already exposes its own entry points)

It requires an authenticated user.

## Implementation Notes

- The modal state was lifted from `DashboardPage` into `Layout`, which is what
  removes the duplicate FAB the dashboard used to own.
- The stack is `flex-direction: column-reverse` with `zIndex: 1000`, so the main
  button stays anchored while actions expand upward.
- Labels come from i18n (`common.newIncome`, `common.newExpense`) — see
  [[wiki/features/localization/localization]].
- It is a plain MUI `Button` stack, not MUI's `SpeedDial`: the styling needed to
  match the sidebar/glass aesthetic did not fit `SpeedDial`'s internal markup.

## Requirements (as shipped)

- [x] Reachable from every page except Config and dashboard
- [x] Single toggle button with two actions
- [x] Opens the transaction modal with the correct type
- [x] Hidden for unauthenticated users
- [x] Localized labels

## Related

- [[wiki/features/sidebar-redesign/sidebar-redesign]]
- [[wiki/features/transaction-layout-improvement/transaction-layout-improvement]]
- Archived GSD phase: [06-fab-navigation](../../../raw/archive/gsd/phases/06-fab-navigation/)
