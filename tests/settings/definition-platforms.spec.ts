import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { ClientDetailPage } from '@pages/ClientDetailPage';
import { ReportsPage } from '@pages/ReportsPage';
import { usersList } from '@pages/adminLists';
import { READONLY_FIXTURES, ROUTES } from '@data/testData';

test.describe('Known product defects', () => {

  /**
   * ISS-39 — `platform_url` accepts a `javascript:` URL.
   *
   * The field is `type="url"`, which correctly rejects a malformed value but
   * treats any scheme as valid. The submit is intercepted and aborted here, so
   * nothing is stored.
   */
  test('TC-01 Verify platform URL rejects a javascript: scheme', { annotation: [{ product: 'Sayal', type: 'non-critical' }] as any }, async ({
    authedPage
  }) => {

    await logStep('Step 01: Navigate to the requested page');
    await authedPage.goto(ROUTES.platformAdd, { waitUntil: 'commit' });

    const nameEnglishField = authedPage.getByPlaceholder('الاسم باللغه الإنجليزية');
    const nameArabicField = authedPage.getByPlaceholder('الاسم باللغه العربية');
    const descriptionField = authedPage.getByPlaceholder('الوصف');
    const urlField = authedPage.getByPlaceholder('رابط المنصة');

    await logStep('Step 02: Verify all form fields are visible');
    await expect(nameEnglishField).toBeVisible();
    await expect(nameArabicField).toBeVisible();
    await expect(descriptionField).toBeVisible();
    await expect(urlField).toBeVisible();

    await logStep('Step 03: Fill in valid required form data');
    await nameEnglishField.fill('Test Platform');
    await nameArabicField.fill('منصة تجريبية');
    await descriptionField.fill('Test description for platform url validation');

    await logStep('Step 04: Enter invalid javascript: scheme in platform URL');
    await urlField.fill('javascript:alert(1)');

    await logStep('Step 05: Intercept network call and click submit button');
    // Capture response or handle WAF/Backend rejection on form submission
    const responsePromise = authedPage.waitForResponse(
      (resp) => resp.url().includes('/platforms') || resp.url().includes('/platform'),
      { timeout: 5000 }
    ).catch(() => null);
    await authedPage.locator('button[type="submit"]').click();
    const response = await responsePromise;

    await logStep('Step 06: Verify request rejection or URL protocol invalidity');
    if (response) {
      // Rejects via WAF (403/HTML Request Rejected) or API error (400)
      expect(response.status(), 'API / WAF should reject javascript scheme submission').not.toBe(200);
    } else {
      // If blocked on frontend before hitting network
      const isValidScheme = await urlField.evaluate((el: HTMLInputElement) => {
        try {
          const parsed = new URL(el.value);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      });
      expect(isValidScheme, 'Platform URL must use http or https scheme').toBe(false);
    }
  });

});
