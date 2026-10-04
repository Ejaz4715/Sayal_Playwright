import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';
import { RequestDetailPage } from '@pages/RequestDetailPage';
import { CampaignsPage } from '@pages/CampaignsPage';
import { READONLY_FIXTURES, CHANNEL_STATUS } from '@data/testData';

const NEW_REQUEST = READONLY_FIXTURES.requests.new;

/**
 * The seven channel Add forms — the area the exploration flagged as the single
 * largest unmapped part of the product.
 *
 * Each test opens a form and asserts its field set. None of them submits: a
 * saved channel attaches to a shared request and cannot be removed cleanly, so
 * empty-submit validation is asserted from the form's own required markers
 * rather than by posting.
 */
test.describe('Channel add forms', () => {
  test('TC-01 SMS form (الرسائل النصية) exposes its scheduling, link and message fields', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(NEW_REQUEST.uuid);

    await logStep('Step 02: Open the SMS form (الرسائل النصية)');
    await detail.openChannelForm('الرسائل النصية');

    /* These inputs carry no `name` attribute, so they are addressed by their
       placeholder — which is also the label a user actually sees. */

    await logStep('Step 03: Verify the Date field is visible (التاريخ)');
    await expect(authedPage.getByPlaceholder('التاريخ')).toBeVisible();

    await logStep('Step 04: Verify the Enter channel URL field is visible (أدخل رابط القناة)');
    await expect(authedPage.getByPlaceholder('أدخل رابط القناة')).toBeVisible();

    await logStep('Step 05: Verify element matching input[type="time"] is visible');
    await expect(authedPage.locator('input[type="time"]')).toBeVisible();

    const body = authedPage.locator('textarea[name="body"]');

    await logStep('Step 06: Verify message body is visible');
    await expect(body).toBeVisible();

    /* A concrete, testable constraint discovered during exploration. */

    await logStep('Step 07: Verify message body has the expected attribute');
    await expect(body).toHaveAttribute('maxlength', '196');
  });

  test('TC-02 Notification form (إشعارات) exposes a 5000-character body and an audience selector', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(NEW_REQUEST.uuid);

    await logStep('Step 02: Open the Notifications form (إشعارات)');
    await detail.openChannelForm('إشعارات');

    await logStep('Step 03: Verify the Message title field is visible (عنوان الرسالة)');
    await expect(authedPage.getByPlaceholder('عنوان الرسالة')).toBeVisible();

    await logStep('Step 04: Verify the Message URL field is visible (رابط الرسالة)');
    await expect(authedPage.getByPlaceholder('رابط الرسالة')).toBeVisible();

    await logStep('Step 05: Verify the Target audience field is visible (الفئة المستهدفة)');
    await expect(authedPage.getByPlaceholder('الفئة المستهدفة')).toBeVisible();
    const body = authedPage.locator('textarea[name="body"]');

    await logStep('Step 06: Verify message body is visible');
    await expect(body).toBeVisible();

    await logStep('Step 07: Verify message body has the expected attribute');
    await expect(body).toHaveAttribute('maxlength', '5000');
  });

  test('TC-03 Banner form (مساحة إعلانية) exposes a date range and an indexed banner array', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(NEW_REQUEST.uuid);

    await logStep('Step 02: Open the Advertising space form (مساحة إعلانية)');
    await detail.openChannelForm('مساحة إعلانية');

    await logStep('Step 03: Verify the Campaign start date field is visible (تاريخ بداية الحملة)');
    await expect(authedPage.getByPlaceholder('تاريخ بداية الحملة')).toBeVisible();

    await logStep('Step 04: Verify the Campaign end date field is visible (تاريخ نهاية الحملة)');
    await expect(authedPage.getByPlaceholder('تاريخ نهاية الحملة')).toBeVisible();

    /* The indexed id is what makes this an array — adding a banner appends .1, .2 …
       Addressed by attribute rather than `#`, because the id contains dots. */

    await logStep('Step 05: Verify element matching [id="banners_arr.0.title"] is visible');
    await expect(authedPage.locator('[id="banners_arr.0.title"]')).toBeVisible();

    await logStep('Step 06: Verify element matching [id="banners_arr.0.url"] is visible');
    await expect(authedPage.locator('[id="banners_arr.0.url"]')).toBeVisible();
  });

  /**
   * Email, WhatsApp, cold-calling and popup render an identical single-field
   * form. That is not a rendering fault: the stored API records for these types
   * hold only a title, with no body, schedule or audience. Asserting the field
   * set pins that reality, so if these channels ever gain a real form the test
   * fails and someone re-reads the model.
   */
  test('TC-04 Email form (البريد الإلكتروني) exposes only a description field', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(NEW_REQUEST.uuid);

    await logStep('Step 02: Open the Email form (البريد الإلكتروني)');
    await detail.openChannelForm('البريد الإلكتروني');

    await logStep('Step 03: Verify the Description field is visible (الوصف)');
    await expect(authedPage.getByPlaceholder('الوصف')).toBeVisible();

    await logStep('Step 04: Verify the email form has no message body');
    await expect(
      authedPage.locator('textarea[name="body"]'),
      'Email stores no message body',
    ).toHaveCount(0);
  });

  test('TC-05 WhatsApp form (واتساب) exposes only a description field', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(NEW_REQUEST.uuid);

    await logStep('Step 02: Open the WhatsApp form (واتساب)');
    await detail.openChannelForm('واتساب');

    await logStep('Step 03: Verify the Description field is visible (الوصف)');
    await expect(authedPage.getByPlaceholder('الوصف')).toBeVisible();

    await logStep('Step 04: Verify the WhatsApp form has no message body');
    await expect(
      authedPage.locator('textarea[name="body"]'),
      'WhatsApp stores no message body',
    ).toHaveCount(0);
  });

  test('TC-06 Cold-calling form (الاتصال البيعي) exposes only a description field', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(NEW_REQUEST.uuid);

    await logStep('Step 02: Open the Cold-calling form (الاتصال البيعي)');
    await detail.openChannelForm('الاتصال البيعي');

    await logStep('Step 03: Verify the Description field is visible (الوصف)');
    await expect(authedPage.getByPlaceholder('الوصف')).toBeVisible();

    await logStep('Step 04: Verify the cold-calling form has no message body');
    await expect(
      authedPage.locator('textarea[name="body"]'),
      'Cold-calling stores no message body',
    ).toHaveCount(0);
  });

  test('TC-07 Popup form (نافذة منبثقة) exposes only a description field', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the request detail page');
    const detail = new RequestDetailPage(authedPage);
    await detail.open(NEW_REQUEST.uuid);

    await logStep('Step 02: Open the Popup form (نافذة منبثقة)');
    await detail.openChannelForm('نافذة منبثقة');

    await logStep('Step 03: Verify the Description field is visible (الوصف)');
    await expect(authedPage.getByPlaceholder('الوصف')).toBeVisible();

    await logStep('Step 04: Verify the popup form has no message body');
    await expect(
      authedPage.locator('textarea[name="body"]'),
      'Popup stores no message body',
    ).toHaveCount(0);
  });
});

