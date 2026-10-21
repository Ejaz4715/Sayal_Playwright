import { logStep } from '@helpers/LogSteps';
import { test } from '@fixtures/pages.fixture';
import { CampaignWithPopup } from '@pages/Campaign/PopupCampaign';
import testData from '@data/test-data.json';

const { titlePrefix, price, details, popup } = testData.services.campaigns;

test.describe('Campaign with a pop-up channel', () => {
  test('TC-01 a pop-up-unpaid campaign is created, approved, quoted and accepted', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage }) => {
    const campaign = new CampaignWithPopup(authedPage);

    await logStep('Step 01: Open the campaigns page and start a new campaign');
    await campaign.openCampaigns();
    await campaign.startNewCampaign();

    await logStep('Step 02: Fill title, client and goal (unpaid — no agreement number)');
    await campaign.fillCampaignDetails(details.unpaidWithQuotation, `${titlePrefix} ${Date.now()}`);

    await logStep('Step 03: Go to the next step');
    await campaign.next();

    await logStep('Step 04: Add a pop-up channel');
    await campaign.chooseChannel(popup.channelType);

    await logStep('Step 05: Fill the description');
    await campaign.fillDescription(popup.description);

    await logStep('Step 06: Save the channel');
    await campaign.save();

    await logStep('Step 07: Verify the channel was added successfully');
    await campaign.expectChannelAdded();

    await logStep('Step 08: Review the campaign and approve the request');
    await campaign.reviewCampaign();
    await campaign.approveRequest();

    await logStep('Step 09: Verify the campaign approval message is displayed');
    await campaign.expectCampaignApproved();

    await logStep(`Step 10: Create a quotation priced at ${price}`);
    await campaign.editCampaign();
    await campaign.createQuotation(price);
    await campaign.closeQuotationDialog();

    await logStep('Step 11: Open the public quotation link');
    await campaign.openPublicQuotation();

    await logStep(`Step 12: Verify the total equals the price ${price} plus 15% VAT`);
    await campaign.expectQuotedAmounts(price);

    await logStep('Step 13: Accept the quotation');
    await campaign.acceptQuotation();
  });

  test('TC-02 a pop-up-paid campaign is created and approved', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage }) => {
    const campaign = new CampaignWithPopup(authedPage);

    await logStep('Step 01: Open the campaigns page and start a new campaign');
    await campaign.openCampaigns();
    await campaign.startNewCampaign();

    await logStep('Step 02: Fill title, client, goal, mark as paid and fill the agreement number');
    await campaign.fillCampaignDetails(details.paid, `${titlePrefix} ${Date.now()}`);

    await logStep('Step 03: Go to the next step');
    await campaign.next();

    await logStep('Step 04: Add a pop-up channel');
    await campaign.chooseChannel(popup.channelType);

    await logStep('Step 05: Fill the description');
    await campaign.fillDescription(popup.description);

    await logStep('Step 06: Save the channel');
    await campaign.save();

    await logStep('Step 07: Verify the channel was added successfully');
    await campaign.expectChannelAdded();

    await logStep('Step 08: Review the campaign and approve the request');
    await campaign.reviewCampaign();
    await campaign.approveRequest();

    await logStep('Step 09: Verify the campaign approval message is displayed');
    await campaign.expectCampaignApproved();
  });
});
