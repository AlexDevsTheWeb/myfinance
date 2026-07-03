---
title: "BrokerAccount ticker field not persisted — PAC creates transactions with wrong ticker"
tags: [bug, investment, broker, critical]
created: 2026-07-03
updated: 2026-07-03
status: open
severity: critical
sources: ["raw/investment-report.md"]
related: ["features/multi-broker-architecture", "features/pac-automation", "features/investment-tracking-v3", "architecture/investment-tracking-architecture"]
---

# Bug: Ticker Persistence Failure in BrokerAccount

Status: **open**
Severity: **critical**

## Symptom

1. The **ETF Ticker** field in the Broker Settings modal is validated but **never persisted** to the store or Firestore.
2. The **PAC automation** creates buy transactions with the **broker account ID** as the ticker instead of the actual ETF ticker symbol.

## Root Cause Analysis

### Issue 1: BrokerAccount type missing `ticker` field

The `BrokerAccount` interface (`src/store/types/investment.types.ts:24`) has no `ticker` property:

```typescript
export interface BrokerAccount {
  id: string;
  name: string;
  baseLumpSum: number;
  monthlyPacAmount: number;
  interestRate: number;
  // ❌ ticker is missing
}
```

In `BrokerSettingsModal.tsx:99-105`, the save handler constructs the account object without `ticker`:

```typescript
const account = {
  id: editingBrokerId || crypto.randomUUID(),
  name,
  baseLumpSum: Number(formData.baseLumpSum) || 0,
  monthlyPacAmount: Number(formData.monthlyPacAmount) || 0,
  interestRate: Number(formData.interestRate) || 0,
  // ❌ ticker is not included
};
```

The ticker form field (`formData.ticker`) is validated and cleared on save, but its value never reaches the store. On edit (`handleEdit`, line 70), ticker defaults to `''` since there's nothing to restore.

### Issue 2: PAC confirmation uses brokerId as ticker

In `PacConfirmationDialog.tsx:21`, the broker ID is passed directly:

```typescript
await confirmPacTransaction(pendingPacTransaction.brokerId);
```

In `useInvestmentStore.ts:450-455`, the store creates the transaction with:

```typescript
const tx: IETFTransaction = {
  ...
  ticker: selectedAccountId,  // ❌ brokerId used as ticker symbol!
  ...
};
```

This means every PAC auto-buy registers under the broker ID (e.g., `"broker-1"`) instead of the actual ETF ticker (e.g., `"SWDA.MI"`).

## Impact

- Portfolio holdings for auto-bought PAC units show under a garbage ticker name
- Holdings table, allocation donut, and tax tracking produce incorrect data for PAC transactions
- Users who configure multiple brokers with different ETFs get corrupted portfolio data
- The ticker validation UI exists and gives feedback, but the value is silently discarded

## Reproduction

1. Go to `/invest` → Settings → Add Broker Account
2. Enter a ticker like `SWDA.MI`
3. Save → close → reopen settings → the ticker field is empty
4. If a PAC triggers, the buy transaction records with `broker-1` as the ticker

## Proposed Fix

1. Add `ticker: string` to `BrokerAccount` type
2. Include `ticker` in the save payload in `BrokerSettingsModal.handleSave`
3. Update `handleEdit` to pre-fill ticker from stored broker data
4. Update `confirmPacTransaction` to read the actual ticker from the broker account instead of using `selectedAccountId` as ticker
5. Update Firestore rules for the new field
6. Validate ticker at the API boundary (already done in form — needs to survive to persistence)

## Related

- [[features/multi-broker-architecture]]
- [[features/pac-automation]]
- [[features/investment-tracking-v3]]
- [[architecture/investment-tracking-architecture]]
- Source: [raw/investment-report.md](raw/investment-report.md)
