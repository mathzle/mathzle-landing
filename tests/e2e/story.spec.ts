import { test, expect } from '@playwright/test';

test('story never shows placeholder people', async ({ page }) => {
  await page.goto('/kit');
  const s = page.locator('#story');
  await expect(s.locator('#story-title')).toBeVisible();
  // Every rendered person must have a real photo (schema enforces consent).
  const imgs = s.locator('.st-founder img, .st-advisors img');
  for (let k = 0; k < (await imgs.count()); k++) {
    await expect(imgs.nth(k)).toHaveAttribute('src', /\/_astro\//);
  }
});
