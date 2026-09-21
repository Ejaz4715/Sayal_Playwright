import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { DataTable } from './components/DataTable';
import { Pagination } from './components/Pagination';
import { Dropdown } from './components/Dropdown';
import { ROUTES } from '@data/testData';

/**
 * `/main/admin/Requests` — campaign requests, the core business entity.
 *
 * Two tabs backed by the same endpoint with different parameters:
 *   حملات النشر السريع → `is_quick=1` (Quick Promo) — the **default** tab
 *   الحملات            → `is_quick=0` (standard requests)
 *
 * This is the one list in the product built on a real HTML `<table>`.
 */
export class RequestsPage extends BasePage {
  protected readonly path = ROUTES.requests;
  readonly shell: AppShell;
  readonly table: DataTable;
  readonly pagination: Pagination;

  static readonly COLUMNS = [
    'رقم الحملة',
    'عنوان الحملة',
    'مصدر الحملة',
    'تاريخ انشاء الحملة',
    'اسم العميل',
    'رقم السجل التجاري',
    'سبب الإلغاء',
    'نوع القناة',
    'حالة الحملة',
    'الإجراءات',
  ] as const;

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
    this.table = new DataTable(page, 'table');
    this.pagination = new Pagination(page);
  }

  get quickPromoTab(): Locator {
    return this.page.getByRole('tab', { name: 'حملات النشر السريع' });
  }

  get standardTab(): Locator {
    return this.page.getByRole('tab', { name: 'الحملات', exact: true });
  }

  get addRequestButton(): Locator {
    return this.page.getByRole('button', { name: 'إضافة حملة' });
  }

  get quickPromoButton(): Locator {
    return this.page.getByRole('button', { name: 'النشر السريع' });
  }

  get searchInput(): Locator {
    return this.page.getByPlaceholder('بحث');
  }

  get searchButton(): Locator {
    return this.page.getByRole('button', { name: 'بحث' });
  }

  get emptyState(): Locator {
    return this.page.getByText('لا يوجد بيانات');
  }

  statusFilter(): Dropdown {
    return new Dropdown(this.page, 'الحالة');
  }

  channelTypeFilter(): Dropdown {
    return new Dropdown(this.page, 'نوع القناة');
  }

  sourceFilter(): Dropdown {
    return new Dropdown(this.page, 'مصدر الحملة');
  }

  async open(): Promise<void> {
    await this.gotoUntilReady(this.table.container);
    await this.shell.expectReady();
  }

  /**
   * Switch to the standard (non-quick) campaigns tab and wait for its data to
   * actually reach the DOM.
   *
   * Waiting only for the response is not enough: the previous tab's rows stay
   * rendered while the new payload is applied, so a test that reads rows
   * immediately gets Quick Promo data while believing it is on the standard
   * tab. Anchoring on the first record from the response payload makes the
   * hand-over observable.
   */
  async openStandardTab(): Promise<void> {
    await this.open();
    await this.switchTab(this.standardTab, 'is_quick=0');
  }

  async openQuickPromoTab(): Promise<void> {
    await this.open();
    await this.switchTab(this.quickPromoTab, 'is_quick=1');
  }

  private async switchTab(tab: Locator, marker: string): Promise<void> {
    await this.actAndSettle(marker, () => tab.click());
  }

  /**
   * Move to another page of results and wait for the grid to actually show it.
   *
   * Same hazard as switching tabs: the previous page's rows stay mounted while
   * the new payload is applied, so reading rows straight after the response
   * returns the old page and an overlap assertion fails for the wrong reason.
   */
  async goToPage(n: number): Promise<void> {
    await this.actAndSettle(`page=${n}`, () => this.pagination.goToPage(n));
  }

  /**
   * Perform an action that triggers a list request, then block until the
   * rendered grid matches the payload that came back. Anchoring on the first
   * record from the response is what makes the hand-over observable rather
   * than merely likely.
   */
  private async actAndSettle(marker: string, action: () => Promise<void>): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (r) => r.url().includes('/api/campaign-requests') && r.url().includes(marker),
    );
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
      await expect(
        this.table.rows.first(),
        `the ${marker} payload leads with ${firstNumber}, so the grid must render it`,
      ).toContainText(String(firstNumber));
    } else {
      await expect(this.table.container).toBeVisible();
    }
  }

  /** Search and wait for the query to be reflected in the request. */
  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    const response = this.page.waitForResponse(
      (r) => r.url().includes('/api/campaign-requests') && r.url().includes('keyword='),
    );
    await this.searchButton.click();
    await response;
  }

  /** Request numbers currently rendered, read from the first column. */
  async requestNumbers(): Promise<string[]> {
    const rows = await this.table.allRowTexts();
    return rows.map((cells) => (cells[0] ?? '').trim()).filter(Boolean);
  }

  /** Open a request detail page by its visible request number. */
  async openRequest(requestNumber: string): Promise<void> {
    const row = this.table.rowContaining(requestNumber);
    await expect(row).toBeVisible();
    await row.getByText('عرض التفاصيل').dispatchEvent('click');
    await this.page.waitForURL(/\/main\/admin\/Requests\/[0-9a-f-]{36}/, { waitUntil: 'commit' });
  }
}
