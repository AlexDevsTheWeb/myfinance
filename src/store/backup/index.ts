import type { IBrokerConfig, IETFTransaction, IFinanceState, IPortfolioSnapshot } from '../types';
import { DEFAULT_BROKER_CONFIG } from '../defaults';
import { validateTransaction, validateRecurringTransaction } from '../validation';

export interface BackupValidationError {
  type: 'transaction' | 'recurring' | 'account' | 'category' | 'field';
  index?: number;
  message: string;
}

export interface BackupValidationResult {
  valid: boolean;
  errors: BackupValidationError[];
}

export function validateBackupData(data: BackupPayload): BackupValidationResult {
  const errors: BackupValidationError[] = [];

  if (data.transactions) {
    data.transactions.forEach((t, i) => {
      const result = validateTransaction(t);
      if (!result.valid) {
        errors.push({ type: 'transaction', index: i, message: result.error || 'Invalid transaction' });
      }
    });
  }

  if (data.recurringTransactions) {
    data.recurringTransactions.forEach((r, i) => {
      const result = validateRecurringTransaction(r);
      if (!result.valid) {
        errors.push({ type: 'recurring', index: i, message: result.error || 'Invalid recurring transaction' });
      }
    });
  }

  if (data.accounts) {
    data.accounts.forEach((a, i) => {
      if (!a.id || typeof a.id !== 'string') {
        errors.push({ type: 'account', index: i, message: 'Account missing valid id' });
      }
      if (!a.name || typeof a.name !== 'string') {
        errors.push({ type: 'account', index: i, message: 'Account missing valid name' });
      }
      if (typeof a.initialBalance !== 'number') {
        errors.push({ type: 'account', index: i, message: 'Account missing valid initialBalance' });
      }
    });
  }

  if (data.categories) {
    data.categories.forEach((c, i) => {
      if (!c.name || typeof c.name !== 'string') {
        errors.push({ type: 'category', index: i, message: 'Category missing valid name' });
      }
      if (!Array.isArray(c.subcategories)) {
        errors.push({ type: 'category', index: i, message: 'Category missing subcategories array' });
      }
    });
  }

  if (data.incomeCategories) {
    data.incomeCategories.forEach((c, i) => {
      if (!c.name || typeof c.name !== 'string') {
        errors.push({ type: 'category', index: i, message: 'Income category missing valid name' });
      }
      if (!Array.isArray(c.subcategories)) {
        errors.push({ type: 'category', index: i, message: 'Income category missing subcategories array' });
      }
    });
  }

  if (data.initialBalance !== undefined && typeof data.initialBalance !== 'number') {
    errors.push({ type: 'field', message: 'initialBalance must be a number' });
  }

  if (data.balanceStartDate !== undefined) {
    if (typeof data.balanceStartDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.balanceStartDate)) {
      errors.push({ type: 'field', message: 'balanceStartDate must be YYYY-MM-DD format' });
    }
  }

  return { valid: errors.length === 0, errors };
}

export interface BackupData {
  version: string;
  exportedAt: string;
  app: string;
  data: BackupPayload;
}

export interface BackupPayload {
  initialBalance?: number;
  accounts?: IFinanceState['accounts'];
  transactions?: IFinanceState['transactions'];
  recurringTransactions?: IFinanceState['recurringTransactions'];
  categories?: IFinanceState['categories'];
  incomeCategories?: IFinanceState['incomeCategories'];
  enabledModules?: IFinanceState['enabledModules'];
  balanceStartDate?: string;
  carMileage?: IFinanceState['carMileage'];
  carInitialMileage?: number;
  tireSettings?: IFinanceState['tireSettings'];
  tireChanges?: IFinanceState['tireChanges'];
  etfTransactions?: IETFTransaction[];
  portfolioSnapshots?: IPortfolioSnapshot[];
  brokerConfig?: IBrokerConfig;
}

export interface BackupPreview {
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
}

export function createBackup(state: IFinanceState): BackupData {
  return {
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
      etfTransactions: (state as any).etfTransactions ?? [],
      portfolioSnapshots: (state as any).portfolioSnapshots ?? [],
      brokerConfig: (state as any).brokerConfig ?? DEFAULT_BROKER_CONFIG,
    },
  };
}

export function downloadBackup(backup: BackupData): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `myfinance-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parseBackup(fileOrData: File | object): Promise<{ data: BackupPayload | null; error?: string }> {
  let backup: { version?: string; app?: string; data?: BackupPayload; state?: BackupPayload };

  if (fileOrData instanceof File) {
    try {
      const text = await fileOrData.text();
      backup = JSON.parse(text);
    } catch {
      return { data: null, error: 'Invalid backup: failed to parse JSON' };
    }
  } else {
    backup = fileOrData as { version?: string; app?: string; data?: BackupPayload; state?: BackupPayload };
  }

  if (backup.version) {
    if (backup.app !== 'myfinance') {
      return { data: null, error: 'Invalid backup: not a MyFinance backup file' };
    }
    return { data: backup.data ?? {} };
  } else if (backup.state) {
    return { data: backup.state };
  } else {
    return { data: null, error: 'Invalid backup: missing data' };
  }
}

export async function previewBackup(file: File): Promise<BackupPreview> {
  try {
    const text = await (file.text() as Promise<string>);
    const backup = JSON.parse(text);

    let data: BackupPayload | undefined;
    let exportedAt = 'Unknown';

    if (backup.version && backup.app === 'myfinance') {
      data = backup.data;
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
        transactionCount: data?.transactions?.length ?? 0,
        accountCount: data?.accounts?.length ?? 0,
        recurringCount: data?.recurringTransactions?.length ?? 0,
        categoryCount: data?.categories?.length ?? 0,
        incomeCategoryCount: data?.incomeCategories?.length ?? 0,
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
}