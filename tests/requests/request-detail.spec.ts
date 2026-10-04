import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { RequestDetailPage } from '@pages/RequestDetailPage';
import { READONLY_FIXTURES, CHANNEL_TYPES } from '@data/testData';

const F = READONLY_FIXTURES.requests;

/**
 * Campaign request detail.
 *
 * Every fixture here is a shared pre-production record opened read-only. No
 * test in this file performs a state transition: accepting, rejecting,
 * approving or cancelling a real request cannot be undone in this environment.
 * What *is* asserted is which actions the product offers per status, which is
 * the testable half of the gating rule and was observed across all seven.
 */
test.describe('Campaign request detail', () => {
  test('TC-01 detail page renders the request, client block and audit trail', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.new.uuid);

    await logStep('Step 02: Verify page heading is visible');
    await expect(detail.pageHeading).toBeVisible();

    await logStep('Step 03: Verify first is visible');
    await expect(authedPage.getByText(F.new.number, { exact: true }).first()).toBeVisible();

    await logStep('Step 04: Verify labelled value is visible');
    await expect(detail.labelledValue('معلومات العميل')).toBeVisible();

    /* The audit trail is populated by a second request and lands a beat after
       the rest of the page, so it needs its own readiness wait. */

    await logStep('Step 05: Verify audit table is visible');
    await expect(detail.auditTable).toBeVisible();

    await logStep('Step 06: Read displayed text from the request detail page');
    const headers = await detail.auditHeaders.allInnerTexts();

    await logStep('Step 07: Verify map meets the expected condition');
    expect(headers.map((h) => h.trim())).toEqual([
      'مصدر الإجراء',
      'اسم الإجراء',
      'متخذ الإجراء',
      'التاريخ',
      'الزمن',
    ]);
  });

  test('TC-02 a جديد request offers edit, delete and add-channel', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.new.uuid);

    await logStep('Step 02: Verify edit request button is visible');
    await expect(detail.editRequestButton).toBeVisible();

    await logStep('Step 03: Verify delete request button is visible');
    await expect(detail.deleteRequestButton).toBeVisible();

    await logStep('Step 04: Verify add channel combobox is visible');
    await expect(detail.addChannelCombobox).toBeVisible();


    /* Approval actions belong to later statuses and must not appear here. */

    await logStep('Step 05: Verify accept request button has the expected count');
    await expect(detail.acceptRequestButton).toHaveCount(0);

    await logStep('Step 06: Verify create quotation button has the expected count');
    await expect(detail.createQuotationButton).toHaveCount(0);
  });

  test('TC-03 an awaiting-approval request offers accept and reject', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.awaitingApproval.uuid);

    await logStep('Step 02: Verify page heading is visible');
    await expect(detail.pageHeading).toBeVisible();

    await logStep('Step 03: Verify accept request button is visible');
    await expect(detail.acceptRequestButton).toBeVisible();

    await logStep('Step 04: Verify reject request button is visible');
    await expect(detail.rejectRequestButton).toBeVisible();
  });

  test('TC-04 an accepted request is where quotation creation becomes available', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.accepted.uuid);

    await logStep('Step 02: Verify page heading is visible');
    await expect(detail.pageHeading).toBeVisible();
    /* Corrects the earlier assumption that this control lives on جديد. */

    await logStep('Step 03: Verify create quotation button is visible');
    await expect(detail.createQuotationButton).toBeVisible();

    await logStep('Step 04: Verify accept request button has the expected count');
    await expect(detail.acceptRequestButton).toHaveCount(0);
  });

  test('TC-05 an approved request offers delivery actions, not lifecycle actions', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.approved.uuid);

    await logStep('Step 02: Verify page heading is visible');
    await expect(detail.pageHeading).toBeVisible();

    await logStep('Step 03: Read the actions available for the approved request');
    const actions = await detail.visibleActions();

    await logStep('Step 04: Verify some meets the expected condition');
    expect(actions.some((a) => /تنزيل الملف|تتبع الحملة|عرض النتائج/.test(a))).toBe(true);

    await logStep('Step 05: Verify accept request button has the expected count');
    await expect(detail.acceptRequestButton).toHaveCount(0);

    await logStep('Step 06: Verify create quotation button has the expected count');
    await expect(detail.createQuotationButton).toHaveCount(0);

    await logStep('Step 07: Verify delete request button has the expected count');
    await expect(detail.deleteRequestButton).toHaveCount(0);
  });

  test('TC-06 the add-channel menu offers all seven channel types', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.new.uuid);

    await logStep('Step 02: Click the add channel combobox');
    await detail.addChannelCombobox.click();

    await logStep('Step 03: Verify channel type option is visible');
    for (const type of CHANNEL_TYPES) {
      await expect(detail.channelTypeOption(type), `channel type "${type}"`).toBeVisible();
        }
  });
});
