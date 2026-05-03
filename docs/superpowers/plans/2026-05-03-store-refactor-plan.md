# Store Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split 1403-line `src/store/useFinanceStore.ts` into domain-driven modules while maintaining 100% backward compatibility.

**Architecture:** Domain-driven split with separate folders for types, validation, sanitization, defaults, and modules. Keep `useFinanceStore.ts` as backward-compatible re-export.

**Tech Stack:** TypeScript, Zustand, Firebase Firestore

---

## File Structure to Create/Modify

```
src/store/
├── types/
│   ├── finance.types.ts    (NEW - extracted from lines 8-105)
│   └── index.ts            (NEW - barrel export)
├── validation/
│   ├── transaction.ts      (NEW - extracted from line 77)
│   ├── recurring.ts        (NEW - extracted from line 91)
│   └── index.ts            (NEW - barrel export)
├── sanitization/
│   ├── transaction.ts      (NEW - extracted from line 188)
│   ├── recurring.ts       (NEW - extracted from line 206)
│   └── index.ts            (NEW - barrel export)
├── defaults/
│   ├── defaults.ts         (NEW - extracted from lines 226-245)
│   └── index.ts            (NEW - barrel export)
├── modules/
│   ├── transactionModule.ts    (NEW - extracted from transaction CRUD)
│   ├── accountModule.ts       (NEW - extracted from account CRUD)
│   ├── recurringModule.ts     (NEW - extracted from recurring CRUD + checkRecurring)
│   ├── categoryModule.ts      (NEW - extracted from category actions)
│   ├── carModule.ts           (NEW - extracted from car CRUD)
│   ├── importExportModule.ts  (NEW - extracted from import/export + settings)
│   ├── index.ts               (NEW - module types)
│   └── store.ts               (NEW - composes all modules)
├── useFinanceStore.ts      (MODIFY - re-export from new modules)
└── index.ts                (NEW - barrel export)
```

---

## Phase 1: Extract Foundation (Types, Validation, Sanitization, Defaults)

### Task 1: Extract Types

**Files:**
- Create: `src/store/types/finance.types.ts`
- Create: `src/store/types/index.ts`
- Modify: `src/store/useFinanceStore.ts` (remove extracted types, re-export from new location)

- [ ] **Step 1: Create types/finance.types.ts**

```typescript
// src/store/types/finance.types.ts

export interface Category {
  name: string;
  subcategories: string[];
}

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense';
  accountId: string;
  recurringLinkId?: string;
  consumption?: number;
  readingDateStart?: string;
  readingDateEnd?: string;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense';
  dayOfMonth: number;
  accountId: string;
  startDate: string;
  endDate?: string | null;
  frequency?: 'monthly' | 'yearly';
  monthOfYear?: number;
}

export interface AppModules {
  financeTracker: boolean;
  carManagement: boolean;
  utilityTracker: boolean;
}

export interface CarMileageRecord {
  id: string;
  year: number;
  month: number;
  reading: number;
}

export interface TireChangeRecord {
  id: string;
  date: string;
  type: 'summer' | 'winter';
  odometer: number;
}

export interface TireSettings {
  summerModel: string;
  winterModel: string;
  initialTireType: 'summer' | 'winter';
}
```

- [ ] **Step 2: Create types/index.ts**

```typescript
// src/store/types/index.ts
export * from './finance.types';
```

- [ ] **Step 3: Modify useFinanceStore.ts to re-export types**
Add at top of file:
```typescript
export * from './types';
```

Keep existing exports but remove the actual type definitions (lines 8-105), keeping just the re-export.

- [ ] **Step 4: Commit**

```bash
git add src/store/types/ src/store/useFinanceStore.ts
git commit -m "refactor: extract types to src/store/types/"
```

---

### Task 2: Extract Validation

**Files:**
- Create: `src/store/validation/transaction.ts`
- Create: `src/store/validation/recurring.ts`
- Create: `src/store/validation/index.ts`
- Modify: `src/store/useFinanceStore.ts`

- [ ] **Step 1: Create validation/transaction.ts**

```typescript
// src/store/validation/transaction.ts
import { Transaction } from '../types';

export function validateTransaction(t: Transaction): { valid: boolean; error?: string } {
  if (!t.description?.trim()) {
    return { valid: false, error: 'Description is required' };
  }
  if (typeof t.amount !== 'number' || t.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (!t.date || !t.category || !t.subcategory || !t.accountId) {
    return { valid: false, error: 'Missing required fields' };
  }
  return { valid: true };
}
```

