---
type: Feature
description: "Loading indicators on Dashboard, Transactions, and Investments pages during data sync."
title: "Loading States"
tags: [feature, ux, go-to-market]
created: 2026-07-12
updated: 2026-07-12
status: implemented
sources: ["openspec/changes/go-to-market-phase-0/"]
related: ["wiki/plans/go-to-market", "wiki/architecture/system-architecture"]
---

# Feature: Loading States

Status: `implemented`

## Description

Added loading indicators (CircularProgress) to data-driven pages during initial Firestore sync, preventing blank/zero data display on slow connections.

## Implementation

### Store Changes

- Added `isLoading: boolean` to `useFinanceStore` (initial: `true`)
- Added `isLoading: boolean` to `useInvestmentStore` (initial: `true`)

### Hook Changes

- `src/hooks/useSyncFinance.ts` — sets `isLoading: false` after first successful snapshot
- `src/hooks/useInvestmentSync.ts` — sets `isLoading: false` after first successful snapshot

### Page Changes

| Page | Loading State |
|------|---------------|
| `src/pages/DashboardPage.tsx` | Centered CircularProgress while finance data loads |
| `src/pages/TransactionsPage.tsx` | Centered CircularProgress while finance data loads |
| `src/pages/InvestmentPage.tsx` | Centered CircularProgress while investment data loads |

## Motivation

Blank page on slow load = "is it broken?" Beta users on slow connections would see empty dashboards before Firestore returns data. Part of [#138](https://github.com/AlexDevsTheWeb/myfinance/issues/138) Phase 0.

## Related

- [[wiki/plans/go-to-market]]
- [[wiki/features/mui-dialogs/mui-dialogs]]
