import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { DataHelper } from '@helpers/DataHelper';
import { SmsSenders, CampaignChannels, CampaignsPage, ToastMessages } from '@pages/CampaignsPage';

const SERVICE = 'campaigns';
const readServiceData = () => DataHelper.readData().services[SERVICE];

test.describe('SMS campaigns', () => {
  test('TC-01 Add new paid SMS channel campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    const campaignName = `Automation Paid SMS Campaign ${new Date()
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

    await logStep('Step 05: Select channel - Banner');
    await campaigns.selectChannel(CampaignChannels.SMS);

    await logStep('Step 06: Select audience and add the details of sms message');
    await campaigns.clickSelectAudienceRadioButton();
    await campaigns.selectTargetAudienceAndValidateTheAudienceCount('Test Audience');
    await campaigns.selectSmsSender(SmsSenders.Sakani);
    await campaigns.enterChannelLink('http://www.banner-test.net/dashboard');
    await campaigns.selectSmsDayAndTime();
    await campaigns.enterMessage('Testing SMS campaign message with Sakani as a sender and audience selected');

    await logStep('Step 07: Save channel and validate the toast message');
    await campaigns.clickSaveButton();
    await campaigns.validateToastMessage(ToastMessages.FollowUpCampaign);
    await campaigns.previewCampaign();

    await logStep('Step 08: Navigate to preview campaign and get the campaign number ');
    const campaignNumber = await campaigns.campaignNumber.textContent();
    DataHelper.updateServiceData(SERVICE, 'campaignNumber', campaignNumber);
  });

  test('TC-02 Approve the paid SMS channel campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
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

  test('TC-03 Add new unpaid SMS channel campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    const campaignName = `Automation Unpaid SMS Campaign ${new Date()
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

    await logStep('Step 05: Select channel - Banner');
    await campaigns.selectChannel(CampaignChannels.SMS);

    await logStep('Step 06: Select audience and add the details of sms message');
    await campaigns.clickSelectAudienceRadioButton();
    await campaigns.selectTargetAudienceAndValidateTheAudienceCount('Test Audience');
    await campaigns.selectSmsDayAndTime();
    await campaigns.selectSmsSender(SmsSenders.Sakani);
    await campaigns.enterChannelLink('http://www.banner-test.net/dashboard');
    await campaigns.enterMessage('Testing SMS campaign message with Sakani as a sender and audience selected');

    await logStep('Step 07: Save channel and validate the toast message');
    await campaigns.clickSaveButton();
    await campaigns.validateToastMessage(ToastMessages.FollowUpCampaign);
    await campaigns.previewCampaign();

    await logStep('Step 08: Navigate to preview campaign and get the campaign number ');
    const campaignNumber = await campaigns.campaignNumber.textContent();
    DataHelper.updateServiceData(SERVICE, 'campaignNumber', campaignNumber);
  });

  test('TC-04 Cancel the unpaid SMS channel campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
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
    await campaigns.clickCancelCampaignButtonAndConfirm();
    await campaigns.validateToastMessage(ToastMessages.UpdatedSuccessfully);
  });
});
