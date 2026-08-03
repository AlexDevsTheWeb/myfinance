---
type: Feature
title: "Card Plafond Tracking"
description: "Track spending per card with monthly plafond limits, configurable per account in settings, with dashboard utilization display."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/165"
tags: [feature, frontend, implemented]
created: 2026-07-26
updated: 2026-07-26
status: implemented
sources: ["raw/165-card-plafond-tracking/165-card-plafond-tracking.md"]
related: []
---

# Feature: Card Plafond Tracking

Status: implemented
Priority: medium

## Description

Add the ability to configure cards (credit/debit) per account with a monthly plafond, mark transactions with the card used, and display card utilization on the dashboard. Purely a spending categorization feature — no balance impact.

## Requirements

- New `ICard` entity: `id`, `name`, `type` (credit/debit), `plafond`, `billingDay`, `accountId`
- Add optional `cardId` field to `ITransaction` (expenses only)
- Settings UI: card management nested under each account in the Accounts tab
- Transaction form: card dropdown when the selected account has cards
- Dashboard: card utilization widget with plafond/spent/available/progress bar
- Plafond computed as `SUM(expenses with cardId === X)` in the current billing period
- Data stored in Firestore user document as a `cards` array

## Implementation Notes

- Cards do not affect account balance computation
- Billing day configurable per card (default: 1, i.e. calendar month)
- Income/refund card tracking deferred to future iteration
- Debit and credit cards treated identically — no deferred payment logic
- Backup/export must include cards data
- Migration: existing docs without `cards` field get empty array

## Implementation Details

### Data Layer
- `ICard` interface in `src/store/types/finance.types.ts`: `id`, `name`, `type`, `plafond`, `billingDay`, `accountId`
- `cardId?: string` added to `ITransaction`
- Cards stored as `cards` array in Firestore `UserDoc` via `src/lib/converters.ts`
- `cardId` included in `TransactionDoc` converter and `src/store/sanitization/transaction.ts`

### Store Actions
- `setCards`, `addCard`, `updateCard`, `deleteCard` in `src/store/useFinanceStore.ts`
- Cards included in sync default config (`src/store/sync/index.ts`) and backup/restore payload (`src/store/backup/index.ts`)

### UI
- **ConfigPage** (`src/pages/ConfigPage.tsx`): card management nested inside each account in Accounts tab with Add/Edit dialog
- **TransactionForm** (`src/components/forms/TransactionForm.tsx`): card dropdown shown only for expense type when selected account has cards
- **TransactionModal** (`src/components/modals/TransactionModal.tsx`): `cardId` initialized from transaction and passed on submit
- **Dashboard** (`src/components/dashboard/RecapCards.tsx`): card utilization widget per card — plafond, spent, available, progress bar
- **TransactionsPage** (`src/pages/TransactionsPage.tsx`): card filter dropdown ("All cards", "Without card", per-card) + sort toggle buttons (Date/Amount with asc/desc toggle)

### Sort Toggle
Sort controls replaced 4 separate asc/desc buttons with 2 toggle buttons (Date, Amount). Each toggles ascending/descending on click, changing icon accordingly. Positioned inline with the Clear button in the filter header.

## Files Changed

| File | Change |
|------|--------|
| `src/store/types/finance.types.ts` | Added `ICard` interface, `cardId` on `ITransaction` |
| `src/store/types/index.ts` | Export `ICard` |
| `src/store/useFinanceStore.ts` | Cards CRUD actions + state |
| `src/pages/ConfigPage.tsx` | Card management in Accounts tab |
| `src/components/forms/TransactionForm.tsx` | Card dropdown on transaction form |
| `src/components/modals/TransactionModal.tsx` | `cardId` init + submit |
| `src/components/dashboard/RecapCards.tsx` | Card utilization widget |
| `src/pages/DashboardPage.tsx` | Layout: RecapCards + charts grid |
| `src/pages/TransactionsPage.tsx` | Card filter + sort toggle buttons |
| `src/lib/converters.ts` | Cards in UserDoc, `cardId` in TransactionDoc |
| `src/store/sanitization/transaction.ts` | `cardId` sanitized |
| `src/store/backup/index.ts` | Cards in backup payload |
| `src/store/sync/index.ts` | Cards in default config |

## Related

- [[wiki/bugs/card-counter-zero]] — spent counter stuck at €0 due to billing-period boundary bug
- [[wiki/features/recurring-card-selection/recurring-card-selection]]
- Source: [raw/165-card-plafond-tracking/165-card-plafond-tracking.md](raw/165-card-plafond-tracking/165-card-plafond-tracking.md)
