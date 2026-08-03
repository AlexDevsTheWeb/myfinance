# Bug Report — Per-broker filter shows zero invested / ETF transactions unlinked to broker

**Status:** FIXED (analyzed and resolved on 2026-08-03)
**Severity:** major
**Related feature:** [91-multi-broker](../../91-multi-broker/91-multi-broker.md), [90-crud-transactions](../../90-crud-transactions/90-crud-transactions.md), [dynamic-portfolio-chart](../../dynamic-portfolio-chart/dynamic-portfolio-chart.md)

---

## Summary

On the **Investments** page → **Invested Capital** tab, the **Broker Select** filter is broken:

- With **All Brokers**: `Total invested = 400 €`, `Current value = 400 €`, `Total return = 0 € (+0.0 %)`.
- Selecting **Trade Republic**: `Total invested = 0 €`, `Current value = 400 €`, `Total return = 400 € (+0.0 %)`, and **no ETF holdings** are listed — even though the user just recorded two Trade Republic transactions.

Separately, the user reports the **Portfolio Value** chart "always grows" because it cannot reflect the real value of the ETF.

## Reproduction

1. Configure one broker (Trade Republic) via broker settings.
2. Add two `Buy` ETF transactions from the **Add Transaction** modal, choosing Trade Republic in the "Broker Account" dropdown.
3. Keep **All Brokers** selected → shows the correct aggregated invest (400 €).
4. Select **Trade Republic** in the Broker Select → invested drops to 0, holdings disappear, but current value still shows the aggregate.

## Root Cause Analysis

### The transaction is never linked to the broker

`IETFTransaction` has a single `accountId` field (src/store/types/investment.types.ts) which, in the manual add flow, is set to a **finance account** (e.g. the default bank account), NOT a broker.

The ETF transaction form (`EtfTransactionForm.tsx`) exposes a **"Broker Account"** select from `brokerAccounts`, but:

1. `EtfTransactionModal.handleSubmit` builds the transaction with only `{ ...accountId, ... }` and **drops the form's `brokerId`** — it is never added to the stored transaction.
2. `IETFTransaction` has no `brokerId` field at all.
3. `sanitizeEtfTransaction` and the Firestore converter (`converters.ts fromFirestore`) strip/never rehydrate any broker link.

### The per-broker filter therefore matches nothing

`usePortfolio` filters with:

```ts
etfTransactions.filter(tx => tx.accountId === selectedBrokerId || tx.brokerId === selectedBrokerId)
```

Since `accountId` is a finance account and `brokerId` is undefined, **no transaction matches** the selected broker. `selectedBrokerId = 'trade-republic'` → `filteredTxs = []`:

- `totalInvested = 0`
- no holdings
- `currentValue` falls back to the **last aggregated portfolio snapshot** (400 €) → misleading `Total return = +400 € (+0.0 %)`.

This is exactly the reported symptom. (Note: PAC-generated buys set `accountId = selectedAccountId` (the broker id) in `confirmPacTransaction`, so they *do* match — only the manual modal path is inconsistent.)

### Chart "always grows"

`InvestmentPage` snapshots are computed at transaction time using `price = prices[ticker] ?? avgCost` (`computeSnapshot`). Until the user clicks **Refresh Prices**, `prices` is empty so `currentValue == invested`, and the chart simply mirrors accumulated contributions — it does not show real market value. Also `EtfTransactionModal` receives `defaultBrokerId` from the page but ignores it (never destructured), so even the intended "pre-select broker" behavior was broken.

## Fix

Add a first-class `brokerId` to ETF transactions, persist it end-to-end, and migrate existing orphaned transactions.

1. **Type:** add `brokerId?: string` to `IETFTransaction`.
2. **Modal:** destructure `defaultBrokerId`, seed the form's Broker Account select with it (on add and on edit), and include `brokerId` in the saved transaction.
3. **Sanitization + Firestore converter:** persist `brokerId` on write and re-hydrate it on read.
4. **Migration:** `migrateEtfTransactions(txs, brokerAccounts)` in `useInvestmentSync.ts` links legacy transactions — existing `brokerId` wins; legacy PAC transactions (broker stored in `accountId`) are linked via that; otherwise single-broker inference assigns the only broker. Applies on load and persists once.
5. **Filter:** `usePortfolio` matches `tx.brokerId === selectedBrokerId || tx.accountId === selectedBrokerId` (keeps legacy PAC match).
6. **Consistency fix:** `usePortfolio` current value is now derived from the per-broker holdings (`price ?? avgCost`) instead of falling back to the aggregate snapshot, so a broker with no holdings correctly shows 0.

The chart auto-fetch behaviour was intentionally left unchanged (manual refresh preserved) per user decision.

## Files

| File | Change |
|------|--------|
| `src/store/types/investment.types.ts` | `IETFTransaction.brokerId?: string` |
| `src/store/sanitization/investment.ts` | persist `brokerId` |
| `src/lib/converters.ts` | re-map `brokerId` on read |
| `src/components/investment/EtfTransactionModal.tsx` | honor `defaultBrokerId`, persist `brokerId` |
| `src/hooks/useInvestmentSync.ts` | `migrateEtfTransactions` + one-time persist |
| `src/analytics/hooks/usePortfolio.ts` | filter by `brokerId`; broker-consistent current value |