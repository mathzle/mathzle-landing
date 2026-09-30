import { test, expect } from '@playwright/test';

test('EN hero: headline, CTA to app', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('h1')).toContainText('Math your child wants to play');
  const cta = page.locator('a[data-track="cta-play-hero"]');
  await expect(cta).toContainText('Let your child try it free');
  await expect(cta).toHaveAttribute('href', /app\.mathzle\.com/);
});

test('VI hero: translated headline and CTA', async ({ page }) => {
  await page.goto('/vi/');
  await expect(page.locator('h1')).toContainText('Con học toán như chơi game');
  await expect(page.locator('a[data-track="cta-play-hero"]')).toContainText('Cho con chơi thử miễn phí');
});

test('Nav CTA goes to web app and uses the short label', async ({ page }) => {
  await page.goto('/vi/');
  const navCta = page.locator('a[data-track="nav-cta"]');
  await expect(navCta).toHaveAttribute('href', /app\.mathzle\.com/);
  await expect(navCta).toHaveText('Chơi thử miễn phí');
});

test('Nav shows the cube logo', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('img.nav-logo-mark')).toHaveAttribute('src', /\/brand\/logo\.png/);
});
