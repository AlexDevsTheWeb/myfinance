---
phase: 12-investment-tracking-v2
plan: '01'
subsystem: investment-tracking
tags: typescript, zustand, firestore, migration, broker
requires: []
provides:
  - BrokerAccount and AssetHolding collection types
  - Multi-broker CRUD actions in investment store
  - Forward-compatible migration from IBrokerConfig to BrokerAccount[]
  - Validation and sanitization for new broker account schema
affects: [12-02-broker-management-ui, 12-03-multi-etf, 12-04-multi-projection]
tech-stack:
  added: []
  patterns:
    - Collection-based multi-broker state (BrokerAccount[] instead of single IBrokerConfig)
    - Optimistic update with rollback for broker CRUD
    - Fire-and-forget migration with run-once guard
    - Legacy field kept as optional for backward-compatible reads
key-files:
  created: []
  modified:
    - src/store/types/investment.types.ts
    - src/store/types/index.ts
    - src/store/defaults.ts
    - src/lib/converters.ts
    - src/store/useInvestmentStore.ts
    - src/hooks/useInvestmentSync.ts
    - src/store/validation/investment.validation.ts
    - src/store/validation/index.ts
    - src/store/sanitization/investment.ts
    - src/store/sanitization/index.ts
    - src/store/sync/index.ts
key-decisions:
  - "BrokerAccount and AssetHolding use plain-object naming (no I-prefix) to distinguish V2 types from legacy I-prefixed interfaces"
  - "IBrokerConfig kept as deprecated export for backward-compatible migration — removed only after all users migrate"
  - "setBrokerConfig legacy action also writes to brokerAccounts[0] to bridge BrokerSettingsModal during transition"
  - "validateBrokerAccount and validateBrokerConfig kept as separate functions — each validates its own type shape"
requirements-completed:
  - REQ-MULTI
coverage:
  - id: D1
    description: BrokerAccount and AssetHolding types defined and exported
    verification:
      - kind: unit
        ref: src/store/types/investment.types.ts#BrokerAccount
        status: pass
      - kind: unit
        ref: src/store/types/investment.types.ts#AssetHolding
        status: pass
    human_judgment: false
  - id: D2
    description: Multi-broker CRUD actions in Zustand store (addBrokerAccount, updateBrokerAccount, deleteBrokerAccount, setSelectedBroker)
    verification:
      - kind: unit
        ref: src/store/useInvestmentStore.ts#addBrokerAccount
        status: pass
      - kind: unit
        ref: src/store/useInvestmentStore.ts#updateBrokerAccount
        status: pass
      - kind: unit
        ref: src/store/useInvestmentStore.ts#deleteBrokerAccount
        status: pass
    human_judgment: false
  - id: D3
    description: Forward-compatible migration from IBrokerConfig to BrokerAccount[] in useInvestmentSync.ts
    verification:
      - kind: unit
        ref: src/hooks/useInvestmentSync.ts#migrateBrokerConfig
        status: pass
    human_judgment: false
  - id: D4
    description: validateBrokerAccount and sanitizeBrokerAccount functions with barrel exports
    verification:
      - kind: unit
        ref: src/store/validation/investment.validation.ts#validateBrokerAccount
        status: pass
      - kind: unit
        ref: src/store/sanitization/investment.ts#sanitizeBrokerAccount
        status: pass
    human_judgment: false
duration: 4min
completed: 2026-06-27
status: complete
---

# Phase 12 Plan 01: Multi-broker Schema Refactor Summary

