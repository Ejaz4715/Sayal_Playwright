import { test, expect } from '@fixtures/pages.fixture';
import { ClientsPage } from '@pages/ClientsPage';
import { ClientDetailPage } from '@pages/ClientDetailPage';
import { READONLY_FIXTURES, CLIENT_SECTORS, autoName } from '@data/testData';

const CLIENT = READONLY_FIXTURES.client;

test.describe('Clients', () => {
  test('SAYAL-CLI-001 client list renders its 6 columns @smoke @P1', async ({ authedPage }) => {
    const clients = new ClientsPage(authedPage);
    await clients.open();

    await clients.expectColumns();
    await clients.expectHasRows();
  });

  test('SAYAL-GAP-003 filter narrows the list and reset restores it @P2', async ({ authedPage }) => {
    const clients = new ClientsPage(authedPage);
    await clients.open();

    const baseline = await clients.table.rowCount();
    expect(baseline, 'a populated list is needed to filter').toBeGreaterThan(1);

    await clients.openFilterPanel();
    await clients.companyNameFilter.fill('NHC');
    await clients.applyFilter();

    const filtered = await clients.table.rowCount();
    expect(filtered, 'filtering must narrow the result set').toBeLessThan(baseline);
    for (const name of await clients.companyNames()) {
      expect(name.toUpperCase()).toContain('NHC');
    }

    await clients.resetFilter();
    await expect(clients.table.rows).toHaveCount(baseline);
  });

  test('filtering on a value that matches nothing yields an empty list @P2', async ({
    authedPage,
  }) => {
    const clients = new ClientsPage(authedPage);
    await clients.open();

    await clients.openFilterPanel();
    await clients.companyNameFilter.fill(autoName('NO_SUCH_COMPANY'));
    await clients.applyFilter();

    await clients.table.expectEmpty();
  });

  test('SAYAL-GAP-001 client detail renders the stored CR and VAT in full @P1', async ({
    authedPage,
  }) => {
    const detail = new ClientDetailPage(authedPage);
    await detail.openDetail(CLIENT.uuid);

    /* The detail page shows values the Add form's maxlength=10 cannot accept —
       this is the evidence that display and entry disagree (ISS-02 / ISS-03). */
    await detail.expectDisplayedValue(CLIENT.crNumber);
    await detail.expectDisplayedValue(CLIENT.vatNumber);
    await detail.expectDisplayedValue(CLIENT.companyName);

    await expect(detail.tabs).toHaveCount(4);
  });

  test('client edit form prefills the full stored CR and VAT despite maxlength=10 @P1', async ({
    authedPage,
  }) => {
    const detail = new ClientDetailPage(authedPage);
    await detail.openEdit(CLIENT.uuid);

    /* `maxlength` constrains typing only, never a programmatically-set value —
       which is precisely why a no-op save cannot silently truncate. */
    await expect(detail.field('cr_number')).toHaveAttribute('maxlength', '10');
    await expect(detail.field('cr_number')).toHaveValue(CLIENT.crNumber);
    await expect(detail.field('tax_registration_number')).toHaveAttribute('maxlength', '10');
    await expect(detail.field('tax_registration_number')).toHaveValue(CLIENT.vatNumber);
  });

  test('SAYAL-CLI-004/005 add form caps CR and VAT at 10 characters @known-defect @P1', async ({
    authedPage,
  }) => {
    test.fail(
      true,
      'ISS-02/ISS-03: a 15-digit Saudi VAT and the 14-digit CR already in the data cannot be entered',
    );

    const detail = new ClientDetailPage(authedPage);
    await detail.gotoAdd();

    await detail.field('tax_registration_number').fill('300000000000003');
    await expect(
      detail.field('tax_registration_number'),
      'a real 15-digit Saudi VAT number must be storable',
    ).toHaveValue('300000000000003');
  });

  test('SAYAL-CLI-008 sector dropdown offers all 12 options @P2', async ({ authedPage }) => {
    const detail = new ClientDetailPage(authedPage);
    await detail.openEdit(CLIENT.uuid);

    /* The sector list is fetched from /api/industries/get-industries, so the
       select starts with only its placeholder. Wait for it to populate rather
       than reading a half-built control. */
    const sectorOptions = authedPage.locator('select option');
    await expect(sectorOptions).toHaveCount(CLIENT_SECTORS.length + 1);

    const options = await sectorOptions.allInnerTexts();
    const trimmed = options.map((o) => o.trim()).filter(Boolean);
    for (const sector of CLIENT_SECTORS) {
      expect(trimmed, `sector "${sector}"`).toContain(sector);
    }
  });
});
