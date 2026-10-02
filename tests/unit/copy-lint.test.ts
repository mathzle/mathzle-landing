import { describe, it, expect } from 'vitest';
import en from '../../src/i18n/en.json';
import vi from '../../src/i18n/vi.json';
import faqEn from '../../src/content/faq/en.json';
import faqVi from '../../src/content/faq/vi.json';
import { readFileSync } from 'node:fs';
import { collectStrings, offenders, BANNED_EN, BANNED_VI, COMPETITORS } from './helpers/strings';

const legal = (locale: 'vi' | 'en') =>
  ['privacy', 'terms'].map((d) => readFileSync(new URL(`../../src/content/legal/${locale}/${d}.md`, import.meta.url), 'utf8'));
// Things the legal text must never promise until the product does them (legal-fact-sheet.md).
const LEGAL_FORBIDDEN = ['không có advertising id', 'xoá dữ liệu bất kỳ lúc nào', 'xóa dữ liệu bất kỳ lúc nào', 'no advertising id', 'todo', 'replace_me'];

describe('copy lint (voice guide §6)', () => {
  it('VI copy has no banned phrases', () => {
    expect(offenders([...collectStrings(vi), ...collectStrings(faqVi)], BANNED_VI)).toEqual([]);
  });
  it('EN copy has no banned phrases', () => {
    expect(offenders([...collectStrings(en), ...collectStrings(faqEn)], BANNED_EN)).toEqual([]);
  });
  it('legal Markdown has no banned or forbidden phrases', () => {
    expect(offenders(legal('vi'), [...BANNED_VI, ...LEGAL_FORBIDDEN])).toEqual([]);
    expect(offenders(legal('en'), [...BANNED_EN, ...LEGAL_FORBIDDEN])).toEqual([]);
  });
  it('no copy names a competitor', () => {
    const all = [...collectStrings(vi), ...collectStrings(en), ...collectStrings(faqVi), ...collectStrings(faqEn)];
    expect(offenders(all, COMPETITORS)).toEqual([]);
  });
});
