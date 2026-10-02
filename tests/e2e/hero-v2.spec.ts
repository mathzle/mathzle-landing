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

type Shift = { value: number; startTime: number; sources: { node: string; from: number[]; to: number[] }[] };

for (const locale of ['vi', 'en']) {
  test(`hero visual reserves space before the island hydrates (no layout shift) — /${locale}/`, async ({ page }) => {
    // Deterministic worst case on every machine: a slow CPU (4× throttle) and
    // web fonts that arrive only after first paint. Every woff2 is held back
    // 1.5s, so the page always renders in the platform fallback first and the
    // fallback → Be Vietnam Pro swap always lands inside the measured window
    // (on fast machines it would otherwise happen before first paint, and
    // which fallback is installed decides whether text re-wraps).
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.route('**/*.woff2', async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });
    await page.addInitScript(() => {
      const w = window as unknown as { __shifts: unknown[] };
      w.__shifts = [];
      const rect = (r: DOMRectReadOnly) => [r.x, r.y, r.width, r.height].map(Math.round);
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as {
          value: number; startTime: number; hadRecentInput: boolean;
          sources: { node?: Node; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }[];
        }[]) {
          if (e.hadRecentInput) continue;
          w.__shifts.push({
            value: e.value,
            startTime: Math.round(e.startTime),
            sources: e.sources.map((s) => {
              const el = s.node instanceof Element ? s.node : s.node?.parentElement;
              const node = el ? `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.classList.length ? `.${[...el.classList].join('.')}` : ''}` : String(s.node?.nodeName);
              return { node: s.node instanceof Element ? node : `${node} (text)`, from: rect(s.previousRect), to: rect(s.currentRect) };
            }),
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto(`/${locale}/`);
    // Settle: island mounted, every font loaded and swapped, then a beat more.
    await expect(page.locator('#hero .tap')).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await page.waitForTimeout(500);

    const shifts = await page.evaluate(() => (window as unknown as { __shifts: Shift[] }).__shifts);
    const cls = shifts.reduce((sum, s) => sum + s.value, 0);
    expect(cls, `layout shifts:\n${JSON.stringify(shifts, null, 1)}`).toBeLessThan(0.05);
  });
}
