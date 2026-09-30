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
