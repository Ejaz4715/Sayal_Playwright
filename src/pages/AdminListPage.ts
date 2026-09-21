import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { DataTable, TableVariant } from './components/DataTable';
import { Pagination } from './components/Pagination';

/**
 * Shared behaviour for the eight admin screens built on the `.TableNhc` div
 * grid: Clients, Users, Filters, Platforms, SMS senders, Invoice, Quotations
 * and Banner Definitions.
 *
 * They differ only in route, expected columns and the API they call, so those
 * are constructor parameters rather than eight near-identical classes. Screens
 * with genuinely distinct behaviour (Clients' filter panel, the request detail)
 * get their own page object instead.
 */
export class AdminListPage extends BasePage {
  readonly shell: AppShell;
  readonly table: DataTable;
  readonly pagination: Pagination;
  readonly expectedColumns: readonly string[];
  private readonly apiPath: string;

  /**
   * @param variant which list implementation this screen uses. Most are the
   *   `.TableNhc` div grid, but Banner Definitions renders a real `<table>` —
   *   so this cannot be assumed per-family and is stated per-screen.
   */
  constructor(
    page: Page,
    route: string,
    expectedColumns: readonly string[],
    apiPath: string,
    variant: TableVariant = 'grid',
  ) {
    super(page);
    this.path = route;
    this.shell = new AppShell(page);
    this.table = new DataTable(page, variant);
    this.pagination = new Pagination(page);
    this.expectedColumns = expectedColumns;
    this.apiPath = apiPath;
  }

  get addButton(): Locator {
    return this.page.getByRole('button', { name: 'اضافة' });
  }

  get filterButton(): Locator {
    return this.page.getByRole('button', { name: 'تصفية' });
  }

  /**
   * Navigate and wait for the list API, the grid **and its first row**.
   *
   * Waiting on the container alone is not enough: these grids paint their
   * header row well before the data arrives, so a test that reads rows straight
   * after `open()` intermittently gets an empty set and fails claiming the
   * environment holds no data. Every screen in this family is populated in
   * pre-production, so a row is a legitimate readiness signal.
   */
  async open(): Promise<void> {
    const response = this.page.waitForResponse(
      (r) => r.url().includes(this.apiPath) && r.status() === 200,
      { timeout: 60_000 },
    );
    await this.goto();
    await response.catch(() => null);
    await expect(this.table.container).toBeVisible();
    await expect(this.table.rows.first()).toBeVisible();
    await this.shell.expectReady();
  }

  /** Assert the column set matches what exploration recorded, in order. */
  async expectColumns(): Promise<void> {
    const actual = await this.table.headers();
    expect(actual, `columns on ${this.path}`).toEqual([...this.expectedColumns]);
  }

  async expectHasRows(): Promise<void> {
    await this.table.expectLoaded();
  }
}
