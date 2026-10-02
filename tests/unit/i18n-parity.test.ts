import { describe, it, expect } from 'vitest';
import en from '../../src/i18n/en.json';
import vi from '../../src/i18n/vi.json';
import faqEn from '../../src/content/faq/en.json';
import faqVi from '../../src/content/faq/vi.json';
import { shape } from './helpers/strings';

describe('i18n parity', () => {
  it('vi.json has exactly the keys of en.json', () => {
    expect(shape(vi).sort()).toEqual(shape(en).sort());
  });
  it('FAQ has the same shape in both locales', () => {
    expect(shape(faqVi).sort()).toEqual(shape(faqEn).sort());
  });
});
