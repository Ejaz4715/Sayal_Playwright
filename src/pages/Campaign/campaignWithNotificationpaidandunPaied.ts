import { CampaignWithPopup } from './campaignWithPopupPaidandUnpaid';
import { CampaignWithNotificationObjects as notificationLocators } from '@objects/campains/campaignPaid&Unpaid';


export class CampaignWithNotification extends CampaignWithPopup {
  async fillMessageTitle(title: string): Promise<void> {
    await this.page.getByRole('textbox', { name: notificationLocators.fields.messageTitle }).fill(title);
  }

  async fillMessageLink(link: string): Promise<void> {
    await this.page.getByRole('textbox', { name: notificationLocators.fields.link }).fill(link);
  }

  async selectAudience(audience: string): Promise<void> {
    await this.page.getByRole('textbox', { name: notificationLocators.fields.audience }).click();
    await this.page.getByText(audience).click();
  }

  async fillMessageContent(content: string): Promise<void> {
    await this.page.getByRole('textbox', { name: notificationLocators.fields.content }).fill(content);
  }
}
