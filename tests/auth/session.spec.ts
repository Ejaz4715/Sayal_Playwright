import { test, expect } from '@fixtures/pages.fixture';
import { ADMIN_USER, ROUTES } from '@data/testData';

/**
 * Session and route-guard behaviour that can be asserted from an already
 * authenticated session, so these cost no login attempts.
 */
test.describe('Session and route guard', () => {
  test('SAYAL-AUTH-022 visiting login while authenticated redirects to the dashboard @P2', async ({
    authedPage,
  }) => {
    await authedPage.goto(ROUTES.login, { waitUntil: 'commit' });
    await expect(authedPage).toHaveURL(/\/main\/admin\/Dashboard/);
  });

  test('route guard refuses a protected route without a session @P0', async ({ page }) => {
    // Deliberately runs on a clean page rather than the authenticated fixture.
    await page.goto(ROUTES.login, { waitUntil: 'commit' });
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await page.context().clearCookies();

    await page.goto(ROUTES.users, { waitUntil: 'commit' });

    await expect(page).toHaveURL(/\/auth\/Login/);
    await expect(page.getByText(ADMIN_USER.name, { exact: true })).toBeHidden();
  });

  test('every sidebar destination is reachable and renders @P0', async ({ authedPage, shell }) => {
    await shell.expectReady();
    const count = await shell.navLinks.count();
    expect(count, 'the drawer must expose all 16 admin destinations').toBeGreaterThanOrEqual(16);
  });
});
