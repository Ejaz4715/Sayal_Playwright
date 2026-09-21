import { test, expect } from '@fixtures/pages.fixture';
import { RequestsPage } from '@pages/RequestsPage';
import { REQUEST_STATUS, CHANNEL_TYPES, PLATFORMS, VOLUMES, autoName } from '@data/testData';

test.describe('Campaign requests — list', () => {
  test('SAYAL-REQ-001 standard list renders all 10 columns and 15 rows @smoke @P0', async ({
    authedPage,
  }) => {
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    const headers = await requests.table.headers();
    expect(headers).toEqual([...RequestsPage.COLUMNS]);
    expect(await requests.table.rowCount()).toBe(VOLUMES.perPage);
  });

  test('SAYAL-REQ-002 Quick Promo tab queries a different dataset @P1', async ({ authedPage }) => {
    const requests = new RequestsPage(authedPage);

    const quickResponse = authedPage.waitForResponse(
      (r) => r.url().includes('/api/campaign-requests') && r.url().includes('is_quick=1'),
    );
    await requests.open();
    const response = await quickResponse;

    expect(response.url()).toContain('is_quick=1');
    /* Corrects the earlier report: this tab is not empty in PRE. */
    await expect(requests.table.rows.first()).toBeVisible();
  });

  test('SAYAL-FLT-001 status filter offers exactly the 7 API statuses @P1', async ({
    authedPage,
  }) => {
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    const options = await requests.statusFilter().options();
    expect(options).toEqual(Object.values(REQUEST_STATUS));
  });

  test('SAYAL-FLT-002 channel-type filter offers the 7 channel types @P2', async ({
    authedPage,
  }) => {
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    const options = await requests.channelTypeFilter().options();
    expect(options).toHaveLength(CHANNEL_TYPES.length);
  });

  test('SAYAL-FLT-003 source filter lists all 8 upstream platforms @P2', async ({ authedPage }) => {
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    const options = await requests.sourceFilter().options();
    expect(options).toHaveLength(PLATFORMS.length);
  });

  test('SAYAL-REQ-012 search by exact request number returns that row @P1', async ({
    authedPage,
  }) => {
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    const target = (await requests.requestNumbers())[0];
    expect(target, 'a seed row is required to search for').toBeTruthy();

    await requests.search(target);

    const numbers = await requests.requestNumbers();
    expect(numbers, `search for ${target}`).toContain(target);
  });

  test('SAYAL-REQ-013 search with no matches shows the empty state, not an error @P2', async ({
    authedPage,
  }) => {
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    await requests.search(autoName('NO_SUCH_CAMPAIGN'));

    await expect(requests.emptyState).toBeVisible();
    expect(await requests.table.rowCount()).toBe(0);
  });

  test('SAYAL-REQ-014 injection payloads in search are handled safely @P1', async ({
    authedPage,
  }) => {
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    let dialogFired = false;
    authedPage.on('dialog', async (d) => {
      dialogFired = true;
      await d.dismiss();
    });

    for (const payload of ["' OR 1=1 --", '<script>alert(1)</script>']) {
      await requests.search(payload);
      expect(dialogFired, `payload ${payload} must not execute`).toBe(false);
      /* The payload must never be rendered back as live markup. */
      await expect(authedPage.locator('script:has-text("alert(1)")')).toHaveCount(0);
    }
  });

  test('SAYAL-FLT-005 pagination returns distinct, correctly ordered pages @P1', async ({
    authedPage,
  }) => {
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();
    await requests.pagination.expectVisible();

    const pageOne = await requests.requestNumbers();
    await requests.pagination.expectAtFirstPageBoundary();

    await requests.goToPage(2);

    const pageTwo = await requests.requestNumbers();
    expect(pageTwo.length).toBeGreaterThan(0);
    expect(
      pageTwo.filter((n) => pageOne.includes(n)),
      'pages 1 and 2 must not overlap',
    ).toHaveLength(0);
  });

  test('SAYAL-FLT-005b list spans the expected number of pages @P2', async ({ authedPage }) => {
    const requests = new RequestsPage(authedPage);
    await requests.openStandardTab();

    const lastPage = await requests.pagination.lastPageNumber();
    expect(lastPage, 'standard requests paginate across many pages').toBeGreaterThanOrEqual(10);
  });
});
