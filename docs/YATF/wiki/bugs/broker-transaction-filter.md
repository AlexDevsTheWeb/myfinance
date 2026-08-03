---
type: Bug
title: "Per-broker filter shows zero invested — ETF transactions never linked to a broker"
description: "Broker Select filter returns 0 invested / no holdings for a specific broker because manual ETF transactions never persist a brokerId — current value then falls back to the aggregate snapshot. Fixed by adding brokerId to IETFTransaction, persisting it, and migrating legacy transactions."
tags: [bug, investment, broker, multi-broker, portfolio]
created: 2026-08-03
updated: 2026-08-03
status: fixed
severity: major
sources: ["raw/bugs/broker-transaction-filter/broker-transaction-filter.md"]
related: ["wiki/features/multi-broker-architecture/multi-broker-architecture.md", "wiki/features/crud-etf-transactions/crud-etf-transactions.md", "wiki/features/dynamic-portfolio-chart/dynamic-portfolio-chart.md"]
---

# Bug: Per-broker filter shows zero invested

Status: **fixed**
Severity: **major**

## Symptom

On the **Investments** page → **Invested Capital** tab, the Broker Select filter is inconsistent:

- **All Brokers**: `Total invested = 400 €`, `Current value = 400 €`, `Total return = 0 € (+0.0 %)`.
- **Trade Republic**: `Total invested = 0 €`, `Current value = 400 €`, `Total return = 400 € (+0.0 %)`, and **no ETF holdings** listed — despite two Trade Republic transactions being recorded.

## Reproduction

1. Configure one broker (Trade Republic) in broker settings.
2. Add two `Buy` ETF transactions from **Add Transaction**, choosing Trade Republic in the "Broker Account" dropdown.
3. With **All Brokers** the aggregate shows correctly (400 €).
4. Selecting **Trade Republic** makes invested drop to 0 and holdings disappear, while current value still shows the aggregate.

## Root Cause Analysis

Manual ETF transactions were **never linked to a broker**:

- `EtfTransactionModal.handleSubmit` saved only `accountId` (a finance account), silently dropping the form's "Broker Account" value.
- `IETFTransaction` had no `brokerId` field; `sanitizeEtfTransaction` and the Firestore converter did not carry any broker reference.
- `usePortfolio` filtered by `tx.accountId === selectedBrokerId || tx.brokerId === selectedBrokerId`, which can never match a broker → empty transaction set → `totalInvested = 0`, no holdings.
- `currentValue` then fell back to the **last aggregate portfolio snapshot** (400 €), producing the misleading `+400 € (+0.0 %)`.

Only PAC-generated buys set `accountId = brokerId`, so only they matched the filter.

## Fix

1. Added `brokerId?: string` to `IETFTransaction`.
2. `EtfTransactionModal` now honors `defaultBrokerId` (pre-selected broker), pre-fills it on edit, and persists `brokerId` on submit.
3. Sanitization + Firestore converter persist/re-hydrate `brokerId`.
4. `migrateEtfTransactions()` in `useInvestmentSync.ts` links legacy transactions (existing `brokerId` > legacy PAC via `accountId` > single-broker inference) and persists once on load.
5. `usePortfolio` matches `tx.brokerId || tx.accountId`, and current value is derived from the per-broker holdings (`price ?? avgCost`) instead of the aggregate snapshot — an empty broker now shows 0.

Chart auto-fetch was intentionally left as manual refresh (user decision).

## Related

- [[wiki/features/multi-broker-architecture/multi-broker-architecture]] — the feature this bug belongs to
- [[wiki/features/crud-etf-transactions/crud-etf-transactions]] — transaction modal/CRUD flow that dropped the broker link
- [[wiki/features/dynamic-portfolio-chart/dynamic-portfolio-chart]] — explains the chart's reliance on manual price refresh
- Source: [raw/bugs/broker-transaction-filter/broker-transaction-filter.md](raw/bugs/broker-transaction-filter/broker-transaction-filter.md)
