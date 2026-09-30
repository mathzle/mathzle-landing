import { test, expect } from '@playwright/test';

test('safety section is dark, lists commitments and links to privacy', async ({ page }) => {
  await page.goto('/kit');
  const s = page.locator('#safety');
  await expect(s).toHaveCSS('background-color', 'rgb(23, 21, 43)');
  expect(await s.locator('.sg-item').count()).toBeGreaterThanOrEqual(3);
  await expect(s.getByRole('link', { name: /chính sách bảo mật/i })).toHaveAttribute('href', '/vi/privacy/');
});

test('safety text meets contrast on ink', async ({ page }) => {
  await page.goto('/kit');
  await expect(page.locator('#safety .mk-body').first()).toHaveCSS('color', 'rgb(185, 181, 214)');
});

test('parents section shows both value columns', async ({ page }) => {
  await page.goto('/kit');
  await expect(page.locator('#parents .fp-col')).toHaveCount(2);
});