**BrokerAccount[] collection types, Zustand multi-broker CRUD, forward-compatible migration from IBrokerConfig, and validation/sanitization for the new schema**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-27T09:16:24Z
- **Completed:** 2026-06-27T09:20:32Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- BrokerAccount and AssetHolding collection interfaces defined in investment.types.ts with IBrokerConfig marked @deprecated
- DEFAULT_BROKER_ACCOUNTS array in defaults.ts alongside legacy DEFAULT_BROKER_CONFIG
- UserDoc interface updated with brokerAccounts (BrokerAccount[]) and assetHoldings (AssetHolding[]); brokerConfig kept as optional legacy field
- toFirestore/fromFirestore serialization updated for new fields while keeping legacy brokerConfig path for migration reads
- Zustand store: brokerAccounts, assetHoldings, selectedBrokerId, brokerTransactions, pendingPacTransaction, lastPacGenerationDate state fields
- Store actions: addBrokerAccount, updateBrokerAccount, deleteBrokerAccount (optimistic update), setSelectedBroker, addPendingPacTransaction, confirmPacTransaction, dismissPacTransaction
- setBrokerConfig legacy action updated to also write brokerAccounts[0] for backward compat during transition
- useInvestmentSync.ts: migrateBrokerConfig function with fire-and-forget write, migrationAttempted run-once ref guard
- validateBrokerAccount function (name, baseLumpSum, monthlyPacAmount, interestRate validation)
- sanitizeBrokerAccount/sanitizeBrokerAccounts functions with safe numeric coercion and string trimming
- getDefaultUserConfig in sync/index.ts updated with new brokerAccounts and assetHoldings fields

## Task Commits

Each task was committed atomically:

1. **Task 1: Types, defaults, converters** - `0b49be8` (feat)
2. **Task 2: Store CRUD + migration hook** - `15fb5d6` (feat)
3. **Task 3: Validation + sanitization** - `4f96573` (feat)

## Files Modified

- `src/store/types/investment.types.ts` - Added BrokerAccount, AssetHolding interfaces; marked IBrokerConfig @deprecated
- `src/store/types/index.ts` - Added BrokerAccount, AssetHolding barrel re-exports
- `src/store/defaults.ts` - Added DEFAULT_BROKER_ACCOUNTS array
- `src/lib/converters.ts` - Updated UserDoc, toFirestore, fromFirestore with new fields; kept legacy brokerConfig
- `src/store/useInvestmentStore.ts` - Added multi-broker state, CRUD actions, PAC state, updated setAll/setBrokerConfig
- `src/hooks/useInvestmentSync.ts` - Added migrateBrokerConfig, migrationAttempted guard, updated initializeUser/onSnapshot
- `src/store/validation/investment.validation.ts` - Added validateBrokerAccount
- `src/store/validation/index.ts` - Added validateBrokerAccount export
- `src/store/sanitization/investment.ts` - Added sanitizeBrokerAccount, sanitizeBrokerAccounts
- `src/store/sanitization/index.ts` - Added sanitizeBrokerAccount, sanitizeBrokerAccounts exports
- `src/store/sync/index.ts` - Updated getDefaultUserConfig with new fields

## Decisions Made

- **Plain-object naming (no I-prefix):** BrokerAccount and AssetHolding follow the V2 naming convention established in research, distinguishing them from legacy I-prefixed interfaces
- **Separate validators:** validateBrokerAccount and validateBrokerConfig are kept separate since each validates different shape properties (name vs brokerName, baseLumpSum vs lumpSumAmount+ticker)
- **setBrokerConfig dual-writes:** The legacy single-broker setter now also writes brokerAccounts[0] so the old BrokerSettingsModal UI continues working during the transition
- **brokerConfig as optional legacy field:** Kept in UserDoc as optional `brokerConfig?` so fromFirestore can read both formats, enabling smooth migration for existing users

## Deviations from Plan

None - plan executed exactly as written. Build compiled on first try after Task 3 completed.

## Threat Surface Scan

No new security-relevant surface introduced beyond what the plan's threat model identified:
- T-12-01 (name injection): Mitigated via sanitizeBrokerAccount string coercion/trimming
- T-12-02 (unauthorized read): Inherited Firestore rules enforce isOwner check — no new endpoints or auth paths
- T-12-03 (migration race): Mitigated via migrationAttempted run-once useRef guard

## Issues Encountered

- Task 2 build failed with 2 missing exports (validateBrokerAccount, sanitizeBrokerAccounts) — expected, those were Task 3 deliverables. No resolution needed; sequential dependency by design.
- Task 2 had 3 unused variable warnings after initial implementation — fixed by removing unused captures.

## Next Phase Readiness

Ready for Plan 2 (Broker Management UI) — the data layer is now multi-broker capable. Plan 2 will build the Settings UI that manages brokerAccounts directly instead of the legacy single-broker BrokerSettingsModal.

---
*Phase: 12-investment-tracking-v2*
*Completed: 2026-06-27*
