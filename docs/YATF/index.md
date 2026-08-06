---
type: Index
title: "YATF Wiki — Knowledge Bundle Index"
description: "Master catalog of all knowledge pages for the MyFinance (Balancr) project. Entry point for agent traversal."
timestamp: 2026-08-03
---

# Wiki Index

*Last updated: 2026-08-06* (Account deletion feature)
*Total pages: 72*

---

## Features

| Page | Summary | Sources |
|------|---------|---------|
| [[wiki/features/car-management-redesign/car-management-redesign]] | Car page bento grid redesign with monthly averages | [`raw/SPEC/SPEC.md`](raw/SPEC/SPEC.md) |
| [[wiki/features/transaction-layout-improvement/transaction-layout-improvement]] | Two-column transaction layout with filter + chart on left | [#80](https://github.com/AlexDevsTheWeb/myfinance/issues/80) |
| [[wiki/features/investment-tracking/investment-tracking]] | ✅ ETF portfolio tracking, broker integration, PAC strategy, and asset-vs-expense separation | [`raw/81-tax-refund/81-tax-refund.md`](raw/81-tax-refund/81-tax-refund.md) |
| [[wiki/features/financial-projections/financial-projections]] | ✅ Compound interest simulator with parametric sliders and real-time chart | [`#83`](https://github.com/AlexDevsTheWeb/myfinance/issues/83) |
| [[wiki/features/investment-tracking-guide/investment-tracking-guide]] | 📘 User guide + code analysis — Investment & Projections (EN) | [`raw/FEATURES-GUIDE/FEATURES-GUIDE.md`](raw/FEATURES-GUIDE/FEATURES-GUIDE.md) |
| [[wiki/features/guida-investimenti/guida-investimenti]] | 📘 Guida utente — Investimenti, Proiezioni e Budget (IT) | [`raw/FEATURES-GUIDE.it/FEATURES-GUIDE.it.md`](raw/FEATURES-GUIDE.it/FEATURES-GUIDE.it.md) |
| [[wiki/features/pac-automation/pac-automation]] | ✅ Automated recurring PAC transactions with confirmation UI | [`#89`](https://github.com/AlexDevsTheWeb/myfinance/issues/89) |
| [[wiki/features/responsive-chart-layout/responsive-chart-layout]] | ✅ Salary + Insights: inline charts at ≥2000px, dialog at <2000px | [`raw/responsive-chart-layout/responsive-chart-layout.md`](raw/responsive-chart-layout/responsive-chart-layout.md) |
| [[wiki/features/dynamic-portfolio-chart/dynamic-portfolio-chart]] | 📋 Recompute portfolio chart from current market prices — live valuations | [`#160`](https://github.com/AlexDevsTheWeb/myfinance/issues/160) |
| [[wiki/features/crud-etf-transactions/crud-etf-transactions]] | ✅ Edit/delete ETF transactions with safe cascade recalculation | [`#90`](https://github.com/AlexDevsTheWeb/myfinance/issues/90) |
| [[wiki/features/multi-broker-architecture/multi-broker-architecture]] | ✅ Multi-broker & multi-asset schema refactor with BrokerSelect | [`#91`](https://github.com/AlexDevsTheWeb/myfinance/issues/91) |
| [[wiki/features/historical-snapshots/historical-snapshots]] | ✅ Persistent portfolio history in Firestore subcollection | [`#92`](https://github.com/AlexDevsTheWeb/myfinance/issues/92) |
| [[wiki/features/tax-inflation-modeling/tax-inflation-modeling]] | ✅ Inflation-adjusted projections with real vs nominal toggle | [`#93`](https://github.com/AlexDevsTheWeb/myfinance/issues/93) |
| [[wiki/features/ticker-validation/ticker-validation]] | ✅ Yahoo Finance ticker validation at broker config save | [`#94`](https://github.com/AlexDevsTheWeb/myfinance/issues/94) |
| [[wiki/features/investment-tracking-v3/investment-tracking-v3]] | ✅ V3: Dividend ledger, capital gains tax, cash adjustments, performance prefill | [`#98`](https://github.com/AlexDevsTheWeb/myfinance/issues/98) |
| [[wiki/features/budget-savings-engine/budget-savings-engine]] | ✅ V4: Budget targets, progress tracking, savings rate engine, investment bridge | [`#100`](https://github.com/AlexDevsTheWeb/myfinance/issues/100) |
| [[wiki/features/dashboard-redesign/dashboard-redesign]] | ✅ Dashboard split, account detail dialog, additional charts, overview stat cards | [`#99`](https://github.com/AlexDevsTheWeb/myfinance/issues/99) |
| [[wiki/features/sidebar-redesign/sidebar-redesign]] | ✅ Vertical left sidebar with grouped navigation, collapsible mode, avatar | [`#99`](https://github.com/AlexDevsTheWeb/myfinance/issues/99) |
| [[wiki/features/investment-professional-enhancements/investment-professional-enhancements]] | 📋 Per-ticker pricing, stamp duty, capital losses, fees, privacy mode — **draft** | [`raw/investment-report/investment-report.md`](raw/investment-report/investment-report.md), [`#110`](https://github.com/AlexDevsTheWeb/myfinance/issues/110) |
| [[wiki/features/sidebar-routing-refactor/sidebar-routing-refactor]] | ✅ Sidebar flat links, `/finance` + `/investments` tabbed pages, removed duplicate title | [`#113`](https://github.com/AlexDevsTheWeb/myfinance/issues/113) |
| [[wiki/features/user-configurable-rates/user-configurable-rates]] | ✅ User-configurable inflation & tax rates in ConfigPage > Projections tab | [`raw/103/103.md`](raw/103/103.md) |
| [[wiki/features/error-boundary/error-boundary]] | ✅ React error boundary wrapping the app — catches render crashes | [`#138`](https://github.com/AlexDevsTheWeb/myfinance/issues/138) |
| [[wiki/features/mui-dialogs/mui-dialogs]] | ✅ Native alert()/confirm() replaced with MUI Dialog/Snackbar | [`#138`](https://github.com/AlexDevsTheWeb/myfinance/issues/138) |
| [[wiki/features/loading-states/loading-states]] | ✅ Loading indicators on Dashboard, Transactions, Investments during sync | [`#138`](https://github.com/AlexDevsTheWeb/myfinance/issues/138) |
| [[wiki/features/card-plafond-tracking/card-plafond-tracking]] | ✅ Per-card monthly plafond tracking with configurable cards per account, dashboard utilization, card filter + sort toggle | [`#165`](https://github.com/AlexDevsTheWeb/myfinance/issues/165) |
| [[wiki/features/balancr-branding/balancr-branding]] | ✅ Complete rebrand: YAFT → Balancr, Linked Hexagons logo, new color palette | [`#82`](https://github.com/AlexDevsTheWeb/myfinance/issues/82) |
| [[wiki/features/recurring-card-selection/recurring-card-selection]] | 📋 Card selection (None/credit/debit) on recurring expense templates, propagated to generated transactions — **planned** | [`raw/recurring-card-selection/recurring-card-selection.md`](raw/recurring-card-selection/recurring-card-selection.md) |
| [[wiki/features/account-deletion/account-deletion]] | ✅ Delete own account + all data (Firestore doc, subcollections, auth) with re-auth guard and confirmation UI | [`#158`](https://github.com/AlexDevsTheWeb/myfinance/issues/158) |

## Plans

| Page | Summary | Sources |
|------|---------|---------|
| [[wiki/plans/roadmap]] | Project roadmap with phases, status, and priorities | [`raw/ROADMAP/ROADMAP.md`](raw/ROADMAP/ROADMAP.md) |
| [[wiki/plans/car-redesign-implementation]] | Step-by-step implementation plan for car management redesign | [`raw/PLANS/PLANS.md`](raw/PLANS/PLANS.md) |
| [[wiki/plans/transaction-layout-implementation]] | Implementation plan for transaction page layout restructure | [#80](https://github.com/AlexDevsTheWeb/myfinance/issues/80) |
| [[wiki/plans/investment-tracking-implementation]] | 6-plan implementation for ETF tracking, broker integration, PAC strategy | [`.planning/phases/10-investment-tracking/`](.planning/phases/10-investment-tracking/) |
| [[wiki/plans/financial-projections-implementation]] | ✅ 3-plan implementation for simulation engine, UI shell, routing + i18n | [`raw/83-financial-projections/83-financial-projections.md`](raw/83-financial-projections/83-financial-projections.md) |
| [[wiki/plans/investment-tracking-v2-enhancements]] | ✅ Phase 12 complete — 6 GSD plans implemented (multi-broker, CRUD, PAC, snapshots, inflation, ticker) | [`.planning/phases/12-investment-tracking-v2/`](.planning/phases/12-investment-tracking-v2/) |
| [[wiki/plans/investment-tracking-v3-implementation]] | ✅ V3 implementation: dividend, tax, cash adjustments, performance prefill | [`#98`](https://github.com/AlexDevsTheWeb/myfinance/issues/98) |
| [[wiki/plans/daily-historical-chart/daily-historical-chart]] | 📋 Research & spec for daily historical chart using ticker price history | [`#160`](https://github.com/AlexDevsTheWeb/myfinance/issues/160) |
| [[wiki/plans/budget-savings-engine-implementation]] | ✅ V4 Budget & Savings Rate implementation: 6 waves, 11 new files, 10 modified | [`#100`](https://github.com/AlexDevsTheWeb/myfinance/issues/100) |
| [[wiki/plans/manual-review-99-implementation]] | ✅ 5-wave plan: bug fixes, padding, account dialog, dashboard charts, sidebar | [`#99`](https://github.com/AlexDevsTheWeb/myfinance/issues/99) |
| [[wiki/plans/backup-restore-data-coverage]] | Plan to add missing budget + investment data to backup/restore | [`raw/101-backup-restore-gaps/101-backup-restore-gaps.md`](raw/101-backup-restore-gaps/101-backup-restore-gaps.md) |
| [[wiki/plans/user-configurable-rates-implementation]] | ✅ 6-step plan — completed | [`raw/103/103.md`](raw/103/103.md) |
| [[wiki/plans/italian-tax-enhancements]] | 📋 Stamp duty (0.20%) + capital losses tracking — 5-wave task breakdown | [`#110`](https://github.com/AlexDevsTheWeb/myfinance/issues/110) |
| [[wiki/plans/go-to-market]] | 🔴 **MAX PRIORITY** — 6-phase SaaS launch plan (quick wins → data security → beta → validate → monetize → cleanup) | [`#138`](https://github.com/AlexDevsTheWeb/myfinance/issues/138) |
| [[wiki/plans/beta-launch-playbook]] | 📋 Phase 2 execution details: disclaimer banner ✅, backup/restore verification ✅, tester invitation template ⬜ | [`raw/beta-launch-playbook/beta-launch-playbook.md`](raw/beta-launch-playbook/beta-launch-playbook.md) |

## Decisions

| Page | Summary | Sources |
|------|---------|---------|
| [[wiki/decisions/typescript-7-upgrade]] | ✅ TS 7.0 Go-rewrite adoption with linting workaround via `@typescript/typescript6` | [`raw/typescript-7-upgrade/`](raw/typescript-7-upgrade/) |
| [[wiki/decisions/chart-migration-mui]] | ✅ Migrated 16 chart components from Recharts to MUI X Charts — theme-aware, phased migration | [`raw/chart-migration/`](raw/chart-migration/) |
| [[wiki/decisions/saas-readiness]] | 🔴 **MAX PRIORITY** — Hard blockers vs ship-as-is: fix 6 critical items, launch, iterate with real users | [`raw/saas-readiness/saas-readiness.md`](raw/saas-readiness/saas-readiness.md) |
| [[wiki/decisions/pwa-strategy]] | 🟢 PWA prima, Flutter dopo — mobile senza riscrittura, 2-step plan | [`raw/go-to-market/go-to-market.md`](raw/go-to-market/go-to-market.md) |
| [[wiki/decisions/balancr-identity-system]] | ✅ Balancr identity: Linked Hexagons logo, dark palette, gradient system | [`raw/balancr-identity-system/balancr-identity-system.md`](raw/balancr-identity-system/balancr-identity-system.md) |

## Queries

| Page | Summary | Sources |
|------|---------|---------|
| [[wiki/queries/app-review]] | 🔴 Comprehensive app audit: strengths, weaknesses, architecture anti-patterns, improvement suggestions | [`raw/app-review/app-review.md`](raw/app-review/app-review.md) |
| [[wiki/queries/new-user-auth-flow]] | New user registration flow analysis via Google Auth — data isolation, concerns, false alarms | [`raw/new-user-auth-flow/new-user-auth-flow.md`](raw/new-user-auth-flow/new-user-auth-flow.md) |

## Bugs

| Page | Summary | Sources |
|------|---------|---------|
| [[wiki/bugs/car-statistics-year]] | ✅ Car page "Statistics {year}" shows literal `{year}` | [`#99`](https://github.com/AlexDevsTheWeb/myfinance/issues/99) |
| [[wiki/bugs/ticker-persistence]] | ✅ BrokerAccount ticker not persisted; PAC uses brokerId as ticker — **fixed** | [`#108`](https://github.com/AlexDevsTheWeb/myfinance/issues/108) |
| [[wiki/bugs/recurring-transaction-monthofyear]] | ✅ Yearly recurring transactions ignore `monthOfYear` — **fixed** | [`#142`](https://github.com/AlexDevsTheWeb/myfinance/issues/142) |
| [[wiki/bugs/recurring-transaction-duplicates-same-period]] | ✅ `checkRecurring` generates duplicates alongside manual transactions — **fixed** | [`#146`](https://github.com/AlexDevsTheWeb/myfinance/issues/146) |
| [[wiki/bugs/charts-ui]] | ✅ All charts across the app had layout issues: padding, cutoff labels, pie spacing — **fixed** | [`raw/bugs/charts-ui/charts-ui.md`](raw/bugs/charts-ui/charts-ui.md) |
| [[wiki/bugs/card-counter-zero]] | ✅ Card Utilization counter always €0 — reset-day expenses excluded by strict window bounds — **fixed** | [`raw/bugs/card-counter-zero/card-counter-zero.md`](raw/bugs/card-counter-zero/card-counter-zero.md) |
| [[wiki/bugs/broker-transaction-filter]] | ✅ Broker filter shows 0 invested / no holdings — manual ETF transactions never persisted `brokerId` — **fixed** | [`raw/bugs/broker-transaction-filter/broker-transaction-filter.md`](raw/bugs/broker-transaction-filter/broker-transaction-filter.md) |
| [[wiki/bugs/etf-pricing-total-return]] | ✅ Total Return stuck at €0 — price provider dead (yfin.dev); switched to Yahoo with Xetra-first resolution + SWDA→EUNL consolidation — **fixed** | [`raw/bugs/etf-pricing-total-return/etf-pricing-total-return.md`](raw/bugs/etf-pricing-total-return/etf-pricing-total-return.md) |
| [[wiki/bugs/silent-login-errors]] | ✅ Auth failures (popup blocked, wrong password, network) silently swallowed — now localized AlertSnackbar feedback — **fixed** | [`#157`](https://github.com/AlexDevsTheWeb/myfinance/issues/157) |

## Architecture

| Page | Summary | Sources |
|------|---------|---------|
| [[wiki/architecture/project-state]] | Current project state, focus, and next steps | [`raw/STATE/STATE.md`](raw/STATE/STATE.md) |
| [[wiki/architecture/tech-stack]] | Full technology stack with versions | [`raw/codebase/STACK.md`](raw/codebase/STACK.md) |
| [[wiki/architecture/codebase-structure]] | Directory layout and file conventions | [`raw/codebase/STRUCTURE.md`](raw/codebase/STRUCTURE.md) |
| [[wiki/architecture/system-architecture]] | System overview, component responsibilities, data flow | [`raw/codebase/ARCHITECTURE.md`](raw/codebase/ARCHITECTURE.md) |
| [[wiki/architecture/external-integrations]] | Firebase, environment config, CI/CD status | [`raw/codebase/INTEGRATIONS.md`](raw/codebase/INTEGRATIONS.md) |
| [[wiki/architecture/versioning]] | Versioning scheme, conventional commits, release pipeline | [`.versionrc`](../../.versionrc) |
| [[wiki/architecture/testing-status]] | Testing infrastructure (none exists) | [`raw/codebase/TESTING.md`](raw/codebase/TESTING.md) |
| [[wiki/architecture/concerns-and-tech-debt]] | Tech debt, known bugs, security, performance issues | [`raw/codebase/CONCERNS.md`](raw/codebase/CONCERNS.md) |
| [[wiki/architecture/investment-tracking-architecture]] | ✅ Investment data flow, V1+V2 Firestore schema, store architecture, component tree, migration layer | [`.planning/phases/10-investment-tracking/10-RESEARCH.md`](.planning/phases/10-investment-tracking/10-RESEARCH.md) |
| [[wiki/architecture/financial-projections-architecture]] | ✅ Simulation data flow, component tree, design decisions, integration points | [`raw/83-financial-projections/83-financial-projections.md`](raw/83-financial-projections/83-financial-projections.md) |
| [[wiki/architecture/budget-savings-architecture]] | ✅ Budget data flow, Firestore schema, store architecture, component tree, charting | [`raw/100-budget-savings-engine/100-budget-savings-engine.md`](raw/100-budget-savings-engine/100-budget-savings-engine.md) |
| [[wiki/architecture/user-settings-data-flow]] | ✅ User settings architecture — Firestore field, store, ComponentTree | [`raw/103/103.md`](raw/103/103.md) |

## Conventions

| Page | Summary | Sources |
|------|---------|---------|
| [[wiki/conventions/branch-strategy]] | Git branch rules, naming, PR workflow | — |
| [[wiki/conventions/coding-conventions]] | Naming, imports, error handling, code style | [`raw/codebase/CONVENTIONS.md`](raw/codebase/CONVENTIONS.md) |

## References

| Page | Summary | Sources |
|------|---------|---------|
| [[wiki/references/llm-wiki-pattern]] | Karpathy's LLM Wiki pattern — original article | [`raw/original-llm-wiki/original-llm-wiki.md`](raw/original-llm-wiki/original-llm-wiki.md) |
