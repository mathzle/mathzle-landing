// Renders /og/<locale> at 1200×630 into public/og/<locale>.png. Run against `pnpm preview`.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4321';
mkdirSync('public/og', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const locale of ['vi', 'en']) {
  await page.goto(`${base}/og/${locale}`, { waitUntil: 'networkidle' });
  await page.locator('.og').screenshot({ path: `public/og/${locale}.png` });
  console.log(`public/og/${locale}.png`);
}
await browser.close();
