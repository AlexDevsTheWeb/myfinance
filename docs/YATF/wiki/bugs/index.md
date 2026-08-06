---
type: Index
title: "Bugs — Index"
description: "Bug analysis pages: symptoms, root cause, reproduction steps, and fixes."
timestamp: 2026-07-26
---

# Bugs

Bug analysis pages: symptoms, root cause, reproduction steps, and fixes.

## Pages

| Concept | Description |
|---------|-------------|
| [[bugs/car-statistics-year|car-statistics-year]] | Car page 'Statistics {year}' heading shows literal '{year}' placeholder — fixed. |
| [[bugs/recurring-transaction-duplicates-same-period|recurring-transaction-duplicates-same-period]] | checkRecurring generates duplicate transactions alongside manual ones on every page load — fixed. |
| [[bugs/recurring-transaction-monthofyear|recurring-transaction-monthofyear]] | Yearly recurring transactions ignore monthOfYear and generate in wrong month — fixed. |
| [[bugs/ticker-persistence|ticker-persistence]] | BrokerAccount ticker field not persisted; PAC creates transactions with wrong ticker — fixed. |
| [[bugs/charts-ui|charts-ui]] | All charts had layout/padding issues: excess left space, cutoff labels, pie spacing — fixed. |
| [[bugs/card-counter-zero|card-counter-zero]] | Card Utilization counter always €0 — reset-day expenses excluded by strict window bounds — fixed. |
| [[bugs/broker-transaction-filter|broker-transaction-filter]] | Broker filter shows 0 invested / no holdings because manual ETF transactions never persisted a brokerId — fixed. |
| [[bugs/etf-pricing-total-return|etf-pricing-total-return]] | Total Return stuck at €0 — price provider dead (api.yfin.dev); switched to Yahoo Finance with Xetra-first venue resolution and SWDA→EUNL consolidation — fixed. |
| [[bugs/silent-login-errors|silent-login-errors]] | Login auth failures (popup blocked, wrong password, network) silently console.logged — no user feedback. Fixed with localized AlertSnackbar messages (#157) — fixed. |
| [[bugs/transactions-array-write-back|transactions-array-write-back]] | 5 store actions re-wrote the full transactions array to the dead main-doc field — 1 MiB bloat + renames lost on reload. Fixed by persisting changed transactions to the subcollection — fixed. |
