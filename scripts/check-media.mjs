// Validates product media against spec 36 §2.6. Exit 1 on any problem.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SCREEN_NAMES = ['lesson-play', 'lesson-try', 'lesson-hint', 'review', 'world-map', 'family-dashboard'];
const problems = [];

function pngSize(file) {
  const b = readFileSync(file);
  if (b.toString('ascii', 1, 4) !== 'PNG') return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

const screensDir = 'src/assets/screens';
for (const f of readdirSync(screensDir).filter((f) => !f.startsWith('.'))) {
  const name = f.replace(/\.(png|jpe?g|webp)$/, '');
  if (!SCREEN_NAMES.includes(name)) problems.push(`${f}: unknown screen name (allowed: ${SCREEN_NAMES.join(', ')})`);
  if (!f.endsWith('.png')) { problems.push(`${f}: use PNG (lossless source; astro:assets encodes AVIF/WebP)`); continue; }
  const s = pngSize(join(screensDir, f));
  if (!s) { problems.push(`${f}: not a valid PNG`); continue; }
  const ratio = s.w / s.h;
  const wantRatio = name === 'family-dashboard' ? 4 / 3 : 16 / 10;
  if (Math.abs(ratio - wantRatio) > 0.01) problems.push(`${f}: ${s.w}x${s.h} — expected aspect ${name === 'family-dashboard' ? '4:3' : '16:10'}`);
  if (s.w < 2048) problems.push(`${f}: ${s.w}px wide — capture at 2× (≥ 2048px)`);
}

const mediaDir = 'src/assets/media';
for (const f of ['hero.mp4', 'hero.webm']) {
  const p = join(mediaDir, f);
  if (existsSync(p) && statSync(p).size > 1.2 * 1024 * 1024) problems.push(`${f}: ${(statSync(p).size / 1048576).toFixed(2)} MB > 1.2 MB`);
}
const hasVideo = ['hero.mp4', 'hero.webm'].some((f) => existsSync(join(mediaDir, f)));
if (hasVideo && !['hero-poster.png', 'hero-poster.jpg'].some((f) => existsSync(join(mediaDir, f)))) {
  problems.push('hero video present but hero-poster.png missing');
}

if (problems.length) { console.error(problems.map((p) => `✗ ${p}`).join('\n')); process.exit(1); }
console.log('✓ media ok');
