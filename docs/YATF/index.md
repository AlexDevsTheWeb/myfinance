# Wiki Index

*Last updated: 2026-06-30* (Backup/restore data coverage audit)
*Total pages: 40*

---

## Features

| Page | Summary | Sources |
|------|---------|---------|
| [[features/car-management-redesign]] | Car page bento grid redesign with monthly averages | [`raw/SPEC.md`](raw/SPEC.md) |
| [[features/transaction-layout-improvement]] | Two-column transaction layout with filter + chart on left | [#80](https://github.com/AlexDevsTheWeb/myfinance/issues/80) |
| [[features/investment-tracking]] | ✅ ETF portfolio tracking, broker integration, PAC strategy, and asset-vs-expense separation | [`raw/81-tax-refund/`](raw/81-tax-refund/) |
| [[features/financial-projections]] | ✅ Compound interest simulator with parametric sliders and real-time chart | [`#83`](https://github.com/AlexDevsTheWeb/myfinance/issues/83) |
| [[features/investment-tracking-guide]] | 📘 User guide — Investment, Projections & Budget (EN) | [`raw/FEATURES-GUIDE.md`](raw/FEATURES-GUIDE.md) |
| [[features/guida-investimenti]] | 📘 Guida utente — Investimenti, Proiezioni e Budget (IT) | [`raw/FEATURES-GUIDE.it.md`](raw/FEATURES-GUIDE.it.md) |
| [[features/pac-automation]] | ✅ Automated recurring PAC transactions with confirmation UI | [`#89`](https://github.com/AlexDevsTheWeb/myfinance/issues/89) |
| [[features/crud-etf-transactions]] | ✅ Edit/delete ETF transactions with safe cascade recalculation | [`#90`](https://github.com/AlexDevsTheWeb/myfinance/issues/90) |
| [[features/multi-broker-architecture]] | ✅ Multi-broker & multi-asset schema refactor with BrokerSelect | [`#91`](https://github.com/AlexDevsTheWeb/myfinance/issues/91) |
| [[features/historical-snapshots]] | ✅ Persistent portfolio history in Firestore subcollection | [`#92`](https://github.com/AlexDevsTheWeb/myfinance/issues/92) |
| [[features/tax-inflation-modeling]] | ✅ Inflation-adjusted projections with real vs nominal toggle | [`#93`](https://github.com/AlexDevsTheWeb/myfinance/issues/93) |
| [[features/ticker-validation]] | ✅ Yahoo Finance ticker validation at broker config save | [`#94`](https://github.com/AlexDevsTheWeb/myfinance/issues/94) |
| [[features/investment-tracking-v3]] | ✅ V3: Dividend ledger, capital gains tax, cash adjustments, performance prefill | [`#98`](https://github.com/AlexDevsTheWeb/myfinance/issues/98) |
| [[features/budget-savings-engine]] | ✅ V4: Budget targets, progress tracking, savings rate engine, investment bridge | [`#100`](https://github.com/AlexDevsTheWeb/myfinance/issues/100) |
| [[features/dashboard-redesign]] | ✅ Dashboard split, account detail dialog, additional charts, overview stat cards | [`#99`](https://github.com/AlexDevsTheWeb/myfinance/issues/99) |
| [[features/sidebar-redesign]] | ✅ Vertical left sidebar with grouped navigation, collapsible mode, avatar | [`#99`](https://github.com/AlexDevsTheWeb/myfinance/issues/99) |

## Plans

| Page | Summary | Sources |
|------|---------|---------|
| [[plans/roadmap]] | Project roadmap with phases, status, and priorities | [`raw/ROADMAP.md`](raw/ROADMAP.md) |
| [[plans/car-redesign-implementation]] | Step-by-step implementation plan for car management redesign | [`raw/PLANS.md`](raw/PLANS.md) |
| [[plans/transaction-layout-implementation]] | Implementation plan for transaction page layout restructure | [#80](https://github.com/AlexDevsTheWeb/myfinance/issues/80) |
| [[plans/investment-tracking-implementation]] | 6-plan implementation for ETF tracking, broker integration, PAC strategy | [`.planning/phases/10-investment-tracking/`](.planning/phases/10-investment-tracking/) |
| [[plans/financial-projections-implementation]] | ✅ 3-plan implementation for simulation engine, UI shell, routing + i18n | [`raw/83-financial-projections/issue.md`](raw/83-financial-projections/issue.md) |
| [[plans/investment-tracking-v2-enhancements]] | ✅ Phase 12 complete — 6 GSD plans implemented (multi-broker, CRUD, PAC, snapshots, inflation, ticker) | [`.planning/phases/12-investment-tracking-v2/`](.planning/phases/12-investment-tracking-v2/) |
| [[plans/investment-tracking-v3-implementation]] | ✅ V3 implementation: dividend, tax, cash adjustments, performance prefill | [`#98`](https://github.com/AlexDevsTheWeb/myfinance/issues/98) |
| [[plans/budget-savings-engine-implementation]] | ✅ V4 Budget & Savings Rate implementation: 6 waves, 11 new files, 10 modified | [`#100`](https://github.com/AlexDevsTheWeb/myfinance/issues/100) |
| [[plans/manual-review-99-implementation]] | ✅ 5-wave plan: bug fixes, padding, account dialog, dashboard charts, sidebar | [`#99`](https://github.com/AlexDevsTheWeb/myfinance/issues/99) |
| [[plans/backup-restore-data-coverage]] | Plan to add missing budget + investment data to backup/restore | [`raw/101-backup-restore-gaps.md`](raw/101-backup-restore-gaps.md) |

## Bugs

| Page | Summary | Sources |
|------|---------|---------|
| [[bugs/car-statistics-year]] | ✅ Car page "Statistics {year}" shows literal `{year}` instead of the year value — fixed | [`#99`](https://github.com/AlexDevsTheWeb/myfinance/issues/99) |

## Architecture

| Page | Summary | Sources |
|------|---------|---------|
| [[architecture/project-state]] | Current project state, focus, and next steps | [`raw/STATE.md`](raw/STATE.md) |
| [[architecture/tech-stack]] | Full technology stack with versions | [`raw/codebase/STACK.md`](raw/codebase/STACK.md) |
| [[architecture/codebase-structure]] | Directory layout and file conventions | [`raw/codebase/STRUCTURE.md`](raw/codebase/STRUCTURE.md) |
| [[architecture/system-architecture]] | System overview, component responsibilities, data flow | [`raw/codebase/ARCHITECTURE.md`](raw/codebase/ARCHITECTURE.md) |
| [[architecture/external-integrations]] | Firebase, environment config, CI/CD status | [`raw/codebase/INTEGRATIONS.md`](raw/codebase/INTEGRATIONS.md) |
| [[architecture/versioning]] | Versioning scheme, conventional commits, release pipeline | [`.versionrc`](../../.versionrc) |
| [[architecture/testing-status]] | Testing infrastructure (none exists) | [`raw/codebase/TESTING.md`](raw/codebase/TESTING.md) |
| [[architecture/concerns-and-tech-debt]] | Tech debt, known bugs, security, performance issues | [`raw/codebase/CONCERNS.md`](raw/codebase/CONCERNS.md) |
| [[architecture/investment-tracking-architecture]] | ✅ Investment data flow, V1+V2 Firestore schema, store architecture, component tree, migration layer | [`.planning/phases/10-investment-tracking/10-RESEARCH.md`](.planning/phases/10-investment-tracking/10-RESEARCH.md) |
| [[architecture/financial-projections-architecture]] | ✅ Simulation data flow, component tree, design decisions, integration points | [`raw/83-financial-projections/issue.md`](raw/83-financial-projections/issue.md) |
| [[architecture/budget-savings-architecture]] | ✅ Budget data flow, Firestore schema, store architecture, component tree, charting | [`raw/100-budget-savings-engine/issue.md`](raw/100-budget-savings-engine/issue.md) |

## Conventions

| Page | Summary | Sources |
|------|---------|---------|
| [[conventions/branch-strategy]] | Git branch rules, naming, PR workflow | — |
| [[conventions/coding-conventions]] | Naming, imports, error handling, code style | [`raw/codebase/CONVENTIONS.md`](raw/codebase/CONVENTIONS.md) |

## References

| Page | Summary | Sources |
|------|---------|---------|
| [[references/llm-wiki-pattern]] | Karpathy's LLM Wiki pattern — original article | [`raw/original LLM Wiki.md`](raw/original%20LLM%20Wiki.md) |
