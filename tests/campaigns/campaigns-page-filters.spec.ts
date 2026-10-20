import { logStep } from '@helpers/LogSteps';
import { test } from '@fixtures/pages.fixture';
import { CampaignsPage } from '@pages/CampaignsPage';
import { CampaignsPageFiltersObjects } from '@objects/campaigns-page-filters';

const { status, channelType, source } = CampaignsPageFiltersObjects.values;
const { status: statusColumn, channelType: channelTypeColumn, source: sourceColumn } = CampaignsPageFiltersObjects.columns;

const TABS = [
  { name: 'Campaigns', key: 'standard' },
  { name: 'Quick Promo', key: 'quickPromo' },
] as const;

test.describe('Campaigns page filters', () => {
  test('TC-01 all filters work on the Campaigns and Quick Promo tabs', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {
    const requests = new CampaignsPage(authedPage);

    for (const tab of TABS) {
      await logStep(`Step 01: [${tab.name}] Open the ${tab.name} tab`);
      await requests.openTab(tab.key);

      await logStep(`Step 02: [${tab.name}] Read a request number from the first row`);
      const requestNumber = await requests.firstRequestNumber();

      await logStep(`Step 03: [${tab.name}] Search by that request number`);
      await requests.search(requestNumber);

      await logStep(`Step 04: [${tab.name}] Verify the request is listed`);
      await requests.expectRequestListed(requestNumber);

      await logStep(`Step 05: [${tab.name}] Reload the page in the same session and return to the ${tab.name} tab`);
      await requests.openTab(tab.key);

      await logStep(`Step 06: [${tab.name}] Verify the search is cleared and the full list is restored`);
      await requests.expectFullListRestored();

      await logStep(`Step 07: [${tab.name}] Select the status "${status}" and apply`);
      await requests.filterByStatus(tab.key, status);

      await logStep(`Step 08: [${tab.name}] Verify every rendered row has that status`);
      await requests.expectAllRowsContain(statusColumn, status);

      await logStep(`Step 09: [${tab.name}] Re-open the ${tab.name} tab to clear the status filter`);
      await requests.openTab(tab.key);

      await logStep(`Step 10: [${tab.name}] Select the channel type "${channelType}" and apply`);
      await requests.filterByChannelType(tab.key, channelType);

      await logStep(`Step 11: [${tab.name}] Verify every rendered row includes that channel type`);
      await requests.expectAllRowsContain(channelTypeColumn, channelType);

      await logStep(`Step 12: [${tab.name}] Re-open the ${tab.name} tab to clear the channel type filter`);
      await requests.openTab(tab.key);

      await logStep(`Step 13: [${tab.name}] Select the campaign source "${source}" and apply`);
      await requests.filterBySource(tab.key, source);

      await logStep(`Step 14: [${tab.name}] Verify every rendered row has that source`);
      await requests.expectAllRowsContain(sourceColumn, source);

      await logStep(`Step 15: c Re-open the ${tab.name} tab to clear the source filter`);
      await requests.openTab(tab.key);
    }
  });
});
