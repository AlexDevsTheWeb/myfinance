---
type: Index
title: "Features — Index"
description: "Feature pages describing all implemented, planned, and deprecated features."
timestamp: 2026-10-05
---

# Features

Feature pages describing all implemented, planned, and deprecated features.

## Pages

| Concept | Description |
|---------|-------------|
| [[wiki/features/balancr-branding/balancr-branding|balancr-branding]] | Complete rebrand from YAFT to Balancr: Linked Hexagons logo and new color palette. |
| [[wiki/features/budget-savings-architecture/budget-savings-architecture|budget-savings-architecture]] | Architecture reference for the Budget & Savings Rate module: data flow, Firestore schema, and component tree. |
| [[wiki/features/budget-savings-engine/budget-savings-engine|budget-savings-engine]] | V4 budget targets, savings rate engine, progress tracking, and investment bridge. |
| [[wiki/features/car-management-redesign/car-management-redesign|car-management-redesign]] | Car page bento grid redesign with monthly cost averages and improved UX. |
| [[wiki/features/dynamic-portfolio-chart/dynamic-portfolio-chart|dynamic-portfolio-chart]] | Recompute portfolio chart from current market prices — live valuations for historical data. |
| [[wiki/features/crud-etf-transactions/crud-etf-transactions|crud-etf-transactions]] | Edit and delete ETF transactions with safe cascade recalculation. |
| [[wiki/features/dashboard-redesign/dashboard-redesign|dashboard-redesign]] | Dashboard split view, account detail dialog, additional charts, and overview stat cards. |
| [[wiki/features/error-boundary/error-boundary|error-boundary]] | React error boundary wrapping the app to catch and display render crashes gracefully. |
| [[wiki/features/financial-projections/financial-projections|financial-projections]] | Compound interest simulator with parametric sliders and real-time interactive chart. |
| [[wiki/features/guida-investimenti/guida-investimenti|guida-investimenti]] | Guida utente in italiano — Investimenti, Proiezioni e Budget. |
| [[wiki/features/historical-snapshots/historical-snapshots|historical-snapshots]] | Persistent portfolio history stored in Firestore subcollection. |
| [[wiki/features/investment-professional-enhancements/investment-professional-enhancements|investment-professional-enhancements]] | Draft: per-ticker pricing, stamp duty, capital losses tracking, fees, and privacy mode. |
| [[wiki/features/investment-tracking-guide/investment-tracking-guide|investment-tracking-guide]] | User guide and code analysis covering the Investment & Projections feature set (EN). |
| [[wiki/features/investment-tracking-v3/investment-tracking-v3|investment-tracking-v3]] | V3 investment tracking: dividend ledger, capital gains tax, cash adjustments, and performance prefill. |
| [[wiki/features/investment-tracking/investment-tracking|investment-tracking]] | ETF portfolio tracking, broker integration, PAC strategy, and asset-vs-expense separation. |
| [[wiki/features/loading-states/loading-states|loading-states]] | Loading indicators on Dashboard, Transactions, and Investments pages during data sync. |
| [[wiki/features/mui-dialogs/mui-dialogs|mui-dialogs]] | Native alert()/confirm() replaced with MUI Dialog and Snackbar components. |
| [[wiki/features/multi-broker-architecture/multi-broker-architecture|multi-broker-architecture]] | Multi-broker and multi-asset schema refactor with BrokerSelect component. |
| [[wiki/features/pac-automation/pac-automation|pac-automation]] | Automated recurring PAC transactions with user confirmation UI. |
| [[wiki/features/responsive-chart-layout/responsive-chart-layout|responsive-chart-layout]] | Salary + Insights pages: inline charts at ≥2000px, full-screen dialog at <2000px. |
| [[wiki/features/sidebar-redesign/sidebar-redesign|sidebar-redesign]] | Vertical left sidebar with grouped navigation, collapsible mode, and user avatar. |
| [[wiki/features/sidebar-routing-refactor/sidebar-routing-refactor|sidebar-routing-refactor]] | Sidebar flat links, /finance + /investments tabbed pages, removed duplicate title. |
| [[wiki/features/tax-inflation-modeling/tax-inflation-modeling|tax-inflation-modeling]] | Inflation-adjusted financial projections with real vs nominal toggle. |
| [[wiki/features/ticker-validation/ticker-validation|ticker-validation]] | Yahoo Finance ticker validation triggered at broker config save. |
| [[wiki/features/transaction-layout-improvement/transaction-layout-improvement|transaction-layout-improvement]] | Two-column transaction layout with filter panel and chart on the left side. |
| [[wiki/features/card-plafond-tracking/card-plafond-tracking|card-plafond-tracking]] | Track spending per card with monthly plafond, configurable per account in settings. |
| [[wiki/features/user-configurable-rates/user-configurable-rates|user-configurable-rates]] | User-configurable inflation and tax rates in ConfigPage > Projections tab. |
| [[wiki/features/recurring-card-selection/recurring-card-selection|recurring-card-selection]] | Card selection (None/credit/debit) on recurring expense templates, propagated to generated transactions. |
| [[wiki/features/recurring-subcollection-scaling/recurring-subcollection-scaling|recurring-subcollection-scaling]] | recurringTransactions moved to a Firestore subcollection + offline persistence enabled (persistentLocalCache). |
| [[wiki/features/account-deletion/account-deletion|account-deletion]] | Users can delete their own account + all data (Firestore doc, subcollections, auth) with re-auth guard and confirmation UI. |
| [[wiki/features/test-infrastructure/test-infrastructure|test-infrastructure]] | Layered Vitest infrastructure (jsdom, colocated tests, mocked Firebase) — Phase 1 pure-logic layer complete. |
| [[wiki/features/first-of-month-recurring/first-of-month-recurring|first-of-month-recurring]] | Recurrent transactions auto-generated on the 1st of each month; whole month preloaded at month start; back-filled with correct date on any app open. |
| [[wiki/features/dashboard-calendar/dashboard-calendar|dashboard-calendar]] | Month calendar on the Dashboard — per-day income/expense/transfer dots + selected-day transaction list, live-updating. |
| [[wiki/features/marketing-website/marketing-website|marketing-website]] | ✅ Balancr marketing landing page as an isolated `apps/website` workspace, with its own Firebase Hosting site. |
