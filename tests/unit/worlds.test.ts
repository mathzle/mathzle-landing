import { describe, it, expect, vi } from 'vitest';
vi.mock('../../src/assets/worlds/CountingCove.png', () => ({ default: { src: 'a' } }));
vi.mock('../../src/assets/worlds/NumberForest.png', () => ({ default: { src: 'b' } }));
vi.mock('../../src/assets/worlds/LogicSky.png', () => ({ default: { src: 'c' } }));
vi.mock('../../src/assets/worlds/PatternPeaks.png', () => ({ default: { src: 'd' } }));
vi.mock('../../src/assets/worlds/FractionFields.png', () => ({ default: { src: 'e' } }));
vi.mock('../../src/assets/worlds/MeasurementMeadow.png', () => ({ default: { src: 'f' } }));
const { WORLDS } = await import('../../src/data/worlds');
import vi_ from '../../src/i18n/vi.json';
import en from '../../src/i18n/en.json';

describe('WORLDS', () => {
  it('has six unique worlds', () => {
    expect(new Set(WORLDS.map((w) => w.id)).size).toBe(6);
  });
  it('grade ranges sit inside primary school (1–5)', () => {
    for (const w of WORLDS) {
      expect(w.grades.from).toBeGreaterThanOrEqual(1);
      expect(w.grades.to).toBeLessThanOrEqual(5);
      expect(w.grades.from).toBeLessThanOrEqual(w.grades.to);
    }
  });
  it('every world has copy in both locales', () => {
    for (const w of WORLDS) {
      expect((vi_.worlds as Record<string, unknown>)[w.id], `vi ${w.id}`).toBeTruthy();
      expect((en.worlds as Record<string, unknown>)[w.id], `en ${w.id}`).toBeTruthy();
    }
  });
});
