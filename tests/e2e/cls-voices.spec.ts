import { test, expect, type Page } from '@playwright/test';

/**
 * CLS regression test for the Voices beta SignupForm (D-017: no testimonials
 * yet → #voices renders the beta waitlist form). `client:only="preact"`
 * renders nothing server-side, so the form grows from 0 to its hydrated
 * height unless its wrapper reserves that height (Voices.astro's
 * `.beta-form`, mirrored in FinalCta's `.fc-form` and Pricing's `.waitlist`).
 * Landing on `/vi/#voices` — including via the `/vi/pricing/` beta redirect
 * (BetaRedirect.astro) — puts `#faq` right below in the viewport, so an
 * unreserved hydration used to shift it down (CLS ≈0.07–0.09, failing the
 * Lighthouse gate for `/vi/pricing/`: see tests/lighthouse/lighthouserc.cjs).
 *
 * Two layers, like contact-form.spec.ts's own hydration-slot test:
 *  1. Deterministic: the reserved `.beta-form` slot's height must already
 *     equal the hydrated form's height (no before/after delta at all) — this
 *     is the actual regression guard, immune to timing noise.
 *  2. A PerformanceObserver total-CLS reading (installed before navigation,
 *     buffered, read once the form is visible + 500ms) as a real-world
 *     sanity check, logging shift sources on failure. Its budget is wider
 *     than the Lighthouse gate's 0.02 on purpose: a `#voices`/`#faq` deep
 *     link forces the web-font class on before first paint (fonts.spec.ts),
 *     which can race the font file's own download and reflow the beta
 *     heading/body text independently of the form; measured up to ~0.026 on
 *     this build with the form-growth regression fully fixed, it is
 *     pre-existing, unrelated to hydration, and doesn't show up in Lighthouse
 *     (CLS measured at 0 for /vi/pricing/ across 3 lab runs) — so it must not
 *     fail this test. The real SignupForm regression this test guards
 *     against measured 0.07–0.09, well clear of that noise floor.
 */
async function installClsObserver(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    (window as unknown as { __shifts: unknown[] }).__shifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number; sources?: { node?: Element }[] }>) {
        if (!entry.hadRecentInput) {
          const w = window as unknown as { __cls: number; __shifts: unknown[] };
          w.__cls += entry.value ?? 0;
          w.__shifts.push({
            value: entry.value,
            sources: (entry.sources ?? []).map((s) => (s.node ? s.node.className || s.node.tagName : 'unknown')),
          });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
}

async function readCls(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as { __cls: number; __shifts: unknown[] };
    return { cls: w.__cls, shifts: w.__shifts };
  });
}

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1280, height: 900 },
] as const;

// Wider than the Lighthouse gate's 0.02 — see the file comment above for why.
const CLS_SANITY_BUDGET = 0.05;

async function assertNoShift(page: Page) {
  const slot = page.locator('#voices .beta-form');
  const before = (await slot.boundingBox())!.height;
  const form = page.locator('#voices .cta-form');
  await form.waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  const [formHeight, after] = await Promise.all([
    form.evaluate((el) => el.getBoundingClientRect().height),
    slot.evaluate((el) => el.getBoundingClientRect().height),
  ]);
  expect(formHeight, 'hydrated form fits the slot reserved for it').toBeLessThanOrEqual(before + 0.5);
  expect(after, 'slot did not grow when the form hydrated').toBeCloseTo(before, 0);

  await page.waitForTimeout(500);
  const { cls, shifts } = await readCls(page);
  expect(cls, `layout shifts: ${JSON.stringify(shifts)}`).toBeLessThan(CLS_SANITY_BUDGET);
}

for (const viewport of VIEWPORTS) {
  const label = `${viewport.width}x${viewport.height}`;

  test(`/vi/pricing/ beta redirect @ ${label}: SignupForm hydrates with no layout shift`, async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium', 'layout-shift API is Chromium-only; one run is enough');
    await page.setViewportSize(viewport);
    await installClsObserver(page);
    await page.goto('/vi/pricing/');
    await page.waitForURL('**/vi/#voices');
    await assertNoShift(page);
  });

  test(`/vi/#voices direct @ ${label}: SignupForm hydrates with no layout shift`, async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium', 'layout-shift API is Chromium-only; one run is enough');
    await page.setViewportSize(viewport);
    await installClsObserver(page);
    await page.goto('/vi/#voices');
    await assertNoShift(page);
  });
}
