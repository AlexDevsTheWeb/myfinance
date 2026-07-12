---
title: "ETF Transactions CRUD & Settings Persistence"
tags: [feature, investment, crud, implemented]
created: 2026-06-27
updated: 2026-06-27
status: implemented
sources: ["raw/90-crud-transactions/90-crud-transactions.md", "raw/12-investment-tracking-v2/implementation.md"]
related: ["features/investment-tracking", "plans/investment-tracking-v2-enhancements", "features/multi-broker-architecture", "features/pac-automation"]
---

# Feature: ETF Transactions CRUD & Settings Persistence

Status: implemented
Priority: high

## Description

Add edit/delete capabilities for ETF transactions with safe cascading recalculation. Implemented in Plan 12-03.

## What Was Built

### Edit/Delete Actions

- **HoldingsTable.tsx:** Edit (MUI `EditIcon`) and Delete (MUI `DeleteIcon`) icon buttons per row. Actions column conditionally rendered via optional `onEdit`/`onDelete` callbacks.
- **EtfTransactionModal.tsx:** Edit mode via optional `editTransaction` prop — pre-fills all fields, switches title to "Edit ETF Transaction", calls `updateEtfTransaction` instead of `addEtfTransaction`.
- **EtfTransactionForm.tsx:** Broker Account select dropdown from `brokerAccounts` store state.

### Safe Delete Cascade (D-09)

The `deleteEtfTransaction` action implements a safe cascade:
1. Find the transaction by id — guard if null
2. Optimistic removal from state
3. Persist updated array to Firestore
4. Recompute portfolio snapshot (revert units → recalculate PMC → restore cash balance)
5. Persist new snapshot

### PAC State Foundation

- Store fields: `pendingPacTransaction`, `lastPacGenerationDate`
- Store actions: `addPendingPacTransaction`, `confirmPacTransaction` (stub — fully wired in Plan 12-05), `dismissPacTransaction`

### Settings Persistence

- BrokerSettingsModal supports full CRUD without affecting historical snapshots or other data.
- Multi-broker settings save independently per broker account.

## Files

- **Modified:** `HoldingsTable.tsx`, `EtfTransactionModal.tsx`, `EtfTransactionForm.tsx`, `useInvestmentStore.ts`, `InvestmentPage.tsx`, `en.json`, `it.json`

## Related

- [[wiki/features/investment-tracking/investment-tracking]]
- [[wiki/features/multi-broker-architecture/multi-broker-architecture]]
- [[wiki/features/pac-automation/pac-automation]]
- [[wiki/plans/investment-tracking-v2-enhancements]]
- GitHub: [#90](https://github.com/AlexDevsTheWeb/myfinance/issues/90)
- Source: [raw/12-investment-tracking-v2/implementation.md](raw/12-investment-tracking-v2/implementation.md)
