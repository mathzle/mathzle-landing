import { test, expect } from '@playwright/test';

// D-024: math-themed background texture + hero shapes. Purely decorative —
// must never be announced, intercept input, scroll the page sideways, or move
// under reduced motion.

test('decorative layers are aria-hidden, pointer-events:none and below content', async ({ page }) => {
  await page.goto('/vi/');
  const deco = page.locator('#hero .hero-deco');
  await expect(deco).toHaveAttribute('aria-hidden', 'true');
  const shapes = deco.locator('.hd');
  expect(await shapes.count()).toBeGreaterThanOrEqual(8);
  const deco_ = await deco.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { pe: cs.pointerEvents, pos: cs.position, z: cs.zIndex };
  });
  expect(deco_).toEqual({ pe: 'none', pos: 'absolute', z: '-1' });

  // Textured sections: grid on light bands, dots on ink; drawn on ::before.
  for (const [id, kind] of [['hero', 'grid'], ['method', 'grid'], ['worlds', 'grid'], ['safety', 'dots'], ['final-cta', 'dots']] as const) {
    const sec = page.locator(`#${id}`);
    await expect(sec).toHaveClass(new RegExp(`mk-pattern-${kind}`));
    const before = await sec.evaluate((el) => {
      const cs = getComputedStyle(el, '::before');
      return { pe: cs.pointerEvents, pos: cs.position, z: cs.zIndex, bg: cs.backgroundImage, iso: getComputedStyle(el).isolation };
    });
    expect(before.pe).toBe('none');
    expect(before.pos).toBe('absolute');
    expect(before.z).toBe('-1');
    expect(before.iso).toBe('isolate');
    expect(before.bg).toMatch(/gradient/);
  }

  // The headline and CTA still receive the click (nothing decorative on top).
  const cta = page.locator('a[data-track="cta-play-hero"]');
  await cta.scrollIntoViewIfNeeded();
  const box = (await cta.boundingBox())!;
  const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('a')?.dataset.track, [box.x + box.width / 2, box.y + box.height / 2]);
  expect(hit).toBe('cta-play-hero');
});

for (const width of [360, 390, 768, 1280, 1440]) {
  test(`no horizontal scroll with decorative layers at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/vi/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
}

test('hero shapes actually drift (transform changes over time)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/vi/');
  const ring = page.locator('#hero .hd-ring');
  await expect(ring).toHaveCSS('animation-name', 'hd-drift');
  const t0 = await ring.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(1500);
  const t1 = await ring.evaluate((el) => getComputedStyle(el).transform);
  expect(t1).not.toBe(t0);
});

test('reduced motion: hero shapes are static', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/vi/');
  const names = await page.locator('#hero .hd').evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  expect(names.length).toBeGreaterThan(0);
  expect(new Set(names)).toEqual(new Set(['none']));
  const ring = page.locator('#hero .hd-ring');
  const t0 = await ring.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(800);
  expect(await ring.evaluate((el) => getComputedStyle(el).transform)).toBe(t0);
});
