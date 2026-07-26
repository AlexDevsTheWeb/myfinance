## ADDED Requirements

### Requirement: Transactions stored in sub-collection
The system SHALL store each transaction as an individual document in `users/{uid}/transactions/{txnId}` sub-collection instead of an array field on the user doc.

#### Scenario: New transaction written to sub-collection
- **WHEN** user creates a transaction via `addTransaction`
- **THEN** the transaction is written as a new document in `users/{uid}/transactions/{txnId}` with fields: `id`, `date`, `description`, `amount`, `type`, `accountId`, `categoryId`, `createdAt`

#### Scenario: Transaction updated in sub-collection
- **WHEN** user edits a transaction via `updateTransaction`
- **THEN** only that transaction document is updated in the sub-collection (no full-array rewrite)

#### Scenario: Transaction deleted from sub-collection
- **WHEN** user deletes a transaction via `deleteTransaction`
- **THEN** only that transaction document is deleted from the sub-collection

### Requirement: Dual-write migration path
The system SHALL support a phased migration: Phase A (dual-write to array + sub-collection), Phase B (backfill existing transactions), Phase C (read from sub-collection), Phase D (remove legacy array field).

#### Scenario: Dual-write during Phase A
- **WHEN** a transaction is created, updated, or deleted
- **THEN** the change is applied to BOTH the legacy `transactions` array AND the `transactions` sub-collection

#### Scenario: Backfill script copies existing transactions
- **WHEN** the one-time backfill script runs
- **THEN** all transactions in the `users/{uid}` doc's `transactions` array are copied to `users/{uid}/transactions/{txnId}` sub-collection

#### Scenario: Sub-collection read after flip
- **WHEN** `useSyncFinance` listener fires after Phase C
- **THEN** it reads from `onSnapshot` on `users/{uid}/transactions` sub-collection instead of the legacy array field

#### Scenario: Legacy field removal
- **WHEN** all users have been migrated and confirmed
- **THEN** the `transactions` field is removed from the `UserDoc` interface and Firestore doc

### Requirement: Firestore rules for sub-collection
The system SHALL have Firestore security rules that allow authenticated users to read/write only their own transaction documents.

#### Scenario: Authenticated user reads own transaction
- **WHEN** an authenticated user queries `users/{uid}/transactions/{txnId}`
- **THEN** the read is allowed if `request.auth.uid == uid`

#### Scenario: Unauthenticated read denied
- **WHEN** an unauthenticated client attempts to read a transaction document
- **THEN** the read is denied

### Requirement: Backward compatibility during migration
During Phase A-B, existing code that reads from the `transactions` array field SHALL continue to work without modification.

#### Scenario: Legacy reader works during dual-write
- **WHEN** any component reads `useFinanceStore.transactions` during Phase A
- **THEN** the array contains the correct, up-to-date transaction data
