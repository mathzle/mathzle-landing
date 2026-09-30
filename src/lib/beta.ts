import { site, type SiteConfig } from '../data/site';

/**
 * Beta-phase pricing gate (D-017). While `site.pricing.public` is false the
 * site shows no prices: these helpers are the single place that decides what
 * disappears, so flipping the flag restores everything.
 */
export const pricingPublic = (cfg: SiteConfig = site): boolean => cfg.pricing.public;

/** FAQ items to show: billing questions only once pricing is public. */
export function visibleFaq<T extends { category: string }>(items: readonly T[], cfg: SiteConfig = site): T[] {
  return items.filter((q) => q.category !== 'billing' || cfg.pricing.public);
}

/** Sitemap filter: the pricing pages are redirects while pricing isn't public. */
export function hiddenFromSitemap(pathname: string, cfg: SiteConfig = site): boolean {
  return !cfg.pricing.public && /^\/(vi|en)\/pricing\/?$/.test(pathname);
}

/** Where /{locale}/pricing/ sends visitors during the beta: the beta program. */
export const betaTarget = (locale: 'vi' | 'en'): string => `/${locale}/#voices`;
