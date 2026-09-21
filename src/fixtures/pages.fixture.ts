import { test as base, Page } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { AppShell } from '@components/AppShell';
import { ADMIN_USER, ROUTES } from '@data/testData';

/**
 * Page-object fixtures for the Sayal suite.
 *
 * Usage:
 *   import { test, expect } from '@fixtures/pages.fixture';
 *   test('example', async ({ dashboardPage }) => { ... });
 */
type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  shell: AppShell;
  /** A page that has already completed login and landed on the dashboard. */
  authedPage: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  shell: async ({ page }, use) => {
    await use(new AppShell(page));
  },

  /**
   * An authenticated page.
   *
   * The session comes from the `setup` project's stored storageState rather
   * than a per-test login. That is not an optimisation: Sayal rate-limits login
   * *attempts* and returns `429 SE0053` with a ~10-minute block, so a suite
   * that logs in per test locks itself out partway through (measured — it
   * tripped after roughly a dozen tests).
   *
   * Landing on the dashboard here also gives every consuming test a clean,
   * asserted starting point, so a stale session surfaces as an explicit
   * authentication failure rather than as a confusing failure deeper in.
   */
  authedPage: async ({ page }, use) => {
    await page.goto(ROUTES.dashboard, { waitUntil: 'commit' });
    const shell = new AppShell(page);
    await shell.expectReady();
    await shell.expectAuthenticatedAs(ADMIN_USER.name);
    await use(page);
  },
});

export { expect } from '@playwright/test';
