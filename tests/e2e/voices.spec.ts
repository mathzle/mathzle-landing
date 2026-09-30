import { test, expect } from '@playwright/test';

test('with no consented testimonials, the beta program is shown and posts source=beta', async ({ page }) => {
  await page.goto('/kit');
  const s = page.locator('#voices');
  await expect(s.locator('blockquote')).toHaveCount(0);
  let body: Record<string, string> | null = null;
  await page.route('**/api/signup', async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, body: '{"ok":true}' });
  });
  await s.locator('input[type=email]').fill('ba@me.vn');
  await s.getByRole('button', { name: 'Đăng ký tham gia' }).click();
  await expect(s.getByRole('status')).toContainText('Cảm ơn');
  expect(body).toMatchObject({ email: 'ba@me.vn', source: 'beta', locale: 'vi' });
});

test('invalid email keeps what was typed and explains', async ({ page }) => {
  await page.goto('/kit');
  await page.route('**/api/signup', (r) => r.fulfill({ status: 400, body: '{"error":"invalid-email"}' }));
  const s = page.locator('#voices');
  await s.locator('input[type=email]').fill('ba@me');
  await s.getByRole('button', { name: 'Đăng ký tham gia' }).click();
  await expect(s.getByRole('alert')).toContainText('chưa đúng định dạng');
  await expect(s.locator('input[type=email]')).toHaveValue('ba@me');
});
