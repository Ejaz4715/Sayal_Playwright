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
  test('detail page renders the request, client block and audit trail @P0', async ({
    authedPage,
  }) => {
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.new.uuid);

    await expect(detail.pageHeading).toBeVisible();
    await expect(authedPage.getByText(F.new.number, { exact: true }).first()).toBeVisible();
    await expect(detail.labelledValue('معلومات العميل')).toBeVisible();

    /* The audit trail is populated by a second request and lands a beat after
       the rest of the page, so it needs its own readiness wait. */
    await expect(detail.auditTable).toBeVisible();
    const headers = await detail.auditHeaders.allInnerTexts();
    expect(headers.map((h) => h.trim())).toEqual([
      'مصدر الإجراء',
      'اسم الإجراء',
      'متخذ الإجراء',
      'التاريخ',
      'الزمن',
    ]);
  });

  test('SAYAL-REQ-009 a جديد request offers edit, delete and add-channel @P1', async ({
    authedPage,
  }) => {
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.new.uuid);

    await expect(detail.editRequestButton).toBeVisible();
    await expect(detail.deleteRequestButton).toBeVisible();
    await expect(detail.addChannelCombobox).toBeVisible();

    /* Approval actions belong to later statuses and must not appear here. */
    await expect(detail.acceptRequestButton).toHaveCount(0);
    await expect(detail.createQuotationButton).toHaveCount(0);
  });

  test('SAYAL-REQ-015 an awaiting-approval request offers accept and reject @P0', async ({
    authedPage,
  }) => {
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.awaitingApproval.uuid);

    await expect(detail.pageHeading).toBeVisible();
    await expect(detail.acceptRequestButton).toBeVisible();
    await expect(detail.rejectRequestButton).toBeVisible();
  });

  test('an accepted request is where quotation creation becomes available @P0', async ({
    authedPage,
  }) => {
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.accepted.uuid);

    await expect(detail.pageHeading).toBeVisible();
    /* Corrects the earlier assumption that this control lives on جديد. */
    await expect(detail.createQuotationButton).toBeVisible();
    await expect(detail.acceptRequestButton).toHaveCount(0);
  });

  test('an approved request offers delivery actions, not lifecycle actions @P1', async ({
    authedPage,
  }) => {
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.approved.uuid);

    await expect(detail.pageHeading).toBeVisible();
    const actions = await detail.visibleActions();

    expect(actions.some((a) => /تنزيل الملف|تتبع الحملة|عرض النتائج/.test(a))).toBe(true);
    await expect(detail.acceptRequestButton).toHaveCount(0);
    await expect(detail.createQuotationButton).toHaveCount(0);
    await expect(detail.deleteRequestButton).toHaveCount(0);
  });

  test('SAYAL-CHAN-004 the add-channel menu offers all seven channel types @P1', async ({
    authedPage,
  }) => {
    const detail = new RequestDetailPage(authedPage);
    await detail.open(F.new.uuid);

    await detail.addChannelCombobox.click();
    for (const type of CHANNEL_TYPES) {
      await expect(detail.channelTypeOption(type), `channel type "${type}"`).toBeVisible();
    }
  });
});
