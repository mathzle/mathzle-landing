/**
 * Lighthouse CI thresholds. Runs against pnpm preview (locally) or the
 * Cloudflare Pages branch preview URL (in CI via LHCI_BUILD_CONTEXT).
 *
 * Performance threshold is set conservatively (0.85) for local CI runs
 * since CI machines vary; the real perf gate lives on the deployed
 * preview URL via the Lighthouse GitHub Action (see .github/workflows).
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm preview',
      startServerReadyPattern: 'Local',
      url: [
        'http://localhost:4321/en/',
        'http://localhost:4321/vi/',
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance':    ['warn',  { minScore: 0.85 }],
        'categories:accessibility':  ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo':            ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
