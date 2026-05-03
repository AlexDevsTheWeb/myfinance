import dayjs from 'dayjs';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { db } from '../lib/firebase';
import i18n from '../lib/i18n';
import { useAuthStore } from './useAuthStore';
import * as Types from './types';

// Re-export types (with "I" prefix)
export { Types };

// Backward-compatible type aliases (no prefix for existing code)
export type Category = Types.ICategory;
export type Account = Types.IAccount;
export type Transaction = Types.ITransaction;
export type RecurringTransaction = Types.IRecurringTransaction;
export type AppModules = Types.IAppModules;
export type CarMileageRecord = Types.ICarMileageRecord;
export type TireChangeRecord = Types.ITireChangeRecord;
export type TireSettings = Types.ITireSettings;

// Re-export validation functions from types
export const validateTransaction = Types.validateTransaction;
export const validateRecurringTransaction = Types.validateRecurringTransaction;

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
  balanceStartDate: string; // YYYY-MM-DD
  deletedRecurringInstances: { recurringLinkId: string; date: string }[];
  isSaving: boolean;
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
  previewBackup: (file: File) => Promise<{
    valid: boolean;
    error?: string;
    summary: {
      transactionCount: number;
      accountCount: number;
      recurringCount: number;
      categoryCount: number;
      incomeCategoryCount: number;
      exportedAt: string;
    } | null;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitizeTransaction = (t: Transaction): any => {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitizeRecurring = (r: RecurringTransaction): any => {
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

export const useFinanceStore = create<FinanceState>()(
    (set) => ({
      initialBalance: 0,
      accounts: [
        { id: 'default-main', name: 'Conto Principale', initialBalance: 0, isDefault: true }
      ],
      categories: [
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
      ],
      incomeCategories: [
        { name: 'Salario', subcategories: ['Busta paga', 'Mance', 'Bonus', 'Commissioni', '13-esima', '14-esima'] },
        { name: 'Altro', subcategories: ['Risparmi', 'Interessi', 'Dividendi', 'Regali', 'Rimborsi', 'Rimborso 730'] },
      ],
      transactions: [],
      recurringTransactions: [],
      carMileage: [],
      carInitialMileage: 0,
      tireSettings: { summerModel: '', winterModel: '', initialTireType: 'summer' },
      tireChanges: [],
      enabledModules: {
        financeTracker: true,
        carManagement: false,
        utilityTracker: false,
      },
      balanceStartDate: '2026-01-01',
      deletedRecurringInstances: [],
      isSaving: false,
      saveError: null,
      language: 'it',

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

        // Validate transaction before saving
        const validation = validateTransaction(transaction);
        if (!validation.valid) {
          set({ saveError: validation.error, isSaving: false });
          return;
        }

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const sorted = [transaction, ...state.transactions].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
            return { transactions: sorted, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const sanitizedTransactions = useFinanceStore.getState().transactions.map(sanitizeTransaction);
          await updateDoc(docRef, { transactions: sanitizedTransactions });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
          set((state) => {
            // Revert optimistic update on error
            const reverted = state.transactions.filter(t => t.id !== transaction.id);
            return { saveError: errorMessage, isSaving: false, transactions: reverted };
          });
          console.error('addTransaction error:', err);
        }
      },

      updateTransaction: async (transaction) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        // Validate transaction before saving
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
          const sanitizedTransactions = useFinanceStore.getState().transactions.map(sanitizeTransaction);
          await updateDoc(docRef, { transactions: sanitizedTransactions });
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
          const sanitizedTransactions = useFinanceStore.getState().transactions.map(sanitizeTransaction);
          const currentDeletedInstances = useFinanceStore.getState().deletedRecurringInstances;
          await updateDoc(docRef, {
            transactions: sanitizedTransactions,
            deletedRecurringInstances: currentDeletedInstances
          });
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

        const payload = sanitizeRecurring(recurring);
        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const newRecurring = [...state.recurringTransactions, payload].sort((a, b) => a.description.localeCompare(b.description));
            return { recurringTransactions: newRecurring, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const sanitizedRecurring = useFinanceStore.getState().recurringTransactions.map(sanitizeRecurring);
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

        const payload = sanitizeRecurring(recurring);
        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const updatedRecurring = state.recurringTransactions.map(r => r.id === payload.id ? payload : r);
            return { recurringTransactions: updatedRecurring, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const sanitizedRecurring = useFinanceStore.getState().recurringTransactions.map(sanitizeRecurring);
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

        set({ saveError: null, isSaving: true });
        try {
          set((state) => {
            const newTransactions: Transaction[] = [];
            const now = dayjs();
            const balanceStart = dayjs(state.balanceStartDate);

            state.recurringTransactions.forEach(payload => {
              const start = dayjs(payload.startDate);
              let current = start.isAfter(balanceStart) ? start : balanceStart;
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
            });

            if (newTransactions.length === 0) return { isSaving: false };

            const allTransactions = [...state.transactions, ...newTransactions].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
            return { transactions: allTransactions, isSaving: false };
          });
          const docRef = doc(db, 'users', userId);
          const sanitizedTransactions = useFinanceStore.getState().transactions.map(sanitizeTransaction);
          await updateDoc(docRef, { transactions: sanitizedTransactions });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to check recurring transactions';
          set({ saveError: errorMessage, isSaving: false });
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
          const sanitizedRecurring = useFinanceStore.getState().recurringTransactions.map(sanitizeRecurring);
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
        const backupData = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          app: 'myfinance',
          data: {
            initialBalance: state.initialBalance,
            accounts: state.accounts,
            transactions: state.transactions,
            recurringTransactions: state.recurringTransactions,
            categories: state.categories,
            incomeCategories: state.incomeCategories,
            enabledModules: state.enabledModules,
            balanceStartDate: state.balanceStartDate,
            carMileage: state.carMileage,
            carInitialMileage: state.carInitialMileage,
            tireSettings: state.tireSettings,
            tireChanges: state.tireChanges,
          }
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `myfinance-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      importAllData: async (fileOrData: File | object) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return false;

        set({ saveError: null, isSaving: true });
        try {
          let backup: { version?: string; app?: string; data?: Partial<FinanceState>; state?: Partial<FinanceState> };

          if (fileOrData instanceof File) {
            const text = await fileOrData.text();
            backup = JSON.parse(text);
          } else {
            backup = fileOrData as { version?: string; app?: string; data?: Partial<FinanceState>; state?: Partial<FinanceState> };
          }

          let data: Partial<FinanceState>;

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

          const docRef = doc(db, 'users', userId);
          await updateDoc(docRef, {
            initialBalance: data.initialBalance ?? 0,
            accounts: data.accounts ?? [],
            transactions: data.transactions ?? [],
            recurringTransactions: data.recurringTransactions ?? [],
            categories: data.categories ?? [],
            incomeCategories: data.incomeCategories ?? [],
            enabledModules: data.enabledModules ?? { financeTracker: true, carManagement: false, utilityTracker: false },
            balanceStartDate: data.balanceStartDate ?? '2026-01-01',
            carMileage: data.carMileage ?? [],
            carInitialMileage: data.carInitialMileage ?? 0,
            tireSettings: data.tireSettings ?? { summerModel: '', winterModel: '', initialTireType: 'summer' },
            tireChanges: data.tireChanges ?? [],
          });

          set({
            initialBalance: data.initialBalance ?? 0,
            accounts: data.accounts ?? [],
            transactions: data.transactions ?? [],
            recurringTransactions: data.recurringTransactions ?? [],
            categories: data.categories ?? [],
            incomeCategories: data.incomeCategories ?? [],
            enabledModules: data.enabledModules ?? { financeTracker: true, carManagement: false, utilityTracker: false },
            balanceStartDate: data.balanceStartDate ?? '2026-01-01',
            carMileage: data.carMileage ?? [],
            carInitialMileage: data.carInitialMileage ?? 0,
            tireSettings: data.tireSettings ?? { summerModel: '', winterModel: '', initialTireType: 'summer' },
            tireChanges: data.tireChanges ?? [],
            isSaving: false,
          });

          return true;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to import backup';
          set({ saveError: errorMessage, isSaving: false });
          return false;
        }
      },

      previewBackup: async (file: File) => {
        try {
          const text = await file.text();
          const backup = JSON.parse(text);

          let data: Partial<FinanceState>;
          let exportedAt = 'Unknown';

          if (backup.version && backup.app === 'myfinance') {
            data = backup.data ?? {};
            exportedAt = backup.exportedAt ?? 'Unknown';
          } else if (backup.state) {
            data = backup.state;
            exportedAt = backup.exportedAt ?? backup.createdAt ?? 'Unknown';
          } else {
            return { valid: false, error: 'Invalid backup: not a MyFinance backup file', summary: null };
          }

          return {
            valid: true,
            summary: {
              transactionCount: data.transactions?.length ?? 0,
              accountCount: data.accounts?.length ?? 0,
              recurringCount: data.recurringTransactions?.length ?? 0,
              categoryCount: data.categories?.length ?? 0,
              incomeCategoryCount: data.incomeCategories?.length ?? 0,
              exportedAt,
            },
          };
        } catch (err) {
          return {
            valid: false,
            error: err instanceof Error ? err.message : 'Failed to read backup file',
            summary: null,
          };
        }
      },
    })
);
