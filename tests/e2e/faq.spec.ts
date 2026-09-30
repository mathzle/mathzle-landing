import { test, expect } from '@playwright/test';

test('deep link opens the matching question', async ({ page }) => {
  await page.goto('/vi/faq#faq-install');
  const item = page.locator('#faq-install');
  await expect(item.locator('button.faq-q')).toHaveAttribute('aria-expanded', 'true');
  await expect(item.locator('.faq-a')).toContainText('trình duyệt');
});

test('FAQPage JSON-LD has plain-text answers (no HTML)', async ({ page }) => {
  await page.goto('/vi/faq');
  const json = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = json.map((j) => JSON.parse(j)).find((j) => j['@type'] === 'FAQPage');
  expect(faq.mainEntity.length).toBeGreaterThanOrEqual(5);
  for (const q of faq.mainEntity) expect(q.acceptedAnswer.text).not.toMatch(/<[a-z]/);
});

test('faq-main wrapper reserves space before the island hydrates (no CLS)', async ({ browser }) => {
  // The island is client:only="preact", so with JS disabled it never
  // hydrates — any bounding-box height comes purely from the Astro-rendered
  // wrapper's CSS min-height, proving space is reserved before hydration.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/vi/faq');
  const box = await page.locator('.faq-main').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(384); // 24rem @ 16px root
  await context.close();
});
