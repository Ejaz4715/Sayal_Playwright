import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { ClientsPage } from '@pages/ClientsPage';
import { ClientDetailPage } from '@pages/ClientDetailPage';
import { READONLY_FIXTURES, CLIENT_SECTORS, autoName } from '@data/testData';

const CLIENT = READONLY_FIXTURES.client;

test.describe('Clients', () => {
  test('TC-01 client list renders its 6 columns', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the clients list');
    const clients = new ClientsPage(authedPage);
    await clients.open();

    await logStep('Step 02: Verify the clients list column headers');
    await clients.expectColumns();

    await logStep('Step 03: Verify the clients list contains records');
    await clients.expectHasRows();
  });

  test('TC-02 filter narrows the list and reset restores it', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the clients list');
    const clients = new ClientsPage(authedPage);
    await clients.open();

    await logStep('Step 02: Count the visible rows in the clients list');
    const baseline = await clients.table.rowCount();

    await logStep('Step 03: Verify baseline meets the expected condition');
    expect(baseline, 'a populated list is needed to filter').toBeGreaterThan(1);

    await logStep('Step 04: Open the client filters panel');
    await clients.openFilterPanel();

    await logStep('Step 05: Enter a value in the company name filter');
    await clients.companyNameFilter.fill('NHC');

    await logStep('Step 06: Apply the selected client filters');
    await clients.applyFilter();

    await logStep('Step 07: Count the visible rows in the clients list');
    const filtered = await clients.table.rowCount();

    await logStep('Step 08: Verify filtered meets the expected condition');
    expect(filtered, 'filtering must narrow the result set').toBeLessThan(baseline);

    await logStep('Step 09: Read the visible company names');
    for (const name of await clients.companyNames()) {
      expect(name.toUpperCase()).toContain('NHC');
    }

    await logStep('Step 10: Reset client filters to restore the full list');
    await clients.resetFilter();

    await logStep('Step 11: Verify rows has the expected count');
    await expect(clients.table.rows).toHaveCount(baseline);
  });

  test('TC-03 filtering on a value that matches nothing yields an empty list', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the clients list');
    const clients = new ClientsPage(authedPage);
    await clients.open();

    await logStep('Step 02: Open the client filters panel');
    await clients.openFilterPanel();

    await logStep('Step 03: Enter a value in the company name filter');
    await clients.companyNameFilter.fill(autoName('NO_SUCH_COMPANY'));

    await logStep('Step 04: Apply the selected client filters');
    await clients.applyFilter();

    await logStep('Step 05: Verify expect empty on the clients list');
    await clients.table.expectEmpty();
  });

  test('TC-04 client detail renders the stored CR and VAT in full', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the client detail page');
    const detail = new ClientDetailPage(authedPage);
    await detail.openDetail(CLIENT.uuid);

    /* The detail page shows values the Add form's maxlength=10 cannot accept —
       this is the evidence that display and entry disagree (ISS-02 / ISS-03). */

    await logStep('Step 02: Verify expect displayed value on the request detail page');
    await detail.expectDisplayedValue(CLIENT.crNumber);

    await logStep('Step 03: Verify expect displayed value on the request detail page');
    await detail.expectDisplayedValue(CLIENT.vatNumber);

    await logStep('Step 04: Verify expect displayed value on the request detail page');
    await detail.expectDisplayedValue(CLIENT.companyName);

    await logStep('Step 05: Verify tabs has the expected count');
    await expect(detail.tabs).toHaveCount(4);
  });

  test('TC-05 client edit form prefills the full stored CR and VAT despite maxlength=10', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the request detail page edit form');
    const detail = new ClientDetailPage(authedPage);
    await detail.openEdit(CLIENT.uuid);

    /* `maxlength` constrains typing only, never a programmatically-set value —
       which is precisely why a no-op save cannot silently truncate. */

    await logStep('Step 02: Verify field has the expected attribute');
    await expect(detail.field('cr_number')).toHaveAttribute('maxlength', '10');

    await logStep('Step 03: Verify field has the expected value');
    await expect(detail.field('cr_number')).toHaveValue(CLIENT.crNumber);

    await logStep('Step 04: Verify field has the expected attribute');
    await expect(detail.field('tax_registration_number')).toHaveAttribute('maxlength', '10');

    await logStep('Step 05: Verify field has the expected value');
    await expect(detail.field('tax_registration_number')).toHaveValue(CLIENT.vatNumber);
  });

  test('TC-06 Add form caps CR and VAT at 10 characters', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the client add form');
    test.fail(
      true,
      'ISS-02/ISS-03: a 15-digit Saudi VAT and the 14-digit CR already in the data cannot be entered',
    );

    const detail = new ClientDetailPage(authedPage);
    await detail.gotoAdd();

    await logStep('Step 02: Enter a value in the field');
    await detail.field('tax_registration_number').fill('300000000000003');

    await logStep('Step 03: Verify field has the expected value');
    await expect(
      detail.field('tax_registration_number'),
      'a real 15-digit Saudi VAT number must be storable',
    ).toHaveValue('300000000000003');
  });

  test('TC-07 sector dropdown offers all 12 options', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the request detail page edit form');
    const detail = new ClientDetailPage(authedPage);
    await detail.openEdit(CLIENT.uuid);

    /* The sector list is fetched from /api/industries/get-industries, so the
       select starts with only its placeholder. Wait for it to populate rather
       than reading a half-built control. */
    const sectorOptions = authedPage.locator('select option');

    await logStep('Step 02: Verify sector options has the expected count');
    await expect(sectorOptions).toHaveCount(CLIENT_SECTORS.length + 1);

    await logStep('Step 03: Read displayed text from the sector options');
    const options = await sectorOptions.allInnerTexts();
    const trimmed = options.map((o) => o.trim()).filter(Boolean);

    await logStep('Step 04: Verify trimmed meets the expected condition');
    for (const sector of CLIENT_SECTORS) {
      expect(trimmed, `sector "${sector}"`).toContain(sector);
    }
  });

  test('TC-08 an existing client can be saved without inventing address data', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage, page,
  }) => {

    await logStep('Step 01: Open the request detail page edit form');
    const detail = new ClientDetailPage(authedPage);
    await detail.openEdit(READONLY_FIXTURES.client.uuid);

    await logStep('Step 02: Verify field has the expected value');
    await expect(detail.field('cr_number')).toHaveValue(READONLY_FIXTURES.client.crNumber);

    await logStep('Step 03: Verify save button is visible');
    await expect(detail.saveButton).toBeVisible();
    const writes: string[] = [];

    await logStep('Step 04: Navigate directly to the report tab URL');
    await authedPage.route('**/api/clients**', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') return route.continue();
      /* Record the attempt and abort it — this test must never mutate PRE. */
      writes.push(request.method());
      await route.abort();
    });

    await logStep('Step 05: Click the save button');
    await detail.saveButton.click();

    await logStep('Step 06: Verify expected condition exceeds the expected threshold');
    await expect
      .poll(() => writes.length, {
        message: 'saving an unchanged client must issue a request',
        timeout: 10_000,
      })
      .toBeGreaterThan(0);
  });
});
