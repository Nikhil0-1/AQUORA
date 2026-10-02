/**
 * Shared UI constants & formatting utilities for AQUORA
 */

export const AQUORA_BRAND = {
  name: 'AQUORA',
  tagline: 'Smart Sanitizer Vending Machine',
  motto: 'Pay. Dispense. Done.',
  currency: 'INR',
  currencySymbol: '₹',
  primaryColor: '#06b6d4', // cyan-500
  accentColor: '#38bdf8',  // sky-400
  darkBg: '#080c14',       // deep aqua dark
};

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
