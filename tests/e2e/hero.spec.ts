import { test, expect } from '@playwright/test';

test('EN hero renders with mascot, headline, and CTAs', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('h1')).toContainText('Make math an adventure');
  await expect(page.locator('img[alt="Mathzle mascot, cheering"]')).toBeVisible();
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
