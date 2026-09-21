import { test, expect } from '@fixtures/pages.fixture';
import { DashboardPage } from '@pages/DashboardPage';
import { AppShell } from '@components/AppShell';

test.describe('Dashboard', () => {
  test('SAYAL-DASH-001 all six widgets and the calendar render @smoke @P0', async ({
    authedPage,
  }) => {
    const dashboard = new DashboardPage(authedPage);
    await dashboard.open();

    await expect(dashboard.calendar).toBeVisible();
    await dashboard.expectAllWidgets();
  });

  test('SAYAL-DASH-001b sender-identity widget lists the nine registered identities @P2', async ({
    authedPage,
  }) => {
    const dashboard = new DashboardPage(authedPage);
    await dashboard.open();
    await dashboard.expectSenderIdentities();
  });

  test('SAYAL-NAV-001 the drawer exposes all 16 admin destinations @smoke @P0', async ({
    authedPage,
  }) => {
    const dashboard = new DashboardPage(authedPage);
    await dashboard.open();

    for (const item of AppShell.NAV_ITEMS) {
      await expect(
        dashboard.shell.navLink(item.label),
        `sidebar item "${item.label}"`,
      ).toBeVisible();
    }
  });

  test('SAYAL-NAV-003 every sidebar link points at its module route @P0', async ({ authedPage }) => {
    const dashboard = new DashboardPage(authedPage);
    await dashboard.open();

    for (const item of AppShell.NAV_ITEMS) {
      const href = await dashboard.shell.navLink(item.label).getAttribute('href');
      expect(href, `href for "${item.label}"`).toContain(item.route.split('?')[0]);
    }
  });

  test('SAYAL-DASH-004 Quick Promo CTA opens the express wizard @P1', async ({ authedPage }) => {
    const dashboard = new DashboardPage(authedPage);
    await dashboard.open();

    await dashboard.quickPromoButton.click();
    await expect(authedPage).toHaveURL(/QuickPromo\/Add/);
  });
});
