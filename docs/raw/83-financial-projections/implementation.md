# Phase 11: Financial Projections — Implementation Notes

**Date:** 2026-06-26
**Issue:** #83
**Branch:** feat/YATF-83

## Files Created

### Wave 1 — Types + Simulation Engine
- `src/store/types/projection.types.ts` — `IProjectionInput` (6 fields) + `IMonthlySnapshot` (7 fields)
- `src/lib/compoundInterestUtils.ts` — Pure `generateFinancialProjection()` function
  - Monthly loop algorithm: cash interest → capped PAC → ETF growth
  - Monthly rates via `Math.pow(1 + annualRate, 1/12) - 1`
  - Annual inflow credited at month 1 from year 2 onwards
  - All values `Math.round()` to integers

### Wave 2 — UI Shell
- `src/components/projections/ProjectionControls.tsx` — 3 sliders (1-50yr, 0-20%, 0-10%) + 3 text fields
- `src/components/projections/ProjectionChart.tsx` — Recharts AreaChart with gradient fills
- `src/components/projections/ProjectionSummary.tsx` — 3 metric Paper cards
- `src/components/projections/ProjectionsHeader.tsx` — Page title
- `src/pages/ProjectionsPage.tsx` — Responsive grid layout (4col controls / 8col chart on desktop)

### Wave 3 — Hook, Routing, i18n
- `src/hooks/useProjections.ts` — State + computation hook with optional broker prefill
- Route `/projections` added with `React.lazy` code-splitting
- Nav link in Layout top AppBar (desktop) + drawer (mobile)
- 15 EN + 15 IT translation keys under `projections` namespace

## Key Decisions
- Pure client-side — no Firestore, no persistence
- No new npm packages (Recharts, MUI, Zustand already present)
- Local state via custom hook, not global Zustand store
- Feature always visible (no module gate)
- Prefill from `useInvestmentStore.brokerConfig` with try/catch fallback

## Build
- `npm run build` passes with zero type errors
- ProjectionsPage lazy-loaded as separate 29 kB chunk
