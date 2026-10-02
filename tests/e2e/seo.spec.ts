import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

// /pricing/ is a redirect to the beta program while pricing isn't public (D-017).
const ROUTES = ['', ...(site.pricing.public ? ['pricing'] : []), 'about', 'faq', 'contact', 'privacy', 'terms'];

test('every public route: unique title, description length, canonical + hreflang', async ({ page }) => {
  const titles = new Set<string>();
  for (const locale of ['vi', 'en']) {
    for (const r of ROUTES) {
      const path = `/${locale}/${r ? `${r}/` : ''}`;
      await page.goto(path);
      const title = await page.title();
      expect(titles.has(title), `duplicate title on ${path}`).toBe(false);
      titles.add(title);
      expect(title.match(/Mathzle/g)?.length, `${path} title repeats the brand: ${title}`).toBe(1);
      const desc = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
      expect(desc.length, `${path} description length`).toBeGreaterThanOrEqual(50);
      expect(desc.length, `${path} description length`).toBeLessThanOrEqual(170);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://mathzle.com${path}`);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
      // Every hreflang / og:url points at the canonical (slash-terminated) form.
      for (const href of await page.locator('link[rel="alternate"][hreflang]').evaluateAll((els) => els.map((e) => e.getAttribute('href')!)))
        expect(new URL(href).pathname, `${path} hreflang ${href}`).toMatch(/\/$/);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://mathzle.com${path}`);
      // Internal page links never point at a redirect (no-slash form → 307).
      const links = await page.locator('a[href^="/"]').evaluateAll((els) => els.map((e) => e.getAttribute('href')!));
      for (const href of links) {
        const { pathname } = new URL(href, 'https://mathzle.com');
        if (/\.[a-z0-9]+$/i.test(pathname)) continue; // files (pdf, png…)
        expect(pathname, `${path} links to ${href}`).toMatch(/\/$/);
      }
    }
  }
});

test('sitemap lists public routes only', async ({ request }) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  expect(xml).toContain('https://mathzle.com/vi/contact/');
  expect(xml).not.toMatch(/\/(kit|og)\//);
  expect(xml).not.toContain('<loc>https://mathzle.com/</loc>'); // root is only the language-sniff stub
  if (site.pricing.public) expect(xml).toContain('https://mathzle.com/vi/pricing/');
  else expect(xml).not.toContain('/pricing/');
});

test('WebApplication offer price uses the locale currency', async ({ page }) => {
  await page.goto('/vi/');
  const app = (await page.locator('script[type="application/ld+json"]').allTextContents())
    .map((j) => JSON.parse(j)).find((j) => j['@type'] === 'WebApplication');
  expect(app.offers.priceCurrency).toBe('VND');
});
