/**
 * Finance store types
 * All interfaces with "I" prefix naming
 */

export interface ICategory {
  name: string;
  subcategories: string[];
}

export interface IAccount {
  id: string;
  name: string;
  initialBalance: number;
  isDefault: boolean;
}

export interface ITransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  accountId: string;
  recurringLinkId?: string;
  consumption?: number;
  readingDateStart?: string;
  readingDateEnd?: string;
}

export interface IRecurringTransaction {
  id: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  dayOfMonth: number;
  accountId: string;
  startDate: string;
  endDate?: string | null;
  frequency?: 'monthly' | 'yearly';
  monthOfYear?: number;
  lastGeneratedUpTo?: string;
}

export interface IAppModules {
  financeTracker: boolean;
  carManagement: boolean;
  utilityTracker: boolean;
  investmentTracking: boolean;
  budgetTracking: boolean;
}

export interface ICarMileageRecord {
  id: string;
  year: number;
  month: number;
  reading: number;
}

export interface ITireChangeRecord {
  id: string;
  date: string;
  type: 'summer' | 'winter';
  odometer: number;
}

export interface ITireSettings {
  summerModel: string;
  winterModel: string;
  initialTireType: 'summer' | 'winter';
}

export interface IFinanceState {
  initialBalance: number;
  categories: ICategory[];
  incomeCategories: ICategory[];
  accounts: IAccount[];
  transactions: ITransaction[];
  recurringTransactions: IRecurringTransaction[];
  carMileage: ICarMileageRecord[];
  carInitialMileage: number;
  tireSettings: ITireSettings;
  tireChanges: ITireChangeRecord[];
  enabledModules: IAppModules;
  balanceStartDate: string;
  deletedRecurringInstances: { recurringLinkId: string; date: string }[];
  isSaving: boolean;
  saveError: string | null;
  language: string;
  setLanguage: (lang: string) => void;
  setInitialBalance: (balance: number) => void;
  addTransaction: (transaction: ITransaction) => void;
  updateTransaction: (transaction: ITransaction) => void;
  deleteTransaction: (id: string) => void;
  setCategories: (categories: ICategory[]) => void;
  setIncomeCategories: (categories: ICategory[]) => void;
  setTransactions: (transactions: ITransaction[]) => void;
  setAccounts: (accounts: IAccount[]) => void;
  setRecurringTransactions: (recurring: IRecurringTransaction[]) => void;
  setCarMileage: (mileage: ICarMileageRecord[]) => void;
  setEnabledModules: (modules: IAppModules) => void;
  toggleModule: (module: keyof IAppModules) => void;
  setBalanceStartDate: (date: string) => void;
  addCategory: (type: 'income' | 'expense', name: string) => void;
  renameCategory: (type: 'income' | 'expense', oldName: string, newName: string) => void;
  deleteCategory: (type: 'income' | 'expense', name: string) => void;
  addSubcategory: (type: 'income' | 'expense', categoryName: string, subName: string) => void;
  renameSubcategory: (type: 'income' | 'expense', categoryName: string, oldName: string, newName: string) => void;
  deleteSubcategory: (type: 'income' | 'expense', categoryName: string, subName: string) => void;
  deleteSubcategoryAndRemap: (type: 'income' | 'expense', categoryName: string, subToDelete: string, remapToSub: string) => void;
  moveSubcategory: (type: 'income' | 'expense', subName: string, fromCategory: string, toCategory: string) => void;
  addRecurring: (recurring: IRecurringTransaction) => void;
  updateRecurring: (recurring: IRecurringTransaction) => void;
  deleteRecurring: (id: string) => void;
  checkRecurring: () => void;
  _migrateToMultiAccount: () => void;
  addAccount: (account: IAccount) => void;
  updateAccount: (account: IAccount) => void;
  deleteAccount: (id: string) => void;
  setDefaultAccount: (id: string) => void;
  addCarMileage: (record: ICarMileageRecord) => void;
  updateCarMileage: (record: ICarMileageRecord) => void;
  deleteCarMileage: (id: string) => void;
  setCarInitialMileage: (value: number) => void;
  setTireSettings: (settings: ITireSettings) => void;
  addTireChange: (record: ITireChangeRecord) => void;
  updateTireChange: (record: ITireChangeRecord) => void;
  deleteTireChange: (id: string) => void;
  setTireChanges: (records: ITireChangeRecord[]) => void;
  setAll: (data: Partial<IFinanceState>) => void;
  clearSaveError: () => void;
  exportAllData: () => void;
  importAllData: (fileOrData: File | object) => Promise<boolean>;
  previewBackup: (file: File) => Promise<import('../../store/backup').BackupPreview>;
}

// Validation functions moved to ../validation/finance.validation.ts