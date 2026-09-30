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

/**
 * Wrap html in the same "unverified claim" markup `claimHtml`/`copy` use.
 * Exported so components that derive a display value from *multiple* claims
 * (e.g. a savings % from both a monthly and a yearly price) can flag it
 * themselves when `claimHtml`'s single-key check isn't enough.
 */
export function flag(key: string, html: string): string {
  return `<span class="claim-unverified" data-claim="${key}" title="Unverified claim: ${key}">${html}</span>`;
}

function claimText(key: string, locale: Locale, strict: boolean): { text: string; verified: boolean } {
  const r = resolveClaim(key as ClaimKey, strict);
  // Unverified with no value yet (preview builds only — strict threw above):
  // render nothing rather than a `[key]` placeholder. Copy should gate such
  // claims with {if:key}; tests/unit/content-integrity.test.ts enforces that.
  if (!r.verified && r.value === null) return { text: '', verified: true };
  if (!r.show) throw new Error(`Copy references claim "${key}" which is confirmed absent — rewrite the copy`);
  if (typeof r.value === 'boolean') throw new Error(`Claim "${key}" is boolean and cannot be interpolated`);
  const text = typeof r.value === 'number' ? formatNumber(r.value, locale) : (r.value as string);
  return { text, verified: r.verified };
}

/** i18n string → safe HTML. Syntax: {claim:key}, {if:key}…{/if}, ==marker==, **bold**. */
export function copy(src: string, locale: Locale, strict: boolean = STRICT): string {
  const withClaims = (s: string) =>
    s.replace(CLAIM_RE, (_, key: string) => {
      const { text, verified } = claimText(key, locale, strict);
      return verified ? escapeHtml(text) : flag(key, escapeHtml(text));
    });
  return escapeHtml(src)
    .replace(IF_RE, (_, key: string, inner: string) => {
      const r = resolveClaim(key as ClaimKey, strict);
      if (!r.show) return '';
      const html = withClaims(inner);
      return r.verified ? html : flag(key, html);
    })
    .replace(CLAIM_RE, (m) => withClaims(m))
    .replace(/==(.+?)==/g, '<mark class="marker">$1</mark>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** i18n string → plain text (meta tags, JSON-LD, aria-label). */
export function copyText(src: string, locale: Locale, strict: boolean = STRICT): string {
  return src
    .replace(IF_RE, (_, key: string, inner: string) => (resolveClaim(key as ClaimKey, strict).show ? inner : ''))
    .replace(CLAIM_RE, (_, key: string) => claimText(key, locale, strict).text)
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
  const html = escapeHtml(format(r.value as number | string));
  return r.verified ? html : flag(key, html);
}
