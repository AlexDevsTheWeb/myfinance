/**
 * Pure helpers for the add/edit transaction drawer.
 *
 * Kept free of React and store access so the rules can be unit tested:
 * input validation, utility-unit resolution, account balances and the mapping
 * from a drawer draft to a recurring template.
 */
import dayjs from 'dayjs';
import type { Account, RecurringTransaction, Transaction } from '../../store/useFinanceStore';
import type { TransactionDrawerType } from '../../store/useUiStore';

export type { TransactionDrawerType };

export interface TransactionDraft {
  date: string;
  description: string;
  category: string;
  subcategory: string;
  amount: string;
  accountId: string;
  cardId: string;
  consumption: string;
  readingDateStart: string;
  readingDateEnd: string;
}

export interface RecurringDraft {
  enabled: boolean;
  frequency: 'monthly' | 'yearly';
  dayOfMonth: number;
  monthOfYear: number;
  endDate: string;
}

export const EMPTY_DRAFT: TransactionDraft = {
  date: dayjs().format('YYYY-MM-DD'),
  description: '',
  category: '',
  subcategory: '',
  amount: '',
  accountId: '',
  cardId: '',
  consumption: '',
  readingDateStart: '',
  readingDateEnd: '',
};

export const DEFAULT_RECURRING_DRAFT: RecurringDraft = {
  enabled: false,
  frequency: 'monthly',
  dayOfMonth: dayjs().date(),
  monthOfYear: dayjs().month() + 1,
  endDate: '',
};

/** Drawer density: a blank form is not valid until these fields are filled. */
export function validateDraft(draft: TransactionDraft): Record<keyof TransactionDraft, string> {
  const errors = {} as Record<keyof TransactionDraft, string>;

  const amount = Number(draft.amount);
  if (!draft.amount || Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'amount';
  }
  if (!draft.description.trim()) {
    errors.description = 'description';
  }
  if (!draft.category) {
    errors.category = 'category';
  }
  if (!draft.subcategory) {
    errors.subcategory = 'subcategory';
  }
  if (!draft.accountId) {
    errors.accountId = 'accountId';
  }

  return errors;
}

export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

export type UtilityUnit = 'kWh' | 'smc' | 'L';

const ELECTRICITY = ['elettricità', 'elettricita', 'electricity', 'luce', 'energia'];
const GAS = ['gas', 'metano'];
const FUEL = ['carburante', 'benzina', 'diesel', 'gasolio', 'fuel'];

/**
 * Resolve the consumption unit from the selected category/subcategory.
 *
 * Categories are user data, so this matches known names instead of relying on a
 * category id. `null` means the utility block stays collapsed and optional.
 */
export function resolveUtilityUnit(category: string, subcategory: string): UtilityUnit | null {
  const needle = `${category} ${subcategory}`.toLowerCase();
  if (FUEL.some((term) => needle.includes(term))) return 'L';
  if (GAS.some((term) => needle.includes(term))) return 'smc';
  if (ELECTRICITY.some((term) => needle.includes(term))) return 'kWh';
  return null;
}

/** Utility bills record the billing period; fuel and everything else do not. */
export function showsReadingPeriod(unit: UtilityUnit | null): boolean {
  return unit === 'kWh' || unit === 'smc';
}

/** Price per litre, derived from the total amount and the recorded litres. */
export function pricePerLitre(amount: number, litres: number): number | null {
  if (!Number.isFinite(amount) || !Number.isFinite(litres) || litres <= 0) return null;
  return amount / litres;
}

/** Liquid balance for a single account: initial balance + income − expenses. */
export function computeAccountBalance(
  accountId: string,
  accounts: Account[],
  transactions: Transaction[],
): number | null {
  const account = accounts.find((item) => item.id === accountId);
  if (!account) return null;

  const delta = transactions
    .filter((transaction) => transaction.accountId === accountId)
    .reduce((sum, transaction) => {
      if (transaction.type === 'income') return sum + transaction.amount;
      if (transaction.type === 'expense') return sum - transaction.amount;
      return sum;
    }, 0);

  return account.initialBalance + delta;
}

export interface RecurringTemplateInput {
  draft: TransactionDraft;
  recurring: RecurringDraft;
  type: 'expense' | 'income' | 'transfer';
  /** Today, injectable for tests. */
  today?: dayjs.Dayjs;
}

/**
 * Build a recurring template from a drawer draft.
 *
 * The template starts on the first day of **next** month: the transaction the
 * user is saving already covers today, so starting this month would generate a
 * duplicate on the next `checkRecurring` run.
 */
export function buildRecurringTemplate({
  draft,
  recurring,
  type,
  today = dayjs(),
}: RecurringTemplateInput): RecurringTransaction {
  const start = today.add(1, 'month').startOf('month');
  const dayOfMonth = Math.min(31, Math.max(1, Math.round(recurring.dayOfMonth)));

  return {
    id: crypto.randomUUID(),
    description: draft.description.trim(),
    category: draft.category,
    subcategory: draft.subcategory,
    amount: Number(draft.amount),
    type,
    dayOfMonth,
    accountId: draft.accountId,
    startDate: start.format('YYYY-MM-DD'),
    endDate: recurring.endDate || null,
    frequency: recurring.frequency,
    ...(recurring.frequency === 'yearly' ? { monthOfYear: recurring.monthOfYear } : {}),
    ...(draft.cardId ? { cardId: draft.cardId } : {}),
  };
}

/** Map a draft to the Transaction payload (create or edit). */
export function draftToTransaction(
  draft: TransactionDraft,
  type: 'expense' | 'income' | 'transfer',
  existingId?: string,
): Transaction {
  const consumption = draft.consumption !== '' ? Number(draft.consumption) : undefined;

  return {
    id: existingId ?? crypto.randomUUID(),
    date: draft.date || dayjs().format('YYYY-MM-DD'),
    description: draft.description.trim(),
    category: draft.category,
    subcategory: draft.subcategory,
    amount: Number(draft.amount),
    type,
    accountId: draft.accountId,
    ...(draft.cardId ? { cardId: draft.cardId } : {}),
    ...(consumption !== undefined && !Number.isNaN(consumption) ? { consumption } : {}),
    ...(draft.readingDateStart ? { readingDateStart: draft.readingDateStart } : {}),
    ...(draft.readingDateEnd ? { readingDateEnd: draft.readingDateEnd } : {}),
  };
}

/** Map an existing transaction back into the form draft. */
export function transactionToDraft(transaction: Transaction): TransactionDraft {
  return {
    date: transaction.date,
    description: transaction.description,
    category: transaction.category,
    subcategory: transaction.subcategory,
    amount: String(transaction.amount),
    accountId: transaction.accountId,
    cardId: transaction.cardId ?? '',
    consumption: transaction.consumption !== undefined ? String(transaction.consumption) : '',
    readingDateStart: transaction.readingDateStart ?? '',
    readingDateEnd: transaction.readingDateEnd ?? '',
  };
}
