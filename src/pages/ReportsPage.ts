import { Locator, Page, Download, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';

/**
 * `/main/admin/ReportsManagement` — three report tabs plus PDF and Excel export.
 *
 * Each tab has its own endpoint:
 *   الحملات  → /api/report/campaign-request
 *   القنوات  → /api/report/campaign
 *   العملاء  → /api/report/client
 *
 * Note the `?tab=` parameter is written to the URL when a tab is clicked but is
 * **not** honoured on direct navigation — that is ISS-41, guarded by its own
 * known-defect test rather than worked around here.
 */
export class ReportsPage extends BasePage {
  protected path = '/main/admin/ReportsManagement?tab=0';
  readonly shell: AppShell;

  static readonly TABS = {
    campaigns: { label: 'الحملات', api: '/api/report/campaign-request', heading: 'تقارير الحملات' },
    channels: { label: 'القنوات', api: '/api/report/campaign', heading: 'تقارير القنوات' },
    clients: { label: 'العملاء', api: '/api/report/client', heading: 'تقارير العملاء' },
  } as const;

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
  }

  /**
   * The report tabs are MUI `<button role="tab">`. They must be addressed by
   * the `tab` role, not `button` — the sidebar carries links with the same
   * Arabic labels, so a looser locator reaches the wrong control entirely.
   */
  tab(label: string): Locator {
    return this.page.getByRole('tab', { name: label, exact: true });
  }

  get pdfButton(): Locator {
    return this.page.getByRole('button', { name: 'تنزيل PDF' });
  }

  get excelButton(): Locator {
    return this.page.getByRole('button', { name: 'تنزيل EXCEL' });
  }

  get filterButton(): Locator {
    return this.page.getByRole('button', { name: 'تصفية' });
  }

  heading(text: string): Locator {
    return this.page.getByText(text, { exact: true }).first();
  }

  async open(): Promise<void> {
    await this.gotoUntilReady(this.pdfButton);
    await this.shell.expectReady();
  }

  /**
   * Click a tab and wait for that tab's own report request, so the assertion
   * that follows cannot pass on the previous tab's still-rendered data.
   */
  async openTab(key: keyof typeof ReportsPage.TABS): Promise<void> {
    const { label, api } = ReportsPage.TABS[key];
    const response = this.page.waitForResponse(
      (r) => r.url().includes(api) && r.status() === 200,
      { timeout: 60_000 },
    );
    await this.tab(label).click();
    await response;
    await expect(this.heading(ReportsPage.TABS[key].heading)).toBeVisible();
  }

  /** Trigger an export and return the captured download. */
  async downloadPdf(): Promise<Download> {
    const download = this.page.waitForEvent('download', { timeout: 60_000 });
    await this.pdfButton.click();
    return download;
  }

  async downloadExcel(): Promise<Download> {
    const download = this.page.waitForEvent('download', { timeout: 60_000 });
    await this.excelButton.click();
    return download;
  }
}
