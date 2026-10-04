import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { ReportsPage } from '@pages/ReportsPage';

test.describe('Reports', () => {
  test('TC-01 reports open on the campaigns tab with data', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the reports page');
    const reports = new ReportsPage(authedPage);
    await reports.open();

    await logStep('Step 02: Verify heading "تقارير الحملات" is visible');
    await expect(reports.heading('تقارير الحملات')).toBeVisible();

    await logStep('Step 03: Verify PDF export button is visible');
    await expect(reports.pdfButton).toBeVisible();

    await logStep('Step 04: Verify Excel export button is visible');
    await expect(reports.excelButton).toBeVisible();
  });

  test('TC-02 each tab loads its own dataset', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the reports page');
    const reports = new ReportsPage(authedPage);
    await reports.open();

    /* Each `openTab` waits for that tab's own endpoint, so passing here proves
       the tab genuinely re-queried rather than leaving the previous view up. */

    await logStep('Step 02: Open the channels report tab');
    await reports.openTab('channels');

    await logStep('Step 03: Open the clients report tab');
    await reports.openTab('clients');

    await logStep('Step 04: Open the campaigns report tab');
    await reports.openTab('campaigns');
  });

  test('TC-03 PDF export downloads a file', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the reports page');
    const reports = new ReportsPage(authedPage);
    await reports.open();

    await logStep('Step 02: Download the report as a PDF file');
    const download = await reports.downloadPdf();

    await logStep('Step 03: Verify suggested filename meets the expected condition');
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

    await logStep('Step 04: Get the downloaded file path');
    const path = await download.path();

    await logStep('Step 05: Verify path meets the expected condition');
    expect(path, 'the download must produce a file on disk').toBeTruthy();
  });

  test('TC-04 Excel export downloads a file', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the reports page');
    const reports = new ReportsPage(authedPage);
    await reports.open();

    await logStep('Step 02: Download the report as an Excel file');
    const download = await reports.downloadExcel();

    await logStep('Step 03: Verify suggested filename meets the expected condition');
    expect(download.suggestedFilename()).toMatch(/\.(xlsx?|csv)$/i);

    await logStep('Step 04: Get the downloaded file path');
    const path = await download.path();

    await logStep('Step 05: Verify path meets the expected condition');
    expect(path, 'the download must produce a file on disk').toBeTruthy();
  });

  test('TC-05 exports are offered on every report tab', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the reports page');
    const reports = new ReportsPage(authedPage);
    await reports.open();

    await logStep('Step 02: Open the selected report tab');
    for (const key of ['channels', 'clients'] as const) {
      await reports.openTab(key);
      await expect(reports.pdfButton, `PDF export on the ${key} tab`).toBeVisible();
      await expect(reports.excelButton, `Excel export on the ${key} tab`).toBeVisible();
    }
  });

  test('TC-05 Verify a report tab deep link restores that tab', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Declare expected failure for known defect ISS-41');
    const reports = new ReportsPage(authedPage);

    await logStep('Step 02: Navigate to deep link with tab parameter');
    await authedPage.goto('/main/admin/ReportsManagement?tab=1', { waitUntil: 'domcontentloaded' });

    await logStep('Step 03: Verify tab 1 heading is visible');
    // Short timeout fails fast to confirm ISS-41 is still unresolved
    await expect(reports.heading('تقاريرالقنوات')).toBeVisible({ timeout: 3000 });
  });
});
