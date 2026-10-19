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
});
