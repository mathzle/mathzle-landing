import { describe, it, expect } from 'vitest';
import { shouldAutoplay } from '../../src/lib/autoplay';

describe('shouldAutoplay', () => {
  it('plays only when motion is allowed and data is not saved', () => {
    expect(shouldAutoplay({ reducedMotion: false, saveData: false })).toBe(true);
    expect(shouldAutoplay({ reducedMotion: true, saveData: false })).toBe(false);
    expect(shouldAutoplay({ reducedMotion: false, saveData: true })).toBe(false);
  });
});
