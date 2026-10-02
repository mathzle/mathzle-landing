import { describe, it, expect } from 'vitest';
import { claims } from '../../src/data/claims';

describe('claim register format', () => {
  it('verifiedBy is "<name> <YYYY-MM-DD>" when set', () => {
    for (const [k, c] of Object.entries(claims)) {
      if (c.verifiedBy !== null) expect(c.verifiedBy, k).toMatch(/^\S.* \d{4}-\d{2}-\d{2}$/);
    }
  });
  it('prices are positive when present', () => {
    for (const k of ['premiumMonthlyVnd', 'premiumYearlyVnd', 'premiumMonthlyUsd', 'premiumYearlyUsd'] as const) {
      const v = claims[k].value;
      if (v !== null) expect(v, k).toBeGreaterThan(0);
    }
  });
  it('yearly price is cheaper than 12 monthly payments', () => {
    const { premiumMonthlyVnd: m, premiumYearlyVnd: y } = claims;
    if (typeof m.value === 'number' && typeof y.value === 'number') expect(y.value).toBeLessThan(m.value * 12);
  });
});
