import dayjs from 'dayjs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  endDate?: string; // YYYY-MM-DD (optional)
}

interface FinanceState {
  initialBalance: number;
  categories: Category[];
  incomeCategories: Category[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  balanceStartDate: string; // YYYY-MM-DD
  setInitialBalance: (balance: number) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setCategories: (categories: Category[]) => void;
  setIncomeCategories: (categories: Category[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setRecurringTransactions: (recurring: RecurringTransaction[]) => void;
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
  // Account actions
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  setDefaultAccount: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      initialBalance: 0, // No longer used as primary source, sum of accounts instead
      accounts: [
        { id: 'default-main', name: 'Conto Principale', initialBalance: 18325, isDefault: true }
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
      balanceStartDate: '2026-01-01',
      setInitialBalance: (balance) => set({ initialBalance: balance }),
      addTransaction: (transaction) => set((state) => {
        const sorted = [transaction, ...state.transactions].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
        return { transactions: sorted };
      }),
      updateTransaction: (transaction) => set((state) => {
        const sorted = state.transactions
          .map((t) => (t.id === transaction.id ? transaction : t))
          .sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
        return { transactions: sorted };
      }),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      })),
      setCategories: (categories) => set({ categories }),
      setIncomeCategories: (categories) => set({ incomeCategories: categories }),
      setTransactions: (transactions) => set({
        transactions: [...transactions].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
      }),
      setRecurringTransactions: (recurring) => set({ recurringTransactions: recurring }),
      setBalanceStartDate: (date) => set({ balanceStartDate: date }),

      addCategory: (type, name) => set((state) => {
        const key = type === 'income' ? 'incomeCategories' : 'categories';
        return { [key]: [...state[key], { name, subcategories: [] }] };
      }),

      renameCategory: (type, oldName, newName) => set((state) => {
        const key = type === 'income' ? 'incomeCategories' : 'categories';
        // Also update all transactions and recurring templates
        const updatedTransactions = state.transactions.map(t =>
          t.type === type && t.category === oldName ? { ...t, category: newName } : t
        );
        const updatedRecurring = state.recurringTransactions.map(r =>
          r.type === type && r.category === oldName ? { ...r, category: newName } : r
        );
        return {
          [key]: state[key].map(c => c.name === oldName ? { ...c, name: newName } : c),
          transactions: updatedTransactions,
          recurringTransactions: updatedRecurring
        };
      }),

      deleteCategory: (type, name) => set((state) => {
        const key = type === 'income' ? 'incomeCategories' : 'categories';
        const cat = state[key].find(c => c.name === name);
        if (cat && cat.subcategories.length > 0) return state; // Safety check
        return {
          [key]: state[key].filter(c => c.name !== name)
        };
      }),

      addSubcategory: (type, categoryName, subName) => set((state) => {
        const key = type === 'income' ? 'incomeCategories' : 'categories';
        return {
          [key]: state[key].map(c => c.name === categoryName ? { ...c, subcategories: [...c.subcategories, subName] } : c)
        };
      }),

      renameSubcategory: (type, categoryName, oldName, newName) => set((state) => {
        const key = type === 'income' ? 'incomeCategories' : 'categories';
        // Also update all transactions and recurring templates
        const updatedTransactions = state.transactions.map(t =>
          t.type === type && t.category === categoryName && t.subcategory === oldName ? { ...t, subcategory: newName } : t
        );
        const updatedRecurring = state.recurringTransactions.map(r =>
          r.type === type && r.category === categoryName && r.subcategory === oldName ? { ...r, subcategory: newName } : r
        );
        return {
          [key]: state[key].map(c => c.name === categoryName ? {
            ...c,
            subcategories: c.subcategories.map(s => s === oldName ? newName : s)
          } : c),
          transactions: updatedTransactions,
          recurringTransactions: updatedRecurring
        };
      }),

      deleteSubcategory: (type, categoryName, subName) => set((state) => {
        const key = type === 'income' ? 'incomeCategories' : 'categories';
        return {
          [key]: state[key].map(c => c.name === categoryName ? {
            ...c,
            subcategories: c.subcategories.filter(s => s !== subName)
          } : c)
        };
      }),

      deleteSubcategoryAndRemap: (type, categoryName, subToDelete, remapToSub) => set((state) => {
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

        return {
          [key]: updatedCategories,
          transactions: updatedTransactions,
          recurringTransactions: updatedRecurring
        };
      }),

      moveSubcategory: (type, subName, fromCategory, toCategory) => set((state) => {
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

        return {
          [key]: updatedCategories,
          transactions: updatedTransactions,
          recurringTransactions: updatedRecurring
        };
      }),

      addRecurring: (recurring) => set((state) => ({ recurringTransactions: [...state.recurringTransactions, recurring] })),
      updateRecurring: (recurring) => set((state) => ({
        recurringTransactions: state.recurringTransactions.map(r => r.id === recurring.id ? recurring : r)
      })),
      deleteRecurring: (id) => set((state) => ({
        recurringTransactions: state.recurringTransactions.filter(r => r.id !== id)
      })),

      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
      updateAccount: (account) => set((state) => ({
        accounts: state.accounts.map(a => a.id === account.id ? account : a)
      })),
      deleteAccount: (id) => set((state) => ({
        accounts: state.accounts.filter(a => a.id !== id)
      })),
      setDefaultAccount: (id) => set((state) => ({
        accounts: state.accounts.map(a => ({ ...a, isDefault: a.id === id }))
      })),
    }),
    {
      name: 'finance-storage',
    }
  )
);
