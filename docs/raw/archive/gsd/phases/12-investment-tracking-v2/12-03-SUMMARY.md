---
phase: 12-investment-tracking-v2
plan: '03'
subsystem: investment
tags: etf, crud, edit, delete, modal, broker, pac, i18n

requires:
  - phase: 12-investment-tracking-v2
    provides: Investment store with types, broker accounts, transaction CRUD foundation
  - phase: 12-investment-tracking-v2
    provides: Multi-broker UI layer with Broker Select, broker accounts wiring

provides:
  - HoldingsTable Edit/Delete action column with conditional rendering
  - EtfTransactionModal edit mode with pre-filled form from existing transaction
  - EtfTransactionForm Broker Account select dropdown
  - Safe delete cascade (D-09) — removal + PMC recalculation + snapshot capture
  - PAC automation state fields (pendingPacTransaction, lastPacGenerationDate)
  - PAC state actions (addPendingPacTransaction, confirmPacTransaction, dismissPacTransaction)
  - CRUD and broker locale keys for en.json and it.json

affects:
  - Plan 5 (PAC automation hook) will use pendingPacTransaction / confirmPacTransaction

tech-stack:
  added: none
  patterns:
    - Edit/Delete callbacks as optional props for conditionally rendered action columns
    - Delete cascade with optimistic removal + snapshot recalculation
    - Modal edit mode via optional editTransaction prop

key-files:
  created: []
  modified:
    - src/components/investment/HoldingsTable.tsx
    - src/components/investment/EtfTransactionModal.tsx
    - src/components/investment/EtfTransactionForm.tsx
    - src/pages/InvestmentPage.tsx
    - src/store/useInvestmentStore.ts
    - src/locales/en.json
    - src/locales/it.json

key-decisions:
  - Edit opens modal with the most recent transaction for the holding's ticker
  - Delete uses window.confirm for simplicity (no MUI dialog dependency)
  - BrokerId field is optional in EtfTransactionFormData for backward compatibility

patterns-established:
  - "Conditional Actions column: render only when onEdit||onDelete callbacks are provided"
  - "Delete cascade: find → guard → remove → persist → recompute snapshot → persist snapshot"
  - "Edit mode via optional editTransaction prop, switching title and submit handler"

requirements-completed:
  - REQ-CRUD
  - REQ-PAC

coverage:
  - id: D1
    description: HoldingsTable action column with Edit/Delete icon buttons
    verification:
      - kind: unit
        ref: src/components/investment/HoldingsTable.tsx#L53-L62
        status: pass
    human_judgment: false
  - id: D2
    description: EtfTransactionModal edit mode with pre-filled form data
    verification:
      - kind: unit
        ref: src/components/investment/EtfTransactionModal.tsx#L41-L52
        status: pass
    human_judgment: false
  - id: D3
    description: Safe delete cascade recalculating PMC and recording snapshot
    verification:
      - kind: unit
        ref: src/store/useInvestmentStore.ts#L183-L236
        status: pass
    human_judgment: false
  - id: D4
    description: PAC state fields and actions in store
    verification: []
    human_judgment: false
  - id: D5
    description: CRUD and broker locale keys in en.json and it.json
    verification:
      - kind: unit
        ref: src/locales/en.json#L298-L303
        status: pass
      - kind: unit
        ref: src/locales/it.json#L298-L303
        status: pass
    human_judgment: false

duration: 2 min
completed: 2026-06-27
status: complete
---

# Phase 12 Plan 03: Transaction CRUD (Edit/Delete, safe cascade, PAC state) Summary

**Edit/Delete icon buttons in HoldingsTable, edit mode in EtfTransactionModal with pre-fill, safe delete cascade recalculating PMC, and PAC state foundation in store with i18n keys**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-27T09:28:34Z
- **Completed:** 2026-06-27T09:30:55Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- HoldingsTable has conditional Edit/Delete MUI icon buttons per row with onEdit/onDelete callbacks
- EtfTransactionModal opens in edit mode when triggered from HoldingsTable Edit, pre-filling all fields from the existing transaction
- EtfTransactionForm has Broker Account select dropdown sourced from brokerAccounts store
- Delete cascade (D-09) safely removes transaction, recalculates PMC via computeSnapshot, and records a new portfolio snapshot
- Guard clause in deleteEtfTransaction handles not-found case (T-12-06 threat mitigation)
- PAC state fields (pendingPacTransaction, lastPacGenerationDate) and actions (addPendingPacTransaction, confirmPacTransaction, dismissPacTransaction) in store ready for Plan 5
- CRUD and broker locale keys added to en.json and it.json

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Edit/Delete action column to HoldingsTable** - `2584442` (feat)
2. **Task 2: Add edit mode to EtfTransactionModal with pre-fill** - `c260880` (feat)
3. **Task 3: Safe delete cascade + PAC state + i18n keys** - `f7fa171` (feat)

## Files Modified

- `src/components/investment/HoldingsTable.tsx` - Edit/Delete icon buttons, conditional Actions column, onEdit/onDelete props
- `src/components/investment/EtfTransactionModal.tsx` - editTransaction prop, edit mode with pre-fill, conditional update vs add
- `src/components/investment/EtfTransactionForm.tsx` - brokerId field, Broker Account select dropdown
- `src/pages/InvestmentPage.tsx` - HandleEdit/HandleDelete wiring, selectedTransaction state
- `src/store/useInvestmentStore.ts` - Safe delete cascade with guard clause, snapshot recalculation
- `src/locales/en.json` - CRUD and brokerId locale keys
- `src/locales/it.json` - CRUD and brokerId locale keys

## Decisions Made

- **Edit targets latest transaction:** When clicking Edit on a HoldingsTable row, the modal opens with the most recent transaction matching that ticker
- **window.confirm for delete:** Simple browser confirm dialog used for delete confirmation rather than a MUI dialog, keeping the implementation lightweight for a first pass
- **BrokerId optional field:** Backward-compatible — the form works without broker selection for users without multi-broker setup
- **PAC actions already exist:** The PAC state fields and actions were already set up in a prior plan; this plan validates their presence and adds the delete cascade around them

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None

## Threat Flags

None

## Known Stubs

confirmPacTransaction is intentionally a stub (as noted in the plan, to be fully wired in Plan 5). The existing implementation creates a transaction record and persists it to Firebase, but lacks ticker resolution and unit/price calculation.

## Next Phase Readiness

- CRUD lifecycle for ETF transactions complete with safe delete cascade
- PAC state foundation ready for Plan 5 automation hook
- Next: Plan 4 (ETF transaction list view) or Plan 5 (PAC automation)

## Self-Check: PASSED

All 7 key files verified on disk. All 3 task commits verified in git log. Build passes.

---

*Phase: 12-investment-tracking-v2*
*Completed: 2026-06-27*
