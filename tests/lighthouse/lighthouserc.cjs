/**
 * Lighthouse CI thresholds. Runs against pnpm preview (locally) or the
 * Cloudflare Pages branch preview URL (in CI via LHCI_BUILD_CONTEXT).
 *
 * Mobile emulation (390×844, DPR 3) to match how parents actually load the
 * site. Spec target is Perf ≥ 95 on a real device; the 0.9 gate here allows
 * for CI runner variance — the 95 number is measured on the deployed preview
 * URL by hand before launch (see task-34 Step 5).
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm preview',
      startServerReadyPattern: 'Local',
      url: ['http://localhost:4321/vi/', 'http://localhost:4321/en/', 'http://localhost:4321/vi/pricing'],
      numberOfRuns: 3,
      settings: {
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false },
        throttlingMethod: 'simulate',
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance':    ['error', { minScore: 0.9, aggregationMethod: 'median-run' }],
        'categories:accessibility':  ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo':            ['error', { minScore: 0.95 }],
        'largest-contentful-paint':  ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift':   ['error', { maxNumericValue: 0.02 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
