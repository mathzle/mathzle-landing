import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

test('footer exposes legal pages and every configured contact channel', async ({ page }) => {
  await page.goto('/vi/');
  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'Bảo mật' })).toHaveAttribute('href', '/vi/privacy');
  await expect(footer.getByRole('link', { name: 'Điều khoản' })).toHaveAttribute('href', '/vi/terms');
  await expect(footer.getByRole('link', { name: 'Liên hệ' })).toHaveAttribute('href', '/vi/contact');
  if (site.legal.companyName) await expect(footer.locator('.footer-legal')).toContainText(site.legal.companyName);
});
