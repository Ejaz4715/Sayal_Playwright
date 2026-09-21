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
 *  - this file is serial and last (project dependencies in playwright.config),
 *  - retries are 0 suite-wide,
 *  - the lockout cases themselves (AUTH-012 / AUTH-013) are **not** automated
 *    against this account. Verifying a lockout means causing one, and there is
 *    no disposable account to cause it on. They stay manual until one exists.
 */
test.describe.configure({ mode: 'serial' });

test.describe('Authentication — negative', () => {
  test('SAYAL-AUTH-009 valid credentials with a wrong CAPTCHA are rejected @P0', async ({
    loginPage,
  }) => {
    await loginPage.open();
    await loginPage.fillCredentials(CREDENTIALS.email, CREDENTIALS.password, '99999');

    const response = loginPage.page.waitForResponse(
      (r) => /next-api\/generic/.test(r.url()) && r.request().method() === 'POST',
      { timeout: 30_000 },
    );
    await loginPage.submit.click();
    const result = await response;

    expect(result.status(), 'a wrong CAPTCHA must be refused').toBe(422);
    expect(await result.text()).toContain(ERROR_CODES.badCaptcha);
    await loginPage.expectStillOnLogin();
    await loginPage.expectNoToken();
  });

  test('SAYAL-AUTH-010 a wrong password is rejected @P0', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.fillCredentials(CREDENTIALS.email, 'WrongPass@999', CREDENTIALS.captcha);

    const response = loginPage.page.waitForResponse(
      (r) => /next-api\/generic/.test(r.url()) && r.request().method() === 'POST',
      { timeout: 30_000 },
    );
    await loginPage.submit.click();
    const result = await response;

    expect(result.status()).toBe(400);
    expect(await result.text()).toContain(ERROR_CODES.badCredentials);
    await loginPage.expectStillOnLogin();
    await loginPage.expectNoToken();
  });

  /**
   * The security property worth having: an unknown account and a wrong password
   * must be indistinguishable, or the form becomes an account-enumeration
   * oracle. Asserted by comparing the two responses, not by eyeballing one.
   */
  test('SAYAL-AUTH-011 an unknown account returns the same error as a wrong password @P1', async ({
    loginPage,
  }) => {
    await loginPage.open();
    await loginPage.fillCredentials(
      'qa.notexist.9931@sayal.sa',
      CREDENTIALS.password,
      CREDENTIALS.captcha,
    );

    const response = loginPage.page.waitForResponse(
      (r) => /next-api\/generic/.test(r.url()) && r.request().method() === 'POST',
      { timeout: 30_000 },
    );
    await loginPage.submit.click();
    const result = await response;

    expect(result.status(), 'must match the wrong-password status exactly').toBe(400);
    expect(
      await result.text(),
      'must return the same code as a wrong password — no user enumeration',
    ).toContain(ERROR_CODES.badCredentials);
    await loginPage.expectNoToken();
  });
});
