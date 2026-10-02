import { describe, it, expect } from 'vitest';
import { resolveClaim, unverifiedClaims, claims, type Claim } from '../../src/data/claims';

const reg: Record<string, Claim> = {
  a: { value: 6, source: 's', verifiedBy: 'PO 2026-10-01' },
  b: { value: 12, source: 's', verifiedBy: null },
  c: { value: null, source: 's', verifiedBy: 'PO 2026-10-01' },
  d: { value: false, source: 's', verifiedBy: 'PO 2026-10-01' },
  e: { value: null, source: 's', verifiedBy: null },
};

describe('resolveClaim', () => {
  it('shows a verified value', () => {
    expect(resolveClaim('a' as never, false, reg)).toEqual({ show: true, value: 6, verified: true });
  });
  it('hides a claim confirmed absent (null or false)', () => {
    expect(resolveClaim('c' as never, true, reg).show).toBe(false);
    expect(resolveClaim('d' as never, true, reg).show).toBe(false);
  });
  it('shows an unverified claim in preview builds, flagged', () => {
    expect(resolveClaim('b' as never, false, reg)).toEqual({ show: true, value: 12, verified: false });
  });
  it('hides an unverified claim with no value yet in preview builds (no [key] placeholder)', () => {
    expect(resolveClaim('e' as never, false, reg)).toEqual({ show: false, value: null, verified: false });
  });
  it('throws on an unverified claim in strict builds, naming the key', () => {
    expect(() => resolveClaim('b' as never, true, reg)).toThrow(/Unverified claim "b"/);
    expect(() => resolveClaim('e' as never, true, reg)).toThrow(/Unverified claim "e"/);
  });
  it('throws on an unknown key', () => {
    expect(() => resolveClaim('zzz' as never, false, reg)).toThrow(/Unknown claim "zzz"/);
  });
});

describe('unverifiedClaims', () => {
  it('lists keys with no verifier', () => {
    expect(unverifiedClaims(reg)).toEqual(['b', 'e']);
  });
  it('every real claim documents its source', () => {
    for (const [k, c] of Object.entries(claims)) expect(c.source, k).not.toBe('');
  });
});
