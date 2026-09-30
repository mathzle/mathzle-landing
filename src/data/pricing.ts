import type { Locale } from '../lib/copy';

export type Currency = 'VND' | 'USD';
export const currencyFor = (locale: Locale): Currency => (locale === 'vi' ? 'VND' : 'USD');

export function formatPrice(amount: number, currency: Currency): string {
  if (currency === 'VND') return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

export function perDay(yearly: number, currency: Currency): number {
  const raw = yearly / 365;
  return currency === 'VND' ? Math.round(raw / 100) * 100 : Math.round(raw * 100) / 100;
}

export function savingsPct(monthly: number, yearly: number): number {
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}
