import { test, expect } from '@playwright/test';

for (const locale of ['vi', 'en']) {
  test(`${locale}/pricing: plans, comparison, billing FAQ, final CTA`, async ({ page }) => {
    await page.goto(`/${locale}/pricing/`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#pricing .plan')).toHaveCount(2);
    await expect(page.locator('#compare table tbody tr').first()).toBeVisible();
    // FAQ is client:only="preact" — wait for hydration before counting, else
    // a fast device reads 0 items before the island mounts.
    await page.locator('#faq .faq-item').first().waitFor({ state: 'visible' });
    const cats = await page.locator('#faq .faq-item').count();
    expect(cats).toBeGreaterThan(0);
    await expect(page.locator('#final-cta')).toBeVisible();
  });
}
