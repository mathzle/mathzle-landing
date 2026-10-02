/**
 * Site-wide facts that are not marketing claims: URLs, contact, legal
 * entity, feature flags. `null` means "not provided yet" — the page hides
 * the element, and `pnpm launch:check` fails until launch-required fields
 * are filled. Marketing numbers live in claims.ts, not here.
 */
export interface SiteConfig {
  url: string;
  appUrl: string;
  /** Flip to true once app.mathzle.com (or the final URL) actually serves the game. */
  appUrlConfirmed: boolean;
  contact: { email: string | null; zaloUrl: string | null };
  /** policiesReviewedOn: YYYY-MM-DD a lawyer signed off Privacy + Terms. */
  legal: { companyName: string | null; taxId: string | null; address: string | null; policiesReviewedOn: string | null };
  premium: { onSale: boolean };
  /**
   * Beta phase (D-017): while false the site shows no prices anywhere — no
   * Pricing section, /pricing/ redirects to the beta program, no pricing
   * links, no billing FAQ. Pricing code stays intact for the flip.
   */
  pricing: { public: boolean };
  mascot: { name: string | null };
  analytics: { cfBeaconToken: string | null };
}

// `import.meta.env` is undefined when Playwright imports this file in plain
// Node (tests/e2e/footer.spec.ts) — fall back to an empty object.
const env: Record<string, string | undefined> = import.meta.env ?? {};

export const site: SiteConfig = {
  url: 'https://mathzle.com',
  appUrl: env.PUBLIC_APP_URL || 'https://app.mathzle.com',
  appUrlConfirmed: env.PUBLIC_APP_URL_CONFIRMED === '1',
  contact: { email: null, zaloUrl: null },
  legal: { companyName: null, taxId: null, address: null, policiesReviewedOn: null },
  premium: { onSale: false },
  // Flip to true at public launch (restores Pricing section, /pricing/, links, billing FAQ).
  pricing: { public: false },
  mascot: { name: null },
  analytics: { cfBeaconToken: env.PUBLIC_CF_BEACON_TOKEN || null },
};

export const LAUNCH_REQUIRED = [
  'appUrlConfirmed',
  'contact.email',
  'legal.companyName',
  'legal.address',
  'legal.policiesReviewedOn',
  'analytics.cfBeaconToken',
] as const;

export function missingForLaunch(cfg: SiteConfig = site): string[] {
  return LAUNCH_REQUIRED.filter((path) => {
    const v = path
      .split('.')
      .reduce<unknown>((obj, key) => (obj as Record<string, unknown> | null)?.[key], cfg);
    return v === null || v === undefined || v === '' || v === false;
  });
}
