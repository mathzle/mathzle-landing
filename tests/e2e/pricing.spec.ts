import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

// Public-launch assertions only; the beta (pricing hidden, D-017) is covered
// by beta-pricing.spec.ts.
test.skip(!site.pricing.public, 'beta: pricing hidden (D-017)');

test('billing toggle swaps monthly/yearly price without JS', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/vi/pricing/');
  await expect(page.locator('.price--yearly')).toBeVisible();
  await expect(page.locator('.price--monthly')).toBeHidden();
  await page.locator('label[for="billing-monthly"]').click();
  await expect(page.locator('.price--monthly')).toBeVisible();
  await expect(page.locator('.price--yearly')).toBeHidden();
  await ctx.close();
});

test('yearly shows a per-day price and savings badge (VND)', async ({ page }) => {
  await page.goto('/vi/pricing/');
  await expect(page.locator('.plan-perday')).toContainText('mỗi ngày');
  await expect(page.locator('.billing-save')).toContainText('%');
});

test('savings badge renders plain text with no review markup (D-022)', async ({ page }) => {
  await page.goto('/vi/pricing/');
  await expect(page.locator('.billing-save [class*="claim-"], .billing-save [data-claim]')).toHaveCount(0);
});
