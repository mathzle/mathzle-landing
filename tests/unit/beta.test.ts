import { describe, it, expect } from 'vitest';
import { visibleFaq, hiddenFromSitemap, betaTarget, pricingPublic } from '../../src/lib/beta';
import { site, type SiteConfig } from '../../src/data/site';

const cfg = (pub: boolean): SiteConfig => ({ ...site, pricing: { public: pub } });
const items = [
  { id: 'a', category: 'learning' },
  { id: 'b', category: 'billing' },
  { id: 'c', category: 'tech' },
];

describe('beta pricing gate', () => {
  it('defaults to hidden pricing during the beta (D-017)', () => {
    expect(site.pricing.public).toBe(false);
    expect(pricingPublic()).toBe(false);
  });
  it('drops billing FAQ items while pricing is not public', () => {
    expect(visibleFaq(items, cfg(false)).map((q) => q.id)).toEqual(['a', 'c']);
    expect(visibleFaq(items, cfg(true)).map((q) => q.id)).toEqual(['a', 'b', 'c']);
  });
  it('hides the pricing pages from the sitemap only while not public', () => {
    for (const p of ['/vi/pricing/', '/en/pricing/', '/en/pricing']) {
      expect(hiddenFromSitemap(p, cfg(false)), p).toBe(true);
      expect(hiddenFromSitemap(p, cfg(true)), p).toBe(false);
    }
    expect(hiddenFromSitemap('/vi/faq/', cfg(false))).toBe(false);
    expect(hiddenFromSitemap('/vi/', cfg(false))).toBe(false);
  });
  it('sends pricing visitors to the beta program section', () => {
    expect(betaTarget('vi')).toBe('/vi/#voices');
    expect(betaTarget('en')).toBe('/en/#voices');
  });
});
