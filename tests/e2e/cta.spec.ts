import { test, expect } from '@playwright/test';

test('signup form is wired and renders the placeholder', async ({ page }) => {
  await page.goto('/en/');
  const section = page.locator('#signup');
  await section.scrollIntoViewIfNeeded();
  const input = section.locator('input[type=email]');
  await expect(input).toBeVisible();
  await input.fill('test+e2e@example.com');
  // Don't actually submit against the live endpoint here; CTA-form spec is
  // about confirming the island hydrated and the input accepts text. The
  // endpoint contract is exercised at Cloudflare integration time (Task 15).
  await expect(section.locator('button[type=submit]')).toBeEnabled();
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
  await page.goto('/en/pricing');
  await expect(page.locator('a[data-track="cta-pricing-free"]')).toHaveAttribute('href', /app\.mathzle\.com/);
  const prem = page.locator('a[data-track="cta-pricing-premium"]');
  await expect(prem).toHaveAttribute('href', '#signup');
  await expect(prem).not.toContainText(/try/i);
  await expect(page.locator('#signup')).toHaveCount(1);
});
