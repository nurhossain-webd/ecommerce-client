/** USD preserves the existing storefront convention; the backend has no currency field. */
export function formatCurrency(
  amount: number,
  { currency = "USD", locale = "en-US" }: { currency?: string; locale?: string } = {},
): string {
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}
