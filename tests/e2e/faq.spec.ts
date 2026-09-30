import { test, expect } from '@playwright/test';

test('deep link opens the matching question', async ({ page }) => {
  await page.goto('/vi/faq/#faq-install');
  const item = page.locator('#faq-install');
  await expect(item.locator('button.faq-q')).toHaveAttribute('aria-expanded', 'true');
  await expect(item.locator('.faq-a')).toContainText('trình duyệt');
});

test('FAQPage JSON-LD has plain-text answers (no HTML)', async ({ page }) => {
  await page.goto('/vi/faq/');
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
  await page.goto('/vi/faq/');
  const box = await page.locator('.faq-main').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(384); // 24rem @ 16px root
  await context.close();
});

test('grouped FAQ page opens no answer on load (no hydration layout shift)', async ({ page }) => {
  await page.goto('/vi/faq/');
  await expect(page.locator('.faq-q').first()).toBeVisible();
  await expect(page.locator('.faq-q[aria-expanded="true"]')).toHaveCount(0);
  await expect(page.locator('.faq-a')).toHaveCount(0);
});

for (const width of [360, 390, 768, 1024, 1280, 1440]) {
  test(`grouped FAQ: collapsed groups fit their reserved height at ${width}px`, async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium', 'viewport sweep runs on desktop project');
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/vi/faq', '/en/faq']) {
      await page.goto(`${path}/`);
      await expect(page.locator('.faq-q').first()).toBeVisible();
      const overflow = await page.$$eval('.faq-group-body', (els) =>
        els.map((el) => el.querySelector('.faq-list')!.getBoundingClientRect().height - parseFloat(getComputedStyle(el).minHeight)),
      );
      expect(overflow.length).toBe(4);
      for (const d of overflow) expect(d).toBeLessThanOrEqual(0.5);
    }
  });
}

test('grouped FAQ deep link opens only the target', async ({ page }) => {
  await page.goto('/vi/faq/#faq-install');
  await expect(page.locator('#faq-install button.faq-q')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.faq-q[aria-expanded="true"]')).toHaveCount(1);
});