- [ ] **Step 2: Create validation/recurring.ts**

```typescript
// src/store/validation/recurring.ts
import { RecurringTransaction } from '../types';

export function validateRecurringTransaction(r: RecurringTransaction): { valid: boolean; error?: string } {
  if (!r.description?.trim()) {
    return { valid: false, error: 'Description is required' };
  }
  if (typeof r.amount !== 'number' || r.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (!r.startDate || !r.accountId || !r.category || !r.subcategory) {
    return { valid: false, error: 'Missing required fields' };
  }
  if (r.endDate && r.startDate && r.endDate < r.startDate) {
    return { valid: false, error: 'End date cannot be before start date' };
  }
  return { valid: true };
}
```

- [ ] **Step 3: Create validation/index.ts**

```typescript
// src/store/validation/index.ts
export * from './transaction';
export * from './recurring';
```

- [ ] **Step 4: Modify useFinanceStore.ts**
Remove lines 76-105 (validation functions) and add re-export at top:
```typescript
export * from './validation';
```

- [ ] **Step 5: Commit**

```bash
git add src/store/validation/ src/store/useFinanceStore.ts
git commit -m "refactor: extract validation to src/store/validation/"
```

---

### Task 3: Extract Sanitization

**Files:**
- Create: `src/store/sanitization/transaction.ts`
- Create: `src/store/sanitization/recurring.ts`
- Create: `src/store/sanitization/index.ts`
- Modify: `src/store/useFinanceStore.ts`

- [ ] **Step 1: Create sanitization/transaction.ts**

```typescript
// src/store/sanitization/transaction.ts
import { Transaction } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeTransaction = (t: Transaction): any => {
  return {
    id: t.id,
    date: t.date,
    description: t.description,
    category: t.category,
    subcategory: t.subcategory,
    amount: Number(t.amount),
    type: t.type,
    accountId: t.accountId,
    recurringLinkId: t.recurringLinkId ?? null,
    consumption: (t.consumption !== undefined && t.consumption !== null && String(t.consumption) !== '') ? Number(t.consumption) : null,
    readingDateStart: t.readingDateStart ?? null,
    readingDateEnd: t.readingDateEnd ?? null,
  };
};
```

- [ ] **Step 2: Create sanitization/recurring.ts**

```typescript
// src/store/sanitization/recurring.ts
import { RecurringTransaction } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeRecurring = (r: RecurringTransaction): any => {
  return {
    id: r.id,
    description: r.description,
    category: r.category,
    subcategory: r.subcategory,
    amount: Number(r.amount),
    type: r.type,
    dayOfMonth: Number(r.dayOfMonth),
    accountId: r.accountId,
    startDate: r.startDate,
    endDate: r.endDate || null,
    frequency: r.frequency || 'monthly',
    ...(r.frequency === 'yearly' && r.monthOfYear ? { monthOfYear: r.monthOfYear } : {}),
  };
};
```

- [ ] **Step 3: Create sanitization/index.ts**

```typescript
// src/store/sanitization/index.ts
export * from './transaction';
export * from './recurring';
```

- [ ] **Step 4: Modify useFinanceStore.ts**
Remove lines 187-221 (sanitization functions) and add re-export at top:
```typescript
export * from './sanitization';
```

- [ ] **Step 5: Commit**

```bash
git add src/store/sanitization/ src/store/useFinanceStore.ts
git commit -m "refactor: extract sanitization to src/store/sanitization/"
```

---

### Task 4: Extract Defaults (Single Source of Truth)

**Files:**
- Create: `src/store/defaults/defaults.ts`
- Create: `src/store/defaults/index.ts`
- Modify: `src/store/useFinanceStore.ts`
- Modify: `src/hooks/useSyncFinance.ts` (to use shared defaults)

- [ ] **Step 1: Create defaults/defaults.ts**

