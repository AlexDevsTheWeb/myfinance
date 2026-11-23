import type { TransactionDoc } from '../../lib/converters';
import type { ITransaction } from '../types';

/**
 * Sanitizes a transaction for Firebase storage
 * Ensures all fields are properly typed for Firestore
 */
export const sanitizeTransaction = (t: ITransaction): TransactionDoc => {
  return {
    id: t.id,
    date: t.date,
    description: t.description,
    category: t.category,
    subcategory: t.subcategory,
    amount: Number(t.amount),
    type: t.type,
    accountId: t.accountId,
    recurringLinkId: t.recurringLinkId ?? null,
    consumption: (t.consumption !== undefined && t.consumption !== null && String(t.consumption) !== '') ? Number(t.consumption) : null,
    readingDateStart: t.readingDateStart ?? null,
    readingDateEnd: t.readingDateEnd ?? null,
    cardId: t.cardId ?? null,
    utilityType: t.utilityType ?? null,
    fixedFee: (t.fixedFee !== undefined && t.fixedFee !== null && String(t.fixedFee) !== '') ? Number(t.fixedFee) : null,
    energyFee: (t.energyFee !== undefined && t.energyFee !== null && String(t.energyFee) !== '') ? Number(t.energyFee) : null,
    provider: t.provider?.trim() || null,
    meterId: t.meterId?.trim() || null,
  };
};