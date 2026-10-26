/** Shared types for the transaction ledger page. */

export type LedgerPeriod = 'month' | '90d' | 'year' | 'custom';

export type LedgerTypeFilter = 'all' | 'recurring' | 'oneOff';

export type LedgerColumnKey = 'category' | 'account' | 'type';

export type LedgerColumnVisibility = Record<LedgerColumnKey, boolean>;

export type LedgerSortField = 'date' | 'amount';

export interface LedgerSort {
  field: LedgerSortField;
  direction: 'asc' | 'desc';
}

export const DEFAULT_COLUMN_VISIBILITY: LedgerColumnVisibility = {
  category: true,
  account: true,
  type: true,
};
