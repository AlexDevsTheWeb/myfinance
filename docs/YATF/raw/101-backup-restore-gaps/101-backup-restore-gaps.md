# Audit: Backup/Restore Missing Data Entities

## Summary

The backup/restore subsystem (`src/store/backup/index.ts`) was built before budget and investment V3 features were added. It does not include these data entities:

### Missing from BackupPayload

| Entity | Store | Field in UserDoc? | Notes |
|--------|-------|-------------------|-------|
| `budgetTargets` | `useBudgetStore` | ✅ Yes | No reference in backup/restore at all |
| `brokerAccounts` | `useInvestmentStore` | ✅ Yes | Missing — old `brokerConfig` included instead |
| `assetHoldings` | `useInvestmentStore` | ✅ Yes | Missing |
| `cashAdjustments` | `useInvestmentStore` | ✅ Yes | Missing |
| `dividendEntries` | `useInvestmentStore` | ✅ Yes | Missing |
| `deletedRecurringInstances` | `useFinanceStore` | ✅ Yes | Missing (minor — rarely needed) |

### Currently Included (mostly legacy)

| Entity | Backup Payload Field | Status |
|--------|---------------------|--------|
| `initialBalance` | ✅ | OK |
| `accounts` | ✅ | OK |
| `transactions` | ✅ | OK |
| `recurringTransactions` | ✅ | OK |
| `categories` | ✅ | OK |
| `incomeCategories` | ✅ | OK |
| `enabledModules` | ✅ | OK |
| `balanceStartDate` | ✅ | OK |
| `carMileage` | ✅ | OK |
| `carInitialMileage` | ✅ | OK |
| `tireSettings` | ✅ | OK |
| `tireChanges` | ✅ | OK |
| `etfTransactions` | ✅ | OK |
| `portfolioSnapshots` | ✅ | OK |
| `brokerConfig` | ✅ | Legacy — deprecated, but included |

## Files to Modify

### 1. `src/store/backup/index.ts`

- **`BackupPayload` interface** — add fields:
  - `budgetTargets?: BudgetTarget[]`
  - `brokerAccounts?: BrokerAccount[]`
  - `assetHoldings?: AssetHolding[]`
  - `cashAdjustments?: CashAdjustment[]`
  - `dividendEntries?: DividendEntry[]`
  - `deletedRecurringInstances?: { recurringLinkId: string; date: string }[]`

- **`createBackup()`** — add fields from state (needs `(state as any)` cast or store composition)

- **`validateBackupData()`** — add validation for new fields (basic type checks)

- **`previewBackup()`** — add counts to `BackupPreview.summary` for:
  - `budgetTargetCount`, `brokerAccountCount`, `assetHoldingCount`, etc.

- **`BackupPreview` interface** — add new count fields to summary

### 2. `src/store/useFinanceStore.ts` — `importAllData()`

- **Firestore write** — add fields to `updateDoc`:
  - `budgetTargets: data.budgetTargets ?? []`
  - `brokerAccounts: data.brokerAccounts ?? Defaults.DEFAULT_BROKER_ACCOUNTS`
  - `assetHoldings: data.assetHoldings ?? []`
  - `cashAdjustments: data.cashAdjustments ?? []`
  - `dividendEntries: data.dividendEntries ?? []`

- **Zustand set** — add same fields to local state:
  - `set({ budgetTargets: data.budgetTargets ?? [] })`
  - Note: `budgetTargets` lives in `useBudgetStore`, not `useFinanceStore` — need to also call `useBudgetStore.getState().setBudgetTargets()`
  - Similarly for investment store fields: need to call `useInvestmentStore.getState().setAll()`

## Implementation Order

1. Extend `BackupPayload` with new optional fields
2. Add validation for new fields in `validateBackupData()`
3. Add fields to `createBackup()` casting from stores
4. Extend `BackupPreview` summary with new counts
5. Add counts to `previewBackup()` return
6. Update `importAllData()` — write to Firestore + set in respective Zustand stores
7. Verify: export → download → import → data intact

## Cross-store State Problem

`useFinanceStore.importAllData()` currently only sets state on `useFinanceStore`. After the fix, it must also:
- Call `useBudgetStore.getState().setBudgetTargets(data.budgetTargets ?? [])`
- Call `useInvestmentStore.getState().setAll({ brokerAccounts: ..., assetHoldings: ..., cashAdjustments: ..., dividendEntries: ... })`
