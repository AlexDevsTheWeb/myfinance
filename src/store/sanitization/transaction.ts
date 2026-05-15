import type { ITransaction } from '../types';

/**
 * Sanitizes a transaction for Firebase storage
 * Ensures all fields are properly typed for Firestore
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeTransaction = (t: ITransaction): any => {
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
  };
};