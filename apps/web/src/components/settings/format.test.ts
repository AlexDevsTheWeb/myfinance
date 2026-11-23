import { describe, expect, it } from 'vitest';
import { maskIban } from './format';

describe('maskIban', () => {
  it('keeps the country/check digits and the last four', () => {
    expect(maskIban('IT28X1234567890123456789012')).toBe('IT28 •••• •••• 9012');
  });

  it('ignores spaces and lower case', () => {
    expect(maskIban('it28 x123 4567 8901 2345 6789 012')).toBe('IT28 •••• •••• 9012');
  });

  it('returns null when there is no IBAN', () => {
    expect(maskIban(undefined)).toBeNull();
    expect(maskIban('')).toBeNull();
  });

  it('returns short values unchanged', () => {
    expect(maskIban('IT28')).toBe('IT28');
  });
});
