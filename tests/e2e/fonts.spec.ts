import { test, expect } from '@playwright/test';

// "Paint first, then Be Vietnam Pro" (global.css + Base.astro head script):
// the first layout uses only the metric-matched fallback, so it never asks for
// a web font; html.wf switches to BVP right after the first paint.

const family = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.querySelector('#hero-title')!).fontFamily);

for (const locale of ['vi', 'en']) {
  test(`/${locale}/: text switches to Be Vietnam Pro after first paint and the faces load`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    await expect(page.locator('html')).toHaveClass(/\bwf\b/);
    expect(await family(page)).toMatch(/^"?Be Vietnam Pro"?,/);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('800 48px "Be Vietnam Pro"', 'Mathzle'))).toBe(true);
  });
}

test('first visit: no web font is requested before the first paint', async ({ page }) => {
  // Every woff2 the page asks for, stamped with the time it was asked for.
  await page.addInitScript(() => {
    const w = window as unknown as { __fcp?: number };
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (e.name === 'first-paint') w.__fcp = e.startTime;
    }).observe({ type: 'paint', buffered: true });
  });
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveClass(/\bwf\b/);
  await page.evaluate(() => document.fonts.ready);
  const { fcp, fonts } = await page.evaluate(() => ({
    fcp: (window as unknown as { __fcp?: number }).__fcp ?? -1,
    fonts: performance.getEntriesByType('resource')
      .filter((r) => r.name.endsWith('.woff2'))
      .map((r) => ({ name: r.name.split('/').pop(), start: r.startTime, preload: (r as PerformanceResourceTiming).initiatorType === 'link' })),
  }));
  expect(fcp).toBeGreaterThan(0);
  // The hero h1's 800 face is preloaded on purpose; every other face waits.
  const early = fonts.filter((f) => !f.preload && f.start < fcp);
  expect(early, JSON.stringify({ fcp, fonts }, null, 1)).toEqual([]);
});

test('returning visit: Be Vietnam Pro applies from the first layout (no fallback flash)', async ({ page }) => {
  await page.goto('/vi/');
  await expect(page.locator('html')).toHaveClass(/\bwf\b/);
  await page.goto('/en/', { waitUntil: 'commit' });
  // Set synchronously by the head script, before any layout.
  await page.waitForFunction(() => document.documentElement.classList.contains('js'));
  expect(await page.evaluate(() => document.documentElement.classList.contains('wf'))).toBe(true);
});

test('deep link (#fragment): Be Vietnam Pro applies from the first layout, so the swap cannot move the target', async ({ page }) => {
  await page.goto('/vi/#voices', { waitUntil: 'commit' });
  await page.waitForFunction(() => document.documentElement.classList.contains('js'));
  expect(await page.evaluate(() => document.documentElement.classList.contains('wf'))).toBe(true);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('text uses Be Vietnam Pro directly', async ({ page }) => {
    await page.goto('/vi/');
    expect(await family(page)).toMatch(/^"?Be Vietnam Pro"?,/);
  });
});
