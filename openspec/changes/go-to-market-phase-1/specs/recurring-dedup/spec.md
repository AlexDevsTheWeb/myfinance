## ADDED Requirements

### Requirement: Firestore-side dedup for recurring transactions
The system SHALL use a `lastGeneratedUpTo` field on each recurring transaction template to prevent duplicate generation across concurrent checks.

#### Scenario: Dedup prevents duplicate generation
- **WHEN** `checkRecurring` runs and a recurring template's `lastGeneratedUpTo` is greater than or equal to the current month
- **THEN** no new transactions are generated for that template

#### Scenario: Dedup advances after generation
- **WHEN** `checkRecurring` generates new transactions from a recurring template
- **THEN** the template's `lastGeneratedUpTo` is updated to the latest generated month in the same Firestore write

### Requirement: Session-level debounce
The system SHALL limit `checkRecurring` to run at most once per session to prevent redundant checks across re-renders and snapshot events.

#### Scenario: Debounce prevents re-check in same session
- **WHEN** `checkRecurring` completes successfully
- **THEN** a session-level ref flag prevents it from running again for the remainder of the user's session

### Requirement: Timestamp-based cooldown
The system SHALL enforce a minimum time interval between `checkRecurring` calls using a timestamp guard in the store.

#### Scenario: Cooldown skips rapid calls
- **WHEN** `checkRecurring` is called less than 5 seconds after its last completion
- **THEN** the call is skipped and no recurring transactions are generated

### Requirement: lastGeneratedUpTo field on recurring template
The `IRecurringTransaction` type SHALL include an optional `lastGeneratedUpTo: string` field storing the last month/year for which transactions were generated.

#### Scenario: Field present on new recurring transactions
- **WHEN** a new recurring transaction template is created
- **THEN** it includes `lastGeneratedUpTo` initialized to the start date month
