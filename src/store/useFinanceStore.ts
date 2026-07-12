import dayjs from 'dayjs';
import { arrayUnion, doc, updateDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { create } from 'zustand';
import { db } from '../lib/firebase';
import { getTransactionDocRef, getTransactionsCollectionRef } from '../lib/converters';
import i18n from '../lib/i18n';
import { useAuthStore } from './useAuthStore';
import { useBudgetStore } from './useBudgetStore';
import { useInvestmentStore } from './useInvestmentStore';
import * as Types from './types';
import * as Validation from './validation';
import * as Sanitization from './sanitization';
import * as Defaults from './defaults';
import * as Backup from './backup';

// Re-export types (with "I" prefix)
export { Types };

// Re-export validation functions from validation folder
export { Validation };

// Backward-compatible type aliases (no prefix for existing code)
export type Category = Types.ICategory;
export type Account = Types.IAccount;
export type Transaction = Types.ITransaction;
export type RecurringTransaction = Types.IRecurringTransaction;
export type AppModules = Types.IAppModules;
export type CarMileageRecord = Types.ICarMileageRecord;
export type TireChangeRecord = Types.ITireChangeRecord;
export type TireSettings = Types.ITireSettings;

// Re-export validation functions from validation folder
export const validateTransaction = Validation.validateTransaction;
export const validateRecurringTransaction = Validation.validateRecurringTransaction;

// Re-export sanitization functions from sanitization folder
export { Sanitization };

interface FinanceState {
  initialBalance: number;
  categories: Category[];
  incomeCategories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  carMileage: CarMileageRecord[];
  carInitialMileage: number;
  tireSettings: TireSettings;
  tireChanges: TireChangeRecord[];
  enabledModules: AppModules;
  balanceStartDate: string;
  deletedRecurringInstances: { recurringLinkId: string; date: string }[];
  isSaving: boolean;
  isCheckingRecurring: boolean;
  lastRecurringCheck: string | null;
  hasLocalChanges: boolean;
  isLoading: boolean;
  saveError: string | null;
  language: string;
  setLanguage: (lang: string) => void;
  setInitialBalance: (balance: number) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setCategories: (categories: Category[]) => void;
  setIncomeCategories: (categories: Category[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAccounts: (accounts: Account[]) => void;
  setRecurringTransactions: (recurring: RecurringTransaction[]) => void;
  setCarMileage: (mileage: CarMileageRecord[]) => void;
  setEnabledModules: (modules: AppModules) => void;
  toggleModule: (module: keyof AppModules) => void;
  setBalanceStartDate: (date: string) => void;
  // Category actions
  addCategory: (type: 'income' | 'expense', name: string) => void;
  renameCategory: (type: 'income' | 'expense', oldName: string, newName: string) => void;
  deleteCategory: (type: 'income' | 'expense', name: string) => void;
  // Subcategory actions
  addSubcategory: (type: 'income' | 'expense', categoryName: string, subName: string) => void;
  renameSubcategory: (type: 'income' | 'expense', categoryName: string, oldName: string, newName: string) => void;
  deleteSubcategory: (type: 'income' | 'expense', categoryName: string, subName: string) => void;
  deleteSubcategoryAndRemap: (type: 'income' | 'expense', categoryName: string, subToDelete: string, remapToSub: string) => void;
  moveSubcategory: (type: 'income' | 'expense', subName: string, fromCategory: string, toCategory: string) => void;
  // Recurring actions
  addRecurring: (recurring: RecurringTransaction) => void;
  updateRecurring: (recurring: RecurringTransaction) => void;
  deleteRecurring: (id: string) => void;
  checkRecurring: () => void;
  _migrateToMultiAccount: () => void;
  // Account actions
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  setDefaultAccount: (id: string) => void;
  // Car Mileage actions
  addCarMileage: (record: CarMileageRecord) => void;
  updateCarMileage: (record: CarMileageRecord) => void;
  deleteCarMileage: (id: string) => void;
  setCarInitialMileage: (value: number) => void;
  setTireSettings: (settings: TireSettings) => void;
  addTireChange: (record: TireChangeRecord) => void;
  updateTireChange: (record: TireChangeRecord) => void;
  deleteTireChange: (id: string) => void;
  setTireChanges: (records: TireChangeRecord[]) => void;
  setAll: (data: Partial<FinanceState>) => void;
  clearSaveError: () => void;
  exportAllData: () => void;
  importAllData: (fileOrData: File | object) => Promise<boolean>;
  previewBackup: (file: File) => Promise<Backup.BackupPreview>;
}

export const useFinanceStore = create<FinanceState>()(
    (set) => ({
      initialBalance: 0,
      accounts: Defaults.DEFAULT_ACCOUNTS,
      categories: Defaults.DEFAULT_CATEGORIES,
      incomeCategories: Defaults.DEFAULT_INCOME_CATEGORIES,
      transactions: [],
      recurringTransactions: [],
      carMileage: [],
      carInitialMileage: 0,
      tireSettings: Defaults.DEFAULT_TIRE_SETTINGS,
      tireChanges: [],
      enabledModules: Defaults.DEFAULT_ENABLED_MODULES,
      balanceStartDate: Defaults.DEFAULT_BALANCE_START_DATE,
      deletedRecurringInstances: [],
      isSaving: false,
      isCheckingRecurring: false,
      lastRecurringCheck: null,
      hasLocalChanges: false,
      isLoading: true,
      saveError: null,
      language: localStorage.getItem('myfinance_language') || i18n.language || Defaults.DEFAULT_LANGUAGE,

      setLanguage: (lang) => {
        localStorage.setItem('myfinance_language', lang);
        i18n.changeLanguage(lang);
        set({ language: lang });
      },

      setInitialBalance: async (balance) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { initialBalance: balance });
          set({ initialBalance: balance, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set initial balance';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setInitialBalance error:', err);
        }
      },

      addTransaction: async (transaction) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        const validation = validateTransaction(transaction);
        if (!validation.valid) {
          set({ saveError: validation.error, isSaving: false });
          return;
        }

        set({ saveError: null, isSaving: true, hasLocalChanges: true });
        try {
          set((state) => {
            const sorted = [transaction, ...state.transactions].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
            return { transactions: sorted, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const sanitizedTransactions = useFinanceStore.getState().transactions.map(Sanitization.sanitizeTransaction);
          await updateDoc(docRef, { transactions: sanitizedTransactions });

          const txnRef = getTransactionDocRef(userId, transaction.id);
          await setDoc(txnRef, {
            ...Sanitization.sanitizeTransaction(transaction),
            createdAt: undefined,
          }).catch((err) => console.error('sub-collection write error:', err));

          set({ hasLocalChanges: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
          set((state) => {
            const reverted = state.transactions.filter(t => t.id !== transaction.id);
            return { saveError: errorMessage, isSaving: false, hasLocalChanges: false, transactions: reverted };
          });
          console.error('addTransaction error:', err);
        }
      },

      updateTransaction: async (transaction) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        const validation = validateTransaction(transaction);
        if (!validation.valid) {
          set({ saveError: validation.error, isSaving: false });
          return;
        }

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          set((state) => {
            const newTransactions = state.transactions.map((t) => (t.id === transaction.id ? transaction : t));
            const sorted = newTransactions.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
            return { transactions: sorted, isSaving: false };
          });
          const sanitizedTransactions = useFinanceStore.getState().transactions.map(Sanitization.sanitizeTransaction);
          await updateDoc(docRef, { transactions: sanitizedTransactions });

          const txnRef = getTransactionDocRef(userId, transaction.id);
          await setDoc(txnRef, {
            ...Sanitization.sanitizeTransaction(transaction),
            createdAt: undefined,
          }).catch((err) => console.error('sub-collection write error:', err));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
          set({ saveError: errorMessage, isSaving: false });
          console.error('updateTransaction error:', err);
        }
      },

      deleteTransaction: async (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          let newDeletedInstances: { recurringLinkId: string; date: string }[] = [];
          set((state) => {
            const tToDelete = state.transactions.find((t) => t.id === id);
            const newTransactions = state.transactions.filter((t) => t.id !== id);

            if (tToDelete?.recurringLinkId) {
              newDeletedInstances = [...state.deletedRecurringInstances, {
                recurringLinkId: tToDelete.recurringLinkId,
                date: tToDelete.date
              }];
            }

            return {
              transactions: newTransactions,
              deletedRecurringInstances: newDeletedInstances,
              isSaving: false
            };
          });
          const docRef = doc(db, 'users', userId);
          const sanitizedTransactions = useFinanceStore.getState().transactions.map(Sanitization.sanitizeTransaction);
          const currentDeletedInstances = useFinanceStore.getState().deletedRecurringInstances;
          await updateDoc(docRef, {
            transactions: sanitizedTransactions,
            deletedRecurringInstances: currentDeletedInstances
          });

          const txnRef = getTransactionDocRef(userId, id);
          await deleteDoc(txnRef).catch((err) => console.error('sub-collection delete error:', err));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
          set({ saveError: errorMessage, isSaving: false });
          console.error('deleteTransaction error:', err);
        }
      },

      setCategories: async (categories) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { categories });
          set({ categories, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set categories';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setCategories error:', err);
        }
      },

      setIncomeCategories: async (categories) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { incomeCategories: categories });
          set({ incomeCategories: categories, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set income categories';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setIncomeCategories error:', err);
        }
      },

      setTransactions: async (transactions) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { transactions });
          set({
            transactions: [...transactions].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()),
            isSaving: false
          });

          const collRef = getTransactionsCollectionRef(userId);
          const batch = writeBatch(db);
          for (const txn of transactions) {
            const txnRef = doc(collRef, txn.id);
            batch.set(txnRef, Sanitization.sanitizeTransaction(txn));
          }
          await batch.commit().catch((err) => console.error('sub-collection batch write error:', err));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set transactions';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setTransactions error:', err);
        }
      },

      setAccounts: async (accounts) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { accounts });
          set({ accounts, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set accounts';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setAccounts error:', err);
        }
      },

      setRecurringTransactions: async (recurring) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { recurringTransactions: recurring });
          set({ recurringTransactions: recurring, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set recurring transactions';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setRecurringTransactions error:', err);
        }
      },

      setCarMileage: async (mileage) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { carMileage: mileage });
          set({ carMileage: mileage, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set car mileage';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setCarMileage error:', err);
        }
      },

