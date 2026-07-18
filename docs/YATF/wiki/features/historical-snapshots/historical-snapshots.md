---
type: Feature
description: "Persistent portfolio history stored in Firestore subcollection."
title: "Historical Portfolio Snapshot Persistence"
tags: [feature, investment, persistence, implemented]
created: 2026-06-27
updated: 2026-06-27
status: implemented
sources: ["raw/92-historical-snapshots/92-historical-snapshots.md", "raw/12-investment-tracking-v2/implementation.md"]
related: ["features/investment-tracking", "architecture/investment-tracking-architecture", "plans/investment-tracking-v2-enhancements", "features/crud-etf-transactions"]
---

# Feature: Historical Portfolio Snapshot Persistence

Status: implemented
Priority: medium

## Description

Persistent historical portfolio snapshots in a Firestore subcollection, triggered automatically after ETF transactions. Implemented in Plan 12-04.

## What Was Built

- **useHistoricalSnapshots.ts:** Exports `recordPortfolioSnapshot(userId)` that writes `HistorySnapshot` documents to `/users/{uid}/portfolio_history/` subcollection.
- **Snapshot shape:** `{ date, totalInvested, currentValue, cashBalance, netWorth, holdings[] }`.
- **Daily debounce:** Queries for existing today's snapshot before writing — max 1 per day per user.
- **Firestore rules:** `match /users/{userId}/portfolio_history/{snapshotId}` with `allow read, write: if isOwner(userId)`.
- **Store triggers:** `addEtfTransaction` and `deleteEtfTransaction` call `recordPortfolioSnapshot` fire-and-forget after successful persistence.

## Implementation Notes

- Fire-and-forget strategy: subcollection write is non-blocking, main transaction commit is independent.
- Dual-write approach: existing `portfolioSnapshots` array continues to be written alongside new subcollection.
- Future phases can add subcollection reads for chart data; currently write-only.

## Files

- **Created:** `src/hooks/useHistoricalSnapshots.ts`
- **Modified:** `firestore.rules`, `useInvestmentStore.ts`, `en.json`, `it.json`

## Related

- [[wiki/features/investment-tracking/investment-tracking]]
- [[wiki/features/crud-etf-transactions/crud-etf-transactions]]
- [[wiki/architecture/investment-tracking-architecture]]
- [[wiki/plans/investment-tracking-v2-enhancements]]
- GitHub: [#92](https://github.com/AlexDevsTheWeb/myfinance/issues/92)
- Source: [raw/12-investment-tracking-v2/implementation.md](raw/12-investment-tracking-v2/implementation.md)
