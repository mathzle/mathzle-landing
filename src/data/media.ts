import type { ImageMetadata } from 'astro';

/** Screens captured from mathzle-ui (P3 Task 25). Missing files are fine — callers fall back. */
export const SCREEN_NAMES = [
  'lesson-play', 'lesson-try', 'lesson-hint', 'review', 'world-map', 'family-dashboard',
] as const;
export type ScreenName = (typeof SCREEN_NAMES)[number];

export function pickScreen<T>(map: Record<string, { default: T }>, name: ScreenName): T | null {
  const hit = Object.entries(map).find(([path]) => new RegExp(`/${name}\\.(png|jpe?g|webp)$`).test(path));
  return hit ? hit[1].default : null;
}

export interface HeroVideo {
  mp4: string | null;
  webm: string | null;
  poster: ImageMetadata;
}

export function pickHeroVideo(
  videos: Record<string, string>,
  posters: Record<string, { default: ImageMetadata }>,
): HeroVideo | null {
  const find = (ext: string) => Object.entries(videos).find(([p]) => p.endsWith(`/hero.${ext}`))?.[1] ?? null;
  const poster = Object.values(posters)[0]?.default;
  const mp4 = find('mp4');
  const webm = find('webm');
  if (!poster || (!mp4 && !webm)) return null;
  return { mp4, webm, poster };
}

const screens = import.meta.glob<{ default: ImageMetadata }>('../assets/screens/*.{png,jpg,jpeg,webp}', { eager: true });
const videos = import.meta.glob<string>('../assets/media/hero.{mp4,webm}', { eager: true, query: '?url', import: 'default' });
const posters = import.meta.glob<{ default: ImageMetadata }>('../assets/media/hero-poster.{png,jpg,jpeg}', { eager: true });

export const screen = (name: ScreenName) => pickScreen(screens, name);
export const heroVideo = () => pickHeroVideo(videos, posters);
