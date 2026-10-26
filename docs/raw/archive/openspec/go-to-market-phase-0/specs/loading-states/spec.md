# Loading States

## ADDED Requirements

### Requirement: Sync hooks expose isLoading state
Finance sync, investment sync, and budget sync hooks SHALL expose an `isLoading` boolean that is `true` during initial data fetch and `false` after first successful snapshot.

#### Scenario: isLoading is true during initial sync
- **WHEN** the sync hook starts listening to Firestore
- **THEN** `isLoading` is `true`

#### Scenario: isLoading becomes false after first snapshot
- **WHEN** the first Firestore snapshot returns data (or empty set)
- **THEN** `isLoading` becomes `false`

### Requirement: DashboardPage shows loading indicator
The DashboardPage SHALL display a loading indicator while `isLoading` is `true`.

#### Scenario: Dashboard shows spinner while loading
- **WHEN** DashboardPage renders and finance data is still loading
- **THEN** a CircularProgress or Skeleton is displayed instead of empty/zero data

#### Scenario: Dashboard shows content when loaded
- **WHEN** DashboardPage renders and finance data has loaded
- **THEN** the normal dashboard content is displayed

### Requirement: TransactionsPage shows loading indicator
The TransactionsPage SHALL display a loading indicator while `isLoading` is `true`.

#### Scenario: Transactions shows spinner while loading
- **WHEN** TransactionsPage renders and finance data is still loading
- **THEN** a CircularProgress or Skeleton is displayed

#### Scenario: Transactions shows content when loaded
- **WHEN** TransactionsPage renders and finance data has loaded
- **THEN** the normal transactions content is displayed

### Requirement: InvestmentPage shows loading indicator
The InvestmentPage SHALL display a loading indicator while investment sync is loading.

#### Scenario: Investments shows spinner while loading
- **WHEN** InvestmentPage renders and investment data is still loading
- **THEN** a CircularProgress or Skeleton is displayed

#### Scenario: Investments shows content when loaded
- **WHEN** InvestmentPage renders and investment data has loaded
- **THEN** the normal investment content is displayed
