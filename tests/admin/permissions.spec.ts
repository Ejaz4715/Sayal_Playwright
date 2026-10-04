import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { PermissionsPage } from '@pages/PermissionsPage';
import { GeneralSettingsPage } from '@pages/GeneralSettingsPage';

test.describe('Roles and permissions', () => {
  test('TC-01 Permissions screen exposes both tabs and the roles grid', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the permissions page');
    const permissions = new PermissionsPage(authedPage);
    await permissions.open();

    await logStep('Step 02: Read the column headers from the permissions page');
    const headers = await permissions.table.headers();

    await logStep('Step 03: Verify table headers meets the expected condition');
    expect(headers).toEqual([...PermissionsPage.ROLE_COLUMNS]);

    await logStep('Step 04: Verify add role button is visible');
    await expect(permissions.addRoleButton).toBeVisible();
  });

  test('TC-02 Permission catalogue is grouped by screen', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the permissions page');
    const permissions = new PermissionsPage(authedPage);
    await permissions.open();

    await logStep('Step 02: Open the permissions tab');
    await permissions.openPermissionsTab();

    await logStep('Step 03: Read the column headers from the permissions page');
    const headers = await permissions.table.headers();

    await logStep('Step 04: Verify table headers meets the expected condition');
    expect(headers).toEqual([...PermissionsPage.PERMISSION_COLUMNS]);

    await logStep('Step 05: Read the permission screen groups');
    const screens = await permissions.permissionScreens();
    /* The catalogue spans 15 screen groups — one more than the Add Role matrix
       was previously believed to offer. */

    await logStep('Step 06: Verify screens meets the expected condition');
    for (const screen of PermissionsPage.PERMISSION_SCREENS) {
      expect(screens, `permission screen group "${screen}"`).toContain(screen);
    }
  });

  test('TC-03 Every permission in the catalogue is active', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the permissions page');
    const permissions = new PermissionsPage(authedPage);
    await permissions.open();

    await logStep('Step 02: Open the permissions tab');
    await permissions.openPermissionsTab();

    await logStep('Step 03: Read all rows from the permissions page');
    const rows = await permissions.table.allRowTexts();

    await logStep('Step 04: Verify length meets the expected condition');
    expect(rows.length).toBeGreaterThan(0);

    await logStep('Step 05: Verify trim meets the expected condition');
    for (const row of rows) {
      expect(row[2]?.trim(), `state of permission "${row[0]} / ${row[1]}"`).toBe('فعال');
    }
  });
});

test.describe('General settings', () => {
  test('TC-04 Settings load with the five governing parameters', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the general settings page');
    const settings = new GeneralSettingsPage(authedPage);
    await settings.open();

    /* These values are the source of truth other modules assert against, so a
       drift here should fail loudly rather than quietly move expectations. */

    await logStep('Step 02: Verify expect governing values on the general settings page');
    await settings.expectGoverningValues();

    await logStep('Step 03: Verify save button is visible');
    await expect(settings.saveButton).toBeVisible();
  });

  test('TC-05 Validity fields are capped at 3 characters', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the general settings page');
    const settings = new GeneralSettingsPage(authedPage);
    await settings.open();

    await logStep('Step 02: Verify quotation validity has the expected attribute');
    await expect(settings.quotationValidity).toHaveAttribute('maxlength', '3');

    await logStep('Step 03: Verify invoice validity has the expected attribute');
    await expect(settings.invoiceValidity).toHaveAttribute('maxlength', '3');

    await logStep('Step 04: Verify min audience count has the expected attribute');
    await expect(settings.minAudienceCount).toHaveAttribute('maxlength', '7');
  });
});
