import { test, expect } from '@playwright/test';

test('proof strip: every stat renders a plain value with no review markup', async ({ page }) => {
  await page.goto('/kit');
  const stats = page.locator('#proof dd');
  const n = await stats.count();
  // levels/skills hide until counted (D-018), leaving worlds + grade range + no-ads.
  expect(n).toBeGreaterThanOrEqual(3);
  for (let k = 0; k < n; k++) {
    const html = await stats.nth(k).innerHTML();
    expect(html.trim()).toMatch(/^\d/);
    expect(html).not.toContain('claim-');
  }
  await expect(page.locator('#proof .proof-foot')).toBeVisible();
});

test('pain → promise pairs render as rows', async ({ page }) => {
  await page.goto('/kit');
  await expect(page.locator('#pain [role="row"]:not(.pp-head)')).toHaveCount(3);
  await expect(page.locator('#pain-title mark.marker')).toHaveCount(1);
});
