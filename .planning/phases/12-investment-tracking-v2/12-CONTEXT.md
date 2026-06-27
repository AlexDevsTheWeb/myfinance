# Phase 12: Investment Tracking V2 — UX & Architecture Enhancements

**Gathered:** 2026-06-27
**Status:** Ready for planning
**Source:** UX improvements analysis from `docs/YATF/raw/ux-improvments.md` + 6 GitHub issues (#89–#94)

---

<domain>
## Phase Boundary

Evolve the investment tracking module from a single-broker, single-ETF tool into a robust, multi-asset financial platform. This phase covers six enhancement areas:

1. **PAC Automation** — Auto-generate recurring monthly buy transactions with user confirmation
2. **Full CRUD** — Edit/delete ETF transactions and settings with cascading recalculation
3. **Multi-Broker Architecture** — Schema refactor to support multiple brokers and assets
4. **Historical Snapshots** — Persistent portfolio history in Firestore
5. **Tax & Inflation Modeling** — Inflation-adjusted projections in `/projections`
6. **Ticker Validation** — Yahoo Finance ticker validation at config save time
</domain>

<decisions>
## Implementation Decisions

### Architecture & Data Layer
- **D-01:** Multi-broker schema refactor uses collection-based types (`BrokerAccount[]`, `AssetHolding[]`) instead of single-object config
- **D-02:** All existing user data must be migrated forward-compatibly (backward-compatible schema transition)
- **D-03:** Historical snapshots stored in a new `portfolio_history` Firestore collection (separate from user document arrays)
- **D-04:** PAC automation uses a Zustand/Firestore initialization hook (not a server-side cron/worker)

### UI/UX
- **D-05:** Broker filtering uses MUI `<Select />` dropdown — "All Brokers (Aggregated)" default view
- **D-06:** Transaction CRUD uses standard MUI icons (`Edit` / `Delete`) in table action column
- **D-07:** PAC confirmation uses notification badge pattern (consistent with existing MUI snackbar/badge components)
- **D-08:** Inflation toggle in `/projections` is a simple switch — "Adjust for Inflation (2%)"

### Transaction & State
- **D-09:** Safe deletion cascades: revert units → recalculate PMC → restore broker cash balance (atomic operation)
- **D-10:** Auto-generated PAC transactions tagged as `System-Generated Buy` (distinguishable from manual entries)
- **D-11:** Ticker validation uses a lightweight regex pre-check + optional test-fetch (non-blocking warning)

### Dependencies & Constraints
- **D-12:** Multi-broker schema refactor (D-01) is foundational — other features depend on it
- **D-13:** No new npm packages — all needed dependencies (MUI, Recharts, Zustand, Firebase, dayjs) already in project
- **D-14:** Market data continues via `api.yfin.dev` (CORS-friendly Yahoo Finance proxy)
- **D-15:** All computation remains client-side where possible (Firestore only for persistence)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Architecture
- `.planning/phases/10-investment-tracking/10-CONTEXT.md` — Phase 10 decisions and architecture
- `.planning/phases/10-investment-tracking/10-RESEARCH.md` — Phase 10 research (market data, store patterns)
- `.planning/phases/10-investment-tracking/10-01-PLAN.md` through `10-06-PLAN.md` — Implementation details
- `docs/YATF/architecture/investment-tracking-architecture.md` — Current architecture doc
- `docs/YATF/features/investment-tracking.md` — Feature description and status

### GitHub Issues (source of requirements)
- `docs/YATF/raw/89-pac-automation/issue.md` — PAC automation requirements
- `docs/YATF/raw/90-crud-transactions/issue.md` — CRUD requirements
- `docs/YATF/raw/91-multi-broker/issue.md` — Multi-broker schema requirements
- `docs/YATF/raw/92-historical-snapshots/issue.md` — Historical snapshot requirements
- `docs/YATF/raw/93-tax-inflation/issue.md` — Tax & inflation modeling requirements
- `docs/YATF/raw/94-ticker-validation/issue.md` — Ticker validation requirements

### Wiki Pages
- `docs/YATF/features/pac-automation.md` — Wiki feature page
- `docs/YATF/features/crud-etf-transactions.md` — Wiki feature page
- `docs/YATF/features/multi-broker-architecture.md` — Wiki feature page
- `docs/YATF/features/historical-snapshots.md` — Wiki feature page
- `docs/YATF/features/tax-inflation-modeling.md` — Wiki feature page
- `docs/YATF/features/ticker-validation.md` — Wiki feature page
- `docs/YATF/plans/investment-tracking-v2-enhancements.md` — Umbrella V2 plan page
</canonical_refs>

<specifics>
## Specific Ideas

- **Wave ordering:** Multi-broker schema refactor should come first (other features depend on the new types)
- **PMC calculation:** Uses average cost basis with proportional reduction on sell (existing pattern from Phase 10)
- **Tax modeling:** Flat 26% Italian capital gains tax already implemented; inflation toggle is additive
- **Ticker validation:** Regex pattern like `/^[A-Z0-9]{1,5}\.(MI|DE|PA|AS|L|TO|F)$/i` as first pass, optional API test-fetch as enhancement
- **PAC confirmation:** Consider using MUI Badge component on the Invest nav link or a toast notification
</specifics>

<deferred>
## Deferred Ideas

- Server-side cron for PAC automation (client-side hook is sufficient for v1)
- TER (Tracking Expense Ratio) modeling in projections — future enhancement
- CSV/PDF import for ETF transactions — out of scope
- Real-time price polling (manual refresh only, consistent with Phase 10)
</deferred>

---

*Phase: 12-investment-tracking-v2*
*Context gathered: 2026-06-27 via raw/ux-improvments.md + GitHub issues #89–#94*
