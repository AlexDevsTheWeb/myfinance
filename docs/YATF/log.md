# Wiki Log

## [2026-06-27] ingest | Guide | Investment Tracking & Financial Projections guides updated with Phase 12 enhancements
- Updated [[features/investment-tracking-guide]] from `raw/FEATURES-GUIDE.md` — added multi-broker, CRUD transactions, PAC automation, historical snapshots, ticker validation, inflation adjustment
- Updated [[features/guida-investimenti]] from `raw/FEATURES-GUIDE.it.md` — Italian version with same enhancements
- Added cross-references to 6 new V2 feature pages in both guides
- Updated index.md cross-references
- Source: [raw/FEATURES-GUIDE.md](raw/FEATURES-GUIDE.md), [raw/FEATURES-GUIDE.it.md](raw/FEATURES-GUIDE.it.md)

## [2026-06-27] plan | Phase 12 | Investment Tracking V2 — GSD planning complete
- Created `.planning/ROADMAP.md` with all phases (1–12) in GSD format
- Created `.planning/phases/12-investment-tracking-v2/12-CONTEXT.md` with 15 locked decisions
- Spawned `gsd-phase-researcher` → `12-RESEARCH.md` (1058 lines, multi-broker migration path, codebase analysis)
- Spawned `gsd-planner` → 6 plans across 5 waves (12-01 through 12-06)
- Spawned `gsd-plan-checker` → `12-VERIFICATION.md` — 2 blockers found and resolved
- Updated [[plans/investment-tracking-v2-enhancements]] with GSD plan table
- Updated `.planning/ROADMAP.md` with plan list and progress table

