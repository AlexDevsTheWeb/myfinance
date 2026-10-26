/** Display helpers for the settings page. */

/**
 * Mask an IBAN for display: keep the country + check digits and the last four.
 * `IT28X1234567890123456789012` -> `IT28 •••• •••• 9012`.
 */
export function maskIban(iban?: string): string | null {
  if (!iban) return null;
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)} •••• •••• ${clean.slice(-4)}`;
}
