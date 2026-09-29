import { test, expect } from '@playwright/test';

test('EN hero renders with headline, cube logo, and CTAs', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('h1')).toContainText('Make math an adventure');
  // The cube logo is the hero illustration; it also appears in the nav.
  // We assert the hero copy is rendered with at least one of the stats values.
  await expect(page.locator('.hero-stat-value').first()).toBeVisible();
  await expect(page.locator('img.hero-cube')).toBeVisible();
  await expect(page.locator('a[data-track="cta-play-hero"]')).toBeVisible();
  await expect(page.locator('a[data-track="cta-play-hero"]')).toHaveAttribute('href', /app\.mathzle\.com/);
});

test('VI hero renders translated copy', async ({ page }) => {
  await page.goto('/vi/');
  await expect(page.locator('h1')).toContainText('Biến toán học thành cuộc phiêu lưu');
  await expect(page.locator('a[data-track="cta-play-hero"]')).toContainText('Chơi miễn phí ngay');
});

test('Nav CTA goes to web app', async ({ page }) => {
  await page.goto('/en/');
  const navCta = page.locator('a[data-track="nav-cta"]');
  await expect(navCta).toBeVisible();
  await expect(navCta).toHaveAttribute('href', /app\.mathzle\.com/);
});

test('Nav shows real cube logo (not letterform placeholder)', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('img.nav-logo-mark')).toBeVisible();
  await expect(page.locator('img.nav-logo-mark')).toHaveAttribute('src', /\/brand\/logo\.png/);
});
