import { describe, it, expect } from 'vitest';
import vi from '../../src/i18n/vi.json';
import en from '../../src/i18n/en.json';
import { ICONS } from '../../src/lib/icons';
import { claims } from '../../src/data/claims';
import faqVi from '../../src/content/faq/vi.json';
import faqEn from '../../src/content/faq/en.json';

const allIfs = (v: unknown): string[] =>
  Array.isArray(v) ? v.flatMap(allIfs)
  : v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => (k === 'if' && typeof x === 'string' ? [x] : allIfs(x)))
  : [];
const allClaimRefs = (v: unknown): string[] =>
  JSON.stringify(v).match(/\{(?:claim|if):([a-zA-Z0-9]+)\}/g)?.map((m) => m.replace(/\{(?:claim|if):|\}/g, '')) ?? [];

/** Every {claim:k} whose value may be null, not gated by `{if:k}…{/if}` in the
 *  same string or by an `if: k` on the enclosing item. */
function ungatedNullable(v: unknown, gate = ''): string[] {
  if (typeof v === 'string') {
    return [...v.matchAll(/\{claim:([a-zA-Z0-9]+)\}/g)]
      .map((m) => m[1])
      .filter((k) => (claims as Record<string, { value: unknown }>)[k]?.value === null && k !== gate)
      .filter((k) => v.replace(new RegExp(`\\{if:${k}\\}.*?\\{/if\\}`, 'g'), '').includes(`{claim:${k}}`))
      .map((k) => `${k} in "${v}"`);
  }
  if (Array.isArray(v)) return v.flatMap((x) => ungatedNullable(x, gate));
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const g = typeof o.if === 'string' && o.if ? o.if : gate;
    return Object.values(o).flatMap((x) => ungatedNullable(x, g));
  }
  return [];
}

describe('content integrity', () => {
  it('claims with no value yet are always gated by their own {if:} / item if (D-018)', () => {
    for (const src of [vi, en, faqVi, faqEn]) expect(ungatedNullable(src)).toEqual([]);
  });
  it('the gate check catches an ungated nullable claim', () => {
    const k = Object.entries(claims).find(([, c]) => c.value === null)?.[0];
    if (!k) return;
    expect(ungatedNullable({ a: `x {claim:${k}}` })).toHaveLength(1);
    expect(ungatedNullable({ a: `x{if:${k}} {claim:${k}}{/if}` })).toHaveLength(0);
    expect(ungatedNullable({ if: k, a: `{claim:${k}}` })).toHaveLength(0);
  });

  for (const [name, dict] of [['vi', vi], ['en', en]] as const) {
    it(`${name}: every safety icon exists`, () => {
      for (const item of dict.safety.items) expect(ICONS).toHaveProperty(item.icon);
    });
    it(`${name}: every "if" and {claim:…} names a real claim`, () => {
      for (const key of [...allIfs(dict), ...allClaimRefs(dict)].filter(Boolean)) expect(claims).toHaveProperty(key);
    });
    it(`${name}: proof stats that may be confirmed absent are gated by their own claim`, () => {
      // levels/skills can be verified as "none" (null) — the item must then hide,
      // not throw in copy() ("confirmed absent — rewrite the copy").
      for (const key of ['levels', 'skills']) {
        const item = dict.proof.items.find((it) => it.value === `{claim:${key}}`);
        expect(item, key).toBeDefined();
        expect(item!.if, key).toBe(key);
      }
    });
  }
});
