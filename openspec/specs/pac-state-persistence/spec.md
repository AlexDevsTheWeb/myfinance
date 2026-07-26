# pac-state-persistence Specification

## Purpose
TBD - created by archiving change go-to-market-phase-1. Update Purpose after archive.
## Requirements
### Requirement: PAC state persisted to Firestore
The system SHALL persist PAC automation state to the `pacState` field on the `users/{uid}` Firestore document instead of localStorage + Zustand memory.

#### Scenario: PAC state read from Firestore on mount
- **WHEN** `usePacAutomation` initializes
- **THEN** it reads `pacState` from the user's Firestore document instead of checking `localStorage` keys

#### Scenario: PAC generation date persisted
- **WHEN** PAC automation generates a pending transaction
- **THEN** `pacState.lastGenerationDate` is updated in Firestore with the current date

#### Scenario: PAC confirmation persists state
- **WHEN** user confirms a PAC transaction via `confirmPacTransaction`
- **THEN** `pacState.lastGenerationDate` and `pacState.perBrokerLastGeneration[brokerId]` are updated in Firestore

### Requirement: PAC state schema
The `pacState` field SHALL contain: `lastGenerationDate` (ISO string), `pendingTransaction` (optional `{ brokerId, amount, date, status }`), and `perBrokerLastGeneration` (Record of brokerId → last month key string).

#### Scenario: pacState structure validated
- **WHEN** `pacState` is written to Firestore
- **THEN** it conforms to the schema: `{ lastGenerationDate: string, pendingTransaction?: { brokerId: string, amount: number, date: string, status: 'pending' | 'confirmed' | 'executed' }, perBrokerLastGeneration: Record<string, string> }`

### Requirement: localStorage fallback removal
The system SHALL stop using localStorage keys (`pac_last_{brokerId}`) for PAC tracking after migration.

#### Scenario: No localStorage reads after migration
- **WHEN** `usePacAutomation` checks if a PAC was already generated for a broker/month
- **THEN** it reads from Firestore `pacState.perBrokerLastGeneration` instead of `localStorage`

### Requirement: One-time PAC state migration
A one-time migration SHALL read existing localStorage keys and write them into the Firestore `pacState` field.

#### Scenario: localStorage keys imported to Firestore
- **WHEN** the PAC state migration runs
- **THEN** all existing `pac_last_{brokerId}` localStorage entries are read and written to `pacState.perBrokerLastGeneration`

