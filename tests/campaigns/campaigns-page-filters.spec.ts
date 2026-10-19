import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { ReportsPage } from '@pages/ReportsPage';
import { DataHelper } from '@helpers/DataHelper';
import { CampaignsPage } from '@pages/CampaignsPage';

const SERVICE = 'campaigns';
const readServiceData = () => DataHelper.readData().services[SERVICE];
const readEnvironments = () => DataHelper.readData().environments;

test.describe('Campaign Report Filters', () => {
  test('TC-01 reports open on the campaigns tab with data', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {
    const environment = readEnvironments();
    const data = readServiceData();

    await logStep('Step 01: Open the reports page');
    const reports = new CampaignsPage(authedPage);
    await reports.open();
  });
});