## [2026-06-27] ingest | Feature | 6 V2 GitHub issues ingested into wiki
- Created 6 GitHub issues from `raw/ux-improvments.md`: [#89](https://github.com/AlexDevsTheWeb/myfinance/issues/89) PAC Automation, [#90](https://github.com/AlexDevsTheWeb/myfinance/issues/90) CRUD Transactions, [#91](https://github.com/AlexDevsTheWeb/myfinance/issues/91) Multi-Broker, [#92](https://github.com/AlexDevsTheWeb/myfinance/issues/92) Historical Snapshots, [#93](https://github.com/AlexDevsTheWeb/myfinance/issues/93) Tax & Inflation, [#94](https://github.com/AlexDevsTheWeb/myfinance/issues/94) Ticker Validation
- Saved issue files to `raw/89-pac-automation/`, `raw/90-crud-transactions/`, `raw/91-multi-broker/`, `raw/92-historical-snapshots/`, `raw/93-tax-inflation/`, `raw/94-ticker-validation/`
- Created [[features/pac-automation]], [[features/crud-etf-transactions]], [[features/multi-broker-architecture]], [[features/historical-snapshots]], [[features/tax-inflation-modeling]], [[features/ticker-validation]]
- Updated [[plans/investment-tracking-v2-enhancements]] with issue cross-reference table
- Updated index.md (28 pages) and log.md

## [2026-06-27] plan | Phase 12 | Investment Tracking V2 — GSD planning complete
- Created `.planning/ROADMAP.md` with all phases (1–12) in GSD format
- Created `.planning/phases/12-investment-tracking-v2/12-CONTEXT.md` with 15 locked decisions
- Spawned `gsd-phase-researcher` → `12-RESEARCH.md` (1058 lines, multi-broker migration path, codebase analysis)
- Spawned `gsd-planner` → 6 plans across 5 waves (12-01 through 12-06)
- Spawned `gsd-plan-checker` → `12-VERIFICATION.md` — 2 blockers found and resolved
- Updated [[plans/investment-tracking-v2-enhancements]] with GSD plan table and Phase 12 reference
- Updated index.md

## [2026-06-27] ingest | Guide | Investment Tracking & Financial Projections User Guides
- Created [[features/investment-tracking-guide]] from `raw/FEATURES-GUIDE.md`
- Created [[features/guida-investimenti]] from `raw/FEATURES-GUIDE.it.md` (Italian, linked to EN version)
- Created [[plans/investment-tracking-v2-enhancements]] from `raw/ux-improvments.md` — PAC automation, CRUD, multi-broker, historical snapshots, tax modeling, ticker validation
- Updated [[features/investment-tracking]] — added cross-refs to guides and V2 plan
- Updated [[features/financial-projections]] — added cross-refs to guides and V2 plan
- Updated [[architecture/investment-tracking-architecture]] — added V2 schema direction section with `BrokerAccount`/`AssetHolding` types
- Updated index.md (3 new pages)
- Source: [raw/FEATURES-GUIDE.md](raw/FEATURES-GUIDE.md), [raw/FEATURES-GUIDE.it.md](raw/FEATURES-GUIDE.it.md), [raw/ux-improvments.md](raw/ux-improvments.md)

## [2026-06-22] ingest | Bulk | Initial wiki population (12 sources)
- Created [[features/car-management-redesign]] from `raw/SPEC.md`
- Created [[plans/roadmap]] from `raw/ROADMAP.md`
- Created [[architecture/project-state]] from `raw/STATE.md`
- Created [[plans/car-redesign-implementation]] from `raw/PLANS.md`
- Created [[architecture/tech-stack]] from `raw/codebase/STACK.md`
- Created [[architecture/codebase-structure]] from `raw/codebase/STRUCTURE.md`
- Created [[architecture/system-architecture]] from `raw/codebase/ARCHITECTURE.md`
- Created [[conventions/coding-conventions]] from `raw/codebase/CONVENTIONS.md`
- Created [[architecture/external-integrations]] from `raw/codebase/INTEGRATIONS.md`
- Created [[architecture/testing-status]] from `raw/codebase/TESTING.md`
- Created [[architecture/concerns-and-tech-debt]] from `raw/codebase/CONCERNS.md`
- Created [[references/llm-wiki-pattern]] from `raw/original LLM Wiki.md`
- Created index.md and log.md

## [2026-06-22] docs | Conventions | Created branch-strategy page
- Created [[conventions/branch-strategy]] with new branch rules
- Updated AGENTS.md to reference the wiki page as source of truth
- Updated [[conventions/coding-conventions]] to point to the dedicated page
- Updated CLAUDE.md branch strategy section to reference the wiki

## [2026-06-22] docs | CI/CD + Versioning | Audit and documentation
- Fixed `firebase-hosting-pull-request.yml` — restricted to PRs targeting `main` only (was triggering on all PRs including to `development`)
- Updated [[architecture/external-integrations]] with deployment rules table
- Created [[architecture/versioning]] with version scheme, .versionrc mapping, and release pipeline
- Updated index.md

## [2026-06-22] spec | Feature | Transaction Layout Improvement
- Created [[features/transaction-layout-improvement]] from [#80](https://github.com/AlexDevsTheWeb/myfinance/issues/80)
- Created [[plans/transaction-layout-implementation]] with step-by-step tasks
- Updated index.md

## [2026-06-22] re-map | Codebase | Full mapping via gsd-map-codebase (4 parallel agents)
- Re-mapped codebase with tech, arch, quality, and concerns focus agents
- Updated raw files from `.planning/codebase/*.md` → `raw/codebase/*.md`
- Re-ingested [[architecture/tech-stack]] — React ^19.2.6, MUI ^9.0.1, Vite ^8.0.13, version 2026.2.1, standard-version
- Re-ingested [[architecture/external-integrations]] — GitHub Actions CI/CD, i18n details, env vars, Google Fonts
- Re-ingested [[architecture/system-architecture]] — 7-layer architecture, analytics layer, startup flow, recurring check flow
- Re-ingested [[architecture/codebase-structure]] — analytics/ directory, barrel files, .nvmrc, where-to-add-guide
- Re-ingested [[conventions/coding-conventions]] — import patterns, ESLint config, component structure, barrel exports
- Re-ingested [[architecture/testing-status]] — comprehensive test candidate tables, recommended Vitest setup
- Re-ingested [[architecture/concerns-and-tech-debt]] — 15+ issues, 3 new bugs, dnd-kit version mismatch, pro license risk

## [2026-06-26] ingest | Feature | Investment Tracking & Broker Integration
- Created [[features/investment-tracking]] from `raw/81-tax-refund/import.md` and `raw/81-tax-refund/tr-code.md`
- Renamed `raw/81-rax-refund` → `raw/81-tax-refund` (fix typo)
- Updated index.md

## [2026-06-26] plan | Feature | Investment Tracking — Phase 10 planning
- Updated [[features/investment-tracking]] to status: in-progress with planning details
- Created [[plans/investment-tracking-implementation]] — 6 plans across 4 waves
- Created [[architecture/investment-tracking-architecture]] — data flow, Firestore schema, component tree
- Updated [[plans/roadmap]] with Phase 10 entry
- Updated index.md

## [2026-06-26] implement | Feature | Investment Tracking — Phase 10 complete
- Implemented all 6 plans across 4 waves on `feat/investment-tracking`
- 17 files created, 15 files modified (types, store, transaction flow, broker modal, portfolio page, market data, routing, i18n)
- Updated [[features/investment-tracking]] to status: **implemented**
- Updated [[plans/investment-tracking-implementation]] to status: **completed**
- Updated [[architecture/investment-tracking-architecture]] to status: **active**
- Updated index.md

## [2026-06-26] implement | Feature | Investment Tracking — ConfigPage toggle
- Added `investmentTracking` toggle switch to `ConfigPage.tsx` (module was `false` by default with no UI to enable it)
- Added `config.investmentTracking` translation key to `en.json` and `it.json`
- Updated [[features/investment-tracking]] with note about Settings toggle requirement

## [2026-06-26] ingest | Feature | Financial Projections & Compound Interest Simulator
- Created [[features/financial-projections]] from [#83](https://github.com/AlexDevsTheWeb/myfinance/issues/83)
- Created [[architecture/financial-projections-architecture]] — simulation data flow, component tree, design decisions
- Created [[plans/financial-projections-implementation]] — 3 plans for engine, UI shell, routing + i18n
- Updated index.md

## [2026-06-26] plan | Feature | Financial Projections — Phase 11 planning
- Created `.planning/phases/11-financial-projections/`
- Created `11-CONTEXT.md` — 20 locked decisions, canonical refs, domain boundary
- Created `11-RESEARCH.md` — architecture patterns, pitfalls, code examples, standard stack
- Created `11-01-PLAN.md` — Simulation engine + types (wave 1)
- Created `11-02-PLAN.md` — UI shell: controls, chart, summary cards (wave 2)
- Created `11-03-PLAN.md` — Hook, routing, i18n, optional prefill (wave 3)
- Updated [[plans/financial-projections-implementation]]

## [2026-06-26] implement | Feature | Financial Projections — Phase 11 complete (PR #88)
- Implemented all 3 plans across 3 waves on `feat/YATF-83`
- 9 files created, 5 files modified (types, engine, UI shell, hook, routing, nav, i18n)
- Created [[features/financial-projections]] status → **implemented**
- Updated [[plans/financial-projections-implementation]] status → **completed**
- Updated [[architecture/financial-projections-architecture]] status → **active**
- Updated index.md
- Source: [raw/83-financial-projections/implementation.md](raw/83-financial-projections/implementation.md)

## [2026-06-28] ingest | Feature | Investment Tracking V3 — Dividend, Tax, Performance
- Created [[raw/98-investment-tracking-v3/issue.md]] from GitHub [Issue #98](https://github.com/AlexDevsTheWeb/myfinance/issues/98)
- Created [[features/investment-tracking-v3]] — 4 sub-features (dividend ledger, capital gains tax, performance prefill, cash adjustments)
- Created [[plans/investment-tracking-v3-implementation]] — architecture analysis and recommended implementation order
- Updated [[architecture/investment-tracking-architecture]] — added V3 section, new transaction types in classification table
- Updated index.md (30 pages) and log.md

## [2026-06-27] implement | Feature | Investment Tracking V2 — Phase 12 complete (PR #95)
- Implemented 6 plans across 4 waves on `feat/phase-12-investment-tracking-v2`
- 24 execution commits, 4 files created, ~30 files modified
- Created [[features/multi-broker-architecture]] status → **implemented**
- Created [[features/crud-etf-transactions]] status → **implemented**
- Created [[features/historical-snapshots]] status → **implemented**
- Created [[features/pac-automation]] status → **implemented**
- Created [[features/tax-inflation-modeling]] status → **implemented**
- Created [[features/ticker-validation]] status → **implemented**
- Updated [[plans/investment-tracking-v2-enhancements]] status → **completed**
- Updated [[architecture/investment-tracking-architecture]] with V2 schema, store, component tree, migration layer
- Updated index.md
- Source: [raw/12-investment-tracking-v2/implementation.md](raw/12-investment-tracking-v2/implementation.md)

## [2026-06-28] implement | Feature | Investment Tracking V3 — Wave 1+2+3
- Implemented V3 data layer: `CashAdjustment`, `DividendEntry` types, store actions, validation, sanitization, Firestore sync + rules
- Updated cash balance formula in `usePortfolio` to include adjustments and dividends
- Created components: `CashAdjustmentDialog`, `DividendDialog`, `DividendBadge`, `TaxPocketWidget`
- Created `useTaxTracking` hook with 26% Italian capital gains computation per year
- Integrated all new components into `InvestmentPage`
- Added i18n keys (EN/IT) for dividends, cash adjustments, and tax tracking
- Updated [[features/investment-tracking-v3]] status → **in-progress**
- Updated [[plans/investment-tracking-v3-implementation]] status → **in-progress**
- Updated [[architecture/investment-tracking-architecture]] with V3 section and new transaction types

## [2026-06-28] plan | Feature | Dynamic Performance Prefill — Wave 4 analysis
- Added CAGR analysis to [[plans/investment-tracking-v3-implementation]] — computation logic, UX flow, layer breakdown
- Updated [[features/investment-tracking-v3]] with Wave 4 implementation notes
- Updated index.md

## [2026-06-28] implement | Feature | Dynamic Performance Prefill — Wave 4 complete
- Added `computeCAGR()` to `compoundInterestUtils.ts` — annualized return from portfolio snapshot time series
- Extended `useProjections` with `useRealPerformance` toggle — overrides `etfAnnualReturn` with real CAGR when active
- Updated `ProjectionControls` — "Use Real Performance" switch disables ETF slider, shows computed CAGR
- Wired toggle through `ProjectionsPage`
- Updated [[plans/investment-tracking-v3-implementation]] status → **completed**
- Updated [[features/investment-tracking-v3]] status → **implemented**

## [2026-06-28] ingest | Feature | Budget & Savings Rate Engine V4 — Issue #100
- Created [[raw/100-budget-savings-engine/issue.md]] from GitHub [Issue #100](https://github.com/AlexDevsTheWeb/myfinance/issues/100)
- Created [[features/budget-savings-engine]] — 3 sub-features (budget config, Recharts visualizations, savings rate engine)
- Created [[architecture/budget-savings-architecture]] — data flow, Firestore schema, store architecture, component tree, charting, integration points
- Created [[plans/budget-savings-engine-implementation]] — 6 waves, 11 new files, 10 modified files, with full architecture analysis
- Updated [[architecture/investment-tracking-architecture]] — added budget integration section (surplus → investment bridge)
- Updated [[architecture/financial-projections-architecture]] — added savings rate bridge section
- Updated index.md (33 pages) and log.md

## [2026-06-28] docs | Guide | V3 features added to FEATURES-GUIDE (EN/IT)
- Updated `raw/FEATURES-GUIDE.md` — added Cash Adjustments, Dividends, Tax Pocket, and Use Real Performance sections
- Updated `raw/FEATURES-GUIDE.it.md` — Italian version with same V3 additions
- Updated data flow diagram in both guides with new V3 integration points
- Updated [[features/investment-tracking-guide]] and [[features/guida-investimenti]]
