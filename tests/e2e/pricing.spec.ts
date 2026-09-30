import { test, expect } from '@playwright/test';

test('billing toggle swaps monthly/yearly price without JS', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/vi/pricing');
  await expect(page.locator('.price--yearly')).toBeVisible();
  await expect(page.locator('.price--monthly')).toBeHidden();
  await page.locator('label[for="billing-monthly"]').click();
  await expect(page.locator('.price--monthly')).toBeVisible();
  await expect(page.locator('.price--yearly')).toBeHidden();
  await ctx.close();
});

test('yearly shows a per-day price and savings badge (VND)', async ({ page }) => {
  await page.goto('/vi/pricing');
  await expect(page.locator('.plan-perday')).toContainText('mỗi ngày');
  await expect(page.locator('.billing-save')).toContainText('%');
});
