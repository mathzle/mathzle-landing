import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { site, missingForLaunch, type SiteConfig } from '../../src/data/site';

const complete: SiteConfig = {
  url: 'https://mathzle.com',
  appUrl: 'https://app.mathzle.com',
  appUrlConfirmed: true,
  contact: { email: 'hello@example.com', zaloUrl: null },
  legal: { companyName: 'Công ty TNHH X', taxId: '0100000000', address: 'Hà Nội', policiesReviewedOn: '2026-10-15' },
  premium: { onSale: false },
  mascot: { name: null },
  analytics: { cfBeaconToken: 'abc' },
};

describe('missingForLaunch', () => {
  it('returns [] for a complete config', () => {
    expect(missingForLaunch(complete)).toEqual([]);
  });
  it('lists each missing launch field by path', () => {
    const cfg: SiteConfig = {
      ...complete,
      appUrlConfirmed: false,
      contact: { email: null, zaloUrl: null },
      legal: { companyName: null, taxId: '1', address: '', policiesReviewedOn: null },
      analytics: { cfBeaconToken: null },
    };
    expect(missingForLaunch(cfg)).toEqual([
      'appUrlConfirmed',
      'contact.email',
      'legal.companyName',
      'legal.address',
      'legal.policiesReviewedOn',
      'analytics.cfBeaconToken',
    ]);
  });
  it('does not require optional fields (zalo, taxId, mascot name)', () => {
    expect(missingForLaunch({ ...complete, legal: { ...complete.legal, taxId: null } })).toEqual([]);
  });
});

describe.runIf(process.env.LAUNCH_CHECK === '1')('launch gate', () => {
  it('site config has every launch-required field', () => {
    expect(missingForLaunch(site)).toEqual([]);
  });

  it('every claim has been verified (value, or confirmed absent)', async () => {
    const { unverifiedClaims } = await import('../../src/data/claims');
    expect(unverifiedClaims()).toEqual([]);
  });

  it('wrangler.jsonc binds a real SIGNUPS KV namespace (not the placeholder)', () => {
    const src = readFileSync(new URL('../../wrangler.jsonc', import.meta.url), 'utf8')
      .replace(/^\s*\/\/.*$/gm, ''); // strip line comments (JSONC)
    const kv = (JSON.parse(src).kv_namespaces ?? []) as { binding: string; id: string }[];
    const signups = kv.find((n) => n.binding === 'SIGNUPS');
    expect(signups?.id).toBeTruthy();
    expect(signups?.id).not.toBe('REPLACE_WITH_KV_ID');
  });
});
