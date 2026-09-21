import { test, expect } from '@fixtures/pages.fixture';
import { PermissionsPage } from '@pages/PermissionsPage';
import { GeneralSettingsPage } from '@pages/GeneralSettingsPage';

test.describe('Roles and permissions', () => {
  test('SAYAL-ROLE-001 permissions screen exposes both tabs and the roles grid @P1', async ({
    authedPage,
  }) => {
    const permissions = new PermissionsPage(authedPage);
    await permissions.open();

    const headers = await permissions.table.headers();
    expect(headers).toEqual([...PermissionsPage.ROLE_COLUMNS]);
    await expect(permissions.addRoleButton).toBeVisible();
  });

  test('SAYAL-GAP-008 permission catalogue is grouped by screen @P1', async ({ authedPage }) => {
    const permissions = new PermissionsPage(authedPage);
    await permissions.open();
    await permissions.openPermissionsTab();

    const headers = await permissions.table.headers();
    expect(headers).toEqual([...PermissionsPage.PERMISSION_COLUMNS]);

    const screens = await permissions.permissionScreens();
    /* The catalogue spans 15 screen groups — one more than the Add Role matrix
       was previously believed to offer. */
    for (const screen of PermissionsPage.PERMISSION_SCREENS) {
      expect(screens, `permission screen group "${screen}"`).toContain(screen);
    }
  });

  test('every permission in the catalogue is active @P2', async ({ authedPage }) => {
    const permissions = new PermissionsPage(authedPage);
    await permissions.open();
    await permissions.openPermissionsTab();

    const rows = await permissions.table.allRowTexts();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row[2]?.trim(), `state of permission "${row[0]} / ${row[1]}"`).toBe('فعال');
    }
  });
});

test.describe('General settings', () => {
  test('SAYAL-SET-001 settings load with the five governing parameters @P1', async ({
    authedPage,
  }) => {
    const settings = new GeneralSettingsPage(authedPage);
    await settings.open();

    /* These values are the source of truth other modules assert against, so a
       drift here should fail loudly rather than quietly move expectations. */
    await settings.expectGoverningValues();
    await expect(settings.saveButton).toBeVisible();
  });

  test('SAYAL-SET-004 validity fields are capped at 3 characters @P3', async ({ authedPage }) => {
    const settings = new GeneralSettingsPage(authedPage);
    await settings.open();

    await expect(settings.quotationValidity).toHaveAttribute('maxlength', '3');
    await expect(settings.invoiceValidity).toHaveAttribute('maxlength', '3');
    await expect(settings.minAudienceCount).toHaveAttribute('maxlength', '7');
  });
});
