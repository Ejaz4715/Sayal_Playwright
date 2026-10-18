import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { ReportsPage } from '@pages/ReportsPage';

test.describe('Campaign Report Filters', () => {
  test('TC-01 reports open on the campaigns tab with data', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {
    await logStep('Step 01: Open the reports page');
    const reports = new ReportsPage(authedPage);
    await reports.open();

    await logStep('Step 02: Verify heading "تقارير الحملات" is visible');
    await expect(reports.heading('تقارير الحملات')).toBeVisible();
  });
});
