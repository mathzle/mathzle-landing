import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

// D-019: full Privacy Policy + Terms of Use from the `legal` content collection.
const FORBIDDEN = [/không có advertising ID/i, /xoá dữ liệu bất kỳ lúc nào/i, /xóa dữ liệu bất kỳ lúc nào/i, /no advertising ID/i, /delete (your child's )?data (at )?any ?time/i, /TODO/, /REPLACE/];

for (const locale of ['vi', 'en'] as const) {
  for (const doc of ['privacy', 'terms'] as const) {
    const path = `/${locale}/${doc}/`;

    test(`${path}: one h1, at least 12 sections, draft status while unreviewed`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.locator('.legal-prose h2').count()).toBeGreaterThanOrEqual(12);
      const status = page.locator('.legal-status');
      if (site.legal.policiesReviewedOn) {
        await expect(status).toHaveAttribute('data-status', 'reviewed');
        await expect(status).toContainText(site.legal.policiesReviewedOn.slice(0, 4));
      } else {
        await expect(status).toHaveAttribute('data-status', 'draft');
        await expect(status).toContainText(locale === 'vi' ? 'Bản dự thảo — đang chờ luật sư rà soát' : 'Draft — awaiting legal review');
        await expect(status).toContainText('2026');
      }
    });

    test(`${path}: parent summary only on privacy`, async ({ page }) => {
      await page.goto(path);
      const s = page.locator('.parent-summary');
      if (doc === 'privacy') {
        await expect(s).toBeVisible();
        expect(await s.locator('li').count()).toBeGreaterThanOrEqual(3);
      } else {
        await expect(s).toHaveCount(0);
      }
    });

    test(`${path}: table of contents matches the headings and scrolls there`, async ({ page }, info) => {
      await page.goto(path);
      const ids = await page.locator('.legal-prose h2').evaluateAll((els) => els.map((e) => e.id));
      expect(ids.every(Boolean)).toBe(true);
      const mobile = info.project.name.startsWith('mobile');
      const toc = page.locator(mobile ? '.toc--mob' : '.toc--desk');
      if (mobile) await toc.locator('summary').click();
      const hrefs = await toc.locator('a').evaluateAll((els) => els.map((e) => e.getAttribute('href')!));
      expect(hrefs.map((h) => decodeURIComponent(h.slice(1)))).toEqual([...ids, 'company-details']);
      const pick = hrefs[Math.min(8, hrefs.length - 1)];
      await toc.locator(`a[href="${pick}"]`).click();
      const target = page.locator(`[id="${decodeURIComponent(pick.slice(1))}"]`);
      await expect(target).toBeInViewport();
    });

    test(`${path}: company details are honest while entity data is missing`, async ({ page }) => {
      await page.goto(path);
      const box = page.locator('#company-details');
      await expect(box).toBeVisible();
      if (!site.legal.companyName) {
        await expect(box.locator(`a[href="/${locale}/contact/"]`)).toHaveCount(1);
        await expect(box).toContainText(locale === 'vi' ? 'trước khi Mathzle ra mắt chính thức' : "before Mathzle's public launch");
      }
      if (!site.contact.email) await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
    });

    test(`${path}: no forbidden phrases`, async ({ page }) => {
      await page.goto(path);
      const text = await page.locator('main').innerText();
      for (const re of FORBIDDEN) expect(text, String(re)).not.toMatch(re);
    });

    test(`${path}: no horizontal page scroll at 360px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(path);
      const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(sw).toBeLessThanOrEqual(cw);
      // Wide tables scroll inside their own container.
      for (const box of await page.locator('.legal-prose .table-scroll').all()) {
        expect(await box.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');
      }
    });
  }
}
