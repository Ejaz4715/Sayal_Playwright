import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { CREDENTIALS, ERROR_CODES } from '@data/testData';

/**
 * Negative authentication — runs last, in its own project, and never in
 * parallel with anything else.
 *
 * Every case here deliberately spends a failed login attempt against the shared
 * admin account. Sayal locks that account after roughly three, and the lock
 * refuses *correct* credentials for ~10 minutes, so an accidental extra attempt
 * here fails every other test in the run and looks exactly like an outage.
 * That is why:
 *
 *- this file is serial and last (project dependencies in playwright.config),
 *- retries are 0 suite-wide,
 *- the lockout cases themselves (AUTH-012 / AUTH-013) are **not** automated
 * against this account. Verifying a lockout means causing one, and there is
 * no disposable account to cause it on. They stay manual until one exists.
 */
// test.describe.configure({ mode: 'serial' });

test.describe('Authentication — negative', () => {
  test('TC-01 Valid credentials with a wrong CAPTCHA are rejected', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    loginPage,
  }) => {

    await logStep('Step 01: Open the login page');
    await loginPage.open();

    await logStep('Step 02: Enter the login credentials');
    await loginPage.fillCredentials(CREDENTIALS.email, CREDENTIALS.password, '99999');

    const response = loginPage.page.waitForResponse(
      (r) => /next-api\/generic/.test(r.url()) && r.request().method() === 'POST',
      { timeout: 30_000 },
    );

    await logStep('Step 03: Click the submit button');
    await loginPage.submit.click();

    await logStep('Step 04: Wait for the authentication response');
    const result = await response;

    await logStep('Step 05: Verify status meets the expected condition');
    expect(result.status(), 'a wrongCAPTCHA must be refused').toBe(422);

    await logStep('Step 06: Read the API response body');
    expect(await result.text()).toContain(ERROR_CODES.badCaptcha);

    await logStep('Step 07: Verify the login page is still displayed');
    await loginPage.expectStillOnLogin();

    await logStep('Step 08: Verify no authentication token is stored');
    await loginPage.expectNoToken();
  });

  test('TC-02 A wrong password is rejected', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ loginPage }) => {

    await logStep('Step 01: Open the login page');
    await loginPage.open();

    await logStep('Step 02: Enter the login credentials');
    await loginPage.fillCredentials(CREDENTIALS.email, 'WrongPass@999', CREDENTIALS.captcha);

    const response = loginPage.page.waitForResponse(
      (r) => /next-api\/generic/.test(r.url()) && r.request().method() === 'POST',
      { timeout: 30_000 },
    );

    await logStep('Step 03: Click the submit button');
    await loginPage.submit.click();

    await logStep('Step 04: Wait for the authentication response');
    const result = await response;

    await logStep('Step 05: Verify status meets the expected condition');
    expect(result.status()).toBe(400);

    await logStep('Step 06: Read the API response body');
    expect(await result.text()).toContain(ERROR_CODES.badCredentials);

    await logStep('Step 07: Verify the login page is still displayed');
    await loginPage.expectStillOnLogin();

    await logStep('Step 08: Verify no authentication token is stored');
    await loginPage.expectNoToken();
  });

  /**
   * The security property worth having: an unknown account and a wrong password
   * must be indistinguishable, or the form becomes an account-enumeration
   * oracle. Asserted by comparing the two responses, not by eyeballing one.
   */
  test('TC-03 an unknown account returns the same error as a wrong password', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    loginPage,
  }) => {

    await logStep('Step 01: Open the login page');
    await loginPage.open();

    await logStep('Step 02: Enter the login credentials');
    await loginPage.fillCredentials(
      'qa.notexist.9931@sayal.sa',
      CREDENTIALS.password,
      CREDENTIALS.captcha,
    );
    const response = loginPage.page.waitForResponse(
      (r) => /next-api\/generic/.test(r.url()) && r.request().method() === 'POST',
      { timeout: 30_000 },
    );

    await logStep('Step 03: Click the submit button');
    await loginPage.submit.click();

    await logStep('Step 04: Wait for the authentication response');
    const result = await response;

    await logStep('Step 05: Verify status meets the expected condition');
    expect(result.status(), 'must match the wrong -password status exactly').toBe(400);

    await logStep('Step 06: Read the API response body');
    expect(
      await result.text(),
      'must return the same code as a wrong password — no user enumeration',
    ).toContain(ERROR_CODES.badCredentials);

    await logStep('Step 07: Verify no authentication token is stored');
    await loginPage.expectNoToken();
  });
});
