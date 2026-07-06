---
title: "Plan: Backup/Restore Data Coverage"
tags: [plan, backup, budget, investment, needed]
created: 2026-06-30
updated: 2026-06-30
status: planned
sources: ["raw/101-backup-restore-gaps.md"]
related: ["architecture/concerns-and-tech-debt", "features/budget-savings-engine", "features/investment-tracking-v3"]
---

# Plan: Backup/Restore Data Coverage

**Status:** Completed
**Priority:** High

## Goal

Ensure backup/restore includes all persisted data entities — specifically budget targets and the full investment data model (broker accounts, asset holdings, cash adjustments, dividend entries).

## Missing Entities

| Entity | Store | Backup | Restore | Risk |
|--------|-------|--------|---------|------|
| `budgetTargets` | `useBudgetStore` | ❌ | ❌ | Budget config lost on restore |
| `brokerAccounts` | `useInvestmentStore` | ❌ | ❌ | Broker config lost on restore (only legacy `brokerConfig` saved) |
| `assetHoldings` | `useInvestmentStore` | ❌ | ❌ | Holdings lost on restore |
| `cashAdjustments` | `useInvestmentStore` | ❌ | ❌ | Cash adjustments lost on restore |
| `dividendEntries` | `useInvestmentStore` | ❌ | ❌ | Dividend history lost on restore |
| `deletedRecurringInstances` | `useFinanceStore` | ❌ | ❌ | Minor — recurring deletions re-appear |

## Changes Required

### 1. `src/store/backup/index.ts`

- Extend `BackupPayload` interface with 6 new optional fields
- Add validation for `budgetTargets`, `brokerAccounts`, `assetHoldings`, `cashAdjustments`, `dividendEntries`
- Update `createBackup()` to read from respective stores via cast
- Extend `BackupPreview.summary` with new entity counts
- Update `previewBackup()` to include new counts

### 2. `src/store/useFinanceStore.ts`

- Update `importAllData()` Firestore `updateDoc` to write new fields
- After Firestore write, also set state on `useBudgetStore` and `useInvestmentStore`

### 3. Cross-store restore

`importAllData()` currently only sets state on `useFinanceStore`. Must also:

```
useBudgetStore.getState().setBudgetTargets(data.budgetTargets ?? [])
useInvestmentStore.getState().setAll({
  brokerAccounts: data.brokerAccounts ?? Defaults.DEFAULT_BROKER_ACCOUNTS,
  assetHoldings: data.assetHoldings ?? [],
  cashAdjustments: data.cashAdjustments ?? [],
  dividendEntries: data.dividendEntries ?? [],
})
```

## Verification

1. Export backup with budget targets + investment data (broker accounts, holdings, adjustments, dividends)
2. Inspect JSON — verify all fields present
3. Restore backup — verify all data intact in UI
4. Run `npm run build` — verify no type errors

## Related

- [[wiki/architecture/concerns-and-tech-debt]] — import/backup fragility noted
- [[wiki/features/budget-savings-engine/budget-savings-engine]] — budget data source
- [[wiki/features/investment-tracking-v3/investment-tracking-v3]] — cash adjustments + dividends
- [[wiki/features/multi-broker-architecture/multi-broker-architecture]] — broker accounts + holdings
- Source: [raw/101-backup-restore-gaps/101-backup-restore-gaps.md](raw/101-backup-restore-gaps/101-backup-restore-gaps.md)
