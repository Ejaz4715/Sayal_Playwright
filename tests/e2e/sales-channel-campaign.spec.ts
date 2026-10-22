import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { DataHelper } from '@helpers/DataHelper';
import { SmsSenders, CampaignChannels, CampaignsPage, ToastMessages } from '@pages/CampaignsPage';

const SERVICE = 'campaigns';
const readServiceData = () => DataHelper.readData().services[SERVICE];

test.describe('Sales communication campaigns', () => {
  test('TC-01 Add new paid sales communication channel campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    const campaignName = `Automation Paid Sales Communication Campaign ${new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14)}`;
    DataHelper.updateServiceData(SERVICE, 'campaignName', campaignName);

    await logStep('Step 02: Verify add campaign button is visible');
    await expect(campaigns.addCampaignButton).toBeVisible();
    await page.waitForTimeout(3000);

    await logStep('Step 03: Add new campaign');
    await campaigns.addCampaignButton.click();

    await logStep('Step 04: Add campaign details, select paid and move to next section');
    await campaigns.fillCampaignTitle(campaignName);
    await campaigns.selectCampaignClient('الشركة الوطنية للاسكان');
    await campaigns.selectCampaignGoal('زيادة الوعي');
    await campaigns.selectCampaignPaymentType('paid');
    await campaigns.fillAgreementNumber('11231');
    await campaigns.clickNextButton();

    await logStep('Step 05: Select channel - sales channel');
    await campaigns.selectChannel(CampaignChannels.SalesCalling);

    await logStep('Step 06: Enter title');
    await campaigns.enterSalesCallingTitle('Test sales channel campaign title');

    await logStep('Step 07: Save channel and validate the toast message');
    await campaigns.clickSaveButton();
    await campaigns.validateToastMessage(ToastMessages.AddedSuccessfully);
    await campaigns.previewCampaign();

    await logStep('Step 08: Navigate to preview campaign and get the campaign number ');
    const campaignNumber = await campaigns.campaignNumber.textContent();
    DataHelper.updateServiceData(SERVICE, 'campaignNumber', campaignNumber);
  });

  test('TC-02 Approve the paid sales communication channel campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const data = readServiceData();
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    await logStep('Step 01: Navigate to campaigns requests page ');
    await campaigns.openTab('standard');

    await logStep('Step 02: Search by campaign request number');
    await campaigns.search(data.campaignNumber);

    await logStep('Step 03: View details of searched campaign');
    await campaigns.openCampaignDetails(data.campaignName);

    await logStep('Step 04: Approve campaign request > Validate the success toast message');
    await campaigns.approveCampaignRequest();
    await campaigns.clickConfirmButton();
    await campaigns.validateToastMessage(ToastMessages.CampaignApprovedSuccessfully);
  });

  test('TC-03 Edit paid sales communication campaign and channel', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const data = readServiceData();
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    await logStep('Step 01: Navigate to campaigns requests page ');
    await campaigns.openTab('standard');

    await logStep('Step 02: Search by campaign request number');
    await campaigns.search(data.campaignNumber);

    await logStep('Step 03: View details of searched campaign');
    await campaigns.openCampaignDetails(data.campaignName);

    await logStep('Step 04: Edit campaign > Validate the success toast message');
    await campaigns.clickEditCampaignButton();
    await campaigns.fillAgreementNumber('11');
    await campaigns.clickSaveButton();
    await campaigns.validateToastMessage(ToastMessages.EditSuccessfully);

    await logStep('Step 05: Edit channel title > Validate the success toast message');
    await campaigns.clickEditChannelButton();
    await campaigns.enterSalesCallingTitle('Test update channel title');
    await campaigns.clickSaveButton();
    await campaigns.validateToastMessage(ToastMessages.EditSuccessfully);
  });

  test('TC-04 Add new unpaid sales communication channel campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    const campaignName = `Automation Unpaid Sales Communication Campaign ${new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14)}`;
    DataHelper.updateServiceData(SERVICE, 'campaignName', campaignName);

    await logStep('Step 02: Verify add campaign button is visible');
    await expect(campaigns.addCampaignButton).toBeVisible();
    await page.waitForTimeout(3000);

    await logStep('Step 03: Add new campaign');
    await campaigns.addCampaignButton.click();

    await logStep('Step 04: Add campaign details, select paid and move to next section');
    await campaigns.fillCampaignTitle(campaignName);
    await campaigns.selectCampaignClient('الشركة الوطنية للاسكان');
    await campaigns.selectCampaignGoal('زيادة الوعي');
    await campaigns.selectCampaignPaymentType('unpaid');
    await campaigns.clickNextButton();

    await logStep('Step 05: Select channel - sales channel');
    await campaigns.selectChannel(CampaignChannels.SalesCalling);

    await logStep('Step 06: Enter title');
    await campaigns.enterSalesCallingTitle('Test sales channel campaign title');

    await logStep('Step 07: Save channel and validate the toast message');
    await campaigns.clickSaveButton();
    await campaigns.validateToastMessage(ToastMessages.AddedSuccessfully);
    await campaigns.previewCampaign();

    await logStep('Step 08: Navigate to preview campaign and get the campaign number ');
    const campaignNumber = await campaigns.campaignNumber.textContent();
    DataHelper.updateServiceData(SERVICE, 'campaignNumber', campaignNumber);
  });

  test('TC-05 Delete unpaid sales communication channel campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const data = readServiceData();
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    await logStep('Step 01: Navigate to campaigns requests page ');
    await campaigns.openTab('standard');

    await logStep('Step 02: Search by campaign request number');
    await campaigns.search(data.campaignNumber);

    await logStep('Step 03: View details of searched campaign');
    await campaigns.openCampaignDetails(data.campaignName);

    await logStep('Step 04: Delete the campaign');
    await campaigns.clickDeleteCampaignButton();
    await campaigns.clickConfirmDeleteCampaignButton();
    await campaigns.validateToastMessage(ToastMessages.DeletedSuccessfully);
  });
});
