import { test, expect } from '@playwright/test';

test('desktop: the sticky visual follows the step in view', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop layout');
  await page.goto('/kit');
  const visual = page.locator('#method .method-visual');
  await expect(visual.locator('[data-step].is-active')).toHaveCount(1);
  const steps = page.locator('#method .method-step');
  const last = steps.last();
  await last.scrollIntoViewIfNeeded();
  const key = await last.getAttribute('data-step');
  await expect(visual.locator(`[data-step="${key}"]`)).toHaveClass(/is-active/);
});

test('mobile: each step shows its own image', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile layout');
  await page.goto('/kit');
  await expect(page.locator('#method .method-visual')).toBeHidden();
  const n = await page.locator('#method .method-step').count();
  await expect(page.locator('#method .method-inline')).toHaveCount(n);
});
