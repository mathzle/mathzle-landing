import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321',
    trace: 'on-first-retry',
    // Full Chromium in new-headless mode instead of the default headless shell:
    // the shell lays text out with hinted, whole-pixel glyph advances, so line
    // breaks (and thus font-swap layout shift) differ from real Chrome — and
    // from Lighthouse, which runs full Chrome.
    channel: 'chromium',
  },
  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-android', use: { ...devices['Pixel 7'] } },
  ],
});
