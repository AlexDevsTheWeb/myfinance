---
type: Log
title: "YATF Wiki — Update Log"
description: "Chronological append-only record of all wiki operations: ingests, queries, lints, and migrations."
---

# Wiki Log

## [2026-07-06] ingest | Feature | Italian Tax Enhancements — Issue #110
- Created [[raw/110-italian-tax-enhancements/110-italian-tax-enhancements.md]] from GitHub [Issue #110](https://github.com/AlexDevsTheWeb/myfinance/issues/110)
- Updated [[wiki/features/investment-professional-enhancements/investment-professional-enhancements]] — added #110 as source, linked to plan
- Created [[wiki/plans/italian-tax-enhancements]] — 5-wave breakdown (15 subtasks) for stamp duty + capital losses
- Updated index.md (48 pages) and log.md

## [2026-07-26] ingest | Feature | Responsive chart layout — Salary + Insights
- Created [[raw/responsive-chart-layout/responsive-chart-layout.md]] — inline charts at ≥2000px, full-screen dialog at <2000px
- Created [[wiki/features/responsive-chart-layout/responsive-chart-layout]] — design, breakpoint rationale, implementation
- Removed `AnalyticsFilters` from Insights page (date pickers, granularity/category selects)
- Created `SalaryChartDialog.tsx` and `InsightsChartsDialog.tsx` — full-screen chart dialogs
- Updated index.md (66 pages) and log.md
- Source: [raw/responsive-chart-layout/responsive-chart-layout.md](raw/responsive-chart-layout/responsive-chart-layout.md)

## [2026-07-03] implement | Feature | Sidebar/routing refactor — flat links, tabbed pages, duplicate title removed
- Removed duplicate app title from Layout.tsx AppBar (sidebar retains it)
- Created [[wiki/features/sidebar-routing-refactor/sidebar-routing-refactor]] — `FinancePage` (/finance, tabs: Salary + Insights) and `InvestmentsPage` (/investments, tabs: Investments + Projections)
- Removed `/salary`, `/insights`, `/invest`, `/projections` routes from App.tsx
- Removed `NavGroup` component from Sidebar.tsx — flat link structure
- Updated breadcrumb map in Layout.tsx
- Created [#113](https://github.com/AlexDevsTheWeb/myfinance/issues/113)
- Updated index.md (44 pages), log.md
- Source: [raw/sidebar-routing-refactor/sidebar-routing-refactor.md](raw/sidebar-routing-refactor/sidebar-routing-refactor.md)

## [2026-07-03] ingest | Report | Investment bug report & professional enhancements
- Created [[wiki/bugs/ticker-persistence]] — Bug: BrokerAccount ticker not persisted (critical); PAC confirmation uses brokerId as ticker
- Created [[wiki/features/investment-professional-enhancements/investment-professional-enhancements]] — 5 sub-features: per-ticker pricing, stamp duty (0.20%), capital losses tracking (zainetto fiscale), transaction fees field, privacy mode
- Verified claims against codebase: ticker bug **confirmed** (`BrokerAccount` type + save handler both lack ticker); cash adjustments already implemented in V3
- Updated index.md (43 pages) and log.md
- Source: [raw/investment-report/investment-report.md](raw/investment-report/investment-report.md)

## [2026-07-03] docs | Guide | Investment & Projections — Full code analysis added to wiki
- Created [[wiki/features/investment-tracking-guide/investment-tracking-guide]] — complete rewrite: combines user guide (EN) + deep code analysis (6 parts)
- Part 1–2: User guide for `/invest` and `/projections` (from raw/FEATURES-GUIDE/FEATURES-GUIDE.md)
- Part 3: Code analysis of `/invest` — page structure, `usePortfolio()` computation engine (avg cost method, cash balance formula), `usePacAutomation()` flow, `useMarketData()` / Yahoo Finance, store write pattern (optimistic→Firestore→rollback), `useTaxTracking()` (26% capital gains)
- Part 4: Code analysis of `/projections` — `useProjections()` hook flow, `generateFinancialProjection()` monthly loop algorithm, monthly rate conversion, inflation adjustment, CAGR computation
- Part 5: Data flow diagram (Firestore ↔ stores ↔ hooks ↔ pages)
- Part 6: Key files reference table
- Updated [[wiki/features/guida-investimenti/guida-investimenti]] cross-references
- Updated index.md (41 pages) and log.md

## [2026-06-28] complete | Implementation | Manual Review #99 — All 7 items implemented
- ✅ Wave 1: i18n bugfix (car.statistics, utilities.total, insights.financialTrendTitle) + hardcoded strings → translations
- ✅ Wave 2: Padding reduction (p:3→p:1.5) across 20+ component files
- ✅ Wave 3: Account Detail Dialog (full-screen) + stripped account cards from dashboard
- ✅ Wave 4: Added PortfolioLineChart, SavingsRateGauge, BulletChart to dashboard; removed TransactionTable
- ✅ Wave 5: Vertical sidebar with collapsible mode, avatar at bottom, transactions link
- ✅ Dashboard enrichment: module overview stat cards (investments, budget, car, utilities)
- Updated [[wiki/features/dashboard-redesign/dashboard-redesign]] → implemented
- Updated [[wiki/features/sidebar-redesign/sidebar-redesign]] → implemented
- Updated [[wiki/bugs/car-statistics-year]] → fixed
- Updated [[wiki/plans/manual-review-99-implementation]] → completed
- Updated index.md and log.md

## [2026-06-28] ingest | Feature | Manual Review #99 — UI/UX, Bug Fixes & Polish
- Created [[raw/99-manual-review-2706/99-manual-review-2706.md]] from GitHub [Issue #99](https://github.com/AlexDevsTheWeb/myfinance/issues/99)
- Created [[wiki/features/dashboard-redesign/dashboard-redesign]] — dashboard split, account detail dialog, additional charts
- Created [[wiki/features/sidebar-redesign/sidebar-redesign]] — vertical left sidebar with grouped navigation
- Created [[wiki/bugs/car-statistics-year]] — i18next interpolation syntax fix
- Created [[wiki/plans/manual-review-99-implementation]] — 5-wave implementation plan
- Updated [[wiki/architecture/project-state]] — added #99 work items to concerns
- Updated index.md (38 pages) and log.md

## [2026-06-27] ingest | Guide | Investment Tracking & Financial Projections guides updated with Phase 12 enhancements
- Updated [[wiki/features/investment-tracking-guide/investment-tracking-guide]] from `raw/FEATURES-GUIDE/FEATURES-GUIDE.md` — added multi-broker, CRUD transactions, PAC automation, historical snapshots, ticker validation, inflation adjustment
- Updated [[wiki/features/guida-investimenti/guida-investimenti]] from `raw/FEATURES-GUIDE.it/FEATURES-GUIDE.it.md` — Italian version with same enhancements
- Added cross-references to 6 new V2 feature pages in both guides
- Updated index.md cross-references
- Source: [raw/FEATURES-GUIDE/FEATURES-GUIDE.md](raw/FEATURES-GUIDE/FEATURES-GUIDE.md), [raw/FEATURES-GUIDE.it/FEATURES-GUIDE.it.md](raw/FEATURES-GUIDE.it/FEATURES-GUIDE.it.md)

## [2026-06-27] plan | Phase 12 | Investment Tracking V2 — GSD planning complete
- Created `.planning/ROADMAP.md` with all phases (1–12) in GSD format
- Created `.planning/phases/12-investment-tracking-v2/12-CONTEXT.md` with 15 locked decisions
- Spawned `gsd-phase-researcher` → `12-RESEARCH.md` (1058 lines, multi-broker migration path, codebase analysis)
- Spawned `gsd-planner` → 6 plans across 5 waves (12-01 through 12-06)
- Spawned `gsd-plan-checker` → `12-VERIFICATION.md` — 2 blockers found and resolved
- Updated [[wiki/plans/investment-tracking-v2-enhancements]] with GSD plan table
- Updated `.planning/ROADMAP.md` with plan list and progress table

## [2026-06-27] ingest | Feature | 6 V2 GitHub issues ingested into wiki
- Created 6 GitHub issues from `raw/ux-improvments/ux-improvments.md`: [#89](https://github.com/AlexDevsTheWeb/myfinance/issues/89) PAC Automation, [#90](https://github.com/AlexDevsTheWeb/myfinance/issues/90) CRUD Transactions, [#91](https://github.com/AlexDevsTheWeb/myfinance/issues/91) Multi-Broker, [#92](https://github.com/AlexDevsTheWeb/myfinance/issues/92) Historical Snapshots, [#93](https://github.com/AlexDevsTheWeb/myfinance/issues/93) Tax & Inflation, [#94](https://github.com/AlexDevsTheWeb/myfinance/issues/94) Ticker Validation
- Saved issue files to `raw/89-pac-automation/`, `raw/90-crud-transactions/`, `raw/91-multi-broker/`, `raw/92-historical-snapshots/`, `raw/93-tax-inflation/`, `raw/94-ticker-validation/`
- Created [[wiki/features/pac-automation/pac-automation]], [[wiki/features/crud-etf-transactions/crud-etf-transactions]], [[wiki/features/multi-broker-architecture/multi-broker-architecture]], [[wiki/features/historical-snapshots/historical-snapshots]], [[wiki/features/tax-inflation-modeling/tax-inflation-modeling]], [[wiki/features/ticker-validation/ticker-validation]]
- Updated [[wiki/plans/investment-tracking-v2-enhancements]] with issue cross-reference table
- Updated index.md (28 pages) and log.md

## [2026-06-27] plan | Phase 12 | Investment Tracking V2 — GSD planning complete
- Created `.planning/ROADMAP.md` with all phases (1–12) in GSD format
- Created `.planning/phases/12-investment-tracking-v2/12-CONTEXT.md` with 15 locked decisions
- Spawned `gsd-phase-researcher` → `12-RESEARCH.md` (1058 lines, multi-broker migration path, codebase analysis)
- Spawned `gsd-planner` → 6 plans across 5 waves (12-01 through 12-06)
- Spawned `gsd-plan-checker` → `12-VERIFICATION.md` — 2 blockers found and resolved
- Updated [[wiki/plans/investment-tracking-v2-enhancements]] with GSD plan table and Phase 12 reference
- Updated index.md

## [2026-06-27] ingest | Guide | Investment Tracking & Financial Projections User Guides
- Created [[wiki/features/investment-tracking-guide/investment-tracking-guide]] from `raw/FEATURES-GUIDE/FEATURES-GUIDE.md`
- Created [[wiki/features/guida-investimenti/guida-investimenti]] from `raw/FEATURES-GUIDE.it/FEATURES-GUIDE.it.md` (Italian, linked to EN version)
- Created [[wiki/plans/investment-tracking-v2-enhancements]] from `raw/ux-improvments/ux-improvments.md` — PAC automation, CRUD, multi-broker, historical snapshots, tax modeling, ticker validation
- Updated [[wiki/features/investment-tracking/investment-tracking]] — added cross-refs to guides and V2 plan
- Updated [[wiki/features/financial-projections/financial-projections]] — added cross-refs to guides and V2 plan
- Updated [[wiki/architecture/investment-tracking-architecture]] — added V2 schema direction section with `BrokerAccount`/`AssetHolding` types
- Updated index.md (3 new pages)
- Source: [raw/FEATURES-GUIDE/FEATURES-GUIDE.md](raw/FEATURES-GUIDE/FEATURES-GUIDE.md), [raw/FEATURES-GUIDE.it/FEATURES-GUIDE.it.md](raw/FEATURES-GUIDE.it/FEATURES-GUIDE.it.md), [raw/ux-improvments/ux-improvments.md](raw/ux-improvments/ux-improvments.md)

## [2026-06-22] ingest | Bulk | Initial wiki population (12 sources)
- Created [[wiki/features/car-management-redesign/car-management-redesign]] from `raw/SPEC.md`
- Created [[wiki/plans/roadmap]] from `raw/ROADMAP.md`
- Created [[wiki/architecture/project-state]] from `raw/STATE.md`
- Created [[wiki/plans/car-redesign-implementation]] from `raw/PLANS.md`
- Created [[wiki/architecture/tech-stack]] from `raw/codebase/STACK.md`
- Created [[wiki/architecture/codebase-structure]] from `raw/codebase/STRUCTURE.md`
- Created [[wiki/architecture/system-architecture]] from `raw/codebase/ARCHITECTURE.md`
- Created [[wiki/conventions/coding-conventions]] from `raw/codebase/CONVENTIONS.md`
- Created [[wiki/architecture/external-integrations]] from `raw/codebase/INTEGRATIONS.md`
- Created [[wiki/architecture/testing-status]] from `raw/codebase/TESTING.md`
- Created [[wiki/architecture/concerns-and-tech-debt]] from `raw/codebase/CONCERNS.md`
- Created [[wiki/references/llm-wiki-pattern]] from `raw/original-llm-wiki/original-llm-wiki.md`
- Created index.md and log.md

## [2026-06-22] docs | Conventions | Created branch-strategy page
- Created [[wiki/conventions/branch-strategy]] with new branch rules
- Updated AGENTS.md to reference the wiki page as source of truth
- Updated [[wiki/conventions/coding-conventions]] to point to the dedicated page
- Updated CLAUDE.md branch strategy section to reference the wiki

## [2026-06-22] docs | CI/CD + Versioning | Audit and documentation
- Fixed `firebase-hosting-pull-request.yml` — restricted to PRs targeting `main` only (was triggering on all PRs including to `development`)
- Updated [[wiki/architecture/external-integrations]] with deployment rules table
- Created [[wiki/architecture/versioning]] with version scheme, .versionrc mapping, and release pipeline
- Updated index.md

## [2026-06-22] spec | Feature | Transaction Layout Improvement
- Created [[wiki/features/transaction-layout-improvement/transaction-layout-improvement]] from [#80](https://github.com/AlexDevsTheWeb/myfinance/issues/80)
- Created [[wiki/plans/transaction-layout-implementation]] with step-by-step tasks
- Updated index.md

## [2026-06-22] re-map | Codebase | Full mapping via gsd-map-codebase (4 parallel agents)
- Re-mapped codebase with tech, arch, quality, and concerns focus agents
- Updated raw files from `.planning/codebase/*.md` → `raw/codebase/*.md`
- Re-ingested [[wiki/architecture/tech-stack]] — React ^19.2.6, MUI ^9.0.1, Vite ^8.0.13, version 2026.2.1, standard-version
- Re-ingested [[wiki/architecture/external-integrations]] — GitHub Actions CI/CD, i18n details, env vars, Google Fonts
- Re-ingested [[wiki/architecture/system-architecture]] — 7-layer architecture, analytics layer, startup flow, recurring check flow
- Re-ingested [[wiki/architecture/codebase-structure]] — analytics/ directory, barrel files, .nvmrc, where-to-add-guide
- Re-ingested [[wiki/conventions/coding-conventions]] — import patterns, ESLint config, component structure, barrel exports
- Re-ingested [[wiki/architecture/testing-status]] — comprehensive test candidate tables, recommended Vitest setup
- Re-ingested [[wiki/architecture/concerns-and-tech-debt]] — 15+ issues, 3 new bugs, dnd-kit version mismatch, pro license risk

## [2026-06-26] ingest | Feature | Investment Tracking & Broker Integration
- Created [[wiki/features/investment-tracking/investment-tracking]] from `raw/81-tax-refund/81-tax-refund.md` (merged import.md + tr-code.md)
- Renamed `raw/81-rax-refund` → `raw/81-tax-refund` (fix typo)
- Updated index.md

## [2026-06-26] plan | Feature | Investment Tracking — Phase 10 planning
- Updated [[wiki/features/investment-tracking/investment-tracking]] to status: in-progress with planning details
- Created [[wiki/plans/investment-tracking-implementation]] — 6 plans across 4 waves
- Created [[wiki/architecture/investment-tracking-architecture]] — data flow, Firestore schema, component tree
- Updated [[wiki/plans/roadmap]] with Phase 10 entry
- Updated index.md

## [2026-06-26] implement | Feature | Investment Tracking — Phase 10 complete
- Implemented all 6 plans across 4 waves on `feat/investment-tracking`
- 17 files created, 15 files modified (types, store, transaction flow, broker modal, portfolio page, market data, routing, i18n)
- Updated [[wiki/features/investment-tracking/investment-tracking]] to status: **implemented**
- Updated [[wiki/plans/investment-tracking-implementation]] to status: **completed**
- Updated [[wiki/architecture/investment-tracking-architecture]] to status: **active**
- Updated index.md

## [2026-06-26] implement | Feature | Investment Tracking — ConfigPage toggle
- Added `investmentTracking` toggle switch to `ConfigPage.tsx` (module was `false` by default with no UI to enable it)
- Added `config.investmentTracking` translation key to `en.json` and `it.json`
- Updated [[wiki/features/investment-tracking/investment-tracking]] with note about Settings toggle requirement

## [2026-06-26] ingest | Feature | Financial Projections & Compound Interest Simulator
- Created [[wiki/features/financial-projections/financial-projections]] from [#83](https://github.com/AlexDevsTheWeb/myfinance/issues/83)
- Created [[wiki/architecture/financial-projections-architecture]] — simulation data flow, component tree, design decisions
- Created [[wiki/plans/financial-projections-implementation]] — 3 plans for engine, UI shell, routing + i18n
- Updated index.md

## [2026-06-26] plan | Feature | Financial Projections — Phase 11 planning
- Created `.planning/phases/11-financial-projections/`
- Created `11-CONTEXT.md` — 20 locked decisions, canonical refs, domain boundary
- Created `11-RESEARCH.md` — architecture patterns, pitfalls, code examples, standard stack
- Created `11-01-PLAN.md` — Simulation engine + types (wave 1)
- Created `11-02-PLAN.md` — UI shell: controls, chart, summary cards (wave 2)
- Created `11-03-PLAN.md` — Hook, routing, i18n, optional prefill (wave 3)
- Updated [[wiki/plans/financial-projections-implementation]]

## [2026-06-26] implement | Feature | Financial Projections — Phase 11 complete (PR #88)
- Implemented all 3 plans across 3 waves on `feat/YATF-83`
- 9 files created, 5 files modified (types, engine, UI shell, hook, routing, nav, i18n)
- Created [[wiki/features/financial-projections/financial-projections]] status → **implemented**
- Updated [[wiki/plans/financial-projections-implementation]] status → **completed**
- Updated [[wiki/architecture/financial-projections-architecture]] status → **active**
- Updated index.md
- Source: [raw/83-financial-projections/implementation.md](raw/83-financial-projections/implementation.md)

## [2026-06-28] ingest | Feature | Investment Tracking V3 — Dividend, Tax, Performance
- Created [[raw/98-investment-tracking-v3/98-investment-tracking-v3.md]] from GitHub [Issue #98](https://github.com/AlexDevsTheWeb/myfinance/issues/98)
- Created [[wiki/features/investment-tracking-v3/investment-tracking-v3]] — 4 sub-features (dividend ledger, capital gains tax, performance prefill, cash adjustments)
- Created [[wiki/plans/investment-tracking-v3-implementation]] — architecture analysis and recommended implementation order
- Updated [[wiki/architecture/investment-tracking-architecture]] — added V3 section, new transaction types in classification table
- Updated index.md (30 pages) and log.md

## [2026-06-27] implement | Feature | Investment Tracking V2 — Phase 12 complete (PR #95)
- Implemented 6 plans across 4 waves on `feat/phase-12-investment-tracking-v2`
- 24 execution commits, 4 files created, ~30 files modified
- Created [[wiki/features/multi-broker-architecture/multi-broker-architecture]] status → **implemented**
- Created [[wiki/features/crud-etf-transactions/crud-etf-transactions]] status → **implemented**
- Created [[wiki/features/historical-snapshots/historical-snapshots]] status → **implemented**
- Created [[wiki/features/pac-automation/pac-automation]] status → **implemented**
- Created [[wiki/features/tax-inflation-modeling/tax-inflation-modeling]] status → **implemented**
- Created [[wiki/features/ticker-validation/ticker-validation]] status → **implemented**
- Updated [[wiki/plans/investment-tracking-v2-enhancements]] status → **completed**
- Updated [[wiki/architecture/investment-tracking-architecture]] with V2 schema, store, component tree, migration layer
- Updated index.md
- Source: [raw/12-investment-tracking-v2/implementation.md](raw/12-investment-tracking-v2/implementation.md)

## [2026-06-28] implement | Feature | Investment Tracking V3 — Wave 1+2+3
- Implemented V3 data layer: `CashAdjustment`, `DividendEntry` types, store actions, validation, sanitization, Firestore sync + rules
- Updated cash balance formula in `usePortfolio` to include adjustments and dividends
- Created components: `CashAdjustmentDialog`, `DividendDialog`, `DividendBadge`, `TaxPocketWidget`
- Created `useTaxTracking` hook with 26% Italian capital gains computation per year
- Integrated all new components into `InvestmentPage`
- Added i18n keys (EN/IT) for dividends, cash adjustments, and tax tracking
- Updated [[wiki/features/investment-tracking-v3/investment-tracking-v3]] status → **in-progress**
- Updated [[wiki/plans/investment-tracking-v3-implementation]] status → **in-progress**
- Updated [[wiki/architecture/investment-tracking-architecture]] with V3 section and new transaction types

## [2026-06-28] plan | Feature | Dynamic Performance Prefill — Wave 4 analysis
- Added CAGR analysis to [[wiki/plans/investment-tracking-v3-implementation]] — computation logic, UX flow, layer breakdown
- Updated [[wiki/features/investment-tracking-v3/investment-tracking-v3]] with Wave 4 implementation notes
- Updated index.md

## [2026-06-28] implement | Feature | Dynamic Performance Prefill — Wave 4 complete
- Added `computeCAGR()` to `compoundInterestUtils.ts` — annualized return from portfolio snapshot time series
- Extended `useProjections` with `useRealPerformance` toggle — overrides `etfAnnualReturn` with real CAGR when active
- Updated `ProjectionControls` — "Use Real Performance" switch disables ETF slider, shows computed CAGR
- Wired toggle through `ProjectionsPage`
- Updated [[wiki/plans/investment-tracking-v3-implementation]] status → **completed**
- Updated [[wiki/features/investment-tracking-v3/investment-tracking-v3]] status → **implemented**

## [2026-06-28] ingest | Feature | Budget & Savings Rate Engine V4 — Issue #100
- Created [[raw/100-budget-savings-engine/100-budget-savings-engine.md]] from GitHub [Issue #100](https://github.com/AlexDevsTheWeb/myfinance/issues/100)
- Created [[wiki/features/budget-savings-engine/budget-savings-engine]] — 3 sub-features (budget config, Recharts visualizations, savings rate engine)
- Created [[wiki/architecture/budget-savings-architecture]] — data flow, Firestore schema, store architecture, component tree, charting, integration points
- Created [[wiki/plans/budget-savings-engine-implementation]] — 6 waves, 11 new files, 10 modified files, with full architecture analysis
- Updated [[wiki/architecture/investment-tracking-architecture]] — added budget integration section (surplus → investment bridge)
- Updated [[wiki/architecture/financial-projections-architecture]] — added savings rate bridge section
- Updated index.md (33 pages) and log.md

## [2026-06-28] implement | Feature | Budget & Savings Rate Engine V4 — Full /budget module
- Implemented 6 waves across 29 files (1882 insertions)
- Created [[wiki/features/budget-savings-engine/budget-savings-engine]] status → **implemented**
- Created [[wiki/architecture/budget-savings-architecture]] status → **active**
- Created [[wiki/plans/budget-savings-engine-implementation]] status → **completed**
- Updated [[wiki/features/investment-tracking-guide/investment-tracking-guide]] → added Budget section, renamed to include Budget
- Updated [[wiki/features/guida-investimenti/guida-investimenti]] → added Budget section, renamed to include Budget
- Updated [[wiki/architecture/investment-tracking-architecture]] — added budget integration section
- Updated [[wiki/architecture/financial-projections-architecture]] — added savings rate bridge
- Updated FEATURES-GUIDE.md and FEATURES-GUIDE.it.md with Budget section
- Updated index.md and log.md

## [2026-06-30] implement | Backup/Restore | Fixed budget + investment data coverage
- Implemented fix for 6 missing entities in backup/restore (`budgetTargets`, `brokerAccounts`, `assetHoldings`, `cashAdjustments`, `dividendEntries`, `deletedRecurringInstances`)
- Updated `src/store/backup/index.ts`:
  - Extended `BackupPayload` interface with 6 new fields
  - Updated `createBackup()` to read from actual stores (`useInvestmentStore`, `useBudgetStore`) instead of broken `(state as any)` pattern
  - Added validation for `budgetTargets`, `brokerAccounts`, `cashAdjustments`, `dividendEntries`
  - Extended `BackupPreview` summary with new entity counts
- Updated `src/store/useFinanceStore.ts`:
  - Extended `importAllData()` to write new fields to Firestore
  - Added cross-store state restoration for `useBudgetStore` and `useInvestmentStore`
- Updated `src/pages/ConfigPage.tsx` — preview dialog shows new entity counts
- Updated `src/store/types/finance.types.ts` — return type uses `BackupPreview`
- Updated [[wiki/plans/backup-restore-data-coverage]] status → **completed**
- Updated [[wiki/architecture/concerns-and-tech-debt]] — marked backup gap as fixed
- Updated [[wiki/architecture/project-state]] — moved backup gap to resolved
- Updated index.md and log.md

## [2026-06-30] audit | Backup/Restore | Budget + investment data gaps identified
- Audited backup/restore (`src/store/backup/index.ts`) for budget and investment data coverage
- **Found:** 6 entities missing from backup/restore — `budgetTargets`, `brokerAccounts`, `assetHoldings`, `cashAdjustments`, `dividendEntries`, `deletedRecurringInstances`
- Created [[raw/101-backup-restore-gaps.md]] — full gap analysis
- Created [[wiki/plans/backup-restore-data-coverage]] — implementation plan
- Updated [[wiki/architecture/concerns-and-tech-debt]] — added backup coverage gap to Known Bugs
- Updated [[wiki/architecture/project-state]] — added Known Gaps section
- Updated index.md (40 pages) and log.md

## [2026-07-03] docs | Guide | V3 features added to FEATURES-GUIDE (EN/IT)
- Updated `raw/FEATURES-GUIDE/FEATURES-GUIDE.md` — added Cash Adjustments, Dividends, Tax Pocket, and Use Real Performance sections
- Updated `raw/FEATURES-GUIDE.it/FEATURES-GUIDE.it.md` — Italian version with same V3 additions
- Updated data flow diagram in both guides with new V3 integration points
- Updated [[wiki/features/investment-tracking-guide/investment-tracking-guide]] and [[wiki/features/guida-investimenti/guida-investimenti]]

## [2026-07-05] refactor | Settings | Reorganized ConfigPage tabs by domain family
- New tab order: General → Accounts → Expenses → Incomes → Recurring → Projections → Backup
- Renamed "Balance" → "Accounts" (clearer name for bank accounts tab)
- Removed placeholder card from General tab
- Updated i18n EN/IT keys

## [2026-07-05] implement | Feature | User-Configurable Inflation & Tax Rates (#103)
- Created `useProjectionSettingsStore` — Zustand store with Firestore persistence (`projectionSettings` field on `users/{userId}`)
- Added **Projections** tab (index 6) to ConfigPage — two number fields (Inflation Rate %, Tax Rate %) with Save / Reset to Defaults
- Updated `useProjections` — reads `inflationRate` and `taxRate` from settings store; `setInflationToggle` uses configured rate; `estimatedTaxes` uses configured tax rate
- Added 6 i18n keys EN/IT under `config.*`
- Updated [[wiki/features/user-configurable-rates/user-configurable-rates]] → **implemented**
- Updated [[wiki/plans/user-configurable-rates-implementation]] → **completed**
- Updated [[wiki/architecture/user-settings-data-flow]] → **active**
- Updated index.md, log.md

## [2026-07-05] fix | Build | Removed unused SettingsContext.tsx — 2 TS6133 errors
- `SettingsContext.tsx` had 2 `tsc` errors (unused `current` params) and zero imports across the codebase
- Removed the file — `npm run build` now passes clean (0 type errors)
- Updated [[wiki/architecture/concerns-and-tech-debt]] — added dead code entry to tech debt, marked ✅ Removed

## [2026-07-05] ingest | Feature | User-Configurable Inflation & Tax Rates for Projections
- Raw source: [raw/103/103.md](raw/103/103.md) — analysis of moving from hardcoded rates to user-configurable settings
- Created [[wiki/features/user-configurable-rates/user-configurable-rates]] — feature page (draft)
- Created [[wiki/plans/user-configurable-rates-implementation]] — 6-step implementation plan (draft)
- Created [[wiki/architecture/user-settings-data-flow]] — settings architecture, Firestore schema, store design (draft)
- Updated [[wiki/features/tax-inflation-modeling/tax-inflation-modeling]] — added "Next Evolution" section linking to configurable rates
- Updated [[wiki/features/financial-projections/financial-projections]] — added Future Enhancements section
- Updated [[wiki/architecture/financial-projections-architecture]] — added "Future: Configurable Rates" section amending the no-persistence decision
- Updated index.md (47 pages), log.md

## [2026-07-03] fix | Bug | Ticker persistence — BrokerAccount ticker not saved; PAC uses brokerId as ticker (#108)
- Added `ticker: string` to `BrokerAccount` interface (`investment.types.ts`)
- Added `ticker` to `sanitizeBrokerAccount` (`sanitization/investment.ts`)
- Included `ticker` in save payload and pre-fill on edit in `BrokerSettingsModal.tsx`
- Fixed `confirmPacTransaction` to resolve ticker from `brokerAccounts` instead of using `selectedAccountId`
- Fixed `setBrokerConfig` migration, `useInvestmentSync` migration, and `converters.ts` to include `ticker`
- Updated [[wiki/bugs/ticker-persistence]] → status: **fixed**
- Updated index.md (bug status changed to fixed)
- Branch: `fix/YATF-108`
- Source: [#108](https://github.com/AlexDevsTheWeb/myfinance/issues/108)

## [2026-07-11] re-map | Codebase | Full mapping via gsd-map-codebase (4 parallel agents) — post-big-changes refresh
- Re-mapped codebase with tech, arch, quality, and concerns focus agents
- Updated raw files from `.planning/codebase/*.md` → `raw/codebase/*.md`
- Created 16 GitHub issues from refreshed concerns: [#122](https://github.com/AlexDevsTheWeb/myfinance/issues/122)–[#137](https://github.com/AlexDevsTheWeb/myfinance/issues/137)
- Closed 5 superseded old issues: #47, #49, #59, #55, #53
- Re-ingested [[wiki/architecture/tech-stack]] — TS 7 Go rewrite, MUI X Charts (no Recharts), Node 22.19.0, TS workarounds, 16+ chart components
- Re-ingested [[wiki/architecture/system-architecture]] — 4-layer diagram, 14 pages, 5 stores, 8 hooks, new anti-patterns
- Re-ingested [[wiki/architecture/codebase-structure]] — all new pages/stores/hooks, removed .github/, added agent_hub.py
- Re-ingested [[wiki/architecture/external-integrations]] — yfin.dev API, 3 Firestore subcollections, CI/CD removed, no analytics init
- Re-ingested [[wiki/conventions/coding-conventions]] — 6 error patterns, sanitization pattern, sync hook pattern, TS 7 workarounds, 3 anti-patterns
- Re-ingested [[wiki/architecture/testing-status]] — expanded unit/integration/component test targets with priorities
- Re-ingested [[wiki/architecture/concerns-and-tech-debt]] — full rewrite with GitHub issue references for every item
- Updated index.md and log.md

## [2026-07-11] ingest | Decisions | OpenSpec artifacts — TS 7 upgrade + MUI Charts migration
- Copied OpenSpec change archives to `raw/typescript-7-upgrade/` (supplemented existing analysis) and `raw/chart-migration/` (new)
- Created [[wiki/decisions/typescript-7-upgrade]] — TS 7.0 Go-rewrite adoption, benchmarks, workaround strategy
- Created [[wiki/decisions/chart-migration-mui]] — phased 3-wave migration of 16 chart components from Recharts to MUI X Charts
- Created `wiki/decisions/` directory (new category)
- Updated index.md (49 pages) and log.md
- Sources: `openspec/changes/archive/2026-07-11-*`

## [2026-07-11] ingest | Strategy | Go-to-market plan, SaaS readiness, full app review
- Created raw sources from session-generated files:
  - `raw/app-review/app-review.md` — comprehensive app audit
  - `raw/saas-readiness/saas-readiness.md` — hard blockers vs ship-as-is analysis
  - `raw/go-to-market/go-to-market.md` — 6-phase SaaS launch plan
- Created [[wiki/queries/app-review]] — strengths, weaknesses, anti-patterns, improvement areas
- Created [[wiki/decisions/saas-readiness]] — fix 6 hard blockers, ship, iterate with real users
- Created [[wiki/plans/go-to-market]] — 6 phases: quick wins → data security → beta → validate → monetize → cleanup
- Updated [[wiki/architecture/project-state]] — shifted focus from feature dev to go-to-market
- Updated [[wiki/architecture/concerns-and-tech-debt]] — linked to new strategy pages
- Updated index.md (52 pages) and log.md
- Created [#138](https://github.com/AlexDevsTheWeb/myfinance/issues/138) — GitHub issue with full plan
- Sources: `raw/app-review/`, `raw/saas-readiness/`, `raw/go-to-market/`

## [2026-07-11] ingest | Decision | PWA Strategy — mobile senza riscrittura
- Created [[wiki/decisions/pwa-strategy]] — 2-step plan: PWA subito (manifest.json + SW), Flutter solo dopo validazione
- Updated index.md (53 pages) and log.md

## [2026-07-12] implement | Phase 0 | Go-to-Market Quick Wins (#138)
- Implemented all 12 tasks of Phase 0 (Go-to-Market #138):
  - ✅ Error boundary — `src/components/ErrorBoundary.tsx`, wrapped `<App />` in `main.tsx`
  - ✅ MUI dialogs — `ConfirmDialog` + `AlertSnackbar` shared components; replaced 10 native dialogs across ConfigPage, InvestmentPage, TransactionTable
  - ✅ Loading states — added `isLoading` to `useFinanceStore` + `useInvestmentStore`; sync hooks set `isLoading = false` after first snapshot; CircularProgress on Dashboard, Transactions, Investment pages
- Created OpenSpec change `go-to-market-phase-0` with proposal, design, specs, tasks
- Created [[wiki/features/error-boundary/error-boundary]]
- Created [[wiki/features/mui-dialogs/mui-dialogs]]
- Created [[wiki/features/loading-states/loading-states]]
- Updated [[wiki/plans/go-to-market]] — Phase 0 tasks marked complete
- Updated index.md (56 pages) and log.md

## [2026-07-12] ship | Phase 0 | PR #140 + OpenSpec archive
- Created PR [#140](https://github.com/AlexDevsTheWeb/myfinance/pull/140) from `feat/YATF-138` → `development`
- Commented on [#138](https://github.com/AlexDevsTheWeb/myfinance/issues/138) with PR link
- Archived OpenSpec change `go-to-market-phase-0` → `openspec/changes/archive/2026-07-12-go-to-market-phase-0/`
- Updated [[wiki/plans/go-to-market]] — all Phase 0 checkboxes checked

## [2026-07-12] ingest | Plan | Phase 1 — Secure the Data (#138)
- Created [[raw/138-go-to-market/phase-1-analysis.md]] — codebase analysis of 3 sub-items (sub-collection migration, PAC Firestore persistence, recurring race condition) with risk assessment and recommended order (1.3 → 1.2 → 1.1)
- Updated [[wiki/plans/go-to-market]] — Phase 1 expanded with detailed sub-tasks, file references, and solution designs
- Updated index.md and log.md

## [2026-07-12] implement | Phase 1 | Go-to-Market — Recurring dedup + PAC state persistence (#138)
- Implemented 1.3 Recurring dedup: `lastGeneratedUpTo` field on `IRecurringTransaction`, `checkRecurring` uses Firestore-side dedup, session debounce in `useSyncFinance`, timestamp cooldown guard
- Implemented 1.2 PAC state persistence: `PacState` type + `pacState` field on `UserDoc`, `usePacAutomation` reads/writes Firestore instead of localStorage, `confirmPacTransaction` persists to Firestore, localStorage migration on first mount
- Updated [[wiki/plans/go-to-market]] — 1.3 and 1.2 tasks marked complete
- Created OpenSpec change `go-to-market-phase-1` with proposal, design, 3 specs, tasks
- Updated index.md and log.md

## [2026-07-12] implement | Phase 1.1 | Transaction sub-collection migration (#138)
- Implemented Phases A-C: dual-write (all CRUD + setTransactions + importAllData), backfill utility, sub-collection onSnapshot in useSyncFinance
- Phase D (remove legacy array) deferred — needs backfill confirmed for all users
- PR #140 merged to `development` (Phase 0 + 1.3 + 1.2)
- New branch `feat/YATF-138-sub-collection` — PR #141 for 1.1 only
- Updated [[wiki/plans/go-to-market]] — 1.1 sub-tasks marked complete (except Phase D)

## [2026-07-12] implement | Phase 1.1 | Phase D — Remove legacy transactions array (#138)
- Removed `transactions` from `UserDoc` interface, `toFirestore`, and `fromFirestore` in `converters.ts`
- Removed legacy array `updateDoc` from all CRUD functions (`addTransaction`, `updateTransaction`, `deleteTransaction`, `setTransactions`, `importAllData`) — sub-collection is now the sole persistence layer
- Updated `useSyncFinance` — removed `transactions` destructure from doc listener (field no longer exists on doc)
- Updated `sync/index.ts` — `getDefaultUserConfig` no longer includes empty transactions array
- Backfill utility preserved with type-safe legacy read for any remaining cleanup
- Backup/restore unaffected: backup reads store (sub-collection populated), restore writes to sub-collection via batch
- Only safe because single user with backups confirmed

## [2026-07-16] bug | Critical | Yearly recurring transactions ignore `monthOfYear` — generated in wrong month
- Discovered Google One subscription (yearly) invisible in dashboard
- Root cause: `checkRecurring()` in `src/store/useFinanceStore.ts:837` never reads `payload.monthOfYear`
- Created [[raw/recurring-transaction-monthofyear/recurring-transaction-monthofyear.md]] — full analysis with root cause, impact, proposed fix
- Created [[wiki/bugs/recurring-transaction-monthofyear]] — status: **open**, severity: **critical**
- Secondary issues documented: `lastGeneratedUpTo` not persisted, yearly dedup blocking correct re-gen
- Updated index.md (57 pages) and log.md
- Created GitHub issue to track

## [2026-07-16] fix | Bug | #142 — monthOfYear fix implemented
- Implemented fix in `src/store/useFinanceStore.ts`:
  - Added `monthOfYear` read in target date computation for yearly transactions (lines 862-868)
  - Added auto-cleanup of existing wrong-date yearly instances (lines 826-842)
  - Persists cleanup to Firestore even when no new transactions generated
- Updated [[wiki/bugs/recurring-transaction-monthofyear]] → status: **fixed**
- Updated index.md and log.md

## [2026-07-16] fix | Bug | #142 — sub-collection write fix (follow-up)
- `checkRecurring()` was still writing to legacy `UserDoc.transactions` field (ignored after Phase 1.1 migration)
- Changed to `writeBatch` on sub-collection via `getTransactionsCollectionRef()` — matches `setTransactions` pattern
- Builds batch from `getState().transactions` to capture all corrected/generated transactions
- Updated [[wiki/bugs/recurring-transaction-monthofyear]] — added Fix 3 to implemented fix section

## [2026-07-16] fix | Bug | #146 — duplicates alongside manually-added transactions
- Root cause: `existsInPeriod` dedup in `checkRecurring()` skipped manual transactions (no `recurringLinkId`)
- Broadened check to match by `description` + `amount` in same period as fallback
- Created [[raw/recurring-duplicate-same-period/recurring-duplicate-same-period.md]]
- Created [[wiki/bugs/recurring-transaction-duplicates-same-period]]
- Cross-linked both bug pages
- Updated index.md (58 pages) and log.md
- GitHub issue [#146](https://github.com/AlexDevsTheWeb/myfinance/issues/146)

## [2026-07-16] fix | Bug | #146 — checkRecurring never ran: isInitializing guard blocked UserDoc onSnapshot
- The `!isInitializing.current` guard prevented UserDoc `onSnapshot` from EVER processing initial data
- `isInitializing=true` during `initializeUser()`, handler returns early → `hasCheckedRecurring` never set → no path triggers `checkRecurring()`
- Sub-collection `onSnapshot` also blocked if it fires before `initializeUser()` completes
- Removed `isInitializing` guard from UserDoc handler (initial load dedup via `hasLoaded` ref already prevents double-processing)
- Added safety trigger in `initializeUser()` `finally` block
- User confirmed 5 copies per month persisted because `checkRecurring()` simply never ran

## [2026-07-16] fix | Bug | #146 — corrected root cause: race condition (not manual-tx dedup)
- Previous hypothesis was wrong (description+amount matching in `existsInPeriod` reverted)
- Actual root cause: UserDoc `onSnapshot` fires `checkRecurring()` before sub-collection snapshot loads
  → `transactions = []` → every period looks missing → generates new txs → sub-collection snapshot overwrites them → lost → repeat on every page load → 5 copies accumulate
- Fix 1: timing guard — `checkRecurring()` waits for **both** UserDoc AND sub-collection snapshots
- Fix 2: dedup cleanup — removes extra copies by `recurringLinkId|date` before generation
- Verified: 487 total txs, 345 unique, x5 on recurring entries like Google One, Netflix
- Updated [[raw/recurring-duplicate-same-period/recurring-duplicate-same-period.md]]
- Updated [[wiki/bugs/recurring-transaction-duplicates-same-period]]
- Updated index.md and log.md

## [2026-07-18] ingest | Plan | Beta Launch Playbook
- Moved `raw/beta-launch-playbook.md` → `raw/beta-launch-playbook/beta-launch-playbook.md` (subfolder per convention)
- Created [[wiki/plans/beta-launch-playbook]] — English translation with 3 sections: beta disclaimer component, backup/restore verification protocol (post sub-collection migration), tester invitation template
- Updated [[wiki/plans/go-to-market]] — Phase 2 now links to beta playbook, added detailed checkboxes
- Updated [[wiki/plans/backup-restore-data-coverage]] — cross-reference to beta playbook verification protocol
- Updated index.md (59 pages) and log.md

## [2026-07-18] implement | Plan | #149 — Beta disclaimer banner
- Created branch `feat/YATF-149-beta-disclaimer`
- Added `betaDisclaimer` + `betaDisclaimerText` i18n keys to en.json and it.json
- Added `<Alert severity="warning">` component to DashboardPage.tsx (after title, before mileage reminder)
- Build passes clean
- PR [#151](https://github.com/AlexDevsTheWeb/myfinance/pull/151) → development
- Updated [[wiki/plans/beta-launch-playbook]] → Section 1 marked ✅
- Updated [[wiki/plans/go-to-market]] → Phase 2 disclaimer checkbox checked

## [2026-07-18] ingest | Feature | Balancr rebranding — identity system + app rename
- Moved `raw/balancr_identity_system.md` → `raw/balancr-identity-system/balancr-identity-system.md` (subfolder convention)
- Created [[wiki/features/balancr-branding/balancr-branding]] — complete rebrand feature page
- Created [[wiki/decisions/balancr-identity-system]] — Linked Hexagons identity design decision
- Updated index.md (61 pages) and log.md
- Source: [raw/balancr-identity-system/balancr-identity-system.md](raw/balancr-identity-system/balancr-identity-system.md)

## [2026-07-18] query | "What happens when a new user logs in via Google Auth?"
- Analyzed full auth flow: LoginPage → onAuthStateChanged → 3 sync hooks → Firestore init
- Confirmed data isolation is solid: Firestore rules enforce `request.auth.uid == userId` on all paths
- Found 6 concerns (silent login errors, no account deletion, 3 concurrent transactions, no onboarding, _migrateToMultiAccount on mount, no rate limiting)
- Created [[raw/new-user-auth-flow/new-user-auth-flow.md]] — full analysis
- Created [[wiki/queries/new-user-auth-flow]] — summary with findings
- Updated [[wiki/architecture/external-integrations]] — added transactions subcollection, updated subcollection count
- Updated [[wiki/architecture/concerns-and-tech-debt]] — added 3 new security concerns from findings
- Updated index.md (62 pages) and log.md

## [2026-07-18] implement | Feature | Balancr — theme migration, UI polish
- Migrated ~160 hardcoded color refs across 45+ files to MUI theme tokens
- Replaced `#6366f1`/`#5b6cb8` → `primary.main`, `#0f172a` → `background.default`, `#1e293b` → `background.paper`
- Consolidated chart palettes into `theme.chart.palette` (5 components)
- Removed empty AppBar on desktop; mobile hamburger preserved
- Added global `cursor: pointer` via MuiButtonBase theme override
- Enlarged sidebar logo (56px collapsed, 48px expanded)
- Updated [[wiki/features/balancr-branding/balancr-branding]] — added theme migration + UI polish sections
- Updated index.md and log.md

## [2026-07-18] verify | Plan | #150 — Backup/Restore verification protocol
- Analyzed `createBackup()` (reads from Zustand store populated by sub-collection `onSnapshot`) — ✅
- Analyzed `importAllData()` (writes to sub-collection via `batch.set()`) — ✅
- Confirmed `batch.set()` by ID provides idempotent re-import — ✅
- No code changes required; all 3 code-level AC pass
- Manual staging test (AC #4) documented for future execution
- Closed [#150](https://github.com/AlexDevsTheWeb/myfinance/issues/150) with verification comment
- Updated [[wiki/plans/beta-launch-playbook]] → Section 2 marked ✅
- Updated [[wiki/plans/go-to-market]] → Phase 2 verification checkbox checked

## [2026-07-18] migrate | OKF Compliance | Open Knowledge Format v0.1
- Applied OKF frontmatter (`type`, `description`) to all 63 wiki pages
- Created 8 subdirectory `index.md` files: architecture, bugs, conventions, decisions, features, plans, queries, references
- Updated root `index.md` with OKF frontmatter (`type: Index`, `description`, `timestamp`)
- Updated root `log.md` with OKF frontmatter (`type: Log`, `description`)
- Updated [[wiki/AGENTS.md]] with OKF-compliant frontmatter template
- Script archived at `docs/YATF/scripts/okf_migrate.py`
- Reference: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

## [2026-07-18] migrate | OKF Hardening | Templates, pre-commit hook, resource fields, wiki index
- Updated AGENTS.md: OKF frontmatter on AGENTS.md itself (type: Schema)
- Updated AGENTS.md: page templates now include full OKF frontmatter (type, description, resource)
- Updated AGENTS.md: ingest workflow hardened — explicit steps for type, description, resource, subdir index update
- Updated AGENTS.md: lint workflow now starts with `python3 docs/YATF/scripts/okf_migrate.py --check`
- Updated okf_migrate.py: added --check / --dry-run mode (exits 1 if violations, 0 if clean)
- Added resource: field to 16 pages sourced from GitHub issues
- Created docs/YATF/templates/feature.md — OKF-compliant Feature template
- Created docs/YATF/templates/bug.md — OKF-compliant Bug template
- Created docs/YATF/templates/decision.md — OKF-compliant Decision template
- Created docs/YATF/templates/plan.md — OKF-compliant Plan template
- Created docs/YATF/wiki/index.md — wiki root category index for progressive agent traversal
- Created docs/YATF/scripts/pre-commit-hook.sh + installed to .git/hooks/pre-commit
- Ran --check: ✅ 0 violations

## [2026-07-19] ingest | Feature | Dynamic Portfolio Chart
- Created [[raw/dynamic-portfolio-chart/dynamic-portfolio-chart.md]] — full impact analysis for per-ticker pricing + snapshot recomputation
- Created [[wiki/features/dynamic-portfolio-chart/dynamic-portfolio-chart]] — feature page with problem, solution, and scope
- Opened GitHub [Issue #160](https://github.com/AlexDevsTheWeb/myfinance/issues/160)
- Updated index.md (63 pages), features/index.md
- Source: [raw/dynamic-portfolio-chart/dynamic-portfolio-chart.md](raw/dynamic-portfolio-chart/dynamic-portfolio-chart.md)

## [2026-07-26] fix | Bugs | Charts UI — layout, padding, label cutoff, broken investment link
- Ingested [[raw/bugs/charts-ui/charts-ui.md]] → created [[wiki/bugs/charts-ui]]
- **Root cause:** MUI X Charts SVG has `overflow: hidden` → labels outside viewport clipped regardless of container CSS
- **Core fix:** added `sx={{ overflow: 'visible' }}` to `ChartsSurface` (6 files) and convenience chart components (8 files) — stops SVG viewport from clipping labels
- Adjusted margins on 12 chart files: reduced `left` padding (50→30-35), increased `bottom` for legend-bearing charts (30→50), increased `right` on some (10→20)
- Fixed 3 pie charts: increased `outerRadius` 100-110 → 120, added `overflow: visible`
- Fixed broken investment link in `DashboardPage.tsx`: `/invest` → `/investments`
- `npm run build` passes clean (0 errors)
- Updated index.md (65 pages) and log.md

## [2026-07-26] ship | Phase 1 | Archived OpenSpec change `go-to-market-phase-1`
- Marked task 4.3 (verify sub-collection data matches array data) as done — validated implicitly via working `onSnapshot` listener
- Archives: `openspec/changes/archive/2026-07-26-go-to-market-phase-1/`
- Main specs updated: pac-state-persistence, recurring-dedup, transaction-sub-collection
- Updated [[wiki/plans/go-to-market]] — Phase 1.1 all tasks checked
- Updated index.md and log.md

## [2026-07-19] research | Plan | Daily Historical Portfolio Chart
- Created [[raw/daily-historical-chart/daily-historical-chart.md]] — research & spec for daily time series chart
- Created [[wiki/plans/daily-historical-chart/daily-historical-chart]] — plan page with API research and design
- Updated index.md (64 pages), plans/index.md
- Source: [raw/daily-historical-chart/daily-historical-chart.md](raw/daily-historical-chart/daily-historical-chart.md)

## [2026-07-26] ingest | Feature | Card Plafond Tracking — Issue #165
- Created [[raw/165-card-plafond-tracking/165-card-plafond-tracking.md]] from GitHub [Issue #165](https://github.com/AlexDevsTheWeb/myfinance/issues/165)
- Created [[wiki/features/card-plafond-tracking/card-plafond-tracking]] — per-card plafond tracking feature page
- Updated index.md (67 pages), wiki/features/index.md, and log.md
- Source: [raw/165-card-plafond-tracking/165-card-plafond-tracking.md](raw/165-card-plafond-tracking/165-card-plafond-tracking.md)

## [2026-07-26] implement | Feature | Card Plafond Tracking — Issue #165 (PR pending)
- Implemented full card plafond tracking on `feat/YATF-165`
- Data layer: `ICard` interface, `cardId` on `ITransaction`, CRUD actions in store, Firestore converters
- UI: card management in ConfigPage > Accounts tab, card dropdown on transaction form, card utilization widget on dashboard, card filter + sort toggle on transactions page
- Created OpenSpec change `card-plafond-tracking` with proposal, design, specs, tasks
- Updated [[wiki/features/card-plafond-tracking/card-plafond-tracking]] → status: **implemented**
- Updated index.md (mark card-plafond as implemented) and log.md

## [2026-08-03] ingest | Bug | Card Utilization counter €0 — Issue #168
- Analyzed GitHub [Issue #168](https://github.com/AlexDevsTheWeb/myfinance/issues/168) — home page card counter stuck at €0
- Created [[raw/bugs/card-counter-zero/card-counter-zero.md]] — root cause: strict `isAfter`/`isBefore` exclude expenses dated on the billing reset day
- Created [[wiki/bugs/card-counter-zero]] — bug page (status: investigating)
- Updated index.md, wiki/bugs/index.md, and [[wiki/features/card-plafond-tracking/card-plafond-tracking]] (related link)

## [2026-08-03] fix | Bug | Card Utilization counter €0 — Issue #168
- Fixed `src/components/dashboard/RecapCards.tsx` — billing window made inclusive of the reset day (`valueOf() >= periodStart` instead of strict `isAfter`)
- Reset-day expenses now count toward the current period's spent; next period stays exclusive
- Verified: simulation passes, `npm run build` clean, no new lint issues
- Updated [[wiki/bugs/card-counter-zero]] → status: **fixed**; updated index.md, wiki/bugs/index.md

## [2026-08-03] ingest | Feature | Card Selection for Recurring Expenses
- Created [[raw/recurring-card-selection/recurring-card-selection.md]] — design doc for card selection on recurring expense templates (future-only propagation)
- Created [[wiki/features/recurring-card-selection/recurring-card-selection]] — feature page, status: **planned**
- Updated [[wiki/features/card-plafond-tracking/card-plafond-tracking]] — cross-linked to recurring-card-selection
- Updated index.md (68 pages), wiki/features/index.md, and log.md
- Source: [raw/recurring-card-selection/recurring-card-selection.md](raw/recurring-card-selection/recurring-card-selection.md)

## [2026-08-03] fix | Bug | #168 resurfaced — Card Utilization drops credit card expenses on reset day
- Reported: debit card counter OK, credit card counter €0 despite existing expenses (credit `billingDay: 1`, expenses dated Aug 1)
- Root cause: the #168 fix lived only on `fix/YATF-168`; **PR #169 was unmerged** so branches based on `development` still had the strict-window bug
- Re-applied inclusive-window fix locally; verified boundary logic and build clean
- PR #169 later **merged to `development`** (2026-08-03) — fix now permanent; this branch merged `origin/development`
- Note: no duplicate bug docs created — canonical #168 pages already on `development` via PR #169
