import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { AudiencePage } from '@pages/AudiencePage';
import { PublicQuotationPage } from '@pages/PublicQuotationPage';
import { READONLY_FIXTURES } from '@data/testData';
import { DataHelper } from '@helpers/DataHelper';

const SERVICE = 'audience';
const readServiceData = () => DataHelper.readData().services[SERVICE];

test.describe('Audience', () => {
  test('TC-01 Add new audience', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const audience = new AudiencePage(authedPage);
    await audience.open();

    const audienceName = `Automation Test Audience ${new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14)}`;
    DataHelper.updateServiceData(SERVICE, 'audienceName', audienceName);

    await logStep('Step 02: Verify create button is visible');
    await expect(audience.createButton).toBeVisible();

    await logStep('Step 03: Navigate to add new audience');
    await audience.createButton.click();
    await page.waitForTimeout(3000);
    await audience.nameField.fill(audienceName);
    await audience.descriptionField.fill('Test audience description');

    await logStep('Step 04: Select city');
    await audience.selectCity('الرياض');

    await logStep('Step 05: Select gender');
    await audience.selectGender('ذكر');

    await logStep('Step 06: Select social security status');
    await audience.selectSocialSecurity('نعم');

    await logStep('Step 07: Select income range');
    await audience.selectIncome('3000-5999');

    await logStep('Step 08: Select contract status');
    await audience.selectContractStatus('وقعت');

    await logStep('Step 09: Select Sakani eligibility status');
    await audience.selectSakaniEligibility('مستحق');

    await logStep('Step 10: Select preference');
    await audience.selectPreference('وحدات تحت الإنشاء');

    await logStep('Step 11: Select family size');
    await audience.selectFamilySize('1-4');

    await logStep('Step 12: Select age range');
    await audience.selectAge('40-44');

    await logStep('Step 13: Select profession');
    await audience.selectProfession('قطاع حكومي');

    await logStep('Step 14: Select engineering design status');
    await audience.selectEngineeringDesign('نعم');

    await logStep('Step 15: Select building permit status');
    await audience.selectBuildingPermit('لا يملك رخصة');

    await logStep('Step 16: Select current residence');
    await audience.selectCurrentResidence('الباحة');

    await logStep('Step 17: Select new property location');
    await audience.selectNewPropertyLocation('جدة');

    await logStep('Step 18: Select marital status');
    await audience.selectMaritalStatus('زوجة واحدة');

    await logStep('Step 19: Save the audience and validate the success message');
    await audience.saveButton.click();
    await page.waitForTimeout(10000);
  });

  test('TC-02 Delete the audience', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const data = readServiceData();

    let audience = new AudiencePage(authedPage);
    await audience.open();

    await logStep('Step 02: Verify create button is visible');
    await expect(audience.createButton).toBeVisible();
    await page.waitForTimeout(3000);

    await logStep('Step 03: Delete the audience');
    await audience.deleteAudienceIcon(data.audienceName).click();
    await audience.confirmDeleteButton.click();

    await logStep('Step 04: Validate the successeful delete message is present');
    await expect(audience.audienceDeletedSuccessMessage, 'Audience deleted message is not present').toBeVisible({ timeout: 20000 });
  });
});
