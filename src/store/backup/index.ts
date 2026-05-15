import type { IFinanceState } from '../types';

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