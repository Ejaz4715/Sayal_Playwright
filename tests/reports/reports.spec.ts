import { test, expect } from '@fixtures/pages.fixture';
import { ReportsPage } from '@pages/ReportsPage';

test.describe('Reports', () => {
  test('SAYAL-RPT-001 reports open on the campaigns tab with data @P2', async ({ authedPage }) => {
    const reports = new ReportsPage(authedPage);
    await reports.open();

    await expect(reports.heading('تقارير الحملات')).toBeVisible();
    await expect(reports.pdfButton).toBeVisible();
    await expect(reports.excelButton).toBeVisible();
  });

  test('SAYAL-RPT-002 each tab loads its own dataset @P2', async ({ authedPage }) => {
    const reports = new ReportsPage(authedPage);
    await reports.open();

    /* Each `openTab` waits for that tab's own endpoint, so passing here proves
       the tab genuinely re-queried rather than leaving the previous view up. */
    await reports.openTab('channels');
    await reports.openTab('clients');
    await reports.openTab('campaigns');
  });

  test('SAYAL-RPT-003 PDF export downloads a file @P2', async ({ authedPage }) => {
    const reports = new ReportsPage(authedPage);
    await reports.open();

    const download = await reports.downloadPdf();
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

    const path = await download.path();
    expect(path, 'the download must produce a file on disk').toBeTruthy();
  });

  test('SAYAL-RPT-004 Excel export downloads a file @P2', async ({ authedPage }) => {
    const reports = new ReportsPage(authedPage);
    await reports.open();

    const download = await reports.downloadExcel();
    expect(download.suggestedFilename()).toMatch(/\.(xlsx?|csv)$/i);

    const path = await download.path();
    expect(path, 'the download must produce a file on disk').toBeTruthy();
  });

  test('exports are offered on every report tab @P3', async ({ authedPage }) => {
    const reports = new ReportsPage(authedPage);
    await reports.open();

    for (const key of ['channels', 'clients'] as const) {
      await reports.openTab(key);
      await expect(reports.pdfButton, `PDF export on the ${key} tab`).toBeVisible();
      await expect(reports.excelButton, `Excel export on the ${key} tab`).toBeVisible();
    }
  });
});
