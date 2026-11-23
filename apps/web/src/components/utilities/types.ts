/** Shared types for the Utilities & Consumption page. */
import type { UtilityType } from '../../store/useFinanceStore';

/** A calendar year, or every year on record. */
export type UtilitiesPeriod = number | 'all';

/** `all` mixes the three utilities; a concrete value scopes volumes and rates. */
export type UtilitiesTypeFilter = 'all' | UtilityType;

export type UtilitiesSortField = 'date' | 'amount';

export interface UtilitiesSort {
  field: UtilitiesSortField;
  direction: 'asc' | 'desc';
}

export interface UtilityMeta {
  /** Physical unit shown next to a volume: kWh, SMC, m³. */
  unit: string;
  /** Accent used for the energy quota bars and the row badge. */
  color: string;
}

export const UTILITY_TYPES: UtilityType[] = ['electricity', 'gas', 'water'];

export const UTILITY_META: Record<UtilityType, UtilityMeta> = {
  electricity: { unit: 'kWh', color: '#F59E0B' },
  gas: { unit: 'SMC', color: '#EF4444' },
  water: { unit: 'm³', color: '#0EA5E9' },
};

/** Fixed quota is a neutral slate: it is the part consumption cannot move. */
export const FIXED_QUOTA_COLOR = '#334155';
