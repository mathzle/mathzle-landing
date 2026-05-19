import { test, expect } from '@playwright/test';

test('language switch from EN to VI changes html[lang]', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: /Tiếng Việt/i }).first().click();
  await expect(page).toHaveURL(/\/vi\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
});

test('hreflang tags present on both locales', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('link[rel="alternate"][hreflang="vi"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

  await page.goto('/vi/');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
});

test('canonical URL is locale-correct', async ({ page }) => {
  await page.goto('/en/about');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://mathzle.com/en/about',
  );
});
