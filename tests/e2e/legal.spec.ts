import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

for (const locale of ['vi', 'en']) {
  test(`${locale}/privacy opens with a parent summary`, async ({ page }) => {
    await page.goto(`/${locale}/privacy/`);
    const s = page.locator('.parent-summary');
    await expect(s).toBeVisible();
    expect(await s.locator('li').count()).toBeGreaterThanOrEqual(3);
    if (site.legal.policiesReviewedOn) await expect(page.locator('.prose-hero')).toContainText(site.legal.policiesReviewedOn.slice(0, 4));
  });
}