setEnabledModules: async (modules) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { enabledModules: modules });
          set({ enabledModules: modules, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set enabled modules';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setEnabledModules error:', err);
        }
      },

      toggleModule: async (module) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const newModules = {
              ...state.enabledModules,
              [module]: !state.enabledModules[module],
            };
            return { enabledModules: newModules, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const newModules = useFinanceStore.getState().enabledModules;
          await updateDoc(docRef, { enabledModules: newModules });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to toggle module';
          set((state) => {
            // Revert the toggle on error
            const revertedModules = {
              ...state.enabledModules,
              [module]: !state.enabledModules[module],
            };
            return { saveError: errorMessage, isSaving: false, enabledModules: revertedModules };
          });
          console.error('toggleModule error:', err);
        }
      },

setBalanceStartDate: async (date) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { balanceStartDate: date });
          set({ balanceStartDate: date, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set balance start date';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setBalanceStartDate error:', err);
        }
      },

      _migrateToMultiAccount: async () => {
        const state = useFinanceStore.getState();
        
        const needsMigration = state.transactions.some(t => !t.accountId) || 
                           state.recurringTransactions.some(r => !r.accountId);
        if (!needsMigration) {
          return;
        }

        const defaultAccount = state.accounts.find(a => a.isDefault) || state.accounts[0];
        if (!defaultAccount) return;

        set((state) => {
          const updatedTransactions = state.transactions.map(t =>
            t.accountId ? t : { ...t, accountId: defaultAccount.id }
          );
          const updatedRecurring = state.recurringTransactions.map(r =>
            r.accountId ? r : { ...r, accountId: defaultAccount.id }
          );

          return {
            transactions: updatedTransactions,
            recurringTransactions: updatedRecurring
          };
        });

        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          const currentTransactions = useFinanceStore.getState().transactions;
          const currentRecurring = useFinanceStore.getState().recurringTransactions;
          
          await updateDoc(docRef, {
            transactions: currentTransactions,
            recurringTransactions: currentRecurring
          });
          set({ isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to migrate to multi-account';
          set({ saveError: errorMessage, isSaving: false });
          console.error('_migrateToMultiAccount error:', err);
        }
      },

      addCategory: async (type, name) => {
        const newCategory = { name, subcategories: [] };
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          set((state) => ({ [key]: [...state[key], newCategory], isSaving: false }));
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { [key]: arrayUnion(newCategory) });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to add category';
          set({ saveError: errorMessage, isSaving: false });
          console.error('addCategory error:', err);
        }
      },

      renameCategory: async (type, oldName, newName) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const key = type === 'income' ? 'incomeCategories' : 'categories';
            const updatedTransactions = state.transactions.map(t =>
              t.type === type && t.category === oldName ? { ...t, category: newName } : t
            );
            const updatedRecurring = state.recurringTransactions.map(r =>
              r.type === type && r.category === oldName ? { ...r, category: newName } : r
            );
            const updatedCategories = state[key].map(c => c.name === oldName ? { ...c, name: newName } : c);

            return {
              [key]: updatedCategories,
              transactions: updatedTransactions,
              recurringTransactions: updatedRecurring,
              isSaving: false
            };
          });
          const docRef = doc(db, 'users', userId);
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          const categories = useFinanceStore.getState()[key as 'incomeCategories' | 'categories'];
          const transactions = useFinanceStore.getState().transactions;
          const recurringTransactions = useFinanceStore.getState().recurringTransactions;
          await updateDoc(docRef, {
            [key]: categories,
            transactions: transactions,
            recurringTransactions: recurringTransactions
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to rename category';
          set({ saveError: errorMessage, isSaving: false });
          console.error('renameCategory error:', err);
        }
      },

      deleteCategory: async (type, name) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const key = type === 'income' ? 'incomeCategories' : 'categories';
            const cat = state[key].find(c => c.name === name);
            if (cat && cat.subcategories.length > 0) return state;

            const updatedCategories = state[key].filter(c => c.name !== name);
            return { [key]: updatedCategories, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          const categories = useFinanceStore.getState()[key as 'incomeCategories' | 'categories'];
          await updateDoc(docRef, { [key]: categories });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
          set({ saveError: errorMessage, isSaving: false });
          console.error('deleteCategory error:', err);
        }
      },

      addSubcategory: async (type, categoryName, subName) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const key = type === 'income' ? 'incomeCategories' : 'categories';
            const updatedCategories = state[key].map(c => c.name === categoryName ? { ...c, subcategories: [...c.subcategories, subName] } : c);
            return { [key]: updatedCategories, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          const categories = useFinanceStore.getState()[key as 'incomeCategories' | 'categories'];
          await updateDoc(docRef, { [key]: categories });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to add subcategory';
          set({ saveError: errorMessage, isSaving: false });
          console.error('addSubcategory error:', err);
        }
      },

      renameSubcategory: async (type, categoryName, oldName, newName) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const key = type === 'income' ? 'incomeCategories' : 'categories';
            const updatedTransactions = state.transactions.map(t =>
              t.type === type && t.category === categoryName && t.subcategory === oldName ? { ...t, subcategory: newName } : t
            );
            const updatedRecurring = state.recurringTransactions.map(r =>
              r.type === type && r.category === categoryName && r.subcategory === oldName ? { ...r, subcategory: newName } : r
            );
            const updatedCategories = state[key].map(c => c.name === categoryName ? {
              ...c,
              subcategories: c.subcategories.map(s => s === oldName ? newName : s)
            } : c);

            return {
              [key]: updatedCategories,
              transactions: updatedTransactions,
              recurringTransactions: updatedRecurring,
              isSaving: false
            };
          });
          const docRef = doc(db, 'users', userId);
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          const categories = useFinanceStore.getState()[key as 'incomeCategories' | 'categories'];
          const transactions = useFinanceStore.getState().transactions;
          const recurringTransactions = useFinanceStore.getState().recurringTransactions;
          await updateDoc(docRef, {
            [key]: categories,
            transactions: transactions,
            recurringTransactions: recurringTransactions
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to rename subcategory';
          set({ saveError: errorMessage, isSaving: false });
          console.error('renameSubcategory error:', err);
        }
      },

      deleteSubcategory: async (type, categoryName, subName) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const key = type === 'income' ? 'incomeCategories' : 'categories';
            const updatedCategories = state[key].map(c => c.name === categoryName ? {
              ...c,
              subcategories: c.subcategories.filter(s => s !== subName)
            } : c);
            return { [key]: updatedCategories, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          const categories = useFinanceStore.getState()[key as 'incomeCategories' | 'categories'];
          await updateDoc(docRef, { [key]: categories });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete subcategory';
          set({ saveError: errorMessage, isSaving: false });
          console.error('deleteSubcategory error:', err);
        }
      },

      deleteSubcategoryAndRemap: async (type, categoryName, subToDelete, remapToSub) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const key = type === 'income' ? 'incomeCategories' : 'categories';
            const updatedTransactions = state.transactions.map(t =>
              (t.type === type && t.category === categoryName && t.subcategory === subToDelete)
                ? { ...t, subcategory: remapToSub }
                : t
            );
            const updatedRecurring = state.recurringTransactions.map(r =>
              (r.type === type && r.category === categoryName && r.subcategory === subToDelete)
                ? { ...r, subcategory: remapToSub }
                : r
            );
            const updatedCategories = state[key].map(c =>
              c.name === categoryName ? { ...c, subcategories: c.subcategories.filter(s => s !== subToDelete) } : c
            );

            return {
              [key]: updatedCategories,
              transactions: updatedTransactions,
              recurringTransactions: updatedRecurring,
              isSaving: false
            };
          });
          const docRef = doc(db, 'users', userId);
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          const categories = useFinanceStore.getState()[key as 'incomeCategories' | 'categories'];
          const transactions = useFinanceStore.getState().transactions;
          const recurringTransactions = useFinanceStore.getState().recurringTransactions;
          await updateDoc(docRef, {
            [key]: categories,
            transactions: transactions,
            recurringTransactions: recurringTransactions
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete and remap subcategory';
          set({ saveError: errorMessage, isSaving: false });
          console.error('deleteSubcategoryAndRemap error:', err);
        }
      },

      moveSubcategory: async (type, subName, fromCategory, toCategory) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            if (fromCategory === toCategory) return state;
            const key = type === 'income' ? 'incomeCategories' : 'categories';
            const updatedCategories = state[key].map(cat => {
              if (cat.name === fromCategory) {
                return { ...cat, subcategories: cat.subcategories.filter(s => s !== subName) };
              }
              if (cat.name === toCategory) {
                return { ...cat, subcategories: [...cat.subcategories, subName] };
              }
              return cat;
            });
            const updatedTransactions = state.transactions.map(t =>
              (t.type === type && t.category === fromCategory && t.subcategory === subName)
                ? { ...t, category: toCategory }
                : t
            );
            const updatedRecurring = state.recurringTransactions.map(r =>
              (r.type === type && r.category === fromCategory && r.subcategory === subName)
                ? { ...r, category: toCategory }
                : r
            );

            return {
              [key]: updatedCategories,
              transactions: updatedTransactions,
              recurringTransactions: updatedRecurring,
              isSaving: false
            };
          });
          const docRef = doc(db, 'users', userId);
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          const categories = useFinanceStore.getState()[key as 'incomeCategories' | 'categories'];
          const transactions = useFinanceStore.getState().transactions;
          const recurringTransactions = useFinanceStore.getState().recurringTransactions;
          await updateDoc(docRef, {
            [key]: categories,
            transactions: transactions,
            recurringTransactions: recurringTransactions
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to move subcategory';
          set({ saveError: errorMessage, isSaving: false });
          console.error('moveSubcategory error:', err);
        }
      },

      addRecurring: async (recurring) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        // Validate recurring transaction before saving
        const validation = validateRecurringTransaction(recurring);
        if (!validation.valid) {
          set({ saveError: validation.error, isSaving: false });
          return;
        }

        const payload = Sanitization.sanitizeRecurring(recurring);
        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const newRecurring = [...state.recurringTransactions, payload].sort((a, b) => a.description.localeCompare(b.description));
            return { recurringTransactions: newRecurring, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const sanitizedRecurring = useFinanceStore.getState().recurringTransactions.map(Sanitization.sanitizeRecurring);
          await updateDoc(docRef, { recurringTransactions: sanitizedRecurring });
          useFinanceStore.getState().checkRecurring();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to add recurring transaction';
          set({ saveError: errorMessage, isSaving: false });
          console.error('addRecurring error:', err);
        }
      },

      updateRecurring: async (recurring) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        // Validate recurring transaction before saving
        const validation = validateRecurringTransaction(recurring);
        if (!validation.valid) {
          set({ saveError: validation.error, isSaving: false });
          return;
        }

        const payload = Sanitization.sanitizeRecurring(recurring);
        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const updatedRecurring = state.recurringTransactions.map(r => r.id === payload.id ? payload : r);
            return { recurringTransactions: updatedRecurring, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const sanitizedRecurring = useFinanceStore.getState().recurringTransactions.map(Sanitization.sanitizeRecurring);
          await updateDoc(docRef, { recurringTransactions: sanitizedRecurring });
          useFinanceStore.getState().checkRecurring();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to update recurring transaction';
          set({ saveError: errorMessage, isSaving: false });
          console.error('updateRecurring error:', err);
        }
      },

      checkRecurring: async () => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        const state = useFinanceStore.getState();
        if (state.isCheckingRecurring) return;

        if (state.lastRecurringCheck) {
          const timeSinceLastCheck = Date.now() - new Date(state.lastRecurringCheck).getTime();
          if (timeSinceLastCheck < 5000) return;
        }

        set({ saveError: null, isSaving: true, isCheckingRecurring: true });
        try {
          let hasNewTransactions = false;

          set((state) => {
            const newTransactions: Transaction[] = [];
            const now = dayjs();
            const balanceStart = dayjs(state.balanceStartDate);

            const updatedRecurring = state.recurringTransactions.map(payload => {
              const startFrom = payload.lastGeneratedUpTo
                ? dayjs(payload.lastGeneratedUpTo).add(1, payload.frequency === 'yearly' ? 'year' : 'month')
                : dayjs(payload.startDate);

              const start = startFrom.isAfter(balanceStart) ? startFrom : balanceStart;
              let current = start;
              let safetyCounter = 0;

              while (current.isBefore(now, 'day') || current.isSame(now, 'day')) {
                if (safetyCounter++ > 1000) break;

                let targetDate = current.date(payload.dayOfMonth);
                if (targetDate.month() !== current.month()) {
                  targetDate = current.endOf('month');
                }

                if (targetDate.isAfter(now, 'day')) break;
                if (payload.endDate && targetDate.isAfter(dayjs(payload.endDate), 'day')) break;

                if (targetDate.isBefore(start, 'day') || targetDate.isBefore(balanceStart, 'day')) {
                  current = current.add(1, payload.frequency === 'yearly' ? 'year' : 'month');
                  continue;
                }

                const dateStr = targetDate.format('YYYY-MM-DD');

                const isDeleted = state.deletedRecurringInstances.some((d: { recurringLinkId: string; date: string }) => {
                  if (d.recurringLinkId !== payload.id) return false;
                  if (payload.frequency === 'yearly') {
                    return dayjs(d.date).year() === targetDate.year();
                  }
                  return dayjs(d.date).isSame(targetDate, 'month');
                });

                const existsInPeriod = state.transactions.some(t => {
                  if (t.recurringLinkId !== payload.id) return false;
                  if (payload.frequency === 'yearly') {
                    return dayjs(t.date).year() === targetDate.year();
                  }
                  return dayjs(t.date).isSame(targetDate, 'month');
                });

                if (!isDeleted && !existsInPeriod) {
                  newTransactions.push({
                    id: crypto.randomUUID(),
                    date: dateStr,
                    description: payload.description,
                    category: payload.category,
                    subcategory: payload.subcategory,
                    amount: payload.amount,
                    type: payload.type,
                    accountId: payload.accountId,
                    recurringLinkId: payload.id,
                  });
                }
                current = current.add(1, payload.frequency === 'yearly' ? 'year' : 'month');
              }

              const lastScanned = current.subtract(1, payload.frequency === 'yearly' ? 'year' : 'month');
              return { ...payload, lastGeneratedUpTo: lastScanned.format('YYYY-MM-DD') };
            });

            hasNewTransactions = newTransactions.length > 0;

            if (!hasNewTransactions) {
              return { isSaving: false, isCheckingRecurring: false, recurringTransactions: updatedRecurring };
            }

            const allTransactions = [...state.transactions, ...newTransactions].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
            return {
              transactions: allTransactions,
              recurringTransactions: updatedRecurring,
              isSaving: false,
              isCheckingRecurring: false,
            };
          });

          if (hasNewTransactions) {
            const docRef = doc(db, 'users', userId);
            const sanitizedTransactions = useFinanceStore.getState().transactions.map(Sanitization.sanitizeTransaction);
            const sanitizedRecurring = useFinanceStore.getState().recurringTransactions.map(Sanitization.sanitizeRecurring);
            await updateDoc(docRef, {
              transactions: sanitizedTransactions,
              recurringTransactions: sanitizedRecurring,
            });
          } else {
            const docRef = doc(db, 'users', userId);
            const sanitizedRecurring = useFinanceStore.getState().recurringTransactions.map(Sanitization.sanitizeRecurring);
            await updateDoc(docRef, { recurringTransactions: sanitizedRecurring });
          }
          set({ isCheckingRecurring: false, lastRecurringCheck: new Date().toISOString() });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to check recurring transactions';
          set({ saveError: errorMessage, isSaving: false, isCheckingRecurring: false });
          console.error('checkRecurring error:', err);
        }
      },

      deleteRecurring: async (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const updatedRecurring = state.recurringTransactions.filter(r => r.id !== id);
            return { recurringTransactions: updatedRecurring, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const sanitizedRecurring = useFinanceStore.getState().recurringTransactions.map(Sanitization.sanitizeRecurring);
          await updateDoc(docRef, { recurringTransactions: sanitizedRecurring });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete recurring transaction';
          set({ saveError: errorMessage, isSaving: false });
          console.error('deleteRecurring error:', err);
        }
      },

      addAccount: async (account) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => ({ accounts: [...state.accounts, account], isSaving: false }));
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { accounts: arrayUnion(account) });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to add account';
          set({ saveError: errorMessage, isSaving: false });
          console.error('addAccount error:', err);
        }
      },

      updateAccount: async (account) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const updatedAccounts = state.accounts.map(a => a.id === account.id ? account : a);
            return { accounts: updatedAccounts, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const updatedAccounts = useFinanceStore.getState().accounts;
          await updateDoc(docRef, { accounts: updatedAccounts });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to update account';
          set({ saveError: errorMessage, isSaving: false });
          console.error('updateAccount error:', err);
        }
      },

      deleteAccount: async (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const updatedAccounts = state.accounts.filter(a => a.id !== id);
            return { accounts: updatedAccounts, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const updatedAccounts = useFinanceStore.getState().accounts;
          await updateDoc(docRef, { accounts: updatedAccounts });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
          set({ saveError: errorMessage, isSaving: false });
          console.error('deleteAccount error:', err);
        }
      },

      setDefaultAccount: async (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const updatedAccounts = state.accounts.map(a => ({ ...a, isDefault: a.id === id }));
            return { accounts: updatedAccounts, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const updatedAccounts = useFinanceStore.getState().accounts;
          await updateDoc(docRef, { accounts: updatedAccounts });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set default account';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setDefaultAccount error:', err);
        }
      },

      addCarMileage: async (record) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => ({ carMileage: [...state.carMileage, record], isSaving: false }));
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { carMileage: arrayUnion(record) });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to add car mileage';
          set({ saveError: errorMessage, isSaving: false });
          console.error('addCarMileage error:', err);
        }
      },

      updateCarMileage: async (record) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          set((state) => {
            const updatedMileage = state.carMileage.map(m => m.id === record.id ? record : m);
            return { carMileage: updatedMileage, isSaving: false };
          });
          const updatedMileage = useFinanceStore.getState().carMileage;
          await updateDoc(docRef, { carMileage: updatedMileage });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to update car mileage';
          set({ saveError: errorMessage, isSaving: false });
          console.error('updateCarMileage error:', err);
        }
      },

      deleteCarMileage: async (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const updatedMileage = state.carMileage.filter(m => m.id !== id);
            return { carMileage: updatedMileage, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const updatedMileage = useFinanceStore.getState().carMileage;
          await updateDoc(docRef, { carMileage: updatedMileage });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete car mileage';
          set({ saveError: errorMessage, isSaving: false });
          console.error('deleteCarMileage error:', err);
        }
      },

      setCarInitialMileage: async (value) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { carInitialMileage: value });
          set({ carInitialMileage: value, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set car initial mileage';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setCarInitialMileage error:', err);
        }
      },

      setTireSettings: async (settings) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { tireSettings: settings });
          set({ tireSettings: settings, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set tire settings';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setTireSettings error:', err);
        }
      },

      addTireChange: async (record) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => ({ tireChanges: [...state.tireChanges, record], isSaving: false }));
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { tireChanges: arrayUnion(record) });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to add tire change';
          set({ saveError: errorMessage, isSaving: false });
          console.error('addTireChange error:', err);
        }
      },

      updateTireChange: async (record) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const updatedChanges = state.tireChanges.map(t => t.id === record.id ? record : t);
            return { tireChanges: updatedChanges, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const updatedChanges = useFinanceStore.getState().tireChanges;
          await updateDoc(docRef, { tireChanges: updatedChanges });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to update tire change';
          set({ saveError: errorMessage, isSaving: false });
          console.error('updateTireChange error:', err);
        }
      },

      deleteTireChange: async (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const updatedChanges = state.tireChanges.filter(t => t.id !== id);
            return { tireChanges: updatedChanges, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const updatedChanges = useFinanceStore.getState().tireChanges;
          await updateDoc(docRef, { tireChanges: updatedChanges });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete tire change';
          set({ saveError: errorMessage, isSaving: false });
          console.error('deleteTireChange error:', err);
        }
      },

      setTireChanges: async (records) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set({ saveError: null, isSaving: true });
        try {
          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, { tireChanges: records });
          set({ tireChanges: records, isSaving: false });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to set tire changes';
          set({ saveError: errorMessage, isSaving: false });
          console.error('setTireChanges error:', err);
        }
      },

      setAll: (data) => set(data),

      clearSaveError: () => set({ saveError: null }),

      exportAllData: () => {
        const state = useFinanceStore.getState();
        const backup = Backup.createBackup(state);
        Backup.downloadBackup(backup);
      },

      importAllData: async (fileOrData: File | object) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return false;

        set({ saveError: null, isSaving: true });
        try {
          let backup: { version?: string; app?: string; data?: Record<string, unknown>; state?: Record<string, unknown> };

          if (fileOrData instanceof File) {
            const text = await fileOrData.text();
            backup = JSON.parse(text);
          } else {
            backup = fileOrData as { version?: string; app?: string; data?: Record<string, unknown>; state?: Record<string, unknown> };
          }

          let data: Record<string, unknown>;

          if (backup.version) {
            if (backup.app !== 'myfinance') {
              set({ saveError: 'Invalid backup: not a MyFinance backup file', isSaving: false });
              return false;
            }
            data = backup.data ?? {};
          } else if (backup.state) {
            data = backup.state;
          } else {
            set({ saveError: 'Invalid backup: missing data', isSaving: false });
            return false;
          }

          const validation = Backup.validateBackupData(data as Backup.BackupPayload);
          if (!validation.valid) {
            const errorMessages = validation.errors.slice(0, 3).map(e => e.message).join(', ');
            set({ saveError: `Invalid backup data: ${errorMessages}`, isSaving: false });
            return false;
          }

          const payload = data as Backup.BackupPayload;

          const docRef = doc(db, 'users', userId);
          const txnPayload = payload.transactions ?? [];
          await updateDoc(docRef, {
            initialBalance: payload.initialBalance ?? 0,
            accounts: payload.accounts ?? Defaults.DEFAULT_ACCOUNTS,
            transactions: txnPayload,
            recurringTransactions: payload.recurringTransactions ?? [],
            categories: payload.categories ?? Defaults.DEFAULT_CATEGORIES,
            incomeCategories: payload.incomeCategories ?? Defaults.DEFAULT_INCOME_CATEGORIES,
            enabledModules: payload.enabledModules ?? Defaults.DEFAULT_ENABLED_MODULES,
            balanceStartDate: payload.balanceStartDate ?? Defaults.DEFAULT_BALANCE_START_DATE,
            carMileage: payload.carMileage ?? [],
            carInitialMileage: payload.carInitialMileage ?? 0,
            tireSettings: payload.tireSettings ?? Defaults.DEFAULT_TIRE_SETTINGS,
            tireChanges: payload.tireChanges ?? [],
            etfTransactions: payload.etfTransactions ?? [],
            portfolioSnapshots: payload.portfolioSnapshots ?? [],
            brokerConfig: payload.brokerConfig ?? Defaults.DEFAULT_BROKER_CONFIG,
            budgetTargets: payload.budgetTargets ?? [],
            brokerAccounts: payload.brokerAccounts ?? Defaults.DEFAULT_BROKER_ACCOUNTS,
            assetHoldings: payload.assetHoldings ?? [],
            cashAdjustments: payload.cashAdjustments ?? [],
            dividendEntries: payload.dividendEntries ?? [],
            deletedRecurringInstances: payload.deletedRecurringInstances ?? [],
          });

          const collRef = getTransactionsCollectionRef(userId);
          const batch = writeBatch(db);
          for (const txn of txnPayload) {
            const txnRef = doc(collRef, txn.id);
            batch.set(txnRef, Sanitization.sanitizeTransaction(txn));
          }
          await batch.commit().catch((err) => console.error('sub-collection batch write error:', err));

          set({
            initialBalance: payload.initialBalance ?? 0,
            accounts: payload.accounts ?? Defaults.DEFAULT_ACCOUNTS,
            transactions: payload.transactions ?? [],
            recurringTransactions: payload.recurringTransactions ?? [],
            categories: payload.categories ?? Defaults.DEFAULT_CATEGORIES,
            incomeCategories: payload.incomeCategories ?? Defaults.DEFAULT_INCOME_CATEGORIES,
            enabledModules: payload.enabledModules ?? Defaults.DEFAULT_ENABLED_MODULES,
            balanceStartDate: payload.balanceStartDate ?? Defaults.DEFAULT_BALANCE_START_DATE,
            carMileage: payload.carMileage ?? [],
            carInitialMileage: payload.carInitialMileage ?? 0,
            tireSettings: payload.tireSettings ?? Defaults.DEFAULT_TIRE_SETTINGS,
            tireChanges: payload.tireChanges ?? [],
            deletedRecurringInstances: payload.deletedRecurringInstances ?? [],
            isSaving: false,
          });

          useBudgetStore.getState().setBudgetTargets(payload.budgetTargets ?? []);

          useInvestmentStore.getState().setAll({
            etfTransactions: payload.etfTransactions ?? [],
            portfolioSnapshots: payload.portfolioSnapshots ?? [],
            brokerConfig: payload.brokerConfig ?? Defaults.DEFAULT_BROKER_CONFIG,
            brokerAccounts: payload.brokerAccounts ?? Defaults.DEFAULT_BROKER_ACCOUNTS,
            assetHoldings: payload.assetHoldings ?? [],
            cashAdjustments: payload.cashAdjustments ?? [],
            dividendEntries: payload.dividendEntries ?? [],
          });

          return true;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to import backup';
          set({ saveError: errorMessage, isSaving: false });
          return false;
        }
      },

      previewBackup: async (file: File) => {
        return Backup.previewBackup(file);
      },
    })
);
