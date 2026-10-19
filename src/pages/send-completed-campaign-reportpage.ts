import { Page, expect } from '@playwright/test';
import { DataTable } from './components/DataTable';
import { SendCompletedCampaignReportObjects as O } from '../objects/send-completed-campaign-report';

/**
 * The « إرسال التقرير للعميل » row action on the Reports management Campaigns tab.
 *
 * Opening the page and filtering stay with `ReportsPage` and
 * `ReportsManagementFilters`, which the spec calls directly.
 *
 * Sending a report reaches a real client, so the send request is intercepted:
 * it is recorded and answered with an empty 200, and never leaves the browser.
 */
export class SendCompletedCampaignReport {
  private readonly grid: DataTable;
  private readonly sent: string[] = [];

  constructor(private readonly page: Page) {
    this.grid = new DataTable(page, 'grid');
  }

  /** Intercept the send endpoint. Call before anything can trigger it. */
  async interceptSend(): Promise<void> {
    await this.page.route(O.sendEndpoint, (route) => {
      this.sent.push(new URL(route.request().url()).pathname);
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
  }

  /** Open the first row's action menu and choose « إرسال التقرير للعميل ». */
  async chooseSend(): Promise<void> {
    await this.grid.rows.first().locator(O.rowMenuIcon).first().click();
    await this.page.getByRole('menuitem', { name: O.menuItem }).click();
  }

  async expectConfirmation(): Promise<void> {
    await expect(this.page.getByRole('dialog')).toContainText(O.dialog.question);
  }

  async confirm(): Promise<void> {
    await this.page.getByRole('button', { name: O.dialog.confirm }).click();
    await expect(this.page.getByRole('dialog')).toBeHidden();
  }

  async cancel(): Promise<void> {
    await this.page.getByRole('button', { name: O.dialog.cancel }).click();
    await expect(this.page.getByRole('dialog')).toBeHidden();
  }

  async expectNothingSent(): Promise<void> {
    expect(this.sent, 'no report may be sent before confirming').toHaveLength(0);
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.page.getByText(O.successMessage)).toBeVisible();
  }

  async expectReportSent(): Promise<void> {
    await expect.poll(() => this.sent.length).toBe(1);
    expect(this.sent[0]).toMatch(O.sendPath);
  }
}
