import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

for (const locale of ['vi', 'en'] as const) {
  test(`${locale}: no placeholder testimonials or fake screenshots`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    await expect(page.locator('#testimonials')).toHaveCount(0);
    await expect(page.locator('#screenshots')).toHaveCount(0);
    await expect(page.getByText(/Linh|Cô Phạm|Ms\. Pham/)).toHaveCount(0);
  });

  test(`${locale}: no unverified hero claims`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    const hero = page.locator('#hero');
    await expect(hero).not.toContainText('200+');
    await expect(hero).not.toContainText(/giáo viên|teacher/i);
  });

  for (const sub of ['', 'about', 'privacy', 'terms', 'faq', ...(site.pricing.public ? ['pricing'] : [])]) {
    test(`${locale}/${sub}: no visible TODOs or unverifiable claims`, async ({ page }) => {
      await page.goto(`/${locale}/${sub}`);
      const text = await page.locator('body').innerText();
      expect(text).not.toMatch(/TODO|REPLACE_ME/);
      expect(text).not.toMatch(/hàng trăm|hundreds of|thiết kế cùng giáo viên|designed with (classroom )?teachers|built with classroom teachers/i);
    });
  }

  test(`${locale}: a11y labels are localized`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    const english = page.locator('[aria-label="At a glance"], [aria-label="What you get"]');
    if (locale === 'vi') await expect(english).toHaveCount(0);
  });
}
