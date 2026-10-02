import { resolveClaim, STRICT, type ClaimKey } from '../data/claims';

export type Locale = 'vi' | 'en';

const CLAIM_RE = /\{claim:([a-zA-Z0-9]+)\}/g;
const IF_RE = /\{if:([a-zA-Z0-9]+)\}(.*?)\{\/if\}/g;

export function formatNumber(n: number, locale: Locale): string {
  return n.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US');
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/*
 * D-022: public pages carry no review markup. Preview builds render an
 * unverified claim's value as plain text (or hide it when it has no value
 * yet); the review gate is `pnpm build:prod` (STRICT_CLAIMS=1), which throws
 * in resolveClaim() on any rendered unverified claim.
 */
function claimText(key: string, locale: Locale, strict: boolean): string {
  const r = resolveClaim(key as ClaimKey, strict);
  // Unverified with no value yet (preview builds only — strict threw above):
  // render nothing rather than a `[key]` placeholder. Copy should gate such
  // claims with {if:key}; tests/unit/content-integrity.test.ts enforces that.
  if (!r.verified && r.value === null) return '';
  if (!r.show) throw new Error(`Copy references claim "${key}" which is confirmed absent — rewrite the copy`);
  if (typeof r.value === 'boolean') throw new Error(`Claim "${key}" is boolean and cannot be interpolated`);
  return typeof r.value === 'number' ? formatNumber(r.value, locale) : (r.value as string);
}

/** i18n string → safe HTML. Syntax: {claim:key}, {if:key}…{/if}, ==marker==, **bold**. */
export function copy(src: string, locale: Locale, strict: boolean = STRICT): string {
  const withClaims = (s: string) =>
    s.replace(CLAIM_RE, (_, key: string) => escapeHtml(claimText(key, locale, strict)));
  return escapeHtml(src)
    .replace(IF_RE, (_, key: string, inner: string) => {
      const r = resolveClaim(key as ClaimKey, strict);
      return r.show ? withClaims(inner) : '';
    })
    .replace(CLAIM_RE, (m) => withClaims(m))
    .replace(/==(.+?)==/g, '<mark class="marker">$1</mark>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** i18n string → plain text (meta tags, JSON-LD, aria-label). */
export function copyText(src: string, locale: Locale, strict: boolean = STRICT): string {
  return src
    .replace(IF_RE, (_, key: string, inner: string) => (resolveClaim(key as ClaimKey, strict).show ? inner : ''))
    .replace(CLAIM_RE, (_, key: string) => claimText(key, locale, strict))
    .replace(/==(.+?)==/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1');
}

/** Filter list items carrying an `if` claim key ('' = always shown). */
export function visible<T extends { if: string }>(items: readonly T[], strict: boolean = STRICT): T[] {
  return items.filter((it) => it.if === '' || resolveClaim(it.if as ClaimKey, strict).show);
}

/** Render one claim's value with a custom formatter (prices, units). null = hide the element. */
export function claimHtml(
  key: ClaimKey,
  format: (v: number | string) => string,
  strict: boolean = STRICT,
): string | null {
  const r = resolveClaim(key, strict);
  if (!r.show) return null;
  if (typeof r.value === 'boolean') throw new Error(`Claim "${key}" is boolean; use {if:${key}}`);
  return escapeHtml(format(r.value as number | string));
}
