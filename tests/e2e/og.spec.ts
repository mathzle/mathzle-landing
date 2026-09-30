import { test, expect } from '@playwright/test';

for (const locale of ['vi', 'en']) {
  test(`${locale}: og:image exists and is 1200×630`, async ({ page, request }) => {
    await page.goto(`/${locale}/`);
    const url = await page.locator('meta[property="og:image"]').getAttribute('content');
    const path = new URL(url!).pathname;
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const buf = await res.body();
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
  });
}
