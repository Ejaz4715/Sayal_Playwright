import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { AudiencePage } from '@pages/AudiencePage';
import { PublicQuotationPage } from '@pages/PublicQuotationPage';
import { READONLY_FIXTURES } from '@data/testData';

test.describe('Audience', () => {
  test('TC-01 Empty state guides the user to create', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {
    await logStep('Step 01: Open the audience page');
    const audience = new AudiencePage(authedPage);
    await audience.open();

    await logStep('Step 02: Verify empty-state heading is visible');
    await expect(audience.emptyStateHeading).toBeVisible();

    await logStep('Step 03: Verify empty-state call to action is visible');
    await expect(audience.emptyStateCta).toBeVisible();

    await logStep('Step 04: Verify create button is visible');
    await expect(audience.createButton).toBeVisible();
  });

  test('TC-02 The builder offers the active targeting filters', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {
    await logStep('Step 01: Open the audience builder');
    const audience = new AudiencePage(authedPage);
    await audience.openBuilder();

    await logStep('Step 02: Verify name field is visible');
    await expect(audience.nameField).toBeVisible();

    await logStep('Step 03: Verify description field is visible');
    await expect(audience.descriptionField).toBeVisible();

    await logStep('Step 04: Verify the filter option is available in the audience builder');
    for (const filter of AudiencePage.BUILDER_FILTERS) {
      await audience.expectFilterOffered(filter);
    }
  });

  test('TC-03 The builder requests the active filter set for its platform', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {
    await logStep('Step 01: Open the audience builder');
    const audience = new AudiencePage(authedPage);

    const activeFilters = authedPage.waitForResponse((r) => r.url().includes('/api/filters/get-active-filters/') && r.status() === 200, { timeout: 60_000 });
    await audience.openBuilder();

    await logStep('Step 02: Wait for the active-filters API response');
    const response = await activeFilters;

    await logStep('Step 03: Verify url meets the expected condition');
    expect(response.url()).toMatch(/get-active-filters\/\d+/);
  });
});

test.describe('Public quotation page', () => {
  test('TC-04 Canonical public URL renders without a session', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ page }) => {
    await logStep('Step 01: Clear browser cookies to start without a session');
    /* Deliberately on a bare page: the point of this route is that it works
       with no authentication at all. */
    await page.context().clearCookies();
    const quotation = new PublicQuotationPage(page);

    await logStep('Step 02: Open the public quotation using the supplied token');
    await quotation.openWithToken(READONLY_FIXTURES.quotationToken);

    await logStep('Step 03: Verify the public quotation is rendered');
    await quotation.expectRendered();

    await logStep('Step 04: Verify page has the expected URL');
    await expect(page).not.toHaveURL(/\/auth\/Login/);
  });

  test('TC-05 An invalid token does not render a quotation', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ page }) => {
    await logStep('Step 01: Clear browser cookies before checking the invalid token');
    await page.context().clearCookies();
    const quotation = new PublicQuotationPage(page);

    await logStep('Step 02: Open the public quotation using the supplied token');
    await quotation.openWithToken('INVALID123');

    await logStep('Step 03: Verify client info tab is hidden');
    await expect(quotation.clientInfoTab, 'an unknown token must not render client data').toBeHidden();
  });

  test('TC-03 Audience filters', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    let audience = new AudiencePage(authedPage);
    await audience.open();

    await logStep('Step 02: Verify create button is visible');
    await expect(audience.createButton).toBeVisible();

    await logStep('Step 03: Apply filter platform (Ejar tenant)');
    await audience.filtersButton.click();
    await audience.platformFilterOption('منصة إيجار - مستأجر').click();

    await logStep('Step 04: Apply filter platform (Sakani)');
    await audience.filtersButton.click();
    await audience.platformFilterOption('منصة سكني').click();

    await logStep('Step 05: Apply filter platform (Ejar lessor)');
    await audience.filtersButton.click();
    await audience.platformFilterOption('منصة إيجار - مؤجر').click();

    await logStep('Step 06: Apply filter platform (Ejar broker)');
    await audience.filtersButton.click();
    await audience.platformFilterOption('منصة إيجار - وسيط عقاري').click();

    await logStep('Step 07: Apply filter platform (Comprehensive data)');
    await audience.filtersButton.click();
    await audience.platformFilterOption('البيانات الشامله').click();
  });
});
