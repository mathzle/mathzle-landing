import { describe, it, expect } from 'vitest';
import { audienceAges, jsonLd, pageTitle } from '../../src/lib/seo';
import type { Claim } from '../../src/data/claims';

const reg = (ageRange: Claim) => ({ ageRange });

describe('audienceAges', () => {
  it('derives min/max from the ageRange claim', () => {
    expect(audienceAges(false, reg({ value: '6–11', source: 's', verifiedBy: null }))).toEqual({ suggestedMinAge: 6, suggestedMaxAge: 11 });
    expect(audienceAges(false, reg({ value: '5-10', source: 's', verifiedBy: 'x 2026-01-01' }))).toEqual({ suggestedMinAge: 5, suggestedMaxAge: 10 });
  });
  it('omits ages when the claim is confirmed absent or unparseable', () => {
    expect(audienceAges(false, reg({ value: null, source: 's', verifiedBy: 'x 2026-01-01' }))).toEqual({});
    expect(audienceAges(false, reg({ value: 'kids', source: 's', verifiedBy: null }))).toEqual({});
  });
  it('throws in strict builds while unverified (same rule as copy)', () => {
    expect(() => audienceAges(true, reg({ value: '6–11', source: 's', verifiedBy: null }))).toThrow(/Unverified/);
  });
});

describe('jsonLd', () => {
  it('escapes < so a value cannot close the script element', () => {
    const out = jsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ name: '</script><script>alert(1)</script>' });
  });
});

describe('pageTitle', () => {
  it('appends the brand once', () => {
    expect(pageTitle('FAQ')).toBe('FAQ — Mathzle');
    expect(pageTitle('Mathzle pricing')).toBe('Mathzle pricing');
    expect(pageTitle('Bảng giá Mathzle')).toBe('Bảng giá Mathzle');
  });
});
