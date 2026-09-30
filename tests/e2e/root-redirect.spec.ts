import { test, expect } from '@playwright/test';

// `/` is served as the static language-sniff page (no edge redirect: the
// Workers asset server rejects `Language=` conditions, and an unconditional
// `/ → /en/` rule would override the sniff).
test('GET / serves the sniff page (200, not an edge redirect)', async ({ request }) => {
  const res = await request.get('/', { maxRedirects: 0 });
  expect(res.status()).toBe(200);
});

test.describe('Vietnamese browser', () => {
  test.use({ locale: 'vi-VN' });
  test('lands on /vi/', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/vi\/$/);
  });
});

test.describe('English browser', () => {
  test.use({ locale: 'en-US' });
  test('lands on /en/', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
  });
});
