import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

// Public-launch assertions only; the beta (pricing hidden, D-017) is covered
// by beta-pricing.spec.ts.
test.skip(!site.pricing.public, 'beta: pricing hidden (D-017)');

for (const locale of ['vi', 'en']) {
  test(`${locale}/pricing: plans, comparison, billing FAQ, final CTA`, async ({ page }) => {
    await page.goto(`/${locale}/pricing/`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#pricing .plan')).toHaveCount(2);
    await expect(page.locator('#compare table tbody tr').first()).toBeVisible();
    // FAQ items are server-rendered <details> elements, visible immediately.
    await page.locator('#faq .faq-item').first().waitFor({ state: 'visible' });
    const cats = await page.locator('#faq .faq-item').count();
    expect(cats).toBeGreaterThan(0);
    await expect(page.locator('#final-cta')).toBeVisible();
  });
}
