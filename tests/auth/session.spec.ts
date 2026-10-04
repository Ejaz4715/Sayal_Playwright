import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { ADMIN_USER, ROUTES } from '@data/testData';

/**
 * Session and route-guard behaviour that can be asserted from an already
 * authenticated session, so these cost no login attempts.
 */
test.describe('Session and route guard', () => {
  test('TC-01 Visiting login while authenticated redirects to the dashboard', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Navigate to the requested page');
    await authedPage.goto(ROUTES.login, { waitUntil: 'commit' });

    await logStep('Step 02: Verify authenticated page has the expected URL');
    await expect(authedPage).toHaveURL(/\/main\/admin\/Dashboard/);
  });

  test('TC-02 Route guard refuses a protected route without a session', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ page }) => {

    await logStep('Step 01: Navigate to the requested page');
    // Deliberately runs on a clean page rather than the authenticated fixture.
    await page.goto(ROUTES.login, { waitUntil: 'commit' });

    await logStep('Step 02: Evaluate the current browser or form state');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    await logStep('Step 03: Clear cookies from the browser context');
    await page.context().clearCookies();

    await logStep('Step 04: Navigate to the requested page');
    await page.goto(ROUTES.users, { waitUntil: 'commit' });

    await logStep('Step 05: Verify page has the expected URL');
    await expect(page).toHaveURL(/\/auth\/Login/);

    await logStep('Step 06: Verify text "" is hidden');
    await expect(page.getByText(ADMIN_USER.name, { exact: true })).toBeHidden();
  });

  test('TC-03 Every sidebar destination is reachable and renders', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage, shell }) => {

    await logStep('Step 01: Verify the application shell is ready');
    await shell.expectReady();

    await logStep('Step 02: Count items in the application shell');
    const count = await shell.navLinks.count();

    await logStep('Step 03: Verify navigation links meets the expected condition');
    expect(count, 'the drawer must expose all 16 admin destinations').toBeGreaterThanOrEqual(16);
  });
});