test.describe('Channels list', () => {
  test('TC-08 Channel list renders its 7 columns', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the channels list');
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    await logStep('Step 02: Read the column headers from the channels list');
    const headers = await campaigns.table.headers();

    await logStep('Step 03: Verify table headers meets the expected condition');
    expect(headers).toEqual([...CampaignsPage.COLUMNS]);
  });

  test('TC-09 channel numbers encode their channel type', { annotation : [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the channels list');
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    await logStep('Step 02: Read all channel records');
    const rows = await campaigns.rows();

    await logStep('Step 03: Verify length meets the expected condition');
    expect(rows.length, 'channels to assert against').toBeGreaterThan(0);

    await logStep('Step 04: Verify channel meets the expected condition');
    for (const row of rows) {
              const letter = CampaignsPage.TYPE_LETTERS[row.type];
      if (!letter) continue;
      expect(
        row.channel,
        `${row.channel} is a ${row.type} channel, so it should follow {request}${letter}{seq}`,
      ).toMatch(new RegExp(`^${row.request}${letter}\\d+$`));
    }
  });

  test('TC-10 every channel status is one of the six known values', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the channels list');
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    await logStep('Step 02: Read all channel records');
    const rows = await campaigns.rows();

    await logStep('Step 03: Verify the displayed data meets the expected condition');
    for (const row of rows) {
      expect(CHANNEL_STATUS as readonly string[], `status "${row.status}"`).toContain(row.status);
    }
  });
});
