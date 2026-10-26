---
phase: 12-investment-tracking-v2
plan: '04'
subsystem: api
tags: firestore, firestore-rules, subcollection, snapshots, portfolio
requires:
  - phase: 12-03
    provides: ETF transaction CRUD operations and store actions
provides:
  - Persistent historical portfolio snapshots in /users/{uid}/portfolio_history/ subcollection
  - Daily-debounced snapshot writes triggered after ETF transactions
  - Firestore security rules for subcollection access control
affects: []
tech-stack:
  added: []
  patterns:
    - Firestore subcollection writes for structured historical data
    - Fire-and-forget async triggers from Zustand store actions
    - Daily debounce via collection query with date filter
key-files:
  created:
    - src/hooks/useHistoricalSnapshots.ts
  modified:
    - firestore.rules
    - src/store/useInvestmentStore.ts
    - src/locales/en.json
    - src/locales/it.json
key-decisions:
  - "Fire-and-forget strategy: subcollection write is non-blocking, main transaction commit is independent"
  - "Dual-write approach: existing portfolioSnapshots array continues to be written alongside new subcollection"
  - "Daily debounce prevents duplicate snapshots from rapid transactions on same date"
requirements-completed:
  - REQ-SNAP
coverage:
  - id: D1
    description: "useHistoricalSnapshots hook with recordPortfolioSnapshot function that writes HistorySnapshot documents to /users/{uid}/portfolio_history/ subcollection"
    requirement: REQ-SNAP
    verification:
      - kind: unit
        ref: src/hooks/useHistoricalSnapshots.ts#recordPortfolioSnapshot export exists
        status: pass
    human_judgment: false
  - id: D2
    description: "Daily debounce check prevents duplicate snapshots (queries for existing today's date before writing)"
    requirement: REQ-SNAP
    verification:
      - kind: unit
        ref: src/hooks/useHistoricalSnapshots.ts#daily debounce query with where('date', '==', today) and limit(1)
        status: pass
    human_judgment: false
  - id: D3
    description: "Firestore rules allow portfolio_history subcollection writes only for document owner (isOwner check)"
    requirement: REQ-SNAP
    verification:
      - kind: unit
        ref: firestore.rules#portfolio_history/{snapshotId} match block with isOwner(userId)
        status: pass
    human_judgment: false
  - id: D4
    description: "addEtfTransaction and deleteEtfTransaction trigger subcollection write fire-and-forget after transaction persists"
    requirement: REQ-SNAP
    verification:
      - kind: unit
        ref: src/store/useInvestmentStore.ts#2 fire-and-forget calls to recordPortfolioSnapshot
        status: pass
    human_judgment: false
  - id: D5
    description: "Locale keys for snapshot feature added to en.json and it.json"
    requirement: REQ-SNAP
    verification:
      - kind: unit
        ref: src/locales/en.json#snapshotRecorded, snapshotError, portfolioHistory
        status: pass
    human_judgment: false
duration: 1min
completed: 2026-06-27
status: complete
---

# Phase 12 Plan 04: Historical Snapshots Subcollection Summary

**Persistent portfolio history snapshots written to Firestore subcollection with daily debounce, Firestore rules, and store action triggers**

## Performance

- **Duration:** 1 min
- **Started:** 2026-06-27T09:37:22Z
- **Completed:** 2026-06-27T09:39:10Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Created `useHistoricalSnapshots.ts` hook with `recordPortfolioSnapshot` function that writes `HistorySnapshot` documents to `/users/{uid}/portfolio_history/` subcollection
- Implemented daily debounce check (queries for existing today's snapshot before writing)
- Added Firestore security rule for `portfolio_history` subcollection with `isOwner(userId)` guard
- Modified `addEtfTransaction` to trigger fire-and-forget subcollection snapshot write after successful transaction
- Modified `deleteEtfTransaction` to trigger fire-and-forget subcollection snapshot write after deletion
- Added locale keys for snapshot feature in both English and Italian

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useHistoricalSnapshots hook** - `242e1d0` (feat)
2. **Task 2: Add Firestore rules and store triggers** - `8e14e86` (feat)
3. **Task 3: Add locale keys** - `7d005d4` (feat)

## Files Created/Modified

- `src/hooks/useHistoricalSnapshots.ts` - NEW: Hook with `recordPortfolioSnapshot` function, `HistorySnapshot` interface, daily debounce, and subcollection write logic
- `firestore.rules` - MODIFIED: Added `match /portfolio_history/{snapshotId}` block with `isOwner` rule
- `src/store/useInvestmentStore.ts` - MODIFIED: Added `recordPortfolioSnapshot` import and fire-and-forget calls in `addEtfTransaction` and `deleteEtfTransaction`
- `src/locales/en.json` - MODIFIED: Added `snapshotRecorded`, `snapshotError`, `portfolioHistory` keys
- `src/locales/it.json` - MODIFIED: Added Italian translations for snapshot keys

## Decisions Made

- **Fire-and-forget strategy:** The subcollection write is non-blocking — if it fails, the main transaction is already committed. Failures are logged to console. This follows the threat model's accepted risk (T-12-09).
- **Dual-write approach:** The existing `portfolioSnapshots` array continues to be written alongside the new subcollection. This ensures backward compatibility during the transition period.
- **Daily debounce:** A check for existing today's snapshot prevents duplicate writes from rapid transactions, mitigating DoS risk (T-12-10).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Two TypeScript compilation issues during Task 1:
- Unused `IInvestmentHolding` import (HistorySnapshot uses inline holdings type, not `IInvestmentHolding`)
- Unused `etfTransactions` variable (second `getState()` call aliases as `txs`)
Both fixed inline during build verification.

## Known Stubs

None.

## Threat Flags

None. The threat model (T-12-08 through T-12-10) was followed: Firestore rules enforce `isOwner`, fire-and-forget logging is in place, and daily debounce caps writes.

## Next Phase Readiness

- Ready for Plan 05: Subcollection read integration for portfolio chart data
- The subcollection write path is fully operational; existing chart functionality remains unchanged

---

*Phase: 12-investment-tracking-v2*
*Completed: 2026-06-27*

## Self-Check: PASSED

- All 6 files exist on disk
- All 3 task commits found in git history
- `npm run build` passes
