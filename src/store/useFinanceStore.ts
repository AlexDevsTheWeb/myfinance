import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Category {
  name: string;
  subcategories: string[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense';
  recurringLinkId?: string; // Links this instance to a recurring template
}

export interface RecurringTransaction {
  id: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense';
  dayOfMonth: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (optional)
}

interface FinanceState {
  initialBalance: number;
  categories: Category[];
  incomeCategories: Category[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  setInitialBalance: (balance: number) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setCategories: (categories: Category[]) => void;
  setIncomeCategories: (categories: Category[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setRecurringTransactions: (recurring: RecurringTransaction[]) => void;
  // Category actions
  addCategory: (type: 'income' | 'expense', name: string) => void;
  renameCategory: (type: 'income' | 'expense', oldName: string, newName: string) => void;
  deleteCategory: (type: 'income' | 'expense', name: string) => void;
  // Subcategory actions
  addSubcategory: (type: 'income' | 'expense', categoryName: string, subName: string) => void;
  renameSubcategory: (type: 'income' | 'expense', categoryName: string, oldName: string, newName: string) => void;
  deleteSubcategory: (type: 'income' | 'expense', categoryName: string, subName: string) => void;
  // Recurring actions
  addRecurring: (recurring: RecurringTransaction) => void;
  updateRecurring: (recurring: RecurringTransaction) => void;
  deleteRecurring: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      initialBalance: 18325, // Initial from Google Sheet
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
      setInitialBalance: (balance) => set({ initialBalance: balance }),
      addTransaction: (transaction) => set((state) => ({ transactions: [transaction, ...state.transactions] })),
      updateTransaction: (transaction) => set((state) => ({
        transactions: state.transactions.map((t) => (t.id === transaction.id ? transaction : t)),
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      })),
      setCategories: (categories) => set({ categories }),
      setIncomeCategories: (categories) => set({ incomeCategories: categories }),
      setTransactions: (transactions) => set({ transactions }),
      setRecurringTransactions: (recurring) => set({ recurringTransactions: recurring }),

      addCategory: (type, name) => set((state) => {
        const key = type === 'income' ? 'incomeCategories' : 'categories';
        return { [key]: [...state[key], { name, subcategories: [] }] };
      }),

      renameCategory: (type, oldName, newName) => set((state) => {
        const key = type === 'income' ? 'incomeCategories' : 'categories';
        return {
          [key]: state[key].map(c => c.name === oldName ? { ...c, name: newName } : c)
        };
      }),

      deleteCategory: (type, name) => set((state) => {
        const key = type === 'income' ? 'incomeCategories' : 'categories';
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
        return {
          [key]: state[key].map(c => c.name === categoryName ? {
            ...c,
            subcategories: c.subcategories.map(s => s === oldName ? newName : s)
          } : c)
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

      addRecurring: (recurring) => set((state) => ({ recurringTransactions: [...state.recurringTransactions, recurring] })),
      updateRecurring: (recurring) => set((state) => ({
        recurringTransactions: state.recurringTransactions.map(r => r.id === recurring.id ? recurring : r)
      })),
      deleteRecurring: (id) => set((state) => ({
        recurringTransactions: state.recurringTransactions.filter(r => r.id !== id)
      })),
    }),
    {
      name: 'finance-storage',
    }
  )
);
