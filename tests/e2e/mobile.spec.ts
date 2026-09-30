import { test, expect } from '@playwright/test';

test.describe('mobile nav', () => {
  test.beforeEach(({ isMobile }) => test.skip(!isMobile, 'mobile only'));

  for (const width of [360, 390, 412]) {
    test(`CTA fits one line and page has no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/vi/');
      const box = await page.locator('a[data-track="nav-cta"]').boundingBox();
      expect(box!.height).toBeLessThanOrEqual(48);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('drawer opens, lists links, closes on Escape', async ({ page }) => {
    await page.goto('/vi/');
    await page.locator('[data-open-nav]').click();
    const drawer = page.locator('dialog#mobile-nav');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Bảng giá' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: /English/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });

  test('tapping an anchor link closes the drawer and scrolls', async ({ page }) => {
    await page.goto('/vi/');
    await page.locator('[data-open-nav]').click();
    await page.locator('dialog#mobile-nav').getByRole('link', { name: 'Thế giới' }).click();
    await expect(page.locator('dialog#mobile-nav')).toBeHidden();
    await expect(page).toHaveURL(/#worlds$/);
  });
});
