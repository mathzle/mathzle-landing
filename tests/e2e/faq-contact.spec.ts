import { test, expect } from '@playwright/test';

test('faq page groups by category and emits exactly one FAQPage schema', async ({ page }) => {
  await page.goto('/vi/faq');
  expect(await page.locator('.faq-group h2').count()).toBeGreaterThanOrEqual(3);
  const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((j) => JSON.parse(j)['@type']);
  expect(types.filter((t) => t === 'FAQPage')).toHaveLength(1);
});

for (const locale of ['vi', 'en']) {
  test(`${locale}/contact lists every configured channel`, async ({ page }) => {
    await page.goto(`/${locale}/contact`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('footer').getByRole('link', { name: locale === 'vi' ? 'Liên hệ' : 'Contact' })).toHaveAttribute('href', `/${locale}/contact`);
  });
}
