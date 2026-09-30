import { test, expect } from '@playwright/test';

const ROUTES = ['', 'pricing', 'about', 'faq', 'contact', 'privacy', 'terms'];

test('every public route: unique title, description length, canonical + hreflang', async ({ page }) => {
  const titles = new Set<string>();
  for (const locale of ['vi', 'en']) {
    for (const r of ROUTES) {
      const path = `/${locale}/${r}`;
      await page.goto(path);
      const title = await page.title();
      expect(titles.has(title), `duplicate title on ${path}`).toBe(false);
      titles.add(title);
      const desc = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
      expect(desc.length, `${path} description length`).toBeGreaterThanOrEqual(50);
      expect(desc.length, `${path} description length`).toBeLessThanOrEqual(170);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://mathzle.com${path}`);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    }
  }
});

test('sitemap lists public routes only', async ({ request }) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  expect(xml).toContain('/vi/contact');
  expect(xml).not.toMatch(/\/(kit|og)\//);
});

test('WebApplication offer price uses the locale currency', async ({ page }) => {
  await page.goto('/vi/');
  const app = (await page.locator('script[type="application/ld+json"]').allTextContents())
    .map((j) => JSON.parse(j)).find((j) => j['@type'] === 'WebApplication');
  expect(app.offers.priceCurrency).toBe('VND');
});
