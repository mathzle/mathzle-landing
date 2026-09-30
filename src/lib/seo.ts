import { claims, resolveClaim, STRICT, type Claim } from '../data/claims';

/**
 * schema.org audience ages from the `ageRange` claim ("6–11"). Returns {} when
 * the claim is confirmed absent or not a "min–max" range, so JSON-LD never
 * states ages the register doesn't back.
 */
export function audienceAges(
  strict: boolean = STRICT,
  register: Record<string, Claim> = claims,
): { suggestedMinAge?: number; suggestedMaxAge?: number } {
  const r = resolveClaim('ageRange', strict, register);
  if (!r.show || typeof r.value !== 'string') return {};
  const m = /^\s*(\d+)\s*[–—-]\s*(\d+)\s*$/.exec(r.value);
  return m ? { suggestedMinAge: Number(m[1]), suggestedMaxAge: Number(m[2]) } : {};
}

/** JSON for a `<script type="application/ld+json">` body: `<` is escaped as
 *  < so no string value can close the script element. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
