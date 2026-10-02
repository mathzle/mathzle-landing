import { test, expect } from '@playwright/test';
import { site } from '../../src/data/site';

const ORDER = ['hero', 'proof', 'pain', 'method', 'worlds', 'parents', 'safety', 'story', 'voices', 'pricing', 'faq', 'final-cta'];

for (const locale of ['vi', 'en']) {
  test(`${locale}: sections appear in the designed order`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    const ids = await page.locator('main > section[id]').evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(ORDER.filter((id) => ids.includes(id)));
    // Pricing is only required once public (D-017: the beta hides all prices).
    const must = ['hero', 'proof', 'method', 'worlds', 'safety', ...(site.pricing.public ? ['pricing'] : []), 'faq', 'final-cta'];
    for (const id of must) expect(ids).toContain(id);
    if (!site.pricing.public) expect(ids).not.toContain('pricing');
  });

  test(`${locale}: tone rhythm — no adjacent tints, at most two ink bands`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    const tones = await page.locator('main > section').evaluateAll((els) =>
      els.map((e) => [...e.classList].find((c) => c.startsWith('mk-tone-')) ?? 'mk-tone-canvas'),
    );
    for (let k = 1; k < tones.length; k++) {
      if (tones[k] !== 'mk-tone-canvas') expect(tones[k], `section ${k}`).not.toBe(tones[k - 1]);
    }
    expect(tones.filter((t) => t === 'mk-tone-ink').length).toBeLessThanOrEqual(2);
  });

  test(`${locale}: one primary CTA label everywhere`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    const labels = await page.locator('a[data-track^="cta-play"]').allInnerTexts();
    expect(new Set(labels.map((l) => l.replace(/[→\s]+$/, '').trim())).size).toBe(1);
  });
}

test('old template pieces are gone', async ({ page }) => {
  await page.goto('/vi/');
  await expect(page.locator('.section-divider, .hero-cube, #how-it-works, #trust')).toHaveCount(0);
});
