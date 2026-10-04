import { Page, Locator, expect } from '@playwright/test';

/**
 * Shared behaviour for every Sayal page object.
 *
 * The one non-obvious thing here is navigation. Sayal is a Next.js SPA whose
 * `load` event never settles on this environment, so `waitUntil: 'load'` and
 * `networkidle` both hang until the navigation timeout. Every navigation
 * therefore commits and then blocks on a page-specific readiness element, which
 * is the only honest signal that the view is actually usable.
 */
export abstract class BasePage {
  readonly page: Page;

  /**
   * Path relative to `baseURL`. Overridden by each page — either as a field on
   * the subclass, or assigned in the constructor by the generic list page,
   * which takes its route as a parameter.
   */
  protected path: string = '/';

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Commit a navigation without waiting for the SPA bundle to settle.
   * Callers are expected to follow this with a readiness assertion.
   */
  async goto(url: string = this.path): Promise<void> {
    await this.page.goto(url, { waitUntil: 'commit' });
  }

  /**
   * Navigate and block until `ready` is visible.
   *
   * Retries once on failure: this environment intermittently drops a Next.js
   * chunk during SPA routing (ENV-02) and a hard reload recovers it. The retry
   * is deliberately narrow — it re-navigates rather than swallowing an
   * assertion, so a genuinely broken page still fails.
   */
  protected async gotoUntilReady(ready: Locator, url: string = this.path): Promise<void> {
    await this.goto(url);
    try {
      await expect(ready).toBeVisible();
    } catch {
      await this.page.reload({ waitUntil: 'commit' });
      await expect(ready).toBeVisible();
    }
  }

  currentUrl(): string {
    return this.page.url();
  }

  /**
   * Read the bearer token the app stores after login.
   * Returns null when logged out, which is itself an assertable state.
   */
  async authToken(): Promise<string | null> {
    const tokenCookie = (await this.page.context().cookies(this.page.url())).find(
      (cookie) => cookie.name === 'sayal_token',
    );
    if (tokenCookie) return tokenCookie.value;

    const storage = await this.page.evaluate(() => window.localStorage.getItem('sayal_token'));
    
    return storage;
  }
}
