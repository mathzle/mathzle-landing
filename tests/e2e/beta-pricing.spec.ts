import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

// D-017: during the beta the site shows no prices at all. Skips itself once
// `site.pricing.public` flips to true (the pricing specs take over).
test.describe('beta: pricing hidden', () => {
  test.skip(site.pricing.public, 'pricing is public');

  for (const locale of ['vi', 'en'] as const) {
    test(`${locale}: home has no pricing section, links or billing FAQ`, async ({ page }) => {
      await page.goto(`/${locale}/`);
      await expect(page.locator('#pricing')).toHaveCount(0);
      await expect(page.locator('#compare')).toHaveCount(0);
      await expect(page.locator('a[href*="pricing"]')).toHaveCount(0);
      await expect(page.locator('#premium-waitlist')).toHaveCount(0);
      await page.locator('#faq .faq-item').first().waitFor({ state: 'visible' });
      await expect(page.locator('#faq-business-model, #faq-siblings, #faq-refund')).toHaveCount(0);
      const text = await page.locator('body').innerText();
      expect(text).not.toMatch(/119\.000|990\.000|\$4\.99|\$39\.99|đ\/|≈ \S+ (mỗi ngày|a day)|hoàn tiền|refund|Giữ giá|launch price/i);
    });

    test(`${locale}/pricing/ redirects to the beta program`, async ({ page }) => {
      await page.goto(`/${locale}/pricing/`);
      await page.waitForURL(`**/${locale}/#voices`);
      await expect(page.locator('#voices')).toBeVisible();
      await expect(page.locator('#pricing')).toHaveCount(0);
    });

    test(`${locale}/pricing/ is noindex and absent from the sitemap`, async ({ request }) => {
      const html = await (await request.get(`/${locale}/pricing/`)).text();
      expect(html).toContain('noindex');
      expect(html).toContain(`url=/${locale}/#voices`);
      expect(html).not.toMatch(/119\.000|4\.99/);
      const xml = await (await request.get('/sitemap-0.xml')).text();
      expect(xml).not.toContain('/pricing/');
    });

    test(`${locale}/faq/: no billing group, JSON-LD matches the page`, async ({ page }) => {
      await page.goto(`/${locale}/faq/`);
      await expect(page.locator('#faq-g-billing')).toHaveCount(0);
      await page.locator('.faq-q').first().waitFor({ state: 'visible' });
      const shown = await page.locator('.faq-q').count();
      const faq = (await page.locator('script[type="application/ld+json"]').allTextContents())
        .map((j) => JSON.parse(j)).find((j) => j['@type'] === 'FAQPage');
      expect(faq.mainEntity.length).toBe(shown);
      await expect(page.locator('footer a[href*="pricing"], nav a[href*="pricing"], dialog a[href*="pricing"]')).toHaveCount(0);
    });
  }
});
