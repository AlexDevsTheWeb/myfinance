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

/**
 * Parse a currency input that may use Italian or international notation.
 *
 * Accepts `2.123,45`, `2123.45`, `2,5` and plain `2123`. A single dot followed
 * by one or two digits is read as a decimal separator; repeated dots (or a dot
 * followed by three digits) are thousands separators.
 */
export function parseAmountInput(value: string): number {
  const cleaned = value.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return Number.NaN;

  let normalized = cleaned;
  if (cleaned.includes(',')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, '');
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

/**
 * Normalise a currency input while typing: Italian grouping, decimal comma,
 * at most two decimals, and a trailing comma preserved so `1.234,` stays
 * typeable.
 */
export function formatAmountInput(value: string): string {
  const cleaned = value.replace(/[^\d.,]/g, '');
  if (!cleaned) return '';

  let integerPart: string;
  let decimalPart = '';
  let hasDecimal = false;

  const commaIndex = cleaned.lastIndexOf(',');
  if (commaIndex >= 0) {
    hasDecimal = true;
    integerPart = cleaned.slice(0, commaIndex).replace(/\D/g, '');
    decimalPart = cleaned.slice(commaIndex + 1).replace(/\D/g, '').slice(0, 2);
  } else if (cleaned.includes('.')) {
    const dots = (cleaned.match(/\./g) ?? []).length;
    const lastDot = cleaned.lastIndexOf('.');
    const digitsAfter = cleaned.slice(lastDot + 1).replace(/\D/g, '');
    if (dots === 1 && digitsAfter.length > 0 && digitsAfter.length <= 2) {
      hasDecimal = true;
      integerPart = cleaned.slice(0, lastDot).replace(/\D/g, '');
      decimalPart = digitsAfter.slice(0, 2);
    } else {
      integerPart = cleaned.replace(/\D/g, '');
    }
  } else {
    integerPart = cleaned.replace(/\D/g, '');
  }

  integerPart = integerPart.replace(/^0+(?=\d)/, '');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return hasDecimal ? `${grouped},${decimalPart}` : grouped;
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

  const amount = parseAmountInput(draft.amount);
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
    amount: parseAmountInput(draft.amount),
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
    amount: parseAmountInput(draft.amount),
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
    amount: formatAmountInput(String(transaction.amount)),
    accountId: transaction.accountId,
    cardId: transaction.cardId ?? '',
    consumption: transaction.consumption !== undefined ? String(transaction.consumption) : '',
    readingDateStart: transaction.readingDateStart ?? '',
    readingDateEnd: transaction.readingDateEnd ?? '',
  };
}
