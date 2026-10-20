import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { DataHelper } from '@helpers/DataHelper';
import path from 'node:path';
import { CampaignsPage } from '@pages/CampaignsPage';

const SERVICE = 'campaigns';
const readServiceData = () => DataHelper.readData().services[SERVICE];
const readEnvironments = () => DataHelper.readData().environments;

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
    await campaigns.campaignTitleField.fill(campaignName);

    await campaigns.campaignCombobox('اسم العميل').click();
    await campaigns.listboxOption('الشركة الوطنية للاسكان').first().click();

    await campaigns.campaignCombobox('هدف الحملة').click();
    await campaigns.listboxOption('زيادة الوعي').first().click();

    await campaigns.paidCampaignOption.click();

    await campaigns.agreementNumberField.fill('11231');
    await campaigns.nextButton.click();

    await logStep('Step 05: Select channel - Banner');
    await campaigns.campaignCombobox('اضافة قناة').click();
    await campaigns.listboxOption('مساحة إعلانية').click();

    await logStep('Step 06: Add the details of banner channel to be dispalyed in sakani> select the dates > Upload the file and select the area');
    await campaigns.campaignCombobox('اختر المنصة').click();
    await campaigns.bannerPlatformOption.click();

    await campaigns.campaignEndDateField.click();
    await campaigns.nextDayInCalendar.click();

    await campaigns.campaignStartDateField.click();
    await campaigns.todayInCalendar.click();

    await campaigns.bannerTitleField.fill('Test Automation Banner');
    await campaigns.bannerLinkField.fill('http://www.banner-test.net/dashboard');

    await campaigns.bannerPlacementCombobox.click();
    await campaigns.bannerPlacementOption('DesktopServicesPageBottomSection').click();

    await campaigns.bannerFileInput.setInputFiles(image);
    await expect(campaigns.uploadedBannerFileName).toBeVisible({ timeout: 20000 });

    await logStep('Step 07: Navigate to preview campaign');
    await campaigns.previewCampaignButton.click();

    await logStep('Step 07: Check if the channel is already added if not then add the channel again with all the details');
    await campaigns.cancelChannelButton.isVisible();

    if (!(await campaigns.campaignAddedSuccessMessage.isVisible({ timeout: 20000 }))) {
      if (!(await campaigns.cancelChannelButton.isVisible().catch(() => false))) {
        await campaigns.campaignCombobox('اضافة قناة').click();
        await campaigns.listboxOption('مساحة إعلانية').click();

        await campaigns.campaignCombobox('اختر المنصة').click();
        await campaigns.bannerPlatformOption.click();

        await campaigns.campaignEndDateField.click();
        await campaigns.nextDayInCalendar.click();

        await campaigns.campaignStartDateField.click();
        await campaigns.todayInCalendar.click();

        await campaigns.bannerTitleField.fill('Test Automation Banner');
        await campaigns.bannerLinkField.fill('http://www.banner-test.net/dashboard');

        await campaigns.bannerPlacementCombobox.click();
        await campaigns.bannerPlacementOption('DesktopServicesPageBottomSection').click();

        await campaigns.bannerFileInput.setInputFiles(image);
        await expect(campaigns.uploadedBannerFileName).toBeVisible({ timeout: 20000 });

        await campaigns.saveButton.click();
        await expect(campaigns.campaignAddedSuccessMessage, 'Campaign added message is not present').toBeVisible({ timeout: 20000 });
      }
    }
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
    await campaigns.campaignRowActionMenu(data.campaignName).click();
    await campaigns.viewCampaignDetailsOption.click();

    await logStep('Step 04: Approve campaign request > Validate the success toast message');
    await campaigns.approveRequestButton.click();
    await campaigns.confirmButton.click();
    await expect(campaigns.campaignApprovedSuccessMessage, 'Campaign added message is not present').toBeVisible({ timeout: 20000 });
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
    await campaigns.campaignTitleField.fill(campaignName);
    await campaigns.campaignCombobox('اسم العميل').click();
    await campaigns.listboxOption('الشركة الوطنية للاسكان').first().click();
    await campaigns.campaignCombobox('هدف الحملة').click();
    await campaigns.listboxOption('زيادة الوعي').first().click();
    await campaigns.unpaidCampaignOption.click();
    await campaigns.nextButton.click();

    await logStep('Step 05: Select channel - Banner');
    await campaigns.campaignCombobox('اضافة قناة').click();
    await campaigns.listboxOption('مساحة إعلانية').click();

    await logStep('Step 06: Add the details of banner channel to be dispalyed in sakani> select the dates > Upload the file and select the area');
    await campaigns.campaignCombobox('اختر المنصة').click();
    await campaigns.bannerPlatformOption.click();

    await campaigns.campaignEndDateField.click();
    await campaigns.nextDayInCalendar.click();

    await campaigns.campaignStartDateField.click();
    await campaigns.todayInCalendar.click();

    await campaigns.bannerTitleField.fill('Test Automation Banner');
    await campaigns.bannerLinkField.fill('http://www.banner-test.net/dashboard');

    await campaigns.bannerPlacementCombobox.click();
    await campaigns.bannerPlacementOption('DesktopServicesPageBottomSection').click();

    await campaigns.bannerFileInput.setInputFiles(image);
    await expect(campaigns.uploadedBannerFileName).toBeVisible({ timeout: 20000 });

    await logStep('Step 07: Navigate to preview campaign');
    await campaigns.previewCampaignButton.click();

    await logStep('Step 07: Check if the channel is already added if not then add the channel again with all the details');
    await campaigns.cancelChannelButton.isVisible();

    if (!(await campaigns.campaignAddedSuccessMessage.isVisible({ timeout: 20000 }))) {
      if (!(await campaigns.cancelChannelButton.isVisible().catch(() => false))) {
        await campaigns.campaignCombobox('اضافة قناة').click();
        await campaigns.listboxOption('مساحة إعلانية').click();

        await campaigns.campaignCombobox('اختر المنصة').click();
        await campaigns.bannerPlatformOption.click();

        await campaigns.campaignEndDateField.click();
        await campaigns.nextDayInCalendar.click();

        await campaigns.campaignStartDateField.click();
        await campaigns.todayInCalendar.click();

        await campaigns.bannerTitleField.fill('Test Automation Banner');
        await campaigns.bannerLinkField.fill('http://www.banner-test.net/dashboard');

        await campaigns.bannerPlacementCombobox.click();
        await campaigns.bannerPlacementOption('DesktopServicesPageBottomSection').click();

        await campaigns.bannerFileInput.setInputFiles(image);
        await expect(campaigns.uploadedBannerFileName).toBeVisible({ timeout: 20000 });

        await campaigns.saveButton.click();
        await expect(campaigns.campaignAddedSuccessMessage, 'Campaign added message is not present').toBeVisible({ timeout: 20000 });
      }
    }
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
    await campaigns.campaignRowActionMenu(data.campaignName).click();
    await campaigns.viewCampaignDetailsOption.click();

    await logStep('Step 04: Approve campaign request > Validate the success toast message');
    await campaigns.approveRequestButton.click();
    await campaigns.confirmButton.click();
    await expect(campaigns.campaignApprovedSuccessMessage, 'Campaign added message is not present').toBeVisible({ timeout: 20000 });
  });

  test('TC-05 Create quotation for unpaid banner campaign and reject the qoutation', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage, page }) => {
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
    await campaigns.campaignRowActionMenu(data.campaignName).click();
    await campaigns.viewCampaignDetailsOption.click();

    await logStep('Step 05: Create qoutation and send > Validate the success pop up');
    await campaigns.createQuotationButton.click();
    await campaigns.checkbox.check();
    await campaigns.nextButton.click();
    await campaigns.priceField.fill(price);
    await campaigns.sendButton.click();
    await expect(campaigns.successMessage).toBeVisible({ timeout: 20000 });
    await campaigns.doneButton.click();

    await logStep('Step 06: Navigate to the qoutation link');
    const page1Promise = page.waitForEvent('popup');
    await campaigns.quotationLink.click();
    const page1 = await page1Promise;
    await campaigns.campaignDetailsTab(page1).click();

    await logStep('Step 07: Validate the price after and before 15% vat is matching with the entered price');
    await campaigns.verifyPriceWithoutVat(price, page1);
    await campaigns.verifyPriceWithVat(price, page1);

    await logStep('Step 08: Reject the qoutation and validate toast message');
    await campaigns.rejectButton(page1).click();
    await campaigns.rejectReasonField(page1).fill('Reject message');
    await campaigns.confirmRejectionButton(page1).click();
  });
});
