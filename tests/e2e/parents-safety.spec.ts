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

// Claim-gated items can be hidden, so the item count varies. Every grid row
// must be filled edge to edge: an empty track would show the hairline
// background as a grey "missing card" (Safety) or a hole (proof strip).
for (const locale of ['vi', 'en'] as const) {
  test(`${locale}: safety and proof grids have no empty cells at any width`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    for (const width of [1440, 1280, 1024, 768, 600, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const sel of ['#safety .sg', '#proof .proof-grid']) {
        const rows = await page.locator(sel).evaluate((g) => {
          const box = g.getBoundingClientRect();
          const gap = parseFloat(getComputedStyle(g).columnGap) || 0;
          const byTop = new Map<number, number[]>();
          for (const el of g.children) {
            const r = el.getBoundingClientRect();
            const top = Math.round(r.top);
            byTop.set(top, [...(byTop.get(top) ?? []), r.width]);
          }
          return { width: box.width, rows: [...byTop.values()].map((ws) => ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1)) };
        });
        for (const filled of rows.rows) {
          expect(Math.abs(filled - rows.width), `${sel} at ${width}px: a row leaves ${rows.width - filled}px empty`).toBeLessThanOrEqual(2);
        }
      }
    }
  });
}
