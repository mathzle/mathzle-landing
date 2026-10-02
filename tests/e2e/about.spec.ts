import { test, expect } from '@playwright/test';

for (const locale of ['vi', 'en']) {
  test(`${locale}/about: story, principles, safety link, no link back to itself`, async ({ page }) => {
    await page.goto(`/${locale}/about/`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#story')).toBeVisible();
    await expect(page.locator('#principles li')).toHaveCount(4);
    await expect(page.locator(`#story a[href="/${locale}/about"]`)).toHaveCount(0);
  });
}
