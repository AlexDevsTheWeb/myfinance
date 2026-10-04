import type { RecurringTransactionDoc } from '../../lib/converters';
import type { IRecurringTransaction } from '../types';

/**
 * Sanitizes a recurring transaction for Firebase storage
 * Ensures all fields are properly typed for Firestore
 */
export const sanitizeRecurring = (r: IRecurringTransaction): RecurringTransactionDoc => {
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
    ...(r.cardId ? { cardId: r.cardId } : {}),
  };
};