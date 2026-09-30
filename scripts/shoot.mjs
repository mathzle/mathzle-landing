// Full-page screenshots in viewport-sized slices, desktop + mobile.
// Usage: node scripts/shoot.mjs http://localhost:4321 ./shots /vi/ /en/
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [base = 'http://localhost:4321', out = './shots', ...paths] = process.argv.slice(2);
const targets = paths.length ? paths : ['/vi/'];
const viewports = [['desk', 1440, 900], ['mob', 390, 844]];
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const path of targets) {
  for (const [name, width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const total = await page.evaluate(() => document.body.scrollHeight);
    const slug = path.replace(/\W+/g, '_');
    for (let y = 0, i = 0; y < total; y += height, i++) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${out}/${slug}-${name}-${String(i).padStart(2, '0')}.png` });
    }
    console.log(`${path} ${name}: ${total}px`);
    await page.close();
  }
}
await browser.close();
