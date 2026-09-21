import { test, expect } from '@fixtures/pages.fixture';
import { CREDENTIALS, ADMIN_USER, ROUTES } from '@data/testData';
import { ADMIN_STORAGE_STATE } from '@data/authState';

/**
 * The login and logout journeys themselves.
 *
 * These start signed out, so they run in their own project without the stored
 * session, after the functional suite. Every test that actually submits the
 * form is a real login attempt against a rate-limited shared account, so the
 * number of submits here is kept deliberately small — form-level cases assert
 * without submitting.
 */
test.describe('Authentication journey', () => {
  test('SAYAL-AUTH-001 login page renders all three inputs and the CAPTCHA image @smoke @P0', async ({
    loginPage,
  }) => {
    await loginPage.open();

    await expect(loginPage.email).toBeVisible();
    await expect(loginPage.password).toBeVisible();
    await expect(loginPage.captcha.input).toBeVisible();
    await expect(loginPage.captcha.image).toBeVisible();
  });

  test('SAYAL-AUTH-002 submit is disabled until all three fields are filled @P1', async ({
    loginPage,
  }) => {
    await loginPage.open();

    await loginPage.email.fill(CREDENTIALS.email);
    await loginPage.password.fill(CREDENTIALS.password);
    await expect(
      loginPage.submit,
      'submit must stay disabled while the CAPTCHA field is empty',
    ).toBeDisabled();

    await loginPage.captcha.fill(CREDENTIALS.captcha);
    await expect(loginPage.submit).toBeEnabled();
  });

  test('SAYAL-AUTH-005 email is trimmed of surrounding whitespace @P2', async ({ loginPage }) => {
    await loginPage.open();

    await loginPage.email.fill('   Admin@sayal.sa   ');
    await loginPage.password.click();
    await expect(loginPage.email).toHaveValue(CREDENTIALS.email);
  });

  test('SAYAL-AUTH-006 required messages return after clearing a filled field @P2', async ({
    loginPage,
  }) => {
    await loginPage.open();

    await loginPage.email.fill(CREDENTIALS.email);
    await loginPage.email.clear();
    await loginPage.password.click();

    await expect(loginPage.fieldErrors.filter({ hasText: 'حقل إجباري' }).first()).toBeVisible();
  });

  test('SAYAL-AUTH-007 password eye toggle reveals and re-hides @P2', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.password.fill(CREDENTIALS.password);

    await expect(loginPage.password).toHaveAttribute('type', 'password');
    await loginPage.passwordEyeToggle.click();
    await expect(loginPage.password).toHaveAttribute('type', 'text');
    await loginPage.passwordEyeToggle.click();
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  /**
   * AUTH-014 and AUTH-015 are asserted from a single login. They are separate
   * cases in the test plan but both describe one submit, and every extra submit
   * spends a rate-limited attempt — so combining them costs no coverage.
   */
  test('SAYAL-AUTH-014/015 valid credentials issue a token, land on the dashboard, with no OTP step @smoke @P0', async ({
    loginPage,
    shell,
  }) => {
    await loginPage.open();
    await loginPage.fillCredentials();

    const visited: string[] = [];
    loginPage.page.on('framenavigated', (f) => {
      if (f === loginPage.page.mainFrame()) visited.push(f.url());
    });

    /* Shares the login helper so a server rejection — most often the account
       rate limit — is named rather than surfacing as a navigation timeout. */
    await loginPage.submitExpectingSuccess();

    // AUTH-014
    await shell.expectAuthenticatedAs(ADMIN_USER.name);
    expect(await loginPage.authToken(), 'a bearer token must be persisted').toBeTruthy();

    // AUTH-015 — no intermediate OTP route was visited
    const otpRoutes = visited.filter((u) => /otp|verify|verification/i.test(u));
    expect(otpRoutes, `unexpected OTP route in ${visited.join(' → ')}`).toHaveLength(0);
  });

});

/**
 * Logout reuses the stored session rather than logging in again.
 *
 * Logging out needs *an* authenticated session, not a freshly-typed one, and
 * every real login spends a rate-limited attempt. Taking the stored session
 * here removes one attempt per run, which is the difference between a full
 * suite fitting inside the limiter's budget and not.
 *
 * This does invalidate the shared token server-side — which is exactly why this
 * project runs after the functional suite, and why the setup project verifies
 * the stored session and re-authenticates when it has gone stale.
 */
test.describe('Logout journey', () => {
  test.use({ storageState: ADMIN_STORAGE_STATE });

  test('SAYAL-AUTH-020/021 logout clears the token, redirects, and Back does not restore the session @smoke @P0', async ({
    loginPage,
    shell,
  }) => {
    await loginPage.page.goto(ROUTES.dashboard, { waitUntil: 'commit' });
    await shell.expectAuthenticatedAs(ADMIN_USER.name);

    // AUTH-020
    await shell.logout();
    await loginPage.page.waitForURL(/\/auth\/Login/, { waitUntil: 'commit' });
    await loginPage.expectNoToken();

    // AUTH-021 — the security-relevant half: no authenticated content after Back.
    await loginPage.page.goBack({ waitUntil: 'commit' });
    await expect(
      loginPage.page.getByText(ADMIN_USER.name, { exact: true }),
      'the operator name must not be rendered after logging out',
    ).toBeHidden();
    expect(await loginPage.authToken(), 'no token may be restored by Back').toBeNull();
  });
});
