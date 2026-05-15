import type { ITransaction, IRecurringTransaction } from '../types/finance.types';

/**
 * Finance validation functions
 */

export function validateTransaction(t: ITransaction): { valid: boolean; error?: string } {
  if (!t.description?.trim()) {
    return { valid: false, error: 'Description is required' };
  }
  if (typeof t.amount !== 'number' || t.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (!t.date || !t.category || !t.subcategory || !t.accountId) {
    return { valid: false, error: 'Missing required fields' };
  }
  return { valid: true };
}

export function validateRecurringTransaction(r: IRecurringTransaction): { valid: boolean; error?: string } {
  if (!r.description?.trim()) {
    return { valid: false, error: 'Description is required' };
  }
  if (typeof r.amount !== 'number' || r.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (!r.startDate || !r.accountId || !r.category || !r.subcategory) {
    return { valid: false, error: 'Missing required fields' };
  }
  if (r.endDate && r.startDate && r.endDate < r.startDate) {
    return { valid: false, error: 'End date cannot be before start date' };
  }
  return { valid: true };
}