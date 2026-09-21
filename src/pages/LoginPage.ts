import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CaptchaWidget } from './components/CaptchaWidget';
import { CREDENTIALS, ROUTES } from '@data/testData';

/**
 * `/auth/Login`.
 *
 * There is no separate OTP step in this product. The "verification code" quoted
 * in the brief is the value rendered inside the CAPTCHA image on this very
 * form, so login is a single request.
 */
export class LoginPage extends BasePage {
  protected readonly path = ROUTES.login;
  readonly captcha: CaptchaWidget;

  constructor(page: Page) {
    super(page);
    this.captcha = new CaptchaWidget(page);
  }

  get email(): Locator {
    return this.page.locator('#email');
  }

  get password(): Locator {
    return this.page.locator('#password');
  }

  get submit(): Locator {
    return this.page.getByRole('button', { name: /تسجيل الدخول|Login/ });
  }

  get passwordEyeToggle(): Locator {
    return this.page.locator('[class*="iconEye"]').first();
  }

  /** Inline field errors. The auth forms use this CSS-module class family. */
  get fieldErrors(): Locator {
    return this.page.locator('[class*="InputError_error"]');
  }

  /** Toast / banner text surfaced after a rejected submit. */
  get alert(): Locator {
    return this.page.locator('[class*="Toastify"], [role="alert"]').first();
  }

  async open(): Promise<void> {
    await this.gotoUntilReady(this.email);
    await this.captcha.expectRendered();
  }

  /** Fill the three fields without submitting. */
  async fillCredentials(
    email = CREDENTIALS.email,
    password = CREDENTIALS.password,
    captcha = CREDENTIALS.captcha,
  ): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.captcha.fill(captcha);
  }

  /**
   * Complete a successful login and settle on the dashboard.
   * Used both by the auth tests and by the authenticated fixture.
   */
  async login(
    email = CREDENTIALS.email,
    password = CREDENTIALS.password,
    captcha = CREDENTIALS.captcha,
  ): Promise<void> {
    await this.open();
    await this.fillCredentials(email, password, captcha);
    await this.submitExpectingSuccess();
  }

  /**
   * Submit the login form and land on the dashboard, surfacing the server's
   * rejection reason if there is one.
   *
   * Shared by every test that performs a real login. Without the response
   * check, a rejected login shows up only as a 90-second navigation timeout,
   * which reads like an environment outage and hides the actual cause — most
   * often `429 SE0053`, because Sayal rate-limits login *attempts* rather than
   * just failures. Naming it in the failure message is the difference between
   * a five-minute diagnosis and an hour of re-running into the same wall.
   */
  async submitExpectingSuccess(): Promise<void> {
    /* All three fields present is exactly what enables the button (AUTH-002),
       so this doubles as a guard that the form is genuinely submittable. */
    await expect(this.submit).toBeEnabled();

    const loginResponse = this.page
      .waitForResponse((r) => /next-api\/generic/.test(r.url()) && r.request().method() === 'POST', {
        timeout: 30_000,
      })
      .catch(() => null);

    await this.submit.click();
    const response = await loginResponse;

    if (response && !response.ok()) {
      const body = await response.text().catch(() => '');
      const status = response.status();
      const hint =
        status === 429
          ? ' — the shared admin account is rate-limited (SE0053). Login attempts, not just failures, count towards it; wait out the stated window before re-running.'
          : '';
      throw new Error(`Login rejected with HTTP ${status}${hint}\nResponse: ${body.slice(0, 300)}`);
    }

    /**
     * `waitUntil: 'commit'` is required. `waitForURL` defaults to waiting for
     * the `load` event, which never fires on this Next.js app — so the default
     * turns a successful login into a 90s navigation timeout, intermittently.
     */
    await this.page.waitForURL(/\/main\/admin\/Dashboard/, { waitUntil: 'commit' });
  }

  /** Submit and stay put — for the negative cases, which must not navigate. */
  async attemptLogin(email: string, password: string, captcha: string): Promise<void> {
    await this.open();
    await this.fillCredentials(email, password, captcha);
    await this.submit.click();
  }

  async clearSession(): Promise<void> {
    await this.page.goto(ROUTES.login, { waitUntil: 'commit' });
    await this.page
      .evaluate(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
      })
      .catch(() => {
        /* storage can be unavailable before the first real navigation */
      });
    await this.page.context().clearCookies();
  }

  async expectStillOnLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/Login/);
  }

  async expectNoToken(): Promise<void> {
    expect(await this.authToken()).toBeNull();
  }
}
