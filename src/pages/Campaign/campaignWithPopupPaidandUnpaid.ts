import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { AppShell } from '@components/AppShell';
import { CampaignWithPopupObjects as popupLocators, CampaignWithNotificationObjects as notificationLocators } from '@objects/campains/campaignPaid&Unpaid';

/** Step 1 values, given by the spec; a paid campaign adds a payment type and agreement number. */
export type CampaignDetails = {
  client: string;
  goal: string;
  paymentType?: string;
  agreementNumber?: string;
};


export class CampaignWithPopup extends BasePage {
  readonly shell: AppShell;
  /** The public quotation page, available once `openPublicQuotation` has run. */
  private publicPage?: Page;

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
  }

  // ---------------------------------------------------------------- locators

  protected button(name: string, scope: Page = this.page): Locator {
    return scope.getByRole('button', { name });
  }

  private get titleInput(): Locator {
    return this.page.getByRole('textbox', { name: popupLocators.form.title });
  }

  private get descriptionInput(): Locator {
    return this.page.getByRole('textbox', { name: popupLocators.channel.description });
  }

  private get priceInput(): Locator {
    return this.page.getByRole('textbox', { name: popupLocators.quotation.price, exact: true });
  }

  /** Open a dropdown by its placeholder text and choose an option. */
  private async pickOption(placeholder: string, option: string, index = 0): Promise<void> {
    await this.page.getByText(placeholder, { exact: true }).nth(index).click();
    await this.page.getByText(option).first().click();
  }

  // ----------------------------------------------------------------- actions

  async openCampaigns(): Promise<void> {
    await this.shell.navigateTo(popupLocators.sidebarLink);
  }

  async startNewCampaign(): Promise<void> {
    await this.button(popupLocators.buttons.addCampaign).click();
  }

  async fillCampaignDetails(details: CampaignDetails, title: string): Promise<void> {
    const { client, goal, paymentType, agreementNumber } = details;
    const isPaidCampaign = paymentType && agreementNumber;

    await this.titleInput.fill(title);
    await this.pickOption(popupLocators.form.clientDropdown, client);
    /* The goal label also appears as the field caption, so the dropdown is the second match. */
    await this.pickOption(popupLocators.form.goalDropdown, goal, 1);
    if (isPaidCampaign) await this.fillAgreement(paymentType, agreementNumber);
  }

  private async fillAgreement(paymentType: string, agreementNumber: string): Promise<void> {
    await this.page.locator(popupLocators.agreement.paidRadiobutton).click();
    await this.page.getByRole('radio', { name: paymentType, exact: true }).check();
    await this.page.locator(popupLocators.agreement.number).fill(agreementNumber);
  }

  /** Pick a day `daysAhead` from today in the channel date picker. */
  async pickDate(daysAhead: number): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    await this.page.getByRole('textbox', { name: notificationLocators.fields.date }).click();
    await this.page.getByLabel(notificationLocators.dayLabel(String(date.getDate()).padStart(2, '0'))).first().click();
  }

  async next(): Promise<void> {
    await this.button(popupLocators.buttons.next).click();
  }

  /** Open "add channel" and pick the channel type (pop-up, notification, ) */
  async chooseChannel(channelType: string): Promise<void> {
    await this.page.getByText(popupLocators.channel.add).click();
    await this.page.getByText(channelType).click();
  }

  /** The pop-up channel form is a single description field. */
  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async save(): Promise<void> {
    await this.button(popupLocators.buttons.save).click();
  }

  async reviewCampaign(): Promise<void> {
    await this.button(popupLocators.buttons.reviewCampaign).click();
  }

  async approveRequest(): Promise<void> {
    await this.button(popupLocators.buttons.approveRequest).click();
    await this.button(popupLocators.buttons.confirm).click();
  }

  async editCampaign(): Promise<void> {
    await this.button(popupLocators.buttons.editCampaign).click();
  }

  /** On the edit form: change the campaign title and save. */
  async updateTitle(title: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.button(popupLocators.buttons.save).click();
  }

  async createQuotation(price: string): Promise<void> {
    await this.button(popupLocators.buttons.createQuotation).click();
    await this.page.getByRole('checkbox').check();
    await this.next();
    await this.priceInput.fill(price);
    await this.button(popupLocators.buttons.send).click();
  }

  async closeQuotationDialog(): Promise<void> {
    await this.page.locator(popupLocators.quotation.successDialogClose).click();
    await this.button(popupLocators.buttons.done).click();
  }

  /** Follow the public quotation link, which opens in a new tab. */
  async openPublicQuotation(): Promise<void> {
    const popup = this.page.waitForEvent('popup');
    await this.page.locator(popupLocators.quotation.publicLink).click();
    this.publicPage = await popup;
  }

  async acceptQuotation(): Promise<void> {
    const quote = this.requirePublicPage();
    await quote.getByRole('tab', { name: popupLocators.publicPage.detailsTab }).click();
    await this.button(popupLocators.buttons.accept, quote).click();
    await quote.getByRole('checkbox').check();
    await this.button(popupLocators.buttons.confirm, quote).click();
  }

  // -------------------------------------------------------------- assertions

  async expectChannelAdded(): Promise<void> {
    await expect(this.page.getByRole('status').filter({ hasText: popupLocators.messages.channelAdded })).toBeVisible();
  }

  async expectCampaignApproved(): Promise<void> {
    await expect(this.page.getByText(popupLocators.messages.campaignApproved)).toBeVisible();
  }

  async expectCampaignUpdated(): Promise<void> {
    await expect(this.page.getByText(popupLocators.messages.campaignUpdated)).toBeVisible();
  }

  /** The page must show the price as quoted and a total of price + VAT, calculated here. */
  async expectQuotedAmounts(price: string): Promise<void> {
    const quote = this.requirePublicPage();
    const total = (Number(price) * (1 + popupLocators.vatRate)).toFixed(2);
    await quote.getByRole('tab', { name: popupLocators.publicPage.detailsTab }).click();
    await expect(quote.getByText(`${Number(price).toFixed(2)}`, { exact: true })).toBeVisible();
    await expect(quote.getByText(`${total}${popupLocators.currency}`)).toBeVisible();
  }

  private requirePublicPage(): Page {
    if (!this.publicPage) throw new Error('Open the public quotation first');
    return this.publicPage;
  }
}
