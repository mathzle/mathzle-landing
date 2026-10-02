import { test, expect, type Page, type Route } from '@playwright/test';
import { site } from '../../src/data/site';

// D-023: the Contact page's message form is the official channel. The API is
// mocked here; the handler itself is covered by tests/unit/signup.test.ts.

const T = {
  vi: { submit: 'Gửi tin nhắn', success: 'Đã gửi!', invalidEmail: 'Email chưa đúng', invalidMessage: 'nhập nội dung', consent: 'cần đồng ý', error: 'Chưa gửi được' },
  en: { submit: 'Send message', success: 'Sent!', invalidEmail: "doesn't look right", invalidMessage: 'Please write a message', consent: 'Please agree', error: "couldn't be sent" },
} as const;

async function fill(page: Page, { email = 'me@example.com', message = 'Xin chào Mathzle', consent = true } = {}) {
  await page.locator('#cf-name').fill('Lan');
  await page.locator('#cf-email').fill(email);
  await page.locator('#cf-message').fill(message);
  if (consent) await page.locator('.cf-consent input').check();
}

for (const locale of ['vi', 'en'] as const) {
  const t = T[locale];
  const path = `/${locale}/contact/`;

  test(`${path}: no "to be published" text; form with consent linking the Privacy Policy`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).not.toContainText(locale === 'vi' ? /sẽ được công bố|trước khi Mathzle ra mắt/ : /will be published|before .*public launch/i);
    await expect(page.locator('#cf-email')).toHaveAttribute('required', '');
    await expect(page.locator('#cf-message')).toHaveAttribute('maxlength', '2000');
    await expect(page.locator('.cf-consent a')).toHaveAttribute('href', `/${locale}/privacy/`);
    if (!site.contact.email) await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
  });

  test(`${path}: sends name, email, message and consent as source "contact"`, async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await page.route('**/api/signup', async (route: Route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto(path);
    await fill(page);
    await page.getByRole('button', { name: t.submit }).click();
    await expect(page.getByRole('status')).toContainText(t.success);
    expect(body).toEqual({ email: 'me@example.com', name: 'Lan', message: 'Xin chào Mathzle', consent: true, locale, source: 'contact' });
  });

  test(`${path}: invalid states are caught before sending`, async ({ page }) => {
    let calls = 0;
    await page.route('**/api/signup', (route) => { calls++; return route.fulfill({ status: 200, body: '{"ok":true}' }); });
    await page.goto(path);
    const submit = page.getByRole('button', { name: t.submit });

    await fill(page, { email: 'nope' });
    await submit.click();
    await expect(page.getByRole('alert')).toContainText(t.invalidEmail);
    await expect(page.locator('#cf-email')).toHaveAttribute('aria-invalid', 'true');

    await page.locator('#cf-email').fill('me@example.com');
    await page.locator('#cf-message').fill('   ');
    await submit.click();
    await expect(page.getByRole('alert')).toContainText(t.invalidMessage);

    await page.locator('#cf-message').fill('Hello');
    await page.locator('.cf-consent input').uncheck();
    await submit.click();
    await expect(page.getByRole('alert')).toContainText(t.consent);
    expect(calls).toBe(0);
  });

  test(`${path}: server failure shows a retryable error and keeps the input`, async ({ page }) => {
    await page.route('**/api/signup', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }));
    await page.goto(path);
    await fill(page);
    await page.getByRole('button', { name: t.submit }).click();
    await expect(page.getByRole('alert')).toContainText(t.error);
    await expect(page.locator('#cf-message')).toHaveValue('Xin chào Mathzle');
    await expect(page.getByRole('button', { name: t.submit })).toBeEnabled();
  });
}

test('contact form hydrates inside its reserved slot (no layout shift)', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium', 'viewport sweep on desktop project');
  for (const width of [360, 390, 768, 1440]) {
    for (const locale of ['vi', 'en']) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/contact/`);
      const slot = page.locator('.cf-slot');
      const before = (await slot.boundingBox())!.height;
      await expect(page.locator('.cf')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const [form, after] = await Promise.all([
        page.locator('.cf').evaluate((el) => el.getBoundingClientRect().height),
        slot.evaluate((el) => el.getBoundingClientRect().height),
      ]);
      expect(form, `${locale} @${width}px: form fits the reserved slot`).toBeLessThanOrEqual(before + 0.5);
      expect(after, `${locale} @${width}px: slot did not grow`).toBeCloseTo(before, 0);
    }
  }
});
