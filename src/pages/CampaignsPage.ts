import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { DataTable } from './components/DataTable';
import { Dropdown } from './components/Dropdown';
import { CampaignsPageFiltersObjects as O } from '../objects/campaigns-page-filters';

export type CampaignsTab = 'standard' | 'quickPromo';

/**
 * Page object for campaign creation and the campaign requests list used by
 * tests/campaigns/campaigns-page-filters.spec.ts. The requests list at
 * `/main/admin/Requests` has two tabs:
 *   الحملات             → is_quick=0  (standard)
 *   حملات النشر السريع → is_quick=1  (Quick Promo, the default tab)
 *
 * Authentication is deliberately not here: the spec gets a signed-in page from
 * the `authedPage` fixture, which reuses the stored admin session.
 */
export class CampaignsPage extends BasePage {
  protected path = O.route;
  readonly shell: AppShell;
  readonly table: DataTable;

  /** Request parameter each tab sends, used to pin waits to the right response. */
  static readonly TAB_MARKERS: Record<CampaignsTab, string> = {
    standard: O.api.standardTabParam,
    quickPromo: O.api.quickPromoTabParam,
  };

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
    this.table = new DataTable(page, 'table');
  }

  // ---------------------------------------------------------------- locators

  get standardTab(): Locator {
    return this.page.getByRole('tab', { name: O.tabs.standard.name, exact: O.tabs.standard.exact });
  }

  get quickPromoTab(): Locator {
    return this.page.getByRole('tab', { name: O.tabs.quickPromo.name });
  }

  get searchInput(): Locator {
    return this.page.getByPlaceholder(O.search.input.placeholder);
  }

  /** Also applies the dropdown filters: they share one form with the keyword box. */
  get searchButton(): Locator {
    return this.page.getByRole('button', { name: O.search.button.name });
  }

  get emptyState(): Locator {
    return this.page.getByText(O.search.emptyState.text);
  }

  statusFilter(): Dropdown {
    return new Dropdown(this.page, O.filters.status.label);
  }

  channelTypeFilter(): Dropdown {
    return new Dropdown(this.page, O.filters.channelType.label);
  }

  sourceFilter(): Dropdown {
    return new Dropdown(this.page, O.filters.source.label);
  }

  get addCampaignButton(): Locator {
    return this.page.getByRole('button', { name: 'إضافة حملة' });
  }

  get campaignAddedSuccessMessage(): Locator {
    return this.page.getByText('تم إضافة الاعلان بنجاح');
  }

  get campaignApprovedSuccessMessage(): Locator {
    return this.page.getByText('تم الموافقة علي الحملة بنجاح');
  }

  get campaignTitleField(): Locator {
    return this.page.getByLabel('عنوان الحملة*');
  }

  campaignCombobox(label: string): Locator {
    return this.page.getByRole('combobox').filter({ hasText: label });
  }

  listboxOption(option: string): Locator {
    return this.page.getByRole('listbox').getByText(option, { exact: true });
  }

  get paidCampaignOption(): Locator {
    return this.page.locator("//label[@for = 'paid_1']");
  }

  get unpaidCampaignOption(): Locator {
    return this.page.locator("//label[@for = 'paid_0']");
  }

  get agreementNumberField(): Locator {
    return this.page.getByRole('textbox', { name: 'رقم الاتفاقية *' });
  }

  get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'التالي' });
  }

  get bannerPlatformOption(): Locator {
    return this.page.getByRole('listbox').filter({ hasText: 'SakaniSakani Mobile App' }).getByText('Sakani', { exact: true });
  }

  get campaignEndDateField(): Locator {
    return this.page.getByPlaceholder('تاريخ نهاية الحملة');
  }

  get campaignStartDateField(): Locator {
    return this.page.getByPlaceholder('تاريخ بداية الحملة');
  }

  get nextDayInCalendar(): Locator {
    return this.page.locator("(//div[contains (@class, 'rmdp-week')]/descendant::div[contains (@class, 'today')])[2]/following-sibling::div[1]");
  }

  get todayInCalendar(): Locator {
    return this.page.locator("(//div[contains (@class, 'rmdp-week')]/descendant::div[contains (@class, 'today')])[1]");
  }

  get bannerTitleField(): Locator {
    return this.page.getByPlaceholder('عنوان الإعلان');
  }

  get bannerLinkField(): Locator {
    return this.page.getByPlaceholder('رابط الإعلان', { exact: true });
  }

  get bannerPlacementCombobox(): Locator {
    return this.page.getByRole('combobox').locator('div.placeholder', { hasText: 'مساحة إعلانية' });
  }

  bannerPlacementOption(placement: string): Locator {
    return this.page.getByText(placement);
  }

  get bannerFileInput(): Locator {
    return this.page.locator("//input[@type='file']");
  }

  get uploadedBannerFileName(): Locator {
    return this.page.locator("//div[contains (@class, 'dgaui_fileCardFileName')]");
  }

  get previewCampaignButton(): Locator {
    return this.page.getByRole('button', { name: 'استعراض الحملة' });
  }

  get cancelChannelButton(): Locator {
    return this.page.getByRole('button', { name: 'إلغاء القناة' });
  }

  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'حفظ' });
  }

  get campaignNumber(): Locator {
    return this.page.locator("//h3[contains (text(), 'رقم الحملة')]/parent::div/descendant::h4");
  }

  campaignRowActionMenu(campaignName: string): Locator {
    return this.page.getByRole('row').filter({ hasText: campaignName }).locator('div.menuChildren > svg');
  }

  get viewCampaignDetailsOption(): Locator {
    return this.page.getByText('عرض التفاصيل');
  }

  get approveRequestButton(): Locator {
    return this.page.getByRole('button', { name: 'موافقة على الطلب' });
  }

  get confirmButton(): Locator {
    return this.page.getByRole('button', { name: 'تأكيد' });
  }

  get quotationLink(): Locator {
    return this.page.locator("//h3[normalize-space()='رابط عرض السعر']/parent::div/descendant::h4");
  }

  // ------------------- Campaign qoutation creation page ------------------------------------------

  get createWithoutSendingButton(): Locator {
    return this.page.getByRole('button', { name: 'إنشاء بدون ارسال' });
  }

  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: 'إلغاء' });
  }

  get createQuotationButton(): Locator {
    return this.page.getByRole('button', { name: 'إنشاء عرض السعر' });
  }

  get checkbox(): Locator {
    return this.page.getByRole('checkbox');
  }

  get priceField(): Locator {
    return this.page.getByPlaceholder('السعر', { exact: true });
  }

  get sendButton(): Locator {
    return this.page.getByRole('button', { name: 'إرسال' });
  }

  get successMessage(): Locator {
    return this.page.getByText('نجاح', { exact: true });
  }

  get doneButton(): Locator {
    return this.page.getByRole('button', { name: 'تم' });
  }

  // ------------------- Campaign qoutation link page  ------------------------------------------

  acceptButton(page: any): Locator {
    return page.getByRole('button', { name: 'قبول' });
  }

  downloadQuotationButton(page: any): Locator {
    return page.getByRole('button', { name: 'تنزيل عرض السعر' });
  }

  rejectButton(page: any): Locator {
    return page.getByRole('button', { name: 'رفض' });
  }

  rejectReasonField(page: any): Locator {
    return page.getByPlaceholder('سبب الرفض');
  }

  campaignDetailsTab(page: any): Locator {
    return page.locator("//button[normalize-space() = 'تفاصيل الحملة']");
  }

  priceWithoutVat(page: any): Locator {
    return page.locator("//span[normalize-space()='القيمة الإجمالية']/parent::div/following-sibling::div/child::div");
  }

  priceWithVat(page: any): Locator {
    return page.locator("//span[normalize-space()='القيمة الاجمالية شاملة الضريبة']/parent::div/following-sibling::div/child::div");
  }

  confirmRejectionButton(page: any): Locator {
    return page.getByRole('button', { name: 'تأكيد' });
  }

  // -------------------------------------------------------------- navigation

  async open(): Promise<void> {
    await this.gotoUntilReady(this.table.container);
    await this.shell.expectReady();
  }

  /** Open the page on the given tab. */
  async openTab(tab: CampaignsTab): Promise<void> {
    await this.open();
    if (tab === 'standard') {
      await this.actAndSettle(CampaignsPage.TAB_MARKERS.standard, () => this.standardTab.click());
    } else {
      /* Quick Promo is the default tab: landing here already issued its request,
         and clicking it again fires nothing, so only the initial rows are confirmed. */
      await expect(this.quickPromoTab).toBeVisible();
      await expect(this.table.rows.first()).toBeVisible();
    }
  }

  /**
   * Perform an action that triggers a list request, then block until the grid
   * shows the payload that came back. The previous tab's rows stay mounted while
   * the new payload is applied, so anchoring on the first record is what makes
   * the hand-over observable.
   */
  private async actAndSettle(marker: string, action: () => Promise<void>): Promise<void> {
    const responsePromise = this.page.waitForResponse((r) => r.url().includes(O.api.list) && r.url().includes(marker));
    await action();
    const response = await responsePromise;

    const firstNumber = await response
      .json()
      .then((j) => {
        const rows = j?.data?.data ?? j?.data ?? [];
        return rows[0]?.request_number ?? rows[0]?.number ?? null;
      })
      .catch(() => null);

    if (firstNumber) {
      await expect(this.table.rows.first(), `the ${marker} payload leads with ${firstNumber}, so the grid must render it`).toContainText(String(firstNumber));
    } else {
      await expect(this.table.container).toBeVisible();
    }
  }

  // ----------------------------------------------------------------- reading

  /** Every rendered value of one column, identified by its header label. */
  async columnValues(header: string): Promise<string[]> {
    const headers = await this.table.headers();
    const col = headers.indexOf(header);
    expect(col, `column "${header}" not found in [${headers.join(' | ')}]`).toBeGreaterThan(-1);
    const rows = await this.table.allRowTexts();
    return rows.map((cells) => (cells[col] ?? '').trim());
  }

  async requestNumbers(): Promise<string[]> {
    return (await this.columnValues(O.columns.requestNumber)).filter(Boolean);
  }

  async firstRequestNumber(): Promise<string> {
    const first = (await this.requestNumbers())[0];
    expect(first, 'a seed row is required to search for').toBeTruthy();
    return first;
  }

  // ----------------------------------------------------------------- actions

  /** Search by keyword and wait for the query to be reflected in the request. */
  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    const response = this.page.waitForResponse((r) => r.url().includes(O.api.list) && r.url().includes(O.api.keywordParam));
    await this.searchButton.click();
    await response;
  }

  /**
   * Submit the filter form. `tab` pins the wait to that tab's request, so a stale
   * in-flight response cannot satisfy it.
   */
  async applyFilters(tab: CampaignsTab): Promise<void> {
    const marker = CampaignsPage.TAB_MARKERS[tab];
    const response = this.page.waitForResponse((r) => r.url().includes(O.api.list) && r.url().includes(marker) && r.status() === 200);
    await this.searchButton.click();
    await response;
  }

  async filterByStatus(tab: CampaignsTab, status: string): Promise<void> {
    await this.statusFilter().select(status);
    await this.applyFilters(tab);
  }

  async filterByChannelType(tab: CampaignsTab, type: string): Promise<void> {
    await this.channelTypeFilter().select(type);
    await this.applyFilters(tab);
  }

  async filterBySource(tab: CampaignsTab, source: string): Promise<void> {
    await this.sourceFilter().select(source);
    await this.applyFilters(tab);
  }

  // -------------------------------------------------------------- assertions

  async expectRequestListed(requestNumber: string): Promise<void> {
    await expect.poll(() => this.requestNumbers()).toContain(requestNumber);
  }

  /** After a reload: keyword box empty, no empty-state message, and a populated list. */
  async expectFullListRestored(): Promise<void> {
    await expect(this.searchInput).toHaveValue('');
    await expect(this.emptyState).toBeHidden();
    await expect.poll(() => this.table.rowCount()).toBeGreaterThan(1);
  }

  /**
   * Every rendered row's cell in `header` contains `value`. Matched by containment
   * because a request can carry several channels. An empty result also satisfies it.
   */
  async expectAllRowsContain(header: string, value: string): Promise<void> {
    await expect.poll(async () => (await this.columnValues(header)).every((v) => v.includes(value))).toBe(true);
  }

  /**
   * check the price is matching with the input price without adding vat in the qoutation
   */
  async verifyPriceWithoutVat(price: string, page: any) {
    const priceRegex = new RegExp(`^${price}(\\.0+)?\\s*(ريال)?$`);
    await expect(this.priceWithoutVat(page)).toHaveText(priceRegex);
  }

  /**
   * check the price is matching with the input price + 15% vat added in the qoutation
   */
  async verifyPriceWithVat(price: string, page: any) {
    const numericPrice = parseFloat(price);
    const calculatedPrice = (numericPrice * 1.15).toFixed(2);
    const priceRegex = new RegExp(`^${calculatedPrice}(\\.0+)?\\s*(ريال)?$`);
    await expect(this.priceWithVat(page)).toHaveText(priceRegex);
  }
}
