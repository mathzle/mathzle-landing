import { test, expect } from '@playwright/test';

test('world illustrations are served optimized (< 150 KB each)', async ({ page }) => {
  const sizes: number[] = [];
  page.on('response', async (res) => {
    if (/\/_astro\/.+\.(avif|webp)$/.test(res.url())) sizes.push((await res.body()).length);
  });
  await page.goto('/vi/');
  await page.locator('#worlds').scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');
  expect(sizes.length).toBeGreaterThanOrEqual(6);
  expect(Math.max(...sizes)).toBeLessThan(150_000);
});
