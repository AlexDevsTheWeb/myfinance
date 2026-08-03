---
type: Feature
title: "Card Selection for Recurring Expenses"
description: "Allow recurring expense templates to be assigned a card (None / credit / debit) so generated transactions count toward card plafond utilization."
tags: [feature, frontend, planned]
created: 2026-08-03
updated: 2026-08-03
status: planned
sources: ["raw/recurring-card-selection/recurring-card-selection.md"]
related: ["wiki/features/card-plafond-tracking/card-plafond-tracking.md"]
---

# Feature: Card Selection for Recurring Expenses

Status: planned
Priority: medium

## Description

Extends Card Plafond Tracking (#165) to recurring expenses. Recurring templates gain an optional `cardId`; the recurring expense dialog shows the same card dropdown as one-off expenses (None / account's cards), and `checkRecurring()` copies the template's card onto every generated transaction so recurring subscriptions appear in card utilization and the card filter.

## Requirements

- Add optional `cardId?: string` to `IRecurringTransaction` (existing templates default to "None", no migration)
- Show the card dropdown in the recurring expense dialog
- Persist `cardId` on the template (converters + sanitization)
- `checkRecurring()` propagates the template's `cardId` to generated expense transactions
- ConfigPage recurring list shows the card name when set
- **Scope:** card changes affect future generations only — no backfill of already-generated transactions

## Implementation Notes

- Reuses the existing `TransactionForm` card dropdown — just remove the `!isRecurring` gate for expenses
- Cards are pure metadata (no balance impact), consistent with #165
- No migration needed; `cardId` is optional everywhere
- Downstream consumers (dashboard utilization, Transactions card filter, backup) pick up generated transactions automatically

## Related

- [[wiki/features/card-plafond-tracking/card-plafond-tracking]]
- Source: [raw/recurring-card-selection/recurring-card-selection.md](raw/recurring-card-selection/recurring-card-selection.md)
