---
phase: 12-investment-tracking-v2
plan: '05'
subsystem: investment
tags: pac, ticker, validation, hooks, i18n

requires:
  - phase: 12-investment-tracking-v2
    provides: useInvestmentStore with pendingPacTransaction, confirmPacTransaction, dismissPacTransaction, addBrokerAccount, updateBrokerAccount
provides:
  - usePacAutomation hook for monthly PAC day-check and pending transaction generation
  - PacConfirmationDialog for PAC confirmation/dismissal UI
  - validateTicker regex-based Yahoo Finance ticker format validation
  - validateTickerWithApi non-blocking API test-fetch for ticker verification
  - Ticker validation integration in BrokerSettingsModal (blocking regex + non-blocking API warning)
  - PAC badge notification on InvestmentPage when pending transaction exists
  - Locale keys for PAC and ticker validation features (en/it)
affects: Phase 12 future plans (PAC execution, market data integration)

tech-stack:
  added: []
  patterns:
    - useRef guard pattern for duplicate execution prevention (HMR Pitfall 2 fix)
    - Regex-based lightweight input pre-validation before API calls (D-11)
    - localStorage per-entity tracking for cross-session state persistence

key-files:
  created:
    - src/hooks/usePacAutomation.ts
    - src/components/investment/PacConfirmationDialog.tsx
  modified:
    - src/pages/InvestmentPage.tsx
    - src/store/validation/investment.validation.ts
    - src/store/validation/index.ts
    - src/components/investment/BrokerSettingsModal.tsx
    - src/locales/en.json
    - src/locales/it.json

key-decisions:
  - "PAC day default = 1st of month; per-broker config deferred to future"
  - "useRef guard (hasChecked.current) prevents duplicate PAC generation on HMR (Pitfall 2)"
  - "localStorage per-broker tracking (pac_last_{id}) for cross-session PAC month tracking"
  - "Ticker regex /^[A-Z0-9]{1,10}(\.[A-Z]{2,3})?$/i allows US stocks (AAPL) and European ETFs (SWDA.MI, VWCE.DE)"
  - "validateTickerWithApi uses non-blocking async warning — save proceeds regardless of API result"
  - "Only one pending PAC generated at a time (break after first matching broker)"

requirements-completed:
  - REQ-PAC
  - REQ-TICKER

duration: 3min
completed: 2026-06-27
status: complete
---

# Phase 12 Plan 05: PAC Automation + Ticker Validation Summary

**PAC automation lifecycle (detect → notify → confirm) and Yahoo Finance ticker format validation with blocking regex pre-check at broker config save time**

## Performance

- **Duration:** 3 min
- **Started:** 2026-06-27T09:40:34Z
- **Completed:** 2026-06-27T09:43:57Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- `usePacAutomation` hook checks each broker's `monthlyPacAmount` on app init and generates a pending PAC transaction when the configured day (default 1st) has passed and no PAC has been generated this month
- Hook uses `useRef` guard (`hasChecked.current`) to prevent duplicate generation on hot module reload (Pitfall 2 fix)
- `PacConfirmationDialog` displays pending PAC details (broker name, amount, date) with Confirm & Execute / Dismiss actions
- InvestmentPage shows a MUI Badge notification with "!" indicator when PAC is pending; clicking opens confirmation dialog
- `validateTicker` regex function validates Yahoo Finance ticker format (`/^[A-Z0-9]{1,10}(\.[A-Z]{2,3})?$/i`)
- `validateTickerWithApi` performs non-blocking API test-fetch returning a warning on failure
- `BrokerSettingsModal` integrates ticker validation — blocking regex check prevents save on invalid format, non-blocking API warning shown as helper text
- Locale keys for PAC and ticker validation features exist in `en.json` and `it.json`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create usePacAutomation hook** - `17df984` (feat)
2. **Task 2: Create PacConfirmationDialog and add PAC badge** - `15925ec` (feat)
3. **Task 3: Add ticker validation and i18n** - `a8519c2` (feat)

## Files Created/Modified

- `src/hooks/usePacAutomation.ts` - PAC automation initialization hook with HMR guard, localStorage tracking, and pending transaction generation
- `src/components/investment/PacConfirmationDialog.tsx` - Confirmation dialog showing broker, amount, date with Confirm/Dismiss actions
- `src/pages/InvestmentPage.tsx` - Added `usePacAutomation` init call, PAC badge notification, and dialog trigger
- `src/store/validation/investment.validation.ts` - Added `validateTicker` regex function and `validateTickerWithApi` API test-fetch
- `src/store/validation/index.ts` - Exported new validation functions
- `src/components/investment/BrokerSettingsModal.tsx` - Added ticker field with blocking regex validation and non-blocking API warning
- `src/locales/en.json` - Added PAC and ticker validation locale keys
- `src/locales/it.json` - Added Italian translations for PAC and ticker validation

## Decisions Made

- PAC day defaults to 1st of month; per-broker config deferred to future phase
- `useRef` guard (`hasChecked`) is the primary HMR guard, not a state variable — avoids re-render and persists across re-renders
- LocalStorage per-broker tracking (`pac_last_{id}`) provides cross-session PAC month persistence
- Ticker regex is deliberately permissive to cover US stocks (AAPL), European ETFs (SWDA.MI, VWCE.DE), and other common formats
- `validateTickerWithApi` is non-blocking — save proceeds regardless of API result, showing only a warning
- Only one pending PAC generated at a time (break after first matching broker) to avoid UX overwhelm

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- TypeScript required `ticker: ''` in `handleEdit` form data object (BrokerFormData required the new ticker field)
- Static import of `fetchQuote` from `useMarketData.ts` preferred over dynamic import to avoid Vite chunk splitting warning

## Self-Check: PASSED

- [x] `npm run build` passes
- [x] `usePacAutomation.ts` exists and compiles
- [x] `PacConfirmationDialog.tsx` exists and compiles
- [x] InvestmentPage integrates PAC badge and dialog
- [x] `validateTicker("SWDA.MI")` returns `{ valid: true }`
- [x] `validateTicker("INVALID@@@@")` returns `{ valid: false, error: "..."}`
- [x] BrokerSettingsModal blocks save on invalid ticker
- [x] Locale keys exist in `en.json` and `it.json`
- [x] All 3 task commits present

## Next Phase Readiness

PAC automation lifecycle is complete (detect → notify → confirm). The next phase should implement the actual PAC execution flow — fetching market price and creating the buy transaction on confirm. Ticker validation is in place for all broker configuration forms.

---
*Phase: 12-investment-tracking-v2*
*Completed: 2026-06-27*
