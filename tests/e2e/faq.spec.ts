import { test, expect } from '@playwright/test';

test('deep link opens the matching question', async ({ page }) => {
  await page.goto('/vi/faq/#faq-install');
  const item = page.locator('#faq-install');
  await expect(item).toHaveAttribute('open', '');
  await expect(item.locator('.faq-a')).toContainText('trình duyệt');
});

test('FAQPage JSON-LD has plain-text answers (no HTML)', async ({ page }) => {
  await page.goto('/vi/faq/');
  const json = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = json.map((j) => JSON.parse(j)).find((j) => j['@type'] === 'FAQPage');
  expect(faq.mainEntity.length).toBeGreaterThanOrEqual(5);
  for (const q of faq.mainEntity) expect(q.acceptedAnswer.text).not.toMatch(/<[a-z]/);
});

test('FAQ answers are present in the initial HTML even with JS disabled', async ({ browser }) => {
  // Questions/answers are server-rendered <details>/<summary> now (no
  // client:only island to hydrate), so the text is in the DOM — and the
  // native disclosure widget still opens/closes on click — without JS.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/vi/faq/');
  const answers = page.locator('.faq-a');
  const count = await answers.count();
  expect(count).toBeGreaterThanOrEqual(5);
  for (const text of await answers.allTextContents()) expect(text.trim().length).toBeGreaterThan(0);
  await context.close();
});

test('faq page has near-zero layout shift (no island hydration, nothing to reserve)', async ({ page }) => {
  await page.goto('/vi/faq/');
  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
            if (!e.hadRecentInput) total += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(total), 1000);
      }),
  );
  expect(cls).toBeLessThan(0.02);
});

test('grouped FAQ page opens no answer on load (no hydration layout shift)', async ({ page }) => {
  await page.goto('/vi/faq/');
  await expect(page.locator('.faq-q').first()).toBeVisible();
  await expect(page.locator('details.faq-item[open]')).toHaveCount(0);
});

test('grouped FAQ deep link opens only the target', async ({ page }) => {
  await page.goto('/vi/faq/#faq-install');
  await expect(page.locator('#faq-install')).toHaveAttribute('open', '');
  await expect(page.locator('details.faq-item[open]')).toHaveCount(1);
});
