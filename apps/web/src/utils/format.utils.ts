/**
 * Dashboard formatting helpers.
 * All monetary values use the Italian number format to keep tabular figures
 * aligned across cards, tables and charts.
 */

const LOCALE = 'it-IT';

export function formatCurrency(amount: number, fractionDigits = 2): string {
  return `€ ${Math.abs(amount).toLocaleString(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

/** Currency with an explicit leading sign: `+€ 2.100,00` / `-€ 31,43`. */
export function formatSignedCurrency(amount: number, fractionDigits = 2): string {
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}${formatCurrency(amount, fractionDigits)}`;
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPercent(value: number, fractionDigits = 1): string {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${Math.abs(value).toFixed(fractionDigits)}%`;
}
