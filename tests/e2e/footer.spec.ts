import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

test('footer exposes legal pages and every configured contact channel', async ({ page }) => {
  await page.goto('/vi/');
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'Bảo mật' })).toHaveAttribute('href', '/vi/privacy');
  await expect(footer.getByRole('link', { name: 'Điều khoản' })).toHaveAttribute('href', '/vi/terms');
  if (site.contact.email) {
    await expect(footer.locator(`a[href="mailto:${site.contact.email}"]`)).toBeVisible();
  } else {
    await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(0);
  }
  if (site.legal.companyName) await expect(footer.locator('.footer-legal')).toContainText(site.legal.companyName);
});
