import dayjs from 'dayjs';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';

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
  accountId: string; // Refers to Account.id
  recurringLinkId?: string;
  consumption?: number; // kWh or smc
  readingDateStart?: string; // YYYY-MM-DD
  readingDateEnd?: string; // YYYY-MM-DD
}

export interface RecurringTransaction {
  id: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense';
  dayOfMonth: number;
  accountId: string; // Refers to Account.id
  startDate: string; // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD (optional)
  frequency?: 'monthly' | 'yearly';
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
  date: string; // YYYY-MM-DD
  type: 'summer' | 'winter';
  odometer: number;
}

export interface TireSettings {
  summerModel: string;
  winterModel: string;
  initialTireType: 'summer' | 'winter';
}

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
}

export const useFinanceStore = create<FinanceState>()(
  persist<FinanceState>(
    (set) => ({
      initialBalance: 0, // No longer used as primary source, sum of accounts instead
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
      setInitialBalance: (balance) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { initialBalance: balance });
        set({ initialBalance: balance });
      },
      addTransaction: (transaction) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { transactions: arrayUnion(transaction) });

        set((state) => {
          const sorted = [transaction, ...state.transactions].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
          return { transactions: sorted };
        });
      },
      updateTransaction: (transaction) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          const newTransactions = state.transactions.map((t) => (t.id === transaction.id ? transaction : t));
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { transactions: newTransactions });

          const sorted = newTransactions.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
          return { transactions: sorted };
        });
      },
      deleteTransaction: (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          const transactionToDelete = state.transactions.find((t) => t.id === id);
          if (!transactionToDelete) return state;

          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { transactions: arrayRemove(transactionToDelete) });

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
          };
        });
      },
      setCategories: (categories) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { categories });
        set({ categories });
      },
      setIncomeCategories: (categories) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { incomeCategories: categories });
        set({ incomeCategories: categories });
      },
      setTransactions: (transactions) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { transactions });

        set({
          transactions: [...transactions].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
        });
      },
      setAccounts: (accounts) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { accounts });
        set({ accounts });
      },
      setRecurringTransactions: (recurring) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { recurringTransactions: recurring });
        set({ recurringTransactions: recurring });
      },
      setCarMileage: (mileage) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { carMileage: mileage });
        set({ carMileage: mileage });
      },
      setEnabledModules: (modules) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { enabledModules: modules });
        set({ enabledModules: modules });
      },
      toggleModule: (module) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          const newModules = {
            ...state.enabledModules,
            [module]: !state.enabledModules[module],
          };
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { enabledModules: newModules });
          return { enabledModules: newModules };
        });
      },
      setBalanceStartDate: (date) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { balanceStartDate: date });
        set({ balanceStartDate: date });
      },

      // Internal migration helper
      _migrateToMultiAccount: () => set((state) => {
        const defaultAccount = state.accounts.find(a => a.isDefault) || state.accounts[0];
        if (!defaultAccount) return state;

        const updatedTransactions = state.transactions.map(t =>
          t.accountId ? t : { ...t, accountId: defaultAccount.id }
        );
        const updatedRecurring = state.recurringTransactions.map(r =>
          r.accountId ? r : { ...r, accountId: defaultAccount.id }
        );

        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return state;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, {
          transactions: updatedTransactions,
          recurringTransactions: updatedRecurring
        });


        return {
          transactions: updatedTransactions,
          recurringTransactions: updatedRecurring
        };
      }),

      addCategory: (type, name) => {
        const newCategory = { name, subcategories: [] };
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const key = type === 'income' ? 'incomeCategories' : 'categories';
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { [key]: arrayUnion(newCategory) });

        set((state) => {
          return { [key]: [...state[key], newCategory] };
        });
      },

      renameCategory: (type, oldName, newName) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          // Also update all transactions and recurring templates
          const updatedTransactions = state.transactions.map(t =>
            t.type === type && t.category === oldName ? { ...t, category: newName } : t
          );
          const updatedRecurring = state.recurringTransactions.map(r =>
            r.type === type && r.category === oldName ? { ...r, category: newName } : r
          );
          const updatedCategories = state[key].map(c => c.name === oldName ? { ...c, name: newName } : c);

          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, {
            [key]: updatedCategories,
            transactions: updatedTransactions,
            recurringTransactions: updatedRecurring
          });

          return {
            [key]: updatedCategories,
            transactions: updatedTransactions,
            recurringTransactions: updatedRecurring
          };
        });
      },

      deleteCategory: (type, name) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          const cat = state[key].find(c => c.name === name);
          if (cat && cat.subcategories.length > 0) return state; // Safety check

          const updatedCategories = state[key].filter(c => c.name !== name);
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { [key]: updatedCategories });

          return {
            [key]: updatedCategories
          };
        });
      },

      addSubcategory: (type, categoryName, subName) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          const updatedCategories = state[key].map(c => c.name === categoryName ? { ...c, subcategories: [...c.subcategories, subName] } : c);

          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { [key]: updatedCategories });

          return {
            [key]: updatedCategories
          };
        });
      },

      renameSubcategory: (type, categoryName, oldName, newName) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          // Also update all transactions and recurring templates
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

          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, {
            [key]: updatedCategories,
            transactions: updatedTransactions,
            recurringTransactions: updatedRecurring
          });

          return {
            [key]: updatedCategories,
            transactions: updatedTransactions,
            recurringTransactions: updatedRecurring
          };
        });
      },

      deleteSubcategory: (type, categoryName, subName) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          const key = type === 'income' ? 'incomeCategories' : 'categories';
          const updatedCategories = state[key].map(c => c.name === categoryName ? {
            ...c,
            subcategories: c.subcategories.filter(s => s !== subName)
          } : c);
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { [key]: updatedCategories });

          return {
            [key]: updatedCategories
          };
        });
      },

      deleteSubcategoryAndRemap: (type, categoryName, subToDelete, remapToSub) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          const key = type === 'income' ? 'incomeCategories' : 'categories';

          // 1. Update transactions
          const updatedTransactions = state.transactions.map(t =>
            (t.type === type && t.category === categoryName && t.subcategory === subToDelete)
              ? { ...t, subcategory: remapToSub }
              : t
          );

          // 2. Update recurring
          const updatedRecurring = state.recurringTransactions.map(r =>
            (r.type === type && r.category === categoryName && r.subcategory === subToDelete)
              ? { ...r, subcategory: remapToSub }
              : r
          );

          // 3. Remove subcategory
          const updatedCategories = state[key].map(c =>
            c.name === categoryName ? { ...c, subcategories: c.subcategories.filter(s => s !== subToDelete) } : c
          );

          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, {
            [key]: updatedCategories,
            transactions: updatedTransactions,
            recurringTransactions: updatedRecurring
          });

          return {
            [key]: updatedCategories,
            transactions: updatedTransactions,
            recurringTransactions: updatedRecurring
          };
        });
      },

      moveSubcategory: (type, subName, fromCategory, toCategory) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          if (fromCategory === toCategory) return state;
          const key = type === 'income' ? 'incomeCategories' : 'categories';

          // Remove from source, add to target
          const updatedCategories = state[key].map(cat => {
            if (cat.name === fromCategory) {
              return { ...cat, subcategories: cat.subcategories.filter(s => s !== subName) };
            }
            if (cat.name === toCategory) {
              return { ...cat, subcategories: [...cat.subcategories, subName] };
            }
            return cat;
          });

          // Update all related transactions
          const updatedTransactions = state.transactions.map(t =>
            (t.type === type && t.category === fromCategory && t.subcategory === subName)
              ? { ...t, category: toCategory }
              : t
          );

          // Update all related recurring templates
          const updatedRecurring = state.recurringTransactions.map(r =>
            (r.type === type && r.category === fromCategory && r.subcategory === subName)
              ? { ...r, category: toCategory }
              : r
          );

          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, {
            [key]: updatedCategories,
            transactions: updatedTransactions,
            recurringTransactions: updatedRecurring
          });

          return {
            [key]: updatedCategories,
            transactions: updatedTransactions,
            recurringTransactions: updatedRecurring
          };
        });
      },

      addRecurring: (recurring) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        const payload = { ...recurring };
        if (!payload.endDate) {
          delete payload.endDate;
        }

        set((state) => {
          const newTransactions = [];
          const now = dayjs();
          const start = dayjs(payload.startDate);
          const balanceStart = dayjs(state.balanceStartDate);
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
              if (payload.frequency === 'yearly') {
                current = current.add(1, 'year');
              } else {
                current = current.add(1, 'month');
              }
              continue;
            }

            const dateStr = targetDate.format('YYYY-MM-DD');

            const exists = state.transactions.some(t => t.recurringLinkId === payload.id && t.date === dateStr);

            if (!exists) {
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
            if (payload.frequency === 'yearly') {
              current = current.add(1, 'year');
            } else {
              current = current.add(1, 'month');
            }
          }

          const allTransactions = [...state.transactions, ...newTransactions].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
          const newRecurring = [...state.recurringTransactions, payload].sort((a, b) => a.description.localeCompare(b.description));

          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, {
            transactions: allTransactions,
            recurringTransactions: newRecurring
          });

          return {
            recurringTransactions: newRecurring,
            transactions: allTransactions,
          };
        });
      },
      updateRecurring: (recurring) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        const payload = { ...recurring };
        if (!payload.endDate) {
          delete payload.endDate;
        }

        set((state) => {
          const updatedRecurring = state.recurringTransactions.map(r => r.id === payload.id ? payload : r);
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { recurringTransactions: updatedRecurring });
          return { recurringTransactions: updatedRecurring };
        });
      },
      deleteRecurring: (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;

        set((state) => {
          const updatedRecurring = state.recurringTransactions.filter(r => r.id !== id);
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { recurringTransactions: updatedRecurring });
          return { recurringTransactions: updatedRecurring };
        });
      },

      addAccount: (account) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { accounts: arrayUnion(account) });
        set((state) => ({ accounts: [...state.accounts, account] }));
      },
      updateAccount: (account) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        set((state) => {
          const updatedAccounts = state.accounts.map(a => a.id === account.id ? account : a);
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { accounts: updatedAccounts });
          return { accounts: updatedAccounts };
        });
      },
      deleteAccount: (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        set((state) => {
          const updatedAccounts = state.accounts.filter(a => a.id !== id);
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { accounts: updatedAccounts });
          return { accounts: updatedAccounts };
        });
      },
      setDefaultAccount: (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        set((state) => {
          const updatedAccounts = state.accounts.map(a => ({ ...a, isDefault: a.id === id }));
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { accounts: updatedAccounts });
          return { accounts: updatedAccounts };
        });
      },
      addCarMileage: (record) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { carMileage: arrayUnion(record) });
        set((state) => ({ carMileage: [...state.carMileage, record] }));
      },
      updateCarMileage: (record) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        set((state) => {
          const updatedMileage = state.carMileage.map(m => m.id === record.id ? record : m);
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { carMileage: updatedMileage });
          return { carMileage: updatedMileage };
        });
      },
      deleteCarMileage: (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        set((state) => {
          const updatedMileage = state.carMileage.filter(m => m.id !== id);
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { carMileage: updatedMileage });
          return { carMileage: updatedMileage };
        });
      },
      setCarInitialMileage: (value) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { carInitialMileage: value });
        set({ carInitialMileage: value });
      },
      setTireSettings: (settings) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { tireSettings: settings });
        set({ tireSettings: settings });
      },
      addTireChange: (record) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { tireChanges: arrayUnion(record) });
        set((state) => ({ tireChanges: [...state.tireChanges, record] }));
      },
      updateTireChange: (record) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        set((state) => {
          const updatedChanges = state.tireChanges.map(t => t.id === record.id ? record : t);
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { tireChanges: updatedChanges });
          return { tireChanges: updatedChanges };
        });
      },
      deleteTireChange: (id) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        set((state) => {
          const updatedChanges = state.tireChanges.filter(t => t.id !== id);
          const docRef = doc(db, 'users', userId);
          updateDoc(docRef, { tireChanges: updatedChanges });
          return { tireChanges: updatedChanges };
        });
      },
      setTireChanges: (records) => {
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) return;
        const docRef = doc(db, 'users', userId);
        updateDoc(docRef, { tireChanges: records });
        set({ tireChanges: records });
      },
      setAll: (data) => set(data),
    }),
    {
      name: 'finance-storage',
    }
  )
);
