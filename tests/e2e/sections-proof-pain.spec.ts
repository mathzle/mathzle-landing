import { test, expect } from '@playwright/test';

test('proof strip: every number is either verified or visibly flagged', async ({ page }) => {
  await page.goto('/kit');
  const stats = page.locator('#proof dd');
  const n = await stats.count();
  expect(n).toBeGreaterThanOrEqual(3);
  for (let k = 0; k < n; k++) {
    const html = await stats.nth(k).innerHTML();
    expect(/^\d|claim-unverified/.test(html.trim())).toBe(true);
  }
  await expect(page.locator('#proof .proof-foot')).toBeVisible();
});

test('pain → promise pairs render as rows', async ({ page }) => {
  await page.goto('/kit');
  await expect(page.locator('#pain [role="row"]:not(.pp-head)')).toHaveCount(3);
  await expect(page.locator('#pain-title mark.marker')).toHaveCount(1);
});
