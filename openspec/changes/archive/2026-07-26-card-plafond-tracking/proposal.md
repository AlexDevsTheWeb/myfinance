## Why

MyFinance users who have credit cards want to track monthly spending per card against their plafond (credit limit). Currently there is no way to associate transactions with a specific card or see utilization. This feature adds card management per account, transaction-level card tagging, and a dashboard widget showing spent/available per card.

## What Changes

- New `ICard` entity (`id`, `name`, `type`, `plafond`, `billingDay`, `accountId`) stored in Firestore user doc
- Optional `cardId` field on `ITransaction` (expenses only)
- Settings UI: card management nested under each account in the Accounts tab with Add/Edit dialog
- Transaction form: card dropdown shown when the selected account has cards (expenses only)
- Dashboard: card utilization widget showing plafond, spent, available, progress bar per card
- Transactions page: card filter dropdown + sort toggle buttons (Date/Amount with asc/desc toggle)

## Capabilities

### New Capabilities
- `card-plafond-tracking`: Per-card monthly plafond tracking with configurable cards per account, card indication on transactions, dashboard utilization display, and card filter on transactions page

### Modified Capabilities
*(none — requirements are new)*

## Impact

- `src/store/types/finance.types.ts` — `ICard` interface + `cardId` on `ITransaction`
- `src/store/types/index.ts` — export `ICard`
- `src/store/useFinanceStore.ts` — cards CRUD actions + state
- `src/lib/converters.ts` — cards in UserDoc, `cardId` in TransactionDoc
- `src/store/sanitization/transaction.ts` — `cardId` sanitized
- `src/store/backup/index.ts` — cards in backup payload
- `src/store/sync/index.ts` — cards in default config
- `src/pages/ConfigPage.tsx` — card management UI in Accounts tab
- `src/components/forms/TransactionForm.tsx` — card dropdown on transaction form
- `src/components/modals/TransactionModal.tsx` — `cardId` init + submit
- `src/components/dashboard/RecapCards.tsx` — card utilization widget
- `src/pages/DashboardPage.tsx` — layout: RecapCards + charts grid
- `src/pages/TransactionsPage.tsx` — card filter + sort toggle buttons

## Non-goals

- NOT adding balance impact for cards (purely categorization)
- NOT adding deferred payment logic (credit card full balance, no installments)
- NOT tracking income/refund card usage (deferred to future iteration)
