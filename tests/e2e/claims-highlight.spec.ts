import { test, expect } from '@playwright/test';

// D-018: unverified-claim spans are invisible by default; `?claims` turns the
// reviewer highlight on.
const style = (page: import('@playwright/test').Page) =>
  page.locator('.claim-unverified').first().evaluate((el) => {
    const s = getComputedStyle(el);
    return { bg: s.backgroundColor, outline: s.outlineStyle, padLeft: s.paddingLeft };
  });

test('unverified claims are not highlighted by default', async ({ page }) => {
  await page.goto('/vi/');
  await expect(page.locator('html')).not.toHaveClass(/show-claims/);
  expect(await page.locator('.claim-unverified').count()).toBeGreaterThan(0);
  const s = await style(page);
  expect(s.bg).toBe('rgba(0, 0, 0, 0)');
  expect(s.outline).toBe('none');
  expect(s.padLeft).toBe('0px');
});

for (const q of ['?claims', '?claims=1']) {
  test(`${q} highlights unverified claims`, async ({ page }) => {
    await page.goto(`/vi/${q}`);
    await expect(page.locator('html')).toHaveClass(/show-claims/);
    const s = await style(page);
    expect(s.bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(s.outline).toBe('dashed');
  });
}

test('no [key] placeholders for claims that have no value yet', async ({ page }) => {
  for (const path of ['/vi/', '/en/', '/vi/faq/', '/kit']) {
    await page.goto(path);
    const text = await page.locator('body').innerText();
    expect(text, path).not.toMatch(/\[(levels|skills|dataResidency)\]/);
  }
});
