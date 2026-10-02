import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

// Public-launch assertions only; the beta (pricing hidden, D-017) is covered
// by beta-pricing.spec.ts.
test.skip(!site.pricing.public, 'beta: pricing hidden (D-017)');
import { claims } from '../../src/data/claims';

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

test('savings badge is flagged unverified while its source claims are unverified', async ({ page }) => {
  // Guarded: once premiumYearlyVnd (or premiumMonthlyVnd) is verified in
  // src/data/claims.ts this stops applying and the test skips itself rather
  // than asserting a stale expectation.
  test.skip(claims.premiumYearlyVnd.verifiedBy !== null, 'premiumYearlyVnd is now verified');
  await page.goto('/vi/pricing/');
  await expect(page.locator('.billing-save .claim-unverified')).toHaveCount(1);
});
