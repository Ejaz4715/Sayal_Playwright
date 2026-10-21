import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { DataHelper } from '@helpers/DataHelper';
import path from 'node:path';
import { CampaignChannels, BannerPlatforms, CampaignsPage, ToastMessages } from '@pages/CampaignsPage';

const SERVICE = 'campaigns';
const readServiceData = () => DataHelper.readData().services[SERVICE];

test.describe('Banner campaigns', () => {
  test('TC-01 Add new paid banner campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const data = readServiceData();
    const image = path.join(process.cwd(), 'src', 'data', 'Sample image 2.png');
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    const campaignName = `Automation Paid Banner Campaign ${new Date()
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
    await campaigns.selectChannel(CampaignChannels.AdSpace);

    await logStep('Step 06: Add the details of banner channel to be dispalyed in sakani> select the dates > Upload the file and select the area');
    await campaigns.selectBannerPlatform(BannerPlatforms.Web);
    await campaigns.selectBannerStartDate();
    await campaigns.selectBannerEndDate();
    await campaigns.fillBannerTitle('Test Automation Banner');
    await campaigns.fillBannerLink('http://www.banner-test.net/dashboard');
    await campaigns.selectBannerPlacement('DesktopServicesPageBottomSection');
    await campaigns.uploadBannerImage(image);

    await logStep('Step 07: Save channel and validate the toast message');
    await campaigns.saveChannel();
    await campaigns.validateToastMessage(ToastMessages.CampaignAddedSuccessfully);

    await logStep('Step 08: Navigate to preview campaign and get the campaign number ');
    await campaigns.previewCampaign();
    const campaignNumber = await campaigns.campaignNumber.textContent();
    DataHelper.updateServiceData(SERVICE, 'campaignNumber', campaignNumber);
  });

  test('TC-02 Approve the paid banner campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const data = readServiceData();
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    await logStep('Step 01: Navigate to campaigns requests page ');
    await campaigns.openTab('standard');

    await logStep('Step 02: Search by campaoign request number');
    await campaigns.search(data.campaignNumber);

    await logStep('Step 03: View details of searched campaign');
    await campaigns.openCampaignDetails(data.campaignName);

    await logStep('Step 04: Approve campaign request > Validate the success toast message');
    await campaigns.approveCampaignRequest();
    await campaigns.clickConfirmButton();
    await campaigns.validateToastMessage(ToastMessages.CampaignApprovedSuccessfully);
  });

  test('TC-03 Add new unpaid banner campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const data = readServiceData();
    const image = path.join(process.cwd(), 'src', 'data', 'Sample image 2.png');
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    const campaignName = `Automation Unpaid Banner Campaign ${new Date()
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
    await campaigns.fillAgreementNumber('11231');
    await campaigns.clickNextButton();

    await logStep('Step 05: Select channel - Banner');
    await campaigns.selectChannel(CampaignChannels.AdSpace);

    await logStep('Step 06: Add the details of banner channel to be dispalyed in sakani> select the dates > Upload the file and select the area');
    await campaigns.selectBannerPlatform(BannerPlatforms.Web);
    await campaigns.selectBannerStartDate();
    await campaigns.selectBannerEndDate();
    await campaigns.fillBannerTitle('Test Automation Banner');
    await campaigns.fillBannerLink('http://www.banner-test.net/dashboard');
    await campaigns.selectBannerPlacement('DesktopServicesPageBottomSection');
    await campaigns.uploadBannerImage(image);

    await logStep('Step 07: Save channel and validate the toast message');
    await campaigns.saveChannel();
    await campaigns.validateToastMessage(ToastMessages.CampaignAddedSuccessfully);

    await logStep('Step 08: Navigate to preview campaign and get the campaign number ');
    await campaigns.previewCampaign();
    const campaignNumber = await campaigns.campaignNumber.textContent();
    DataHelper.updateServiceData(SERVICE, 'campaignNumber', campaignNumber);
  });

  test('TC-04 Approve the unpaid banner campaign', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
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

  test('TC-05 Create quotation for unpaid banner campaign and reject the quotation', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
    await logStep('Step 01: Open the audience page');
    const data = readServiceData();
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();
    let price = '100';
    DataHelper.updateServiceData(SERVICE, 'price', price);

    await logStep('Step 02: Navigate to campaigns requests page ');
    await campaigns.openTab('standard');

    await logStep('Step 03: Search by campaign request number');
    await campaigns.search(data.campaignNumber);

    await logStep('Step 04: View details of searched campaign');
    await campaigns.openCampaignDetails(data.campaignName);

    await logStep('Step 05: Create qoutation and send > Validate the success pop up');
    await campaigns.startQuotationAndAcceptAgreement();
    await campaigns.clickNextButton();
    await campaigns.fillQuotationPrice(price);
    await campaigns.sendQuotation();
    await expect(campaigns.successMessage).toBeVisible({ timeout: 20000 });
    await campaigns.dismissQuotationSuccess();

    await logStep('Step 06: Navigate to the qoutation link');
    const page1 = await campaigns.openQuotationLink();
    await campaigns.openCampaignDetailsTab(page1);

    await logStep('Step 07: Validate the price after and before 15% vat is matching with the entered price');
    await campaigns.verifyPriceWithoutVat(price, page1);
    await campaigns.verifyPriceWithVat(price, page1);

    await logStep('Step 08: Reject the qoutation and validate toast message');
    await campaigns.clickQuotationAction(page1, 'reject');
    await campaigns.fillRejectReason(page1, 'Reject message');
    await campaigns.confirmRejectionButton(page1).click();
  });
});
