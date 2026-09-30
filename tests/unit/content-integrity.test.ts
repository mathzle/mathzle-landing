import { describe, it, expect } from 'vitest';
import vi from '../../src/i18n/vi.json';
import en from '../../src/i18n/en.json';
import { ICONS } from '../../src/lib/icons';
import { claims } from '../../src/data/claims';

const allIfs = (v: unknown): string[] =>
  Array.isArray(v) ? v.flatMap(allIfs)
  : v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => (k === 'if' && typeof x === 'string' ? [x] : allIfs(x)))
  : [];
const allClaimRefs = (v: unknown): string[] =>
  JSON.stringify(v).match(/\{(?:claim|if):([a-zA-Z0-9]+)\}/g)?.map((m) => m.replace(/\{(?:claim|if):|\}/g, '')) ?? [];

describe('content integrity', () => {
  for (const [name, dict] of [['vi', vi], ['en', en]] as const) {
    it(`${name}: every safety icon exists`, () => {
      for (const item of dict.safety.items) expect(ICONS).toHaveProperty(item.icon);
    });
    it(`${name}: every "if" and {claim:…} names a real claim`, () => {
      for (const key of [...allIfs(dict), ...allClaimRefs(dict)].filter(Boolean)) expect(claims).toHaveProperty(key);
    });
  }
});
