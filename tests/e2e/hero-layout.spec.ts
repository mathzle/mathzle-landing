import { test, expect } from '@playwright/test';

// Viewport-specific layout checks: desktop project only (mobile emulation
// pins its own device metrics).
test.beforeEach(({}, info) => test.skip(info.project.name !== 'chromium', 'desktop project sets viewports itself'));

const WIDTHS = [360, 390, 1024, 1280];

for (const locale of ['vi', 'en'] as const) {
  for (const width of WIDTHS) {
    test(`/${locale}/ hero stage card fits its frame at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/`);
      const card = page.locator('#hero .tap--stage');
      await expect(card).toBeVisible();
      const body = await page.locator('#hero .bf-body').boundingBox();
      expect(body).not.toBeNull();
      const choices = card.locator('.tap-choice');
      await expect(choices).toHaveCount(3);
      for (let n = 0; n < 3; n++) {
        const b = (await choices.nth(n).boundingBox())!;
        expect(b.x).toBeGreaterThanOrEqual(body!.x - 0.5);
        expect(b.y).toBeGreaterThanOrEqual(body!.y - 0.5);
        expect(b.x + b.width).toBeLessThanOrEqual(body!.x + body!.width + 0.5);
        expect(b.y + b.height).toBeLessThanOrEqual(body!.y + body!.height + 0.5);
      }
      const img = (await card.locator('.tap-head img').boundingBox())!;
      expect(img.width).toBeLessThanOrEqual(48);
      expect(img.height).toBeLessThanOrEqual(48);
    });
  }
}

for (const width of [1024, 1280, 1440]) {
  test(`/vi/ has no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/vi/');
    await page.waitForLoadState('load');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
