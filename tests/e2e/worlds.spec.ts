import { test, expect } from '@playwright/test';

test('six world cards with a featured first card', async ({ page }) => {
  await page.goto('/vi/');
  await expect(page.locator('#worlds .wc')).toHaveCount(6);
  await expect(page.locator('#worlds .wc--feature')).toHaveCount(1);
});

test('curriculum table opens and scrolls horizontally on mobile', async ({ page, isMobile }) => {
  await page.goto('/vi/');
  const d = page.locator('#worlds details.curric');
  await d.locator('summary').click();
  await expect(d.locator('tbody tr')).toHaveCount(5);
  if (isMobile) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0); // table scrolls inside its region, not the page
  }
});

test('mobile: worlds are a swipeable row', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await page.goto('/vi/');
  await expect(page.locator('#worlds .bento')).toHaveCSS('scroll-snap-type', /x mandatory/);
});
