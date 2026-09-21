import { test, expect } from '@fixtures/pages.fixture';
import { AudiencePage } from '@pages/AudiencePage';
import { PublicQuotationPage } from '@pages/PublicQuotationPage';
import { READONLY_FIXTURES } from '@data/testData';

test.describe('Audience', () => {
  test('SAYAL-AUD-001 empty state guides the user to create @P1', async ({ authedPage }) => {
    const audience = new AudiencePage(authedPage);
    await audience.open();

    await expect(audience.emptyStateHeading).toBeVisible();
    await expect(audience.emptyStateCta).toBeVisible();
    await expect(audience.createButton).toBeVisible();
  });

  test('SAYAL-GAP-011 the builder offers the active targeting filters @P1', async ({
    authedPage,
  }) => {
    const audience = new AudiencePage(authedPage);
    await audience.openBuilder();

    await expect(audience.nameField).toBeVisible();
    await expect(audience.descriptionField).toBeVisible();

    for (const filter of AudiencePage.BUILDER_FILTERS) {
      await audience.expectFilterOffered(filter);
    }
  });

  test('the builder requests the active filter set for its platform @P2', async ({ authedPage }) => {
    const audience = new AudiencePage(authedPage);

    const activeFilters = authedPage.waitForResponse(
      (r) => r.url().includes('/api/filters/get-active-filters/') && r.status() === 200,
      { timeout: 60_000 },
    );
    await audience.openBuilder();
    const response = await activeFilters;

    expect(response.url()).toMatch(/get-active-filters\/\d+/);
  });
});

test.describe('Public quotation page', () => {
  test('SAYAL-PUB-002 canonical public URL renders without a session @P0', async ({ page }) => {
    /* Deliberately on a bare page: the point of this route is that it works
       with no authentication at all. */
    await page.context().clearCookies();
    const quotation = new PublicQuotationPage(page);
    await quotation.openWithToken(READONLY_FIXTURES.quotationToken);

    await quotation.expectRendered();
    await expect(page).not.toHaveURL(/\/auth\/Login/);
  });

  test('SAYAL-PUB-003 an invalid token does not render a quotation @P1', async ({ page }) => {
    await page.context().clearCookies();
    const quotation = new PublicQuotationPage(page);
    await quotation.openWithToken('INVALID123');

    await expect(
      quotation.clientInfoTab,
      'an unknown token must not render client data',
    ).toBeHidden();
  });
});
