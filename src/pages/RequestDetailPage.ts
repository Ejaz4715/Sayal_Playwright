import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { CHANNEL_TYPES } from '@data/testData';

/**
 * `/main/admin/Requests/{uuid}` — campaign request detail.
 *
 * The interesting property here is that the available actions are gated by
 * status, and the gating was observed directly across all seven statuses:
 *
 *   جديد                → تعديل الحملة · حذف الحملة · اضافة قناة
 *   في انتظار الموافقه  → + قبول الطلب · رفض الطلب · جدولة القناة
 *   مقبول               → + إنشاء عرض السعر
 *   معتمد               → تنزيل الملف · تتبع الحملة الإعلانية · عرض النتائج
 */
export class RequestDetailPage extends BasePage {
  readonly shell: AppShell;

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
  }

  get pageHeading(): Locator {
    return this.page.getByText('تفاصيل الحملة', { exact: true }).first();
  }

  get editRequestButton(): Locator {
    return this.page.getByRole('button', { name: 'تعديل الحملة' });
  }

  get deleteRequestButton(): Locator {
    return this.page.getByRole('button', { name: 'حذف الحملة' });
  }

  get acceptRequestButton(): Locator {
    return this.page.getByRole('button', { name: 'قبول الطلب' });
  }

  get rejectRequestButton(): Locator {
    return this.page.getByRole('button', { name: 'رفض الطلب' });
  }

  get createQuotationButton(): Locator {
    return this.page.getByRole('button', { name: 'إنشاء عرض السعر' });
  }

  /** The اضافة قناة combobox that opens the seven channel types. */
  get addChannelCombobox(): Locator {
    return this.page.locator('[role="combobox"]').filter({ hasText: 'اضافة قناة' }).first();
  }

  channelTypeOption(name: string): Locator {
    return this.page
      .locator('[class*="dropdownItem"]')
      .filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) })
      .first();
  }

  /** The audit trail table, which is a real `<table>`. */
  get auditTable(): Locator {
    return this.page.locator('table').first();
  }

  get auditHeaders(): Locator {
    return this.auditTable.locator('thead th');
  }

  /** Value rendered beneath a labelled field on the detail page. */
  labelledValue(label: string): Locator {
    return this.page.getByText(label, { exact: true }).first();
  }

  async open(uuid: string): Promise<void> {
    await this.gotoUntilReady(this.pageHeading, `/main/admin/Requests/${uuid}`);
  }

  /** Open one channel Add form from the اضافة قناة menu. */
  async openChannelForm(type: (typeof CHANNEL_TYPES)[number]): Promise<void> {
    await this.addChannelCombobox.click();
    const option = this.channelTypeOption(type);
    await expect(option).toBeVisible();
    await option.click();
  }

  /** Visible action-button labels, used to assert status-driven gating. */
  async visibleActions(): Promise<string[]> {
    const raw = await this.page.getByRole('button').allInnerTexts();
    return raw.map((t) => t.trim()).filter(Boolean);
  }
}
