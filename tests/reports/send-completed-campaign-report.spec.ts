import { logStep } from '@helpers/LogSteps';
import { test } from '@fixtures/pages.fixture';
import { ReportsPage } from '@pages/ReportsPage';
import { ReportsManagementFilters } from '@pages/reports-management-filterspage';
import { SendCompletedCampaignReport } from '@pages/send-completed-campaign-reportpage';
import { SendCompletedCampaignReportObjects } from '@objects/send-completed-campaign-report';

const { status } = SendCompletedCampaignReportObjects.data;

test.describe('Send completed campaign report', () => {
  test('TC-01 a report is sent to the client only after confirming', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {
    const reports = new ReportsPage(authedPage);
    const filters = new ReportsManagementFilters(authedPage);
    const send = new SendCompletedCampaignReport(authedPage);

    await logStep('Step 01: Intercept the send-report request so no report reaches a real client');
    await send.interceptSend();

    await logStep('Step 02: Open the reports management page on the Campaigns tab');
    await reports.open();

    await logStep('Step 03: Open the Campaigns filter panel');
    await filters.openPanel();

    await logStep(`Step 04: Filter the campaigns by status "${status}"`);
    await filters.filter('campaigns', { status });

    await logStep('Step 05: Verify every row is a completed campaign');
    await filters.expectRows('campaigns', { status });

    await logStep('Step 06: Choose "Send report to client" from the first row menu');
    await send.chooseSend();

    await logStep('Step 07: Verify the confirmation dialog is shown');
    await send.expectConfirmation();

    await logStep('Step 08: Cancel the confirmation');
    await send.cancel();

    await logStep('Step 09: Verify no report was sent');
    await send.expectNothingSent();

    await logStep('Step 10: Choose "Send report to client" again and confirm');
    await send.chooseSend();
    await send.expectConfirmation();
    await send.confirm();

    await logStep('Step 11: Verify exactly one send-report request was made for that campaign');
    await send.expectReportSent();

    await logStep('Step 12: Verify the success message "تم إرسال التقرير بنجاح" is displayed');
    await send.expectSuccessMessage();
  });
});
