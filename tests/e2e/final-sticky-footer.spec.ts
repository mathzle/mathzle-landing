import { test, expect } from '@playwright/test';

test.describe('sticky CTA (mobile)', () => {
  test.beforeEach(({ isMobile }) => test.skip(!isMobile, 'mobile only'));

  test('hidden on hero, shown mid-page, hidden at final CTA', async ({ page }) => {
    await page.goto('/vi/');
    const bar = page.locator('[data-sticky-cta]');
    await expect(bar).toHaveAttribute('data-visible', 'false');
    await page.locator('#worlds').scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute('data-visible', 'true');
    await page.locator('#final-cta').scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute('data-visible', 'false');
  });

  test('never covers the footer legal line', async ({ page }) => {
    await page.goto('/vi/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const legal = (await page.locator('.footer-legal').boundingBox())!;
    const vh = page.viewportSize()!.height;
    expect(legal.y + legal.height).toBeLessThanOrEqual(vh - 1);
  });
});

test('final CTA offers the newsletter behind a disclosure', async ({ page }) => {
  await page.goto('/vi/');
  const fc = page.locator('#final-cta');
  await expect(fc.locator('a[data-track="cta-play-final"]')).toContainText('Cho con chơi thử miễn phí');
  await fc.locator('summary').click();
  await expect(fc.locator('input[type=email]')).toBeVisible();
});
