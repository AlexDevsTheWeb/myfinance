## 1. Data Layer

- [x] 1.1 Add `ICard` interface to `src/store/types/finance.types.ts` with `id`, `name`, `type`, `plafond`, `billingDay`, `accountId`
- [x] 1.2 Add `cardId?: string` to `ITransaction`
- [x] 1.3 Export `ICard` from `src/store/types/index.ts`
- [x] 1.4 Add cards CRUD actions to `src/store/useFinanceStore.ts` (`setCards`, `addCard`, `updateCard`, `deleteCard`)
- [x] 1.5 Add `cardId` to sanitization in `src/store/sanitization/transaction.ts`
- [x] 1.6 Add cards to `UserDoc` converter and `cardId` to `TransactionDoc` converter in `src/lib/converters.ts`
- [x] 1.7 Add cards to sync default config in `src/store/sync/index.ts`
- [x] 1.8 Add cards to backup/restore payload in `src/store/backup/index.ts`

## 2. Settings UI

- [x] 2.1 Add card management section per account in ConfigPage > Accounts tab
- [x] 2.2 Create Add/Edit card dialog with name, type, plafond, billing day fields

## 3. Transaction Form

- [x] 3.1 Add card dropdown to TransactionForm, shown only for expense type and when selected account has cards
- [x] 3.2 Initialize `cardId` in TransactionModal from existing transaction data
- [x] 3.3 Pass `cardId` on form submit

## 4. Dashboard

- [x] 4.1 Compute card utilization (plafond/spent/available/progress) per card for current billing period
- [x] 4.2 Add card utilization widget to RecapCards as right column grid item (`md=4`)
- [x] 4.3 Adjust stat cards to left column (`md=8`)

## 5. Transactions Page

- [x] 5.1 Add card filter dropdown with "All cards", "Without card", and per-card options
- [x] 5.2 Replace 4 sort buttons with 2 toggle buttons (Date, Amount) in filter header alongside Clear button
