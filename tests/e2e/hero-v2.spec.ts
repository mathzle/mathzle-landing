import { test, expect } from '@playwright/test';

test('hero v2: headline, single primary CTA, reassurance', async ({ page }) => {
  await page.goto('/vi/');
  await expect(page.locator('#hero-title')).toContainText('Bố mẹ thấy rõ con tiến bộ');
  const cta = page.locator('a[data-track="cta-play-hero"]');
  await expect(cta).toContainText('Cho con chơi thử miễn phí');
  await expect(cta).toHaveAttribute('href', /app\.mathzle\.com/);
  await expect(page.locator('#hero ul[aria-label]')).toContainText('Không cần thẻ');
});

test('try-a-problem: wrong answer gives a hint and allows retry; right answer advances', async ({ page }) => {
  await page.goto('/vi/');
  const tap = page.locator('#hero .tap').first();
  await expect(tap.locator('.tap-q')).toContainText('7 + 5');
  await tap.getByRole('button', { name: '11' }).click();
  await expect(tap.getByRole('status')).toContainText('Đếm tiếp từ 7');
  await expect(tap.getByRole('button', { name: '12' })).toBeEnabled();
  await tap.getByRole('button', { name: '12' }).click();
  await expect(tap.getByRole('status')).toContainText('Chuẩn!');
  await tap.getByRole('button', { name: /Câu khác/ }).click();
  await expect(tap.locator('.tap-q')).toContainText('15 − 8');
  await expect(tap.getByRole('status')).toHaveText('');
});

test('hero visual reserves space before the island hydrates (no layout shift)', async ({ page }) => {
  await page.goto('/vi/');
  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
            if (!e.hadRecentInput) total += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(total), 1500);
      }),
  );
  expect(cls).toBeLessThan(0.05);
});
