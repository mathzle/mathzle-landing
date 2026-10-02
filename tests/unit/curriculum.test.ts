import { describe, it, expect } from 'vitest';
import vi from '../../src/content/curriculum/vi.json';
import en from '../../src/content/curriculum/en.json';
import { countSkills } from '../../src/data/curriculum';
import { claims } from '../../src/data/claims';

const IDS = ['ocean', 'forest', 'sky', 'sunset', 'berry', 'mint'];

describe('curriculum table', () => {
  it('covers grades 1–5 once each, every world column present', () => {
    expect(vi.rows.map((r) => r.grade)).toEqual([1, 2, 3, 4, 5]);
    for (const r of vi.rows) expect(Object.keys(r.cells).sort()).toEqual([...IDS].sort());
  });
  it('EN has the same filled cells as VI', () => {
    const filled = (d: typeof vi) => d.rows.flatMap((r) => IDS.filter((id) => (r.cells as Record<string, string>)[id] !== '').map((id) => `${r.grade}:${id}`));
    expect(filled(en)).toEqual(filled(vi));
  });
  it('the "skills" claim, once verified, equals the number of filled cells', () => {
    if (claims.skills.verifiedBy) expect(claims.skills.value).toBe(countSkills(vi.rows));
  });
});
