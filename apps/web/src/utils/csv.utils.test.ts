import { describe, expect, it } from 'vitest';
import { escapeCsvField, transactionsToCsv } from './csv.utils';
import type { Transaction } from '../store/useFinanceStore';

const transaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'tx-1',
  date: '2026-10-28',
  description: 'Esselunga',
  category: 'Alimentari',
  subcategory: 'Spesa',
  amount: 42.5,
  type: 'expense',
  accountId: 'acc-1',
  ...overrides,
});

const resolveAccountName = (id: string) => (id === 'acc-1' ? 'Conto Arancio ING' : 'Sconosciuto');
const resolveCardName = (id: string | undefined) => (id === 'card-1' ? 'Carta Gold' : '');

describe('escapeCsvField', () => {
  it('leaves plain values untouched', () => {
    expect(escapeCsvField('Esselunga')).toBe('Esselunga');
  });

  it('quotes values containing the separator, quotes or newlines', () => {
    expect(escapeCsvField('Mutuo; quota')).toBe('"Mutuo; quota"');
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('transactionsToCsv', () => {
  it('writes a BOM, a header row and one row per transaction', () => {
    const csv = transactionsToCsv([transaction()], resolveAccountName, resolveCardName);
    const lines = csv.replace('\uFEFF', '').trimEnd().split('\r\n');

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('Data;Descrizione;Categoria;Sottocategoria;Tipo;Importo;Conto;Carta');
    expect(lines[1]).toBe('2026-10-28;Esselunga;Alimentari;Spesa;expense;42,50;Conto Arancio ING;');
  });

  it('formats the amount with a decimal comma for Italian Excel', () => {
    const csv = transactionsToCsv([transaction({ amount: 2100 })], resolveAccountName, resolveCardName);
    expect(csv).toContain('2100,00');
    expect(csv).not.toContain('2100.00');
  });

  it('escapes descriptions that contain separators', () => {
    const csv = transactionsToCsv([transaction({ description: 'Mutuo; quota' })], resolveAccountName, resolveCardName);
    expect(csv).toContain('"Mutuo; quota"');
  });

  it('includes the card name when the transaction has one', () => {
    const csv = transactionsToCsv([transaction({ cardId: 'card-1' })], resolveAccountName, resolveCardName);
    expect(csv.trimEnd().endsWith('Conto Arancio ING;Carta Gold')).toBe(true);
  });

  it('returns only the header when there are no transactions', () => {
    const csv = transactionsToCsv([], resolveAccountName, resolveCardName);
    expect(csv.replace('\uFEFF', '').trimEnd().split('\r\n')).toHaveLength(1);
  });
});
