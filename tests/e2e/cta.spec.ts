import { test, expect } from '@playwright/test';

test('newsletter form in the final CTA hydrates', async ({ page }) => {
  await page.goto('/en/');
  const fc = page.locator('#final-cta');
  await fc.locator('summary').click();
  const input = fc.locator('input[type=email]');
  await input.fill('test+e2e@example.com');
  // Don't actually submit against the live endpoint here; CTA-form spec is
  // about confirming the island hydrated and the input accepts text. The
  // endpoint contract is exercised at Cloudflare integration time (Task 15).
  await expect(fc.locator('button[type=submit]')).toBeEnabled();
});

test('FAQ accordion expands and exposes schema.org markup', async ({ page }) => {
  await page.goto('/en/');
  const faq = page.locator('#faq');
  await faq.scrollIntoViewIfNeeded();
  const firstQ = faq.locator('button.faq-q').first();
  // First item starts expanded; collapse it, then re-expand.
  await firstQ.click();
  await expect(firstQ).toHaveAttribute('aria-expanded', 'false');
  await firstQ.click();
  await expect(firstQ).toHaveAttribute('aria-expanded', 'true');

  // FAQ JSON-LD must be present for SEO.
  const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
  expect(jsonLdCount).toBeGreaterThanOrEqual(3); // Org + WebApplication + FAQ
});

test('pricing: free CTA goes to the app, premium CTA goes to the waitlist while not on sale', async ({ page }) => {
  await page.goto('/en/pricing/');
  await expect(page.locator('a[data-track="cta-pricing-free"]')).toHaveAttribute('href', /app\.mathzle\.com/);
  const prem = page.locator('a[data-track="cta-pricing-premium"]');
  await expect(prem).toHaveAttribute('href', '#premium-waitlist');
  await expect(page.locator('#premium-waitlist input[type=email]')).toBeVisible();
});