```typescript
// src/store/defaults/defaults.ts
import { Account, Category } from '../types';

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'default-main', name: 'Conto Principale', initialBalance: 0, isDefault: true }
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { name: 'Debiti', subcategories: ['Carte di credito', 'Prestiti studio', 'Altri prestiti', 'Imposte'] },
  { name: 'Divertimento', subcategories: ['Libri', 'Concerti', 'Partite', 'Hobby', 'Film', 'Musica', 'Attività all\'aperto', 'Fotografia', 'Sport', 'Golf', 'Teatro', 'TV'] },
  { name: 'Spese quotidiane', subcategories: ['Spesa', 'Ristoranti', 'Barbiere', 'Vestiti', 'Lavanderia', 'Tabacchi', 'Nespresso'] },
  { name: 'Regali', subcategories: ['Regali generici', 'Donazioni'] },
  { name: 'Salute', subcategories: ['Dottori/dentista/oculista', 'Cure specialistiche', 'Farmacia', 'Emergenze'] },
  { name: 'Casa', subcategories: ['Mutuo', 'Imposte immobili', 'Arredamento', 'Giardinaggio', 'Forniture', 'Manutenzione', 'Miglioramenti', 'Verisure', 'Trasloco'] },
  { name: 'Assicurazione', subcategories: ['Auto', 'Salute', 'Casa', 'Vita'] },
  { name: 'Tecnologia', subcategories: ['Domini/hosting', 'Servizi online', 'Hardware', 'Software'] },
  { name: 'Trasporti', subcategories: ['Carburante', 'Prestito auto', 'Riparazioni', 'Bollo', 'Trasporto pubblico'] },
  { name: 'Viaggi', subcategories: ['Biglietti aerei', 'Hotel', 'Alimenti', 'Trasporti', 'Divertimento'] },
  { name: 'Bollette', subcategories: ['Telefono', 'TV', 'Internet', 'Elettricità', 'Gas', 'Condominio', 'Rifiuti'] },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { name: 'Salario', subcategories: ['Busta paga', 'Mance', 'Bonus', 'Commissioni', '13-esima', '14-esima'] },
  { name: 'Altro', subcategories: ['Risparmi', 'Interessi', 'Dividendi', 'Regali', 'Rimborsi', 'Rimborso 730'] },
];

export const DEFAULT_ENABLED_MODULES = {
  financeTracker: true,
  carManagement: false,
  utilityTracker: false,
};

export const DEFAULT_TIRE_SETTINGS = {
  summerModel: '',
  winterModel: '',
  initialTireType: 'summer' as const,
};

export const DEFAULT_BALANCE_START_DATE = '2026-01-01';
```

- [ ] **Step 2: Create defaults/index.ts**

```typescript
// src/store/defaults/index.ts
export * from './defaults';
```

- [ ] **Step 3: Modify useFinanceStore.ts**
Replace hardcoded defaults (lines 226-245, 252-261) with imports from defaults:
```typescript
import { DEFAULT_ACCOUNTS, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_ENABLED_MODULES, DEFAULT_TIRE_SETTINGS, DEFAULT_BALANCE_START_DATE } from './defaults';

// In store state:
accounts: DEFAULT_ACCOUNTS,
categories: DEFAULT_EXPENSE_CATEGORIES,
incomeCategories: DEFAULT_INCOME_CATEGORIES,
enabledModules: DEFAULT_ENABLED_MODULES,
tireSettings: DEFAULT_TIRE_SETTINGS,
balanceStartDate: DEFAULT_BALANCE_START_DATE,
```

