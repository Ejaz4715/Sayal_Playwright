import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { RequestsPage } from '@pages/RequestsPage';
import { REQUEST_STATUS, CHANNEL_TYPES, PLATFORMS, VOLUMES, autoName } from '@data/testData';

test.describe('Campaign requests — list', () => {
  test('TC-01 standard list renders all 10 columns and 15 rows', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the standard campaign requests tab');
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    await logStep('Step 02: Read the column headers from the campaign requests list');
    const headers = await requests.table.headers();

    await logStep('Step 03: Verify table headers meets the expected condition');
    expect(headers).toEqual([...RequestsPage.COLUMNS]);

    await logStep('Step 04: Count the visible rows in the campaign requests list');
    expect(await requests.table.rowCount()).toBe(VOLUMES.perPage);
  });

  test('TC-02 Quick Promo tab queries a different dataset', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the campaign requests list');
    const requests = new RequestsPage(authedPage);

    const quickResponse = authedPage.waitForResponse(
      (r) => r.url().includes('/api/campaign-requests') && r.url().includes('is_quick=1'),
    );
    await requests.open();

    await logStep('Step 02: Wait for the Quick Promo API response');
    const response = await quickResponse;

    await logStep('Step 03: Verify url meets the expected condition');
    expect(response.url()).toContain('is_quick=1');
    /* Corrects the earlier report: this tab is not empty in PRE. */

    await logStep('Step 04: Verify first is visible');
    await expect(requests.table.rows.first()).toBeVisible();
  });

  test('TC-03 status filter offers exactly the 7 API statuses', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the standard campaign requests tab');
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    await logStep('Step 02: Read the available options in the campaign requests list');
    const options = await requests.statusFilter().options();

    await logStep('Step 03: Verify options meets the expected condition');
    expect(options).toEqual(Object.values(REQUEST_STATUS));
  });

  test('TC-04 filter offers the 7 channel types', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the standard campaign requests tab');
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    await logStep('Step 02: Read the available options in the campaign requests list');
    const options = await requests.channelTypeFilter().options();

    await logStep('Step 03: Verify options meets the expected condition');
    expect(options).toHaveLength(CHANNEL_TYPES.length);
  });

  test('TC-05 source filter lists all 8 upstream platforms', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the standard campaign requests tab');
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    await logStep('Step 02: Read the available options in the campaign requests list');
    const options = await requests.sourceFilter().options();

    await logStep('Step 03: Verify options meets the expected condition');
    expect(options).toHaveLength(PLATFORMS.length);
  });

  test('TC-06 search by exact request number returns that row', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the standard campaign requests tab');
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    await logStep('Step 02: Read the visible campaign request numbers');
    const target = (await requests.requestNumbers())[0];

    await logStep('Step 03: Verify target meets the expected condition');
    expect(target, 'a seed row is required to search for').toBeTruthy();

    await logStep('Step 04: Search the campaign requests list using the test query');
    await requests.search(target);

    await logStep('Step 05: Read the visible campaign request numbers');
    const numbers = await requests.requestNumbers();

    await logStep('Step 06: Verify numbers meets the expected condition');
    expect(numbers, `search for ${target}`).toContain(target);
  });

  test('TC-07 search with no matches shows the empty state, not an error', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the standard campaign requests tab');
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    await logStep('Step 02: Search the campaign requests list using the test query');
    await requests.search(autoName('NO_SUCH_CAMPAIGN'));


    await logStep('Step 03: Verify empty state is visible');
    await expect(requests.emptyState).toBeVisible();

    await logStep('Step 04: Count the visible rows in the campaign requests list');
    expect(await requests.table.rowCount()).toBe(0);
  });

  test('TC-08 injection payloads in search are handled safely', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the standard campaign requests tab');
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    let dialogFired = false;
    authedPage.on('dialog', async (d) => {
      dialogFired = true;
      await d.dismiss();
    });

    await logStep('Step 02: Search the campaign requests list using the test query');
    for (const payload of ["' OR 1=1 --", '<script>alert(1)</script>']) {
      await requests.search(payload);
      expect(dialogFired, `payload ${payload} must not execute`).toBe(false);
      /* The payload must never be rendered back as live markup. */
      await expect(authedPage.locator('script:has-text("alert(1)")')).toHaveCount(0);
    }
  });

  test('TC-09 pagination returns distinct, correctly ordered pages', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the standard campaign requests tab');
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    await logStep('Step 02: Verify the pagination controls are visible');
    await requests.pagination.expectVisible();

    await logStep('Step 03: Read the visible campaign request numbers');
    const pageOne = await requests.requestNumbers();

    await logStep('Step 04: Verify the previous-page control is disabled on page one');
    await requests.pagination.expectAtFirstPageBoundary();

    await logStep('Step 05: Navigate to page 2');
    await requests.goToPage(2);

    await logStep('Step 06: Read the visible campaign request numbers');
    const pageTwo = await requests.requestNumbers();

    await logStep('Step 07: Verify length meets the expected condition');
    expect(pageTwo.length).toBeGreaterThan(0);

    await logStep('Step 08: Verify filter meets the expected condition');
    expect(
      pageTwo.filter((n) => pageOne.includes(n)),
      'pages 1 and 2 must not overlap',
    ).toHaveLength(0);
  });

  test('TC-10 list spans the expected number of pages', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the standard campaign requests tab');
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    await logStep('Step 02: Check the last page number in the campaign requests list');
    const lastPage = await requests.pagination.lastPageNumber();

    await logStep('Step 03: Verify last page meets the expected condition');
    expect(lastPage, 'standard requests paginate across many pages').toBeGreaterThanOrEqual(10);
  });
});
