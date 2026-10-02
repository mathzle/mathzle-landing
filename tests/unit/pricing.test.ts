import { describe, it, expect } from 'vitest';
import { formatPrice, perDay, savingsPct, currencyFor } from '../../src/data/pricing';

describe('pricing helpers', () => {
  it('formats VND and USD', () => {
    expect(formatPrice(119000, 'VND')).toBe('119.000đ');
    expect(formatPrice(4.99, 'USD')).toBe('$4.99');
    expect(formatPrice(40, 'USD')).toBe('$40');
  });
  it('per-day price: VND to the nearest 100đ, USD to the cent', () => {
    expect(perDay(990000, 'VND')).toBe(2700);
    expect(perDay(39.99, 'USD')).toBe(0.11);
  });
  it('yearly savings vs 12 monthly payments, whole percent', () => {
    expect(savingsPct(119000, 990000)).toBe(31);
    expect(savingsPct(100, 1200)).toBe(0);
  });
  it('currency follows locale', () => {
    expect(currencyFor('vi')).toBe('VND');
    expect(currencyFor('en')).toBe('USD');
  });
});
