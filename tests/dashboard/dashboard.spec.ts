import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { DashboardPage } from '@pages/DashboardPage';
import { AppShell } from '@components/AppShell';

test.describe('Dashboard', () => {
  test('TC-01 all six widgets and the calendar render', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the dashboard');
    const dashboard = new DashboardPage(authedPage);
    await dashboard.open();

    await logStep('Step 02: Verify calendar is visible');
    await expect(dashboard.calendar).toBeVisible();

    await logStep('Step 03: Verify expect all widgets on the dashboard');
    await dashboard.expectAllWidgets();
  });

  test('TC-02 sender-identity widget lists the nine registered identities', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the dashboard');
    const dashboard = new DashboardPage(authedPage);
    await dashboard.open();

    await logStep('Step 02: Verify expect sender identities on the dashboard');
    await dashboard.expectSenderIdentities();
  });

  test('TC -03 the drawer exposes all 16 admin destinations', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the dashboard');
    const dashboard = new DashboardPage(authedPage);
    await dashboard.open();

    await logStep('Step 02: Verify nav link is visible');
    for (const item of AppShell.NAV_ITEMS) {
      await expect(
        dashboard.shell.navLink(item.label),
        `sidebar item "${item.label}"`,
      ).toBeVisible();
    }
  });

  test('TC-04 every sidebar link points at its module route', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the dashboard');
    const dashboard = new DashboardPage(authedPage);
    await dashboard.open();

    await logStep('Step 02: Read the expected attribute from the dashboard');
    for (const item of AppShell.NAV_ITEMS) {
      const href = await dashboard.shell.navLink(item.label).getAttribute('href');
      expect(href, `href for "${item.label}"`).toContain(item.route.split('?')[0]);
    }
  });

  test('TC-05 Quick Promo CTA opens the express wizard', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the dashboard');
    const dashboard = new DashboardPage(authedPage);
    await dashboard.open();

    await logStep('Step 02: Click the Quick Promo button');
    await dashboard.quickPromoButton.click();

    await logStep('Step 03: Verify authenticated page has the expected URL');
    await expect(authedPage).toHaveURL(/QuickPromo\/Add/);
  });
});