- [ ] **Step 4: Modify useSyncFinance.ts (Fixes #48 Duplicate Categories)**
Replace hardcoded categories with imports from defaults:

```typescript
import { DEFAULT_ACCOUNTS, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGULES, DEFAULT_ENABLED_MODULES, DEFAULT_BALANCE_START_DATE } from '../store/defaults';

const getDefaultUserConfig = (): UserDoc => {
  const today = dayjs();
  const firstDayOfMonth = today.startOf('month').format('YYYY-MM-DD');

  return {
    transactions: [],
    initialBalance: 0,
    accounts: DEFAULT_ACCOUNTS,
    categories: DEFAULT_EXPENSE_CATEGORIES,
    incomeCategories: DEFAULT_INCOME_CATEGORIES,
    recurringTransactions: [],
    carMileage: [],
    carInitialMileage: 0,
    tireSettings: { summerModel: '', winterModel: '', initialTireType: 'summer' },
    tireChanges: [],
    enabledModules: DEFAULT_ENABLED_MODULES,
    balanceStartDate: firstDayOfMonth,
  };
};
```

- [ ] **Step 5: Commit**

```bash
git add src/store/defaults/ src/store/useFinanceStore.ts src/hooks/useSyncFinance.ts
git commit -m "refactor: extract defaults, fix duplicate categories (#48)"
```

---

## Phase 2: Extract Modules

### Task 5: Extract Transaction Module

**Files:**
- Create: `src/store/modules/transactionModule.ts`
- Modify: `src/store/modules/index.ts`

- [ ] **Step 1: Create modules/transactionModule.ts**

```typescript
// src/store/modules/transactionModule.ts
import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../useAuthStore';
import { Transaction } from '../types';
import { validateTransaction } from '../validation';
import { sanitizeTransaction } from '../sanitization';

interface TransactionState {
  transactions: Transaction[];
  isSaving: boolean;
  saveError: string | null;
}

interface TransactionActions {
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setTransactions: (transactions: Transaction[]) => Promise<void>;
  setAll: (data: Partial<TransactionState>) => void;
  clearSaveError: () => void;
}

export type TransactionModule = TransactionState & TransactionActions;

export const createTransactionModule = () => {
  const setAll = (data: Partial<TransactionState>) => data;
  const clearSaveError = () => {};

  return {
    transactions: [] as Transaction[],
    isSaving: false,
    saveError: null as string | null,

    addTransaction: async (transaction: Transaction) => {
      const userId = useAuthStore.getState().user?.uid;
      if (!userId) return;

      const validation = validateTransaction(transaction);
      if (!validation.valid) {
        // Will be set by store
        return;
      }

      try {
        // Optimistic update handled by store
        const docRef = doc(db, 'users', userId);
        await updateDoc(docRef, { transactions: [] }); // Placeholder - will be replaced
      } catch (err) {
        console.error('addTransaction error:', err);
      }
    },

    updateTransaction: async (transaction: Transaction) => {
      // Similar structure
    },

    deleteTransaction: async (id: string) => {
      // Similar structure
    },

    setTransactions: async (transactions: Transaction[]) => {
      // Similar structure
    },

    setAll,
    clearSaveError,
  };
};
```

Wait - the module approach needs to be simpler. Since Zustand doesn't natively support slicing in the way I described, I need a different approach.

**Revised Approach:** Create each module as a pure Zustand store slice factory, then compose them in the main store.

Let me rewrite the plan with the correct approach:

---

## Phase 2: Extract Modules (Revised Approach)

The modules will be factory functions that return state and actions, which are then composed in the main store.

### Task 5: Create Module Factory Pattern

**Files:**
- Create: `src/store/modules/index.ts` (define module types)
- Create: `src/store/store.ts` (compose all modules)
- Modify: `src/store/useFinanceStore.ts`

- [ ] **Step 1: Create modules/index.ts**

```typescript
// src/store/modules/index.ts
import { Transaction, Account, RecurringTransaction, Category, CarMileageRecord, TireChangeRecord, TireSettings, AppModules } from '../types';

export interface FinanceState {
  // Transaction state
  transactions: Transaction[];
  // Account state
  accounts: Account[];
  initialBalance: number;
  // Recurring state
  recurringTransactions: RecurringTransaction[];
  deletedRecurringInstances: { recurringLinkId: string; date: string }[];
  // Category state
  categories: Category[];
  incomeCategories: Category[];
  // Car state
  carMileage: CarMileageRecord[];
  carInitialMileage: number;
  tireSettings: TireSettings;
  tireChanges: TireChangeRecord[];
  // Settings state
  enabledModules: AppModules;
  balanceStartDate: string;
  language: string;
  // UI state
  isSaving: boolean;
  saveError: string | null;
}
```

- [ ] **Step 2: Create store.ts that composes all modules**
This will be the main refactoring task - compose all extracted logic into a single store.

Given the complexity, let me simplify the plan. The key is that we extract the functions into separate files but keep them composed in useFinanceStore.ts. The internal implementation details change but the public API remains the same.

---

### Task 5: Create Transaction Domain File

**Files:**
- Create: `src/store/domains/transactionDomain.ts` (ALL transaction-related logic)
- Modify: `src/store/useFinanceStore.ts` (delegate to domain)

- [ ] **Step 1: Create domains/transactionDomain.ts**

```typescript
// src/store/domains/transactionDomain.ts
import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';
import { Transaction } from './types';
import { validateTransaction } from './validation';
import { sanitizeTransaction } from './sanitization';
import { useFinanceStore } from './useFinanceStore';

// All transaction-related actions in one file
export const createTransactionActions = (set: any, get: any) => ({
  addTransaction: async (transaction: Transaction) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const validation = validateTransaction(transaction);
    if (!validation.valid) {
      set({ saveError: validation.error, isSaving: false });
      return;
    }

    set({ saveError: null, isSaving: true });
    try {
      set((state: any) => {
        const sorted = [transaction, ...state.transactions].sort((a: Transaction, b: Transaction) => 
          dayjs(b.date).unix() - dayjs(a.date).unix()
        );
        return { transactions: sorted, isSaving: false };
      });
      const docRef = doc(db, 'users', userId);
      const sanitizedTransactions = get().transactions.map(sanitizeTransaction);
      await updateDoc(docRef, { transactions: sanitizedTransactions });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
      set((state: any) => {
        const reverted = state.transactions.filter((t: Transaction) => t.id !== transaction.id);
        return { saveError: errorMessage, isSaving: false, transactions: reverted };
      });
      console.error('addTransaction error:', err);
    }
  },

  updateTransaction: async (transaction: Transaction) => {
    // ... similar implementation (lines 316-342)
  },

  deleteTransaction: async (id: string) => {
    // ... similar implementation (lines 344-380)
  },

  setTransactions: async (transactions: Transaction[]) => {
    // ... similar implementation (lines 414-431)
  },
});
```

- [ ] **Step 2: Modify useFinanceStore.ts to use domain**
Replace transaction action implementations with imports:

```typescript
import { createTransactionActions } from './domains/transactionDomain';

// Inside store:
...createTransactionActions(set, get),
```

- [ ] **Step 3: Commit**

---

### Task 6: Create Account Domain File

**Files:**
- Create: `src/store/domains/accountDomain.ts`
- Modify: `src/store/useFinanceStore.ts`

- [ ] **Step 1: Create domains/accountDomain.ts**

All account-related actions (lines 1022-1096):
- `addAccount`
- `updateAccount`
- `deleteAccount`
- `setDefaultAccount`
- `setInitialBalance`

- [ ] **Step 2: Commit**

---

### Task 7: Create Recurring Domain File

**Files:**
- Create: `src/store/domains/recurringDomain.ts`
- Modify: `src/store/useFinanceStore.ts`

- [ ] **Step 1: Create domains/recurringDomain.ts**

All recurring-related actions (lines 862-1020):
- `addRecurring`
- `updateRecurring`
- `deleteRecurring`
- `checkRecurring`
- `_migrateToMultiAccount`

- [ ] **Step 2: Commit**

---

### Task 8: Create Category Domain File

**Files:**
- Create: `src/store/domains/categoryDomain.ts`
- Modify: `src/store/useFinanceStore.ts`

- [ ] **Step 1: Create domains/categoryDomain.ts**

All category-related actions (lines 590-860):
- `setCategories`
- `setIncomeCategories`
- `addCategory`
- `renameCategory`
- `deleteCategory`
- `addSubcategory`
- `renameSubcategory`
- `deleteSubcategory`
- `deleteSubcategoryAndRemap`
- `moveSubcategory`

- [ ] **Step 2: Commit**

---

### Task 9: Create Car Domain File

**Files:**
- Create: `src/store/domains/carDomain.ts`
- Modify: `src/store/useFinanceStore.ts`

- [ ] **Step 1: Create domains/carDomain.ts**

All car-related actions (lines 1098-1256):
- `setCarMileage`
- `addCarMileage`
- `updateCarMileage`
- `deleteCarMileage`
- `setCarInitialMileage`
- `setTireSettings`
- `addTireChange`
- `updateTireChange`
- `deleteTireChange`
- `setTireChanges`

- [ ] **Step 2: Commit**

---

### Task 10: Create Import/Export Domain File

**Files:**
- Create: `src/store/domains/importExportDomain.ts`
- Modify: `src/store/useFinanceStore.ts`

- [ ] **Step 1: Create domains/importExportDomain.ts**

All import/export and settings actions (lines 1258-1401):
- `setAll`
- `clearSaveError`
- `exportAllData`
- `importAllData`
- `previewBackup`
- `setLanguage`
- `setEnabledModules`
- `toggleModule`
- `setBalanceStartDate`

- [ ] **Step 2: Commit**

---

## Phase 3: Final Integration

### Task 11: Compose All Domains in useFinanceStore.ts

**Files:**
- Modify: `src/store/useFinanceStore.ts`

- [ ] **Step 1: Replace all action implementations with domain imports**

```typescript
// src/store/useFinanceStore.ts (simplified)
import { create } from 'zustand';
import { Transaction, Account, RecurringTransaction, Category, CarMileageRecord, TireSettings, TireChangeRecord, AppModules } from './types';
import { DEFAULT_ACCOUNTS, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_ENABLED_MODULES, DEFAULT_TIRE_SETTINGS, DEFAULT_BALANCE_START_DATE } from './defaults';

import { createTransactionActions } from './domains/transactionDomain';
import { createAccountActions } from './domains/accountDomain';
import { createRecurringActions } from './domains/recurringDomain';
import { createCategoryActions } from './domains/categoryDomain';
import { createCarActions } from './domains/carDomain';
import { createImportExportActions } from './domains/importExportDomain';

// State interface
interface FinanceState {
  transactions: Transaction[];
  accounts: Account[];
  // ... all other state
}

export const useFinanceStore = create<FinanceState>()(
  (set, get) => ({
    // Initial state using defaults
    accounts: DEFAULT_ACCOUNTS,
    categories: DEFAULT_EXPENSE_CATEGORIES,
    incomeCategories: DEFAULT_INCOME_CATEGORIES,
    // ... other initial state

    // Compose all domain actions
    ...createTransactionActions(set, get),
    ...createAccountActions(set, get),
    ...createRecurringActions(set, get),
    ...createCategoryActions(set, get),
    ...createCarActions(set, get),
    ...createImportExportActions(set, get),
  })
);

// Re-export for backward compatibility
export * from './types';
export * from './validation';
export * from './sanitization';
export * from './defaults';
```

- [ ] **Step 2: Run TypeScript check**

```bash
npm run build
```

Expected: PASS (no type errors)

- [ ] **Step 3: Run ESLint**

```bash
npm run lint
```

Expected: PASS (no lint errors)

- [ ] **Step 4: Test in dev mode**

```bash
npm run dev
```

Expected: App loads normally, all features work

- [ ] **Step 5: Commit**

```bash
git add src/store/
git commit -m "refactor: compose all domains in useFinanceStore.ts"
```

---

### Task 12: Verify Backward Compatibility

**Files:**
- Check all imports in codebase

- [ ] **Step 1: Find all imports of useFinanceStore**

```bash
grep -r "from.*store/useFinanceStore" --include="*.ts" --include="*.tsx" src/
```

Expected: Multiple files import from useFinanceStore

- [ ] **Step 2: Verify each import still works**

Check that all exported types and functions are still available via re-exports

- [ ] **Step 3: Commit**

---

### Task 13: Final Verification

- [ ] **Step 1: Run full TypeScript build**

```bash
npm run build
```

Expected: PASS

- [ ] **Step 2: Run ESLint**

```bash
npm run lint
```

Expected: PASS

- [ ] **Step 3: Test key flows manually**

- Add transaction
- Add recurring
- Export data
- Import data

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "refactor: complete store split into domains"
```

---

## Acceptance Criteria Validation

- [ ] All types in `src/store/types/`
- [ ] All validators in `src/store/validation/`
- [ ] All sanitizers in `src/store/sanitization/`
- [ ] Default categories/accounts in `src/store/defaults/` (single source)
- [ ] Each domain in separate file under `src/store/domains/`
- [ ] `useFinanceStore` hook has identical API to before
- [ ] No runtime errors in dev mode
- [ ] ESLint passes
- [ ] TypeScript passes

---

## Notes

- **CRITICAL:** Each commit must leave the app in working state. Test after each domain extraction.
- **No breaking changes:** Public API must remain identical.
- **Test early, test often:** Run `npm run dev` after each domain extraction to catch issues early.
- **Duplicate categories fix included in Task 4** — Issue #48 is resolved as part of the defaults extraction.