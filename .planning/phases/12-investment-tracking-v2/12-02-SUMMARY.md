---
phase: 12-investment-tracking-v2
plan: '02'
subsystem: ui
tags: [mui, broker-select, multi-broker, portfolio]

requires:
  - phase: 12-investment-tracking-v2
    plan: '01'
    provides: multi-broker store schema, broker CRUD actions, types
provides:
  - BrokerSelect dropdown component for broker filtering
  - Multi-broker CRUD settings modal (add/edit/delete broker accounts)
  - Per-broker + aggregated portfolio computation via usePortfolio
  - Multi-ticker price fetching via useMarketData
  - i18n keys for broker CRUD operations
affects:
  - 12-investment-tracking-v2 (Plan 03: transaction-to-broker linking)

tech-stack:
  added: []
  patterns:
    - MUI Select with TextField `select` variant for filter dropdowns
    - Multi-mode modal pattern (list mode ↔ form mode) for settings UI
    - useMemo dependency on selectedBrokerId for reactive portfolio filtering

key-files:
  created:
    - src/components/investment/BrokerSelect.tsx
  modified:
    - src/components/investment/BrokerSettingsModal.tsx
    - src/analytics/hooks/usePortfolio.ts
    - src/pages/InvestmentPage.tsx
    - src/hooks/useMarketData.ts
    - src/components/investment/EtfTransactionModal.tsx
    - src/locales/en.json
    - src/locales/it.json

key-decisions:
  - "Removed ticker field from multi-broker form — BrokerAccount type has no ticker field, ticker association is now handled via assetHoldings per the new architecture"
  - "Added interestRate to usePortfolio return type — needed by CashInterestCard for per-broker/aggregated rate display"
  - "Kept single aggregated price in useMarketData — multi-ticker price storage is deferred to a future enhancement"

requirements-completed: [REQ-MULTI]

duration: 14 min
completed: 2026-06-27
status: complete
---

# Phase 12 Plan 02: Multi-broker UI Layer Summary

**Broker filter dropdown, multi-broker settings CRUD, per-broker portfolio computation, and multi-ticker price fetching**

## Performance

- **Duration:** 14 min
- **Started:** 2026-06-27T09:12:00Z
- **Completed:** 2026-06-27T09:26:00Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- **BrokerSelect.tsx** — New MUI Select component with "All Brokers (Aggregated)" default and per-broker options
- **BrokerSettingsModal rewrite** — Transformed from single-broker config editor to full multi-broker CRUD with list mode (broker cards with edit/delete) and form mode (add/edit with name, lump sum, PAC, interest rate)
- **usePortfolio refactor** — Now filters ETF transactions by selectedBrokerId, computes aggregated or per-broker cash balance from brokerAccounts, returns weighted average interest rate and broker name
- **InvestmentPage update** — Added BrokerSelect dropdown in page header, wired portfolio.brokerName and portfolio.interestRate to CashInterestCard
- **useMarketData multi-ticker** — Fetches prices for all unique tickers from assetHoldings using comma-separated symbols
- **EtfTransactionModal** — Added optional defaultBrokerId prop (infrastructure for Plan 03)
- **i18n** — Added broker CRUD translation keys (add, edit, delete, confirm, notifications) in both en.json and it.json

## Task Commits

Each task was committed atomically:

1. **Task 1: Create BrokerSelect + rewrite BrokerSettingsModal** — `fa77b8e` (feat)
2. **Task 2: Refactor usePortfolio + CashInterestCard** — `5881008` (feat)
3. **Task 3: Update InvestmentPage, useMarketData, i18n** — `580ccf9` (feat)

## Files Created/Modified
- `src/components/investment/BrokerSelect.tsx` — New MUI Select broker filter component
- `src/components/investment/BrokerSettingsModal.tsx` — Rewritten for multi-broker CRUD (list + form modes)
- `src/analytics/hooks/usePortfolio.ts` — Per-broker/aggregated portfolio computation with selectedBrokerId filter
- `src/pages/InvestmentPage.tsx` — Added BrokerSelect dropdown, wired brokerName/interestRate from portfolio
- `src/hooks/useMarketData.ts` — Multi-ticker price fetch from all assetHoldings
- `src/components/investment/EtfTransactionModal.tsx` — Added defaultBrokerId prop
- `src/locales/en.json` — Added broker CRUD translation keys
- `src/locales/it.json` — Added broker CRUD translation keys

## Decisions Made
- **Ticker field removed from multi-broker form** — The BrokerAccount type has no ticker field. Ticker association is handled via assetHoldings in the new multi-broker architecture. The ticker field from the original single-broker form was intentionally dropped.
- **interestRate added to usePortfolio return** — The CashInterestCard displays the interest rate, and the computed weighted rate from active brokers is needed. Added `interestRate` to the `useMemo` return for the component consumer.
- **Single aggregated price preserved** — useMarketData now fetches from all held tickers but still sets a single aggregated `currentPrice` in the store. Multi-ticker price storage is left as a future enhancement (Plan 03+).

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Multi-broker UI layer is complete (Plan 02 of 6)
- Ready for Plan 03: Transaction-to-broker linking, which will wire EtfTransactionModal's defaultBrokerId and integrate brokerId with ETF transactions
- BrokerSelect dropdown renders correctly in InvestmentPage header
- useMarketData now fetches prices for all tickers across all broker accounts

## Self-Check: PASSED
- [x] All 3 tasks committed with proper commit messages
- [x] Each commit is independently revertable
- [x] `npm run build` passes (verified after each task)
- [x] Key files exist on disk
  - [x] `src/components/investment/BrokerSelect.tsx` — exists
  - [x] `src/components/investment/BrokerSettingsModal.tsx` — exists
  - [x] `src/analytics/hooks/usePortfolio.ts` — exists
  - [x] `src/pages/InvestmentPage.tsx` — exists
  - [x] `src/hooks/useMarketData.ts` — exists
  - [x] `src/locales/en.json` — exists
  - [x] `src/locales/it.json` — exists
- [x] BrokerSelect renders MUI Select with all-broker and per-broker options
- [x] BrokerSettingsModal supports add/edit/delete broker accounts
- [x] usePortfolio returns per-broker and aggregated metrics based on selectedBrokerId
- [x] useMarketData fetches prices for multiple tickers
- [x] All new locale keys exist in en.json and it.json

---
*Phase: 12-investment-tracking-v2*
*Completed: 2026-06-27*
