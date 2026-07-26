# Card Plafond Tracking

## ADDED Requirements

### Requirement: Card entity
The system SHALL allow users to define cards per account with name, type, plafond, and billing day.

#### Scenario: Create a card
- **WHEN** user opens Add Card dialog in ConfigPage > Accounts tab
- **WHEN** user enters name, selects type (credit/debit), sets plafond amount, sets billing day (1-28)
- **THEN** a new `ICard` object is created with a unique `id` and the given `accountId`
- **THEN** the card is persisted in the Firestore user document `cards` array

#### Scenario: Edit a card
- **WHEN** user opens Edit Card dialog for an existing card
- **WHEN** user modifies any field
- **THEN** the card is updated in the store and Firestore

#### Scenario: Delete a card
- **WHEN** user deletes a card
- **THEN** the card is removed from the `cards` array
- **THEN** existing transactions with that `cardId` retain their value (no cascade)

### Requirement: Card tagging on expenses
The system SHALL allow users to associate an expense transaction with a card.

#### Scenario: Card dropdown appears for expenses
- **WHEN** transaction type is "expense" AND the selected account has cards
- **THEN** the transaction form shows a card dropdown with all cards for that account

#### Scenario: Card dropdown hidden for income
- **WHEN** transaction type is "income" or "refund"
- **THEN** no card dropdown appears

#### Scenario: Transaction saved with cardId
- **WHEN** user selects a card and saves the expense
- **THEN** `cardId` is persisted on the transaction document

### Requirement: Card utilization on dashboard
The system SHALL display per-card utilization with plafond, spent, available, and progress bar.

#### Scenario: Utilization widget shows card data
- **WHEN** user views the dashboard
- **THEN** each card with transactions in the current billing period shows plafond, spent amount, available amount, and a progress bar
- **THEN** cards with no transactions show 0 spent, full plafond available

#### Scenario: Billing period computation
- **WHEN** computing utilization for a card with `billingDay: 15`
- **THEN** the current period is from month `M-1` day 15 to month `M` day 14
- **WHEN** `billingDay: 1`
- **THEN** the current period is the calendar month

### Requirement: Card filter on transactions
The system SHALL allow filtering transactions by card on the transactions page.

#### Scenario: Filter by specific card
- **WHEN** user selects a specific card from the card filter dropdown
- **THEN** only transactions with that `cardId` are shown

#### Scenario: Filter "Without card"
- **WHEN** user selects "Without card" from the dropdown
- **THEN** only transactions without a `cardId` are shown

#### Scenario: Filter "All cards"
- **WHEN** user selects "All cards"
- **THEN** no card-based filtering is applied

### Requirement: Sort toggle buttons
The system SHALL provide toggle sort buttons for Date and Amount in the filter header.

#### Scenario: Sort by date descending (default)
- **WHEN** user clicks "Date" button
- **WHEN** no sort is active or a different field is active
- **THEN** transactions sort by date descending

#### Scenario: Toggle date direction
- **WHEN** user clicks "Date" button while already sorting by date
- **THEN** direction toggles between descending and ascending, icon updates accordingly
