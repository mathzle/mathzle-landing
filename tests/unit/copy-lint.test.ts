import { describe, it, expect } from 'vitest';
import en from '../../src/i18n/en.json';
import vi from '../../src/i18n/vi.json';
import faqEn from '../../src/content/faq/en.json';
import faqVi from '../../src/content/faq/vi.json';
import { collectStrings, offenders, BANNED_EN, BANNED_VI, COMPETITORS } from './helpers/strings';

describe('copy lint (voice guide §6)', () => {
  it('VI copy has no banned phrases', () => {
    expect(offenders([...collectStrings(vi), ...collectStrings(faqVi)], BANNED_VI)).toEqual([]);
  });
  it('EN copy has no banned phrases', () => {
    expect(offenders([...collectStrings(en), ...collectStrings(faqEn)], BANNED_EN)).toEqual([]);
  });
  it('no copy names a competitor', () => {
    const all = [...collectStrings(vi), ...collectStrings(en), ...collectStrings(faqVi), ...collectStrings(faqEn)];
    expect(offenders(all, COMPETITORS)).toEqual([]);
  });
});
