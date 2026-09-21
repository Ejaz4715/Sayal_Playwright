import { Locator, Page, expect } from '@playwright/test';
import { AdminListPage } from './AdminListPage';
import { ROUTES } from '@data/testData';

/**
 * `/main/admin/Clients` — corporate client records.
 *
 * Gets its own class rather than a plain `AdminListPage` because of the filter
 * panel, which is the only one of its kind in the product: four named text
 * filters plus apply and reset, each mapping to a query parameter.
 */
export class ClientsPage extends AdminListPage {
  static readonly COLUMNS = [
    'اسم الشركة',
    'اسم العميل',
    'رقم السجل التجاري',
    'رقم الهاتف',
    'البريد الإلكتروني',
    'مصدر العميل',
  ] as const;

  constructor(page: Page) {
    super(page, ROUTES.clients, ClientsPage.COLUMNS, '/api/clients');
  }

  get companyNameFilter(): Locator {
    return this.page.getByPlaceholder('اسم الشركة');
  }

  get crNumberFilter(): Locator {
    return this.page.getByPlaceholder('رقم السجل التجاري');
  }

  get emailFilter(): Locator {
    return this.page.getByPlaceholder('البريد الإلكتروني');
  }

  get mobileFilter(): Locator {
    return this.page.getByPlaceholder('رقم الجوال');
  }

  get applyFilterButton(): Locator {
    return this.page.getByRole('button', { name: 'تطبيق' });
  }

  get resetFilterButton(): Locator {
    return this.page.getByRole('button', { name: 'إعادة التعيين' });
  }

  get closeFilterButton(): Locator {
    return this.page.getByRole('button', { name: 'إغلاق التصفية' });
  }

  async openFilterPanel(): Promise<void> {
    await this.filterButton.click();
    await expect(this.companyNameFilter).toBeVisible();
  }

  /** Apply the panel and wait for the filtered request to come back. */
  async applyFilter(): Promise<void> {
    const response = this.page.waitForResponse(
      (r) => r.url().includes('/api/clients') && r.status() === 200,
    );
    await this.applyFilterButton.click();
    await response;
  }

  async resetFilter(): Promise<void> {
    const response = this.page.waitForResponse(
      (r) => r.url().includes('/api/clients') && r.status() === 200,
    );
    await this.resetFilterButton.click();
    await response;
  }

  /** Company names currently rendered, from the first column. */
  async companyNames(): Promise<string[]> {
    const rows = await this.table.allRowTexts();
    return rows.map((c) => (c[0] ?? '').trim()).filter(Boolean);
  }
}
