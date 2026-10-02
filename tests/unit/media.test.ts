import { describe, it, expect } from 'vitest';
import { pickScreen, pickHeroVideo, SCREEN_NAMES } from '../../src/data/media';

const img = (src: string) => ({ src, width: 2560, height: 1600, format: 'png' }) as never;

describe('pickScreen', () => {
  const map = { '../assets/screens/lesson-play.png': { default: img('a') } };
  it('finds a screen by exact name', () => {
    expect(pickScreen(map, 'lesson-play')).toEqual(img('a'));
  });
  it('returns null when the asset is missing', () => {
    expect(pickScreen(map, 'review')).toBeNull();
    expect(pickScreen({}, 'lesson-play')).toBeNull();
  });
  it('does not match by prefix', () => {
    expect(pickScreen({ '../assets/screens/lesson-play-old.png': { default: img('x') } }, 'lesson-play')).toBeNull();
  });
  it('names are unique', () => {
    expect(new Set(SCREEN_NAMES).size).toBe(SCREEN_NAMES.length);
  });
});

describe('pickHeroVideo', () => {
  const poster = { '../assets/media/hero-poster.png': { default: img('p') } };
  it('needs a poster and at least one source', () => {
    expect(pickHeroVideo({}, poster)).toBeNull();
    expect(pickHeroVideo({ '../assets/media/hero.mp4': '/m.mp4' }, {})).toBeNull();
  });
  it('returns available sources', () => {
    expect(pickHeroVideo({ '../assets/media/hero.webm': '/w.webm' }, poster)).toEqual({
      mp4: null, webm: '/w.webm', poster: img('p'),
    });
  });
});
