import { logStep } from '@helpers/LogSteps';
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
  test('TC-01 Login page renders all three inputs and the CAPTCHA image', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    loginPage,
  }) => {

    await logStep('Step 01: Open the login page');
    await loginPage.open();

    await logStep('Step 02: Verify email field is visible');
    await expect(loginPage.email).toBeVisible();

    await logStep('Step 03: Verify password field is visible');
    await expect(loginPage.password).toBeVisible();

    await logStep('Step 04: Verify input is visible');
    await expect(loginPage.captcha.input).toBeVisible();

    await logStep('Step 05: Verify image is visible');
    await expect(loginPage.captcha.image).toBeVisible();
  });

  test('TC-02 Submit is disabled until all three fields are filled', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    loginPage,
  }) => {

    await logStep('Step 01: Open the login page');
    await loginPage.open();

    await logStep('Step 02: Enter a value in the email field');
    await loginPage.email.fill(CREDENTIALS.email);

    await logStep('Step 03: Enter a value in the password field');
    await loginPage.password.fill(CREDENTIALS.password);

    await logStep('Step 04: Verify submit button is disabled');
    await expect(
      loginPage.submit,
      'submit must stay disabled while the CAPTCHA field is empty',
    ).toBeDisabled();

    await logStep('Step 05: Enter a value in the CAPTCHA field');
    await loginPage.captcha.fill(CREDENTIALS.captcha);

    await logStep('Step 06: Verify submit button is enabled');
    await expect(loginPage.submit).toBeEnabled();
  });

  test('TC-03 Email is trimmed of surrounding whitespace', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ loginPage }) => {

    await logStep('Step 01: Open the login page');
    await loginPage.open();

    await logStep('Step 02: Enter a value in the email field');
    await loginPage.email.fill(' Admin@sayal.sa ');

    await logStep('Step 03: Click the password field');
    await loginPage.password.click();

    await logStep('Step 04: Verify email field has the expected value');
    await expect(loginPage.email).toHaveValue(CREDENTIALS.email);
  });

  test('TC-04 Required messages appear after clearing a filled field', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    loginPage,
  }) => {

    await logStep('Step 01: Open the login page');
    await loginPage.open();

    await logStep('Step 02: Enter a value in the email field');
    await loginPage.email.fill(CREDENTIALS.email);

    await logStep('Step 03: Clear the email field');
    await loginPage.email.clear();

    await logStep('Step 04: Click the password field');
    await loginPage.password.click();

    await logStep('Step 05: Verify first is visible');
    await expect(loginPage.fieldErrors.filter({ hasText: 'حقل إجباري' }).first()).toBeVisible();
  });

  test('TC-05 Password eyetoggle reveals and re-hides', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ loginPage }) => {

    await logStep('Step 01: Open the login page');
    await loginPage.open();

    await logStep('Step 02: Enter a value in the password field');
    await loginPage.password.fill(CREDENTIALS.password);

    await logStep('Step 03: Verify password field has the expected attribute');
    await expect(loginPage.password).toHaveAttribute('type', 'password');

    await logStep('Step 04: Click the password eye toggle');
    await loginPage.passwordEyeToggle.click();

    await logStep('Step 05: Verify password field has the expected attribute');
    await expect(loginPage.password).toHaveAttribute('type', 'text');

    await logStep('Step 06: Click the password eye toggle');
    await loginPage.passwordEyeToggle.click();

    await logStep('Step 07: Verify password field has the expected attribute');
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  /**
   * AUTH-014 and AUTH-015 are asserted from a single login. They are separate
   * cases in the test plan but both describe one submit, and every extra submit
   * spends a rate-limited attempt — so combining them costs no coverage.
   */
  test('TC-06 Valid credentials issue a token, land on the dashboard, with no OTP step', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    loginPage,
    shell,
  }) => {

    await logStep('Step 01: Open the login page');
    await loginPage.open();

    await logStep('Step 02: Enter the login credentials');
    await loginPage.fillCredentials();
    const visited: string[] = [];
    loginPage.page.on('framenavigated', (f) => {
      if (f === loginPage.page.mainFrame()) visited.push(f.url());
    });

    /* Shares the login helper so a server rejection — most often the account
  rate limit — is named rather than surfacing as a navigation timeout. */

    await logStep('Step 03: Submit valid credentials and wait for login success');
    await loginPage.submitExpectingSuccess();

    // AUTH-014

    await logStep('Step 04: Verify expect authenticated as on the application shell');
    await shell.expectAuthenticatedAs(ADMIN_USER.name);

    await logStep('Step 05: Read the stored authentication token');
    expect(await loginPage.authToken(), 'a bearer token must be persisted').toBeTruthy();

    // AUTH-015 — no intermediate OTP route was visited
    const otpRoutes = visited.filter((u) => /otp|verify|verification/i.test(u));

    await logStep('Step 06: Verify otp routes meets the expected condition');
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

  test('TC-07 logout responds to an ordinary user click', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage, page,
    shell,
  }) => {

    await logStep('Step 01: Verify logout link is visible');
    await expect(shell.logoutLink, 'the control is visible to the user').toBeVisible();

    await logStep('Step 02: Click the setting icon and logout link using a real user interaction');
    await shell.logout();

    await logStep('Step 03: Verify authenticated page has the expected URL of login page');
    await expect(authedPage).toHaveURL(/\/auth\/Login/);
  });

  test('TC-08 Logout clears the token, redirects, and Back does not restore the session', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    loginPage,
    shell,
  }) => {

    await logStep('Step 01: Navigate to the requested page');
    await loginPage.page.goto(ROUTES.dashboard, { waitUntil: 'commit' });

    await logStep('Step 02: Verify expect authenticated as on the application shell');
    await shell.expectAuthenticatedAs(ADMIN_USER.name);

    await logStep('Step 03: Log out of the application');
    await shell.logoutByDispatchEvent();

    await logStep('Step 04: Wait for the expected page navigation');
    await loginPage.page.waitForURL(/\/auth\/Login/, { waitUntil: 'commit' });

    await logStep('Step 05: Verify no authentication token is stored');
    await loginPage.expectNoToken();

    await logStep('Step 06: Navigate back to the previous page');
    await loginPage.page.goBack({ waitUntil: 'commit' });

    await logStep('Step 07: Verify text "" is hidden');
    await expect(
      loginPage.page.getByText(ADMIN_USER.name, { exact: true }),
      'The operator name must not be rendered after logging out',
    ).toBeHidden();

    await logStep('Step 08: Read the stored authentication token');
    expect(await loginPage.authToken(), 'no token may be restored by Back').toBeNull();
  });
});
