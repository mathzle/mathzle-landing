export function shouldAutoplay(env: { reducedMotion: boolean; saveData: boolean }): boolean {
  return !env.reducedMotion && !env.saveData;
}
