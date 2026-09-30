/**
 * Claim register — the single source of truth for every number or promise
 * shown on the site (spec 10_requirement.md §6).
 *
 * - verifiedBy: "<who> <YYYY-MM-DD>" once a human confirmed the value, else null.
 * - A verified claim with value null/false means "confirmed we don't offer
 *   this" — components hide it.
 * - Preview builds render unverified claims highlighted; `pnpm build:prod`
 *   (STRICT_CLAIMS=1) fails if any rendered claim is unverified.
 */
export type ClaimValue = number | string | boolean | null;
export interface Claim {
  value: ClaimValue;
  source: string;
  verifiedBy: string | null;
}

export const claims = {
  // Content
  worlds:             { value: 6,       source: 'mathzle-be world seed',                          verifiedBy: null },
  freeWorlds:         { value: 2,       source: 'pricing policy',                                  verifiedBy: null },
  levels:             { value: null,    source: 'DB: count of published lessons',                  verifiedBy: null },
  skills:             { value: null,    source: 'rows in src/content/curriculum',                  verifiedBy: null },
  gradeRange:         { value: '1–5',   source: 'product positioning',                             verifiedBy: null },
  ageRange:           { value: '6–11',  source: 'product positioning',                             verifiedBy: null },
  contentAsOf:        { value: '09/2026', source: 'date the content numbers were counted',         verifiedBy: null },
  curriculumGdpt2018: { value: true,    source: 'advisor review of src/content/curriculum',        verifiedBy: null },
  // Learning mechanics
  sessionMinutes:     { value: 15,      source: 'recommended daily play time (product)',           verifiedBy: null },
  lessonMinutes:      { value: '3–5',   source: 'median lesson duration (analytics)',              verifiedBy: null },
  stepHints:          { value: true,    source: 'lesson player hint feature (Feature 14)',         verifiedBy: null },
  spacedReview:       { value: true,    source: 'review scheduler in lesson engine',               verifiedBy: null },
  // Parents
  skillReport:        { value: true,    source: 'family dashboard (Feature 04)',                   verifiedBy: null },
  parentTimeLimit:    { value: true,    source: 'parent settings in mathzle-ui',                   verifiedBy: null },
  maxChildProfiles:   { value: 4,       source: 'family plan limit',                                verifiedBy: null },
  // Safety
  noAds:              { value: true,    source: 'product policy + privacy policy',                 verifiedBy: null },
  noChat:             { value: true,    source: 'product: no user-to-user messaging',              verifiedBy: null },
  noDataSale:         { value: true,    source: 'privacy policy',                                  verifiedBy: null },
  noInAppPurchase:    { value: true,    source: 'product: no purchases inside kid mode',           verifiedBy: null },
  dataResidency:      { value: null,    source: 'k3s cluster location (Feature 17)',               verifiedBy: null },
  parentDataDeletion: { value: true,    source: 'account settings: delete child data',            verifiedBy: null },
  // Pricing
  premiumMonthlyVnd:  { value: 119000,  source: 'pricing decision',                                verifiedBy: null },
  premiumYearlyVnd:   { value: 990000,  source: 'proposal 36 §4.10',                                verifiedBy: null },
  premiumMonthlyUsd:  { value: 4.99,    source: 'pricing decision',                                verifiedBy: null },
  premiumYearlyUsd:   { value: 39.99,   source: 'proposal 36 §4.10',                                verifiedBy: null },
  refundDays:         { value: 14,      source: 'refund policy (D-016)',                            verifiedBy: null },
  // Beta program
  betaSeats:          { value: 100,     source: 'beta program plan (D-008)',                        verifiedBy: null },
  betaRewardMonths:   { value: 6,       source: 'beta program plan (D-008)',                        verifiedBy: null },
} satisfies Record<string, Claim>;

export type ClaimKey = keyof typeof claims;

declare const __STRICT_CLAIMS__: boolean | undefined;
export const STRICT: boolean = typeof __STRICT_CLAIMS__ !== 'undefined' && __STRICT_CLAIMS__ === true;

export interface ResolvedClaim {
  show: boolean;
  value: ClaimValue;
  verified: boolean;
}

export function resolveClaim(
  key: ClaimKey,
  strict: boolean = STRICT,
  register: Record<string, Claim> = claims,
): ResolvedClaim {
  const c = register[key];
  if (!c) throw new Error(`Unknown claim "${key}"`);
  if (c.verifiedBy) {
    const absent = c.value === null || c.value === false;
    return { show: !absent, value: c.value, verified: true };
  }
  if (strict) {
    throw new Error(`Unverified claim "${key}" used in a strict build (source: ${c.source})`);
  }
  return { show: true, value: c.value, verified: false };
}

export function unverifiedClaims(register: Record<string, Claim> = claims): string[] {
  return Object.entries(register)
    .filter(([, c]) => !c.verifiedBy)
    .map(([k]) => k);
}
