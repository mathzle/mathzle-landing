import { test, expect } from '@playwright/test';

test('kit page is noindex and not in sitemap', async ({ page, request }) => {
  await page.goto('/kit');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).not.toContain('/kit');
});

test('section tones paint distinct backgrounds', async ({ page }) => {
  await page.goto('/kit');
  const bg = (sel: string) => page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor);
  const tones = await Promise.all(['canvas', 'tint', 'warm', 'ink'].map((t) => bg(`#kit-tone-${t}`)));
  expect(new Set(tones).size).toBe(4);
  expect(tones[3]).toBe('rgb(23, 21, 43)');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('reveal content and marker are fully visible immediately', async ({ page }) => {
    await page.goto('/kit');
    const reveal = page.locator('.reveal').first();
    await expect(reveal).toHaveCSS('opacity', '1');
    const mark = page.locator('mark.marker').first();
    await expect(mark).toHaveCSS('background-size', '100% 100%');
  });
});

test('headline uses balanced wrapping', async ({ page }) => {
  await page.goto('/kit');
  await expect(page.locator('.mk-display').first()).toHaveCSS('text-wrap', /balance/);
});
