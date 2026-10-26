# Store Refactoring Design

**Issue:** #46 - Massive Store File
**Date:** 2026-05-03
**Status:** Draft

## Problem Statement

`src/store/useFinanceStore.ts` is 1403 lines, violating the single responsibility principle. This causes:
- Maintainability issues (hard to navigate)
- Debugging complexity (all logic in one file)
- Bundle bloat (entire store loaded even if unused)
- Testing difficulty (can't test domains in isolation)

## Goals

1. **Maintainability** — Clear file boundaries, each module has one purpose
2. **Debuggability** — Easier to trace issues to specific modules
3. **Testability** — Each domain can be unit tested independently
4. **Future bundle optimization** — Enable lazy-loading of store sections

## Architecture: Domain-Driven Split

```
src/store/
├── types/                    # All TypeScript interfaces
│   ├── finance.types.ts       # Transaction, Account, RecurringTransaction, etc.
│   └── index.ts               # Re-exports all types
├── validation/                # Data validation
│   ├── transaction.ts         # validateTransaction
│   ├── recurring.ts           # validateRecurringTransaction
│   └── index.ts               # Re-exports validators
├── sanitization/             # Data normalization for Firestore
│   ├── transaction.ts         # sanitizeTransaction
│   ├── recurring.ts          # sanitizeRecurring
│   ├── index.ts               # Re-exports sanitizers
├── defaults/                  # Default data (single source of truth)
│   ├── defaults.ts            # Default categories, accounts
│   └── index.ts
├── modules/                   # Domain modules (each is a Zustand slice)
│   ├── transactionModule.ts   # Transaction CRUD + sync
│   ├── accountModule.ts       # Account management
│   ├── recurringModule.ts    # Recurring logic + checkRecurring
│   ├── categoryModule.ts     # Category/subcategory management
│   ├── carModule.ts          # Mileage + tire tracking
│   ├── importExportModule.ts # Import/export logic
│   └── index.ts              # Module definitions + types
├── store.ts                   # Composes all modules into single store
├── useFinanceStore.ts         # Re-exports store hook (backward compatible)
└── index.ts                   # Barrel export
```

## Module Design

### 1. Transaction Module (`transactionModule.ts`)

**State:**
- `transactions: Transaction[]`
- `isSaving: boolean`
- `saveError: string | null`

**Actions:**
- `addTransaction(transaction: Transaction)`
- `updateTransaction(transaction: Transaction)`
- `deleteTransaction(id: string)`
- `setTransactions(transactions: Transaction[])`

**Internal dependencies:**
- `validateTransaction` from validation
- `sanitizeTransaction` from sanitization
- Firebase `updateDoc` for persistence
- Optimistic updates with rollback on error

### 2. Account Module (`accountModule.ts`)

**State:**
- `accounts: Account[]`
- `initialBalance: number`

**Actions:**
- `addAccount(account: Account)`
- `updateAccount(account: Account)`
- `deleteAccount(id: string)`
- `setDefaultAccount(id: string)`
- `setInitialBalance(balance: number)`

### 3. Recurring Module (`recurringModule.ts`)

**State:**
- `recurringTransactions: RecurringTransaction[]`
- `deletedRecurringInstances: { recurringLinkId: string; date: string }[]`

**Actions:**
- `addRecurring(recurring: RecurringTransaction)`
- `updateRecurring(recurring: RecurringTransaction)`
- `deleteRecurring(id: string)`
- `checkRecurring()` — Generates transactions from recurring rules
- `_migrateToMultiAccount()` — Migration helper

**Key logic:**
- `checkRecurring()` generates new transactions based on:
  - Current date vs recurring start/end dates
  - Day of month matching
  - Frequency (monthly/yearly)
  - Skip already-generated instances (tracked in `deletedRecurringInstances`)

### 4. Category Module (`categoryModule.ts`)

**State:**
- `categories: Category[]`
- `incomeCategories: Category[]`

**Actions:**
- `setCategories(categories: Category[])`
- `setIncomeCategories(categories: Category[])`
- `addCategory(type, name)`
- `renameCategory(type, oldName, newName)`
- `deleteCategory(type, name)`
- `addSubcategory(type, categoryName, subName)`
- `renameSubcategory(type, categoryName, oldName, newName)`
- `deleteSubcategory(type, categoryName, subName)`
- `deleteSubcategoryAndRemap(type, categoryName, subToDelete, remapToSub)`
- `moveSubcategory(type, subName, fromCategory, toCategory)`

### 5. Car Module (`carModule.ts`)

**State:**
- `carMileage: CarMileageRecord[]`
- `carInitialMileage: number`
- `tireSettings: TireSettings`
- `tireChanges: TireChangeRecord[]`

**Actions:**
- `addCarMileage(record)`
- `updateCarMileage(record)`
- `deleteCarMileage(id: string)`
- `setCarInitialMileage(value)`
- `setTireSettings(settings)`
- `addTireChange(record)`
- `updateTireChange(record)`
- `deleteTireChange(id: string)`
- `setTireChanges(records)`

### 6. Import/Export Module (`importExportModule.ts`)

**State:**
- `enabledModules: AppModules`
- `balanceStartDate: string`
- `language: string`

**Actions:**
- `setAll(data: Partial<FinanceState>)`
- `clearSaveError()`
- `exportAllData()` — Downloads backup JSON
- `importAllData(fileOrData)` — Imports from backup
- `previewBackup(file)` — Validates backup without importing

### 7. Settings Module (included in importExportModule)

**Actions:**
- `setLanguage(lang: string)`
- `toggleModule(module: keyof AppModules)`
- `setEnabledModules(modules: AppModules)`
- `setBalanceStartDate(date: string)`

## Data Flow

### Writing Data Flow

```
Component
    │
    ▼
useFinanceStore.addTransaction()
    │
    ├──► validation/validateTransaction()
    │         │
    │         ▼ (valid)
    │
    ├──► Module.addAction()  ──► Zustand set() (optimistic update)
    │                              │
    │                              ▼
    │                         Firebase updateDoc()
    │                              │
    │                              ▼ (error)
    │                         Rollback via set()
    │
    └──► sanitization/sanitizeTransaction() ──► Firestore payload
```

### Reading Data Flow

```
Firestore onSnapshot (useSyncFinance.ts)
    │
    ▼
store.setAll({ transactions, accounts, ... })
    │
    ▼
Zustand updates state
    │
    ▼
Components re-render via selector
```

## Error Handling Pattern

Each async action follows this pattern:

```typescript
addTransaction: async (transaction) => {
  const userId = useAuthStore.getState().user?.uid;
  if (!userId) return;

  const validation = validateTransaction(transaction);
  if (!validation.valid) {
    set({ saveError: validation.error, isSaving: false });
    return;
  }

  set({ saveError: null, isSaving: true });
  try {
    // Optimistic update
    set((state) => ({ transactions: [...], isSaving: false }));

    // Persist
    await updateDoc(docRef, { ... });

  } catch (err) {
    // Rollback
    set((state) => ({ transactions: reverted, saveError: ..., isSaving: false }));
  }
}
```

## Backward Compatibility

The refactored store MUST maintain the same public API:

```typescript
// Current usage (must continue to work)
import { useFinanceStore } from './store/useFinanceStore';
const { transactions, addTransaction } = useFinanceStore();

// New internal structure is transparent to consumers
```

Implementation approach: Keep `useFinanceStore.ts` as the public API entry point that re-exports from the new internal modules. This allows gradual migration.

## Testing Strategy (for later)

Each module can be tested in isolation:

1. **Validation tests** — Pure functions, easy to unit test
2. **Sanitization tests** — Input/output mapping
3. **Module tests** — Test Zustand slices with mock Firebase

Example test structure:
```
src/
├── store/
│   ├── __tests__/
│   │   ├── validation/
│   │   │   ├── transaction.test.ts
│   │   │   └── recurring.test.ts
│   │   ├── sanitization/
│   │   │   ├── transaction.test.ts
│   │   │   └── recurring.test.ts
│   │   └── modules/
│   │       ├── transactionModule.test.ts
│   │       └── recurringModule.test.ts
```

## Migration Path

1. **Phase 1:** Create folder structure + extract types, validation, sanitization, defaults
2. **Phase 2:** Extract one module at a time (transaction → account → recurring → category → car → import/export)
3. **Phase 3:** Compose in store.ts, update useFinanceStore.ts exports
4. **Phase 4:** Update imports throughout codebase (if any direct module imports)
5. **Phase 5:** Delete original useFinanceStore.ts when all references updated

## Constraints

- **No breaking changes** — Public API must remain identical
- **No data migration** — Existing Firestore data remains valid
- **Single atomic commit** — Each module extraction in one commit for easy rollback

## Acceptance Criteria

- [ ] All types in `src/store/types/`
- [ ] All validators in `src/store/validation/`
- [ ] All sanitizers in `src/store/sanitization/`
- [ ] Default categories/accounts in `src/store/defaults/` (single source)
- [ ] Each domain in separate module under `src/store/modules/`
- [ ] `useFinanceStore` hook has identical API to before
- [ ] No runtime errors in dev mode
- [ ] ESLint passes
- [ ] TypeScript passes