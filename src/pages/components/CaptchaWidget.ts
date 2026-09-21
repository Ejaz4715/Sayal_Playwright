import { Page, Locator, expect } from '@playwright/test';

/**
 * The login CAPTCHA.
 *
 * On pre-production the image is byte-identical on every request and always
 * reads `12345`; only the key rotates (ISS-21). That makes the auth suite
 * unusually cheap to automate here — but it is an environment property, not a
 * product guarantee, so nothing outside this widget assumes it.
 */
export class CaptchaWidget {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get input(): Locator {
    return this.page.locator('#captcha_value');
  }

  /** The rendered CAPTCHA image. Its arrival is the login form's readiness signal. */
  get image(): Locator {
    return this.page.locator('img[src^="data:image"], [class*="captchaImageWrapper"] img').first();
  }

  get refreshButton(): Locator {
    return this.page.locator('[class*="refreshCaptcha"]').first();
  }

  async expectRendered(): Promise<void> {
    await expect(this.input).toBeVisible();
    await expect(this.image).toBeVisible();
    /**
     * Wait for the image to actually carry its payload. `/api/captcha` resolves
     * asynchronously and the component re-renders when it lands — filling
     * before that happens gets the typed value wiped (see `fill` below).
     */
    await expect(this.image).toHaveAttribute('src', /^data:image|\/api\/captcha/);
  }

  /**
   * Type the CAPTCHA and confirm it stuck.
   *
   * The retry is not defensive padding. When `/api/captcha` resolves it
   * re-renders the field and silently clears anything already typed, so a
   * single `fill()` intermittently leaves the input empty, the submit button
   * disabled and the form showing "رمز التحقق مطلوب". Re-filling after the
   * re-render is the only reliable sequence.
   */
  async fill(value: string): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.input.fill(value);
      try {
        await expect(this.input).toHaveValue(value, { timeout: 3000 });
        return;
      } catch {
        // React cleared it on re-render — try again.
      }
    }
    await expect(this.input, 'CAPTCHA value would not persist after 3 attempts').toHaveValue(value);
  }

  /** Base64 payload of the current image, used to prove refresh behaviour. */
  async imageSignature(): Promise<string> {
    return (await this.image.getAttribute('src')) ?? '';
  }

  async refresh(): Promise<void> {
    await this.refreshButton.click();
  }
}
