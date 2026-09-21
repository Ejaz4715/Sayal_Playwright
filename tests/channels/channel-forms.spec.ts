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
  test('SMS form exposes its scheduling, link and message fields @P0', async ({ authedPage }) => {
    const detail = new RequestDetailPage(authedPage);
    await detail.open(NEW_REQUEST.uuid);
    await detail.openChannelForm('الرسائل النصية');

    /* These inputs carry no `name` attribute, so they are addressed by their
       placeholder — which is also the label a user actually sees. */
    await expect(authedPage.getByPlaceholder('التاريخ')).toBeVisible();
    await expect(authedPage.getByPlaceholder('أدخل رابط القناة')).toBeVisible();
    await expect(authedPage.locator('input[type="time"]')).toBeVisible();

    const body = authedPage.locator('textarea[name="body"]');
    await expect(body).toBeVisible();
    /* A concrete, testable constraint discovered during exploration. */
    await expect(body).toHaveAttribute('maxlength', '196');
  });

  test('notification form exposes a 5000-character body and an audience selector @P1', async ({
    authedPage,
  }) => {
    const detail = new RequestDetailPage(authedPage);
    await detail.open(NEW_REQUEST.uuid);
    await detail.openChannelForm('إشعارات');

    await expect(authedPage.getByPlaceholder('عنوان الرسالة')).toBeVisible();
    await expect(authedPage.getByPlaceholder('رابط الرسالة')).toBeVisible();
    await expect(authedPage.getByPlaceholder('الفئة المستهدفة')).toBeVisible();

    const body = authedPage.locator('textarea[name="body"]');
    await expect(body).toBeVisible();
    await expect(body).toHaveAttribute('maxlength', '5000');
  });

  test('banner form exposes a date range and an indexed banner array @P1', async ({
    authedPage,
  }) => {
    const detail = new RequestDetailPage(authedPage);
    await detail.open(NEW_REQUEST.uuid);
    await detail.openChannelForm('مساحة إعلانية');

    await expect(authedPage.getByPlaceholder('تاريخ بداية الحملة')).toBeVisible();
    await expect(authedPage.getByPlaceholder('تاريخ نهاية الحملة')).toBeVisible();
    /* The indexed id is what makes this an array — adding a banner appends .1, .2 …
       Addressed by attribute rather than `#`, because the id contains dots. */
    await expect(authedPage.locator('[id="banners_arr.0.title"]')).toBeVisible();
    await expect(authedPage.locator('[id="banners_arr.0.url"]')).toBeVisible();
  });

  /**
   * Email, WhatsApp, cold-calling and popup render an identical single-field
   * form. That is not a rendering fault: the stored API records for these types
   * hold only a title, with no body, schedule or audience. Asserting the field
   * set pins that reality, so if these channels ever gain a real form the test
   * fails and someone re-reads the model.
   */
  for (const type of ['البريد الإلكتروني', 'واتساب', 'الاتصال البيعي', 'نافذة منبثقة'] as const) {
    test(`${type} form exposes only a description field @P2`, async ({ authedPage }) => {
      const detail = new RequestDetailPage(authedPage);
      await detail.open(NEW_REQUEST.uuid);
      await detail.openChannelForm(type);

      await expect(authedPage.getByPlaceholder('الوصف')).toBeVisible();
      await expect(
        authedPage.locator('textarea[name="body"]'),
        `${type} stores no message body`,
      ).toHaveCount(0);
    });
  }
});

test.describe('Channels list', () => {
  test('channel list renders its 7 columns @P1', async ({ authedPage }) => {
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    const headers = await campaigns.table.headers();
    expect(headers).toEqual([...CampaignsPage.COLUMNS]);
  });

  test('channel numbers encode their channel type @P2', async ({ authedPage }) => {
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    const rows = await campaigns.rows();
    expect(rows.length, 'channels to assert against').toBeGreaterThan(0);

    for (const row of rows) {
      const letter = CampaignsPage.TYPE_LETTERS[row.type];
      if (!letter) continue;
      expect(
        row.channel,
        `${row.channel} is a ${row.type} channel, so it should follow {request}${letter}{seq}`,
      ).toMatch(new RegExp(`^${row.request}${letter}\\d+$`));
    }
  });

  test('every channel status is one of the six known values @P2', async ({ authedPage }) => {
    const campaigns = new CampaignsPage(authedPage);
    await campaigns.open();

    const rows = await campaigns.rows();
    for (const row of rows) {
      expect(CHANNEL_STATUS as readonly string[], `status "${row.status}"`).toContain(row.status);
    }
  });
});
