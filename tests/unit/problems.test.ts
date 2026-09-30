import { describe, it, expect } from 'vitest';
import { PROBLEMS, isCorrect, nextIndex } from '../../src/components/islands/problems';
import vi from '../../src/i18n/vi.json';
import en from '../../src/i18n/en.json';

describe('PROBLEMS', () => {
  it('each answer is the true result', () => {
    for (const p of PROBLEMS) expect(p.op === '+' ? p.a + p.b : p.a - p.b).toBe(p.answer);
  });
  it('each problem offers the answer among 3 unique choices', () => {
    for (const p of PROBLEMS) {
      expect(p.choices).toContain(p.answer);
      expect(new Set(p.choices).size).toBe(3);
    }
  });
  it('has one hint per problem in each locale', () => {
    expect(vi.try.hints).toHaveLength(PROBLEMS.length);
    expect(en.try.hints).toHaveLength(PROBLEMS.length);
  });
  it('isCorrect / nextIndex', () => {
    expect(isCorrect(PROBLEMS[0], PROBLEMS[0].answer)).toBe(true);
    expect(isCorrect(PROBLEMS[0], PROBLEMS[0].answer + 1)).toBe(false);
    expect(nextIndex(PROBLEMS.length - 1)).toBe(0);
    expect(nextIndex(0)).toBe(1);
  });
});
