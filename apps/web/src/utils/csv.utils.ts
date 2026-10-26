/**
 * CSV export helpers for the transaction ledger.
 *
 * Kept dependency-free: builds the CSV string and hands it to the browser via
 * a Blob download, so it works in tests without touching the DOM.
 */
import type { Transaction } from '../store/useFinanceStore';

export interface CsvColumn {
  key: keyof Transaction | 'account' | 'card';
  header: string;
  value: (transaction: Transaction) => string;
}

/**
 * Escape a single CSV field (RFC 4180).
 *
 * Only the active separator forces quoting — with `;` as separator, a decimal
 * comma (42,50) stays unquoted, which is what Italian Excel expects.
 */
export function escapeCsvField(value: string, separator = ';'): string {
  const needsQuotes = value.includes(separator) || /["\n\r]/.test(value);
  return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Serialize transactions as CSV.
 *
 * `separator` defaults to `;` because Excel in Italian locales treats the comma
 * as the decimal separator. The byte-order mark is included so Excel detects
 * UTF-8 and renders the euro sign and accented characters.
 */
export function transactionsToCsv(
  transactions: Transaction[],
  resolveAccountName: (accountId: string) => string,
  resolveCardName: (cardId: string | undefined) => string,
  separator = ';',
): string {
  const header = ['Data', 'Descrizione', 'Categoria', 'Sottocategoria', 'Tipo', 'Importo', 'Conto', 'Carta'];

  const rows = transactions.map((transaction) =>
    [
      transaction.date,
      transaction.description,
      transaction.category,
      transaction.subcategory,
      transaction.type,
      transaction.amount.toFixed(2).replace('.', ','),
      resolveAccountName(transaction.accountId),
      resolveCardName(transaction.cardId),
    ]
      .map((field) => escapeCsvField(String(field ?? ''), separator))
      .join(separator),
  );

  return `\uFEFF${[header.join(separator), ...rows].join('\r\n')}\r\n`;
}

/** Trigger a browser download for a CSV payload. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
