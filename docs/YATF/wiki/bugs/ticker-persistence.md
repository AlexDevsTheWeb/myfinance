---
title: "BrokerAccount ticker field not persisted — PAC creates transactions with wrong ticker"
tags: [bug, investment, broker, critical, fixed]
created: 2026-07-03
updated: 2026-07-03
status: fixed
severity: critical
sources: ["raw/investment-report/investment-report.md"]
related: ["features/multi-broker-architecture", "features/pac-automation", "features/investment-tracking-v3", "architecture/investment-tracking-architecture"]
---

# Bug: Ticker Persistence Failure in BrokerAccount

Status: **fixed**
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

## Implemented Fix

| # | File | Change |
|---|------|--------|
| 1 | `src/store/types/investment.types.ts:28` | Added `ticker: string` to `BrokerAccount` interface |
| 2 | `src/store/sanitization/investment.ts:35` | Added `ticker` to `sanitizeBrokerAccount` (uppercased) |
| 3 | `src/store/defaults.ts:57` | Added `ticker: 'SWDA.MI'` to `DEFAULT_BROKER_ACCOUNTS` |
| 4 | `src/components/investment/BrokerSettingsModal.tsx:104` | Included `ticker: formData.ticker.toUpperCase().trim()` in save payload |
| 5 | `src/components/investment/BrokerSettingsModal.tsx:70` | Pre-fill `ticker` from `broker.ticker` on edit (was `''`) |
| 6 | `src/store/useInvestmentStore.ts:453-454` | Resolve actual ticker from `brokerAccounts` in `confirmPacTransaction` instead of using `selectedAccountId` |
| 7 | `src/store/useInvestmentStore.ts:270` | Include `config.ticker` in `setBrokerConfig` migration |
| 8 | `src/hooks/useInvestmentSync.ts:23` | Include `old.ticker` in `IBrokerConfig` → `BrokerAccount[]` migration |
| 9 | `src/lib/converters.ts:207` | Read `b.ticker` from Firestore in data converter |

### Fix details

**Root Cause 1** — The `BrokerAccount` type was missing `ticker`, so even though the form collected and validated it, the value was never stored. The fix adds the field to the type, the sanitizer, the default, and all construction sites (save handler, edit handler, migrations, converter).

**Root Cause 2** — `confirmPacTransaction` used `selectedAccountId` (the broker ID) as the ticker. Fixed by resolving the actual ticker from `brokerAccounts.find(b => b.id === selectedAccountId)?.ticker` with a fallback to `selectedAccountId` for safety.

### Migration note

Existing broker accounts in Firestore will have `ticker: ""` after the fix lands. Users must re-enter their ticker via the Broker Settings modal.

## Related

- [[wiki/features/multi-broker-architecture/multi-broker-architecture]]
- [[wiki/features/pac-automation/pac-automation]]
- [[wiki/features/investment-tracking-v3/investment-tracking-v3]]
- [[wiki/architecture/investment-tracking-architecture]]
- Source: [raw/investment-report/investment-report.md](raw/investment-report/investment-report.md)
