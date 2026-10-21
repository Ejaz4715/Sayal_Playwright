import { logStep } from '@helpers/LogSteps';
import { test } from '@fixtures/pages.fixture';
import { CampaignWithNotification } from '@pages/Campaign/campaignWithNotificationpaidandunPaied';
import testData from '@data/test-data.json';

const { titlePrefix, price, details, notification } = testData.services.campaigns;

test.describe('Campaign with a notification channel', () => {
  test('TC-01 a notification-paid campaign is created, approved and updated', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage }) => {
    const campaign = new CampaignWithNotification(authedPage);

    await logStep('Step 01: Open the campaigns page and start a new campaign');
    await campaign.openCampaigns();
    await campaign.startNewCampaign();

    await logStep('Step 02: Fill title, client, goal, mark as paid and fill the agreement number');
    await campaign.fillCampaignDetails(details.paid, `${titlePrefix} ${Date.now()}`);

    await logStep('Step 03: Go to the next step');
    await campaign.next();

    await logStep('Step 04: Add a notification channel');
    await campaign.chooseChannel(notification.channelType);

    await logStep('Step 05: Fill the message title');
    await campaign.fillMessageTitle(notification.messageTitle);

    await logStep('Step 06: Fill the message link');
    await campaign.fillMessageLink(notification.link);

    await logStep('Step 07: Pick tomorrow as the send date');
    await campaign.pickDate(notification.daysAhead);

    await logStep('Step 08: Select the target audience');
    await campaign.selectAudience(notification.audience);

    await logStep('Step 09: Fill the message content');
    await campaign.fillMessageContent(notification.content);

    await logStep('Step 10: Save the channel');
    await campaign.save();

    await logStep('Step 11: Verify the channel was added successfully');
    await campaign.expectChannelAdded();

    await logStep('Step 12: Review the campaign and approve the request');
    await campaign.reviewCampaign();
    await campaign.approveRequest();

    await logStep('Step 13: Verify the campaign approval message is displayed');
    await campaign.expectCampaignApproved();

    await logStep(`Step 14: Edit the campaign, change its title to "${notification.updatedTitle}" and save`);
    await campaign.editCampaign();
    await campaign.updateTitle(notification.updatedTitle);

    await logStep('Step 15: Verify the campaign was updated successfully');
    await campaign.expectCampaignUpdated();
  });

  test('TC-02 a notification-unpaid Without Send Quotation campaign is created and approved', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage }) => {
    const campaign = new CampaignWithNotification(authedPage);

    await logStep('Step 01: Open the campaigns page and start a new campaign');
    await campaign.openCampaigns();
    await campaign.startNewCampaign();

    await logStep('Step 02: Fill title, client and goal (unpaid — no agreement number)');
    await campaign.fillCampaignDetails(details.unpaid, `${titlePrefix} ${Date.now()}`);

    await logStep('Step 03: Go to the next step');
    await campaign.next();

    await logStep('Step 04: Add a notification channel');
    await campaign.chooseChannel(notification.channelType);

    await logStep('Step 05: Fill the message title');
    await campaign.fillMessageTitle(notification.messageTitle);

    await logStep('Step 06: Fill the message link');
    await campaign.fillMessageLink(notification.link);

    await logStep('Step 07: Pick tomorrow as the send date');
    await campaign.pickDate(notification.daysAhead);

    await logStep('Step 08: Select the target audience');
    await campaign.selectAudience(notification.audience);

    await logStep('Step 09: Fill the message content');
    await campaign.fillMessageContent(notification.content);

    await logStep('Step 10: Save the channel');
    await campaign.save();

    await logStep('Step 11: Verify the channel was added successfully');
    await campaign.expectChannelAdded();

    await logStep('Step 12: Review the campaign and approve the request');
    await campaign.reviewCampaign();
    await campaign.approveRequest();

    await logStep('Step 13: Verify the campaign approval message is displayed');
    await campaign.expectCampaignApproved();
  });

  test('TC-03 a notification-unpaid With Send Quotation campaign is created and approved', { annotation: [{ product: 'Sayal', type: 'critical' } as any] }, async ({ authedPage }) => {
    const campaign = new CampaignWithNotification(authedPage);

    await logStep('Step 01: Open the campaigns page and start a new campaign');
    await campaign.openCampaigns();
    await campaign.startNewCampaign();

    await logStep('Step 02: Fill title, client and goal (unpaid — no agreement number)');
    await campaign.fillCampaignDetails(details.unpaid, `${titlePrefix} ${Date.now()}`);

    await logStep('Step 03: Go to the next step');
    await campaign.next();

    await logStep('Step 04: Add a notification channel');
    await campaign.chooseChannel(notification.channelType);

    await logStep('Step 05: Fill the message title');
    await campaign.fillMessageTitle(notification.messageTitle);

    await logStep('Step 06: Fill the message link');
    await campaign.fillMessageLink(notification.link);

    await logStep('Step 07: Pick tomorrow as the send date');
    await campaign.pickDate(notification.daysAhead);

    await logStep('Step 08: Select the target audience');
    await campaign.selectAudience(notification.audience);

    await logStep('Step 09: Fill the message content');
    await campaign.fillMessageContent(notification.content);

    await logStep('Step 10: Save the channel');
    await campaign.save();

    await logStep('Step 11: Verify the channel was added successfully');
    await campaign.expectChannelAdded();

    await logStep('Step 12: Review the campaign and approve the request');
    await campaign.reviewCampaign();
    await campaign.approveRequest();

    await logStep('Step 13: Verify the campaign approval message is displayed');
    await campaign.expectCampaignApproved();

    await logStep(`Step 14: Create a quotation priced at ${price}`);
    await campaign.createQuotation(price);
    await campaign.closeQuotationDialog();

    await logStep('Step 15: Open the public quotation link');
    await campaign.openPublicQuotation();

    await logStep(`Step 16: Verify the total equals the price ${price} plus 15% VAT`);
    await campaign.expectQuotedAmounts(price);

    await logStep('Step 17: Accept the quotation');
    await campaign.acceptQuotation();
  });
});
