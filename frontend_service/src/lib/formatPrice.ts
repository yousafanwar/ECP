/**
 * Flat shipping (Rs) — keep in sync anywhere totals include shipping.
 */
export const SHIPPING_FLAT_RS = 30;

/**
 * Format a numeric amount as Pakistani Rupees for display (values are stored as Rs).
 */
export function formatPrice(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) {
    return "Rs. 0";
  }
  const formatted = new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
  return `Rs. ${formatted}`;
}
