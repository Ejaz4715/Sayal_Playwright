import { logStep } from '@helpers/LogSteps';
import { test } from '@fixtures/pages.fixture';
import { ReportsPage } from '@pages/ReportsPage';
import { ReportsManagementFilters } from '@pages/reports-management-filterspage';
import { ReportsManagementFiltersObjects } from '@objects/reports-management-filters';

const { campaigns, channels, clients } = ReportsManagementFiltersObjects.data;

test.describe('Reports management filters', () => {
  test('TC-01 Campaigns, Channels and Clients report filters and reset work', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {
    const reports = new ReportsPage(authedPage);
    const filters = new ReportsManagementFilters(authedPage);

    await logStep('Step 01: Open the reports management page on the Campaigns tab');
    await reports.open();

    await logStep('Step 02: Open the Campaigns filter panel');
    await filters.openPanel();

    await logStep('Step 03: Fill the title, campaign number, client name, CR number and platform, then apply');
    await filters.filter('campaigns', campaigns);

    await logStep('Step 04: Verify every Campaigns row matches the filters');
    await filters.expectRows('campaigns', campaigns);

    await logStep('Step 05: Reset the Campaigns filters');
    await filters.reset('campaigns');

    await logStep('Step 06: Verify the Campaigns filters are cleared and the full list is restored');
    await filters.expectCleared();

    await logStep('Step 07: Switch to the Channels tab and open its filter panel');
    await filters.closePanel();
    await reports.openTab('channels');
    await filters.openPanel();

    await logStep('Step 08: Fill the channel number, campaign number, title, channel type and status, then apply');
    await filters.filter('channels', channels.filters);

    await logStep('Step 09: Verify every Channels row matches the filters');
    await filters.expectRows('channels', channels.rows);

    await logStep('Step 10: Reset the Channels filters');
    await filters.reset('channels');

    await logStep('Step 11: Verify the Channels filters are cleared and the full list is restored');
    await filters.expectCleared();

    await logStep('Step 12: Switch to the Clients tab and open its filter panel');
    await filters.closePanel();
    await reports.openTab('clients');
    await filters.openPanel();

    await logStep('Step 13: Fill the client name and company name, then search');
    await filters.filter('clients', clients);

    await logStep('Step 14: Verify every Clients row matches the filters');
    await filters.expectRows('clients', clients);

    await logStep('Step 15: Reset the Clients filters');
    await filters.reset('clients');

    await logStep('Step 16: Verify the Clients filters are cleared and the full list is restored');
    await filters.expectCleared();

    await logStep('Step 17: Close the filter panel');
    await filters.closePanel();
  });
});
