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

test('lead text on ink tone meets contrast (muted ink text, not app secondary)', async ({ page }) => {
  await page.goto('/kit');
  await expect(page.locator('#kit-tone-ink .mk-lead').first()).toHaveCSS('color', 'rgb(185, 181, 214)');
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

test('button sizes are ordered and never wrap', async ({ page }) => {
  await page.goto('/kit');
  const h = async (t: string) => (await page.locator(`[data-track="${t}"]`).boundingBox())!.height;
  const [sm, md, lg] = [await h('kit-sm'), await h('kit-md'), await h('kit-lg')];
  expect(sm).toBeLessThan(md);
  expect(md).toBeLessThan(lg);
  await expect(page.locator('[data-track="kit-lg"]')).toHaveCSS('white-space', 'nowrap');
});

test('icons render as inline svg', async ({ page }) => {
  await page.goto('/kit');
  await expect(page.locator('#kit-buttons .icon svg')).toHaveCount(6);
});

test('frames keep a fixed aspect ratio even without screenshots', async ({ page }) => {
  await page.goto('/kit');
  const box = (await page.locator('#kit-frames .bf-body').boundingBox())!;
  expect(Math.round((box.width / box.height) * 10) / 10).toBe(1.6);
});
