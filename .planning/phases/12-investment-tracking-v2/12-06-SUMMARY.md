---
phase: 12-investment-tracking-v2
plan: '06'
subsystem: projections
tags: inflation, projections, compound-interest, recharts, i18n
requires:
  - phase: 12-05
    provides: Capital gains tax computation on projection snapshots
provides:
  - Inflation-adjusted financial projections with per-month compounding
  - Real vs nominal value comparison in projection chart
  - Real Final Capital metric card in summary
affects: []
tech-stack:
  added: []
  patterns:
    - Inflation adjustment via per-month compounding factor (Pitfall 5 fix)
    - Dual snapshot computation (nominal + real) for chart overlay
key-files:
  created: []
  modified:
    - src/store/types/projection.types.ts
    - src/lib/compoundInterestUtils.ts
    - src/hooks/useProjections.ts
    - src/components/projections/ProjectionControls.tsx
    - src/components/projections/ProjectionChart.tsx
    - src/components/projections/ProjectionSummary.tsx
    - src/pages/ProjectionsPage.tsx
    - src/locales/en.json
    - src/locales/it.json
key-decisions:
  - "Inflation applied as divisor to nominal values per-month (not just final value)"
  - "Tax remains on nominal gains — inflation adjustment does not affect tax computation"
  - "When inflation is on, netWorth line shows real value; nominalValue dashed overlay shows original"
  - "Dual snapshot computation: nominalSnapshots always computed with adjustForInflation: false"
requirements-completed:
  - REQ-TAX
coverage:
  - id: D1
    description: IProjectionInput extended with adjustForInflation and inflationRate fields
    requirement: REQ-TAX
    verification:
      - kind: unit
        ref: src/store/types/projection.types.ts#L8-L9
        status: pass
    human_judgment: false
  - id: D2
    description: generateFinancialProjection applies per-month inflation adjustment
    requirement: REQ-TAX
    verification:
      - kind: unit
        ref: src/lib/compoundInterestUtils.ts#L50-L65
        status: pass
    human_judgment: false
  - id: D3
    description: useProjections hook exposes setInflationToggle function
    verification:
      - kind: unit
        ref: src/hooks/useProjections.ts#L29
        status: pass
    human_judgment: false
  - id: D4
    description: ProjectionControls shows Adjust for Inflation Switch toggle
    verification:
      - kind: unit
        ref: src/components/projections/ProjectionControls.tsx#L118-L129
        status: pass
    human_judgment: false
  - id: D5
    description: ProjectionChart shows nominalValue dashed line when inflation is on
    verification:
      - kind: unit
        ref: src/components/projections/ProjectionChart.tsx#L114-L123
        status: pass
    human_judgment: false
  - id: D6
    description: ProjectionSummary shows Real Final Capital card when inflation is on
    verification:
      - kind: unit
        ref: src/components/projections/ProjectionSummary.tsx#L69-L78
        status: pass
    human_judgment: false
  - id: D7
    description: Locale keys for inflation feature in en.json and it.json
    verification:
      - kind: unit
        ref: src/locales/en.json#L246-L249
        status: pass
      - kind: unit
        ref: src/locales/it.json#L246-L249
        status: pass
    human_judgment: false
duration: 12 min
completed: 2026-06-27
status: complete
---

# Phase 12 Plan 06: Inflation-Adjusted Projections Summary

**Inflation toggle in ProjectionControls with per-month compounding, dashed nominal-value chart overlay, and Real Final Capital summary card**

## Performance

- **Duration:** 12 min
- **Started:** 2026-06-27T09:35:00Z
- **Completed:** 2026-06-27T09:47:00Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Added `adjustForInflation` and `inflationRate` fields to `IProjectionInput` type
- Implemented inflation adjustment in `generateFinancialProjection` with per-month compounding: `monthlyInflation = (1 + annualInflation)^(1/12) - 1`
- Added `setInflationToggle` to `useProjections` hook and `nominalSnapshots` for dual real/nominal computation
- Added MUI Switch toggle labeled "Adjust for Inflation (2%)" to `ProjectionControls`
- Added dashed "Nominal Value" Area chart overlay in red (dataKey: `nominalValue`) in `ProjectionChart`
- Added "Real Final Capital" `MetricCard` in `ProjectionSummary`
- Added locale keys in `en.json` and `it.json` for all inflation labels
- All existing projection functionality unaffected when toggle is off

## Task Commits

Each task was committed atomically:

1. **Task 1: Update projection types and compoundInterestUtils** - `acb9f78` (feat)
2. **Task 2: Update useProjections and ProjectionControls** - `110b1d6` (feat)
3. **Task 3: Update chart, summary, locale, page wiring** - `7b701ad` (feat)

**Plan metadata:** (committed with final docs commit)

## Files Created/Modified

- `src/store/types/projection.types.ts` — Added `adjustForInflation` and `inflationRate` fields
- `src/lib/compoundInterestUtils.ts` — Added per-month inflation adjustment logic
- `src/hooks/useProjections.ts` — Added `setInflationToggle`, `nominalSnapshots`, extended `chartData` with `nominalValue`
- `src/components/projections/ProjectionControls.tsx` — Added MUI Switch for inflation toggle
- `src/components/projections/ProjectionChart.tsx` — Added `showRealValue` prop and dashed Nominal Value Area
- `src/components/projections/ProjectionSummary.tsx` — Added Real Final Capital MetricCard
- `src/pages/ProjectionsPage.tsx` — Wired inflation toggle to controls, chart, and summary
- `src/locales/en.json` — Added 4 inflation-related keys
- `src/locales/it.json` — Added 4 inflation-related keys

## Decisions Made

- **Per-month inflation compounding:** Using `monthlyInflation = (1 + annual)^(1/12) - 1` and applying to each snapshot individually based on `monthIndex` — avoids Pitfall 5 (applying final-year inflation rate to all prior years)
- **Inflation as divisor:** Nominal value divided by `(1 + monthlyInflation)^monthIndex` gives real purchasing power
- **Tax unchanged:** Capital gains tax (26%) remains computed on nominal gains — research recommendation
- **Dual snapshots:** `nominalSnapshots` always computed with `adjustForInflation: false` regardless of toggle state, enabling real/nominal chart overlay without re-computation on toggle

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Task 2 required intermediate build verification before chart/summary props were added (components didn't accept `showRealValue` yet). This was expected sequential dependency — Task 2 only added `onInflationToggle` wiring, Task 3 added chart/summary props.

## Known Stubs

None - all functionality fully wired.

## Threat Flags

None - all computation is client-side; no new network endpoints or data flows introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Inflation-adjusted projections complete
- Ready for next plan in Phase 12

---
*Phase: 12-investment-tracking-v2*
*Completed: 2026-06-27*
