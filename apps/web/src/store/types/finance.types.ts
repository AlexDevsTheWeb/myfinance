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
  /** Optional IBAN, displayed masked in the UI. */
  iban?: string;
}

export interface ICard {
  id: string;
  name: string;
  type: 'credit' | 'debit';
  plafond: number;
  billingDay: number;
  accountId: string;
}

/** Metered utility kind. Bills without a meter reading (phone, internet) are not utilities here. */
export type UtilityType = 'electricity' | 'gas' | 'water';

/** Vehicle class, used to scope and badge car expenses. */
export type VehicleType = 'car' | 'scooter' | 'rental' | 'other';

/** Car expense kind. Absent means "infer from category/subcategory". */
export type CarExpenseType = 'fuel' | 'maintenance' | 'tax';

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
  cardId?: string;
  /**
   * Explicit utility kind. Optional so existing bills keep working: when it is
   * absent the kind is inferred from category/subcategory keywords.
   */
  utilityType?: UtilityType;
  /** Fixed quota of a utility bill (EUR) — the part independent of consumption. */
  fixedFee?: number;
  /** Energy/consumption quota of a utility bill (EUR). */
  energyFee?: number;
  /** Supplier / contract name, e.g. "Enel Energia". */
  provider?: string;
  /** Meter identifier: POD (electricity), PDR (gas) or the water service code. */
  meterId?: string;
  /**
   * Vehicle this car expense belongs to, e.g. "Peugeot 208". Optional and free
   * text: no vehicle registry exists, so the selector is built from the values
   * that actually appear on transactions.
   */
  vehicleName?: string;
  /** Vehicle class. Absent is treated as `car`. */
  vehicleType?: VehicleType;
  /** Odometer reading at the time of the expense (km). */
  odometerKm?: number;
  /** Litres filled — fuel rows only. Kept separate from utility `consumption`. */
  liters?: number;
  /** Price paid per litre (EUR/L). Derived from amount ÷ litres when absent. */
  pricePerLiter?: number;
  /** Car expense kind. Absent means the page infers it from category keywords. */
  expenseType?: CarExpenseType;
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
  cardId?: string;
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
  cards: ICard[];
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