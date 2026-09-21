import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { DataTable } from './components/DataTable';
import { Pagination } from './components/Pagination';
import { Dropdown } from './components/Dropdown';
import { ROUTES } from '@data/testData';

/**
 * `/main/admin/Campaigns` — the channel list (قائمة القنوات).
 *
 * Channel numbers follow a convention worth asserting because it encodes the
 * channel type: `{requestNumber}{TypeLetter}{sequence}` — S=SMS, W=WhatsApp,
 * N=Notification, C=cold-calling, B=Banner, P=Popup. e.g. `2607001S01`.
 *
 * Row actions are gated by channel status, which was observed directly:
 *   مكتملة / قيد التنفيذ → summary · tracking · download · results
 *   جديد / جدولة        → summary · edit · cancel
 *   ألغيت               → summary only
 */
export class CampaignsPage extends BasePage {
  protected path = ROUTES.campaigns;
  readonly shell: AppShell;
  readonly table: DataTable;
  readonly pagination: Pagination;

  static readonly COLUMNS = [
    'رقم القناة',
    'رقم الحملة',
    'عنوان الحملة',
    'نوع القناة',
    'تاريخ جدولة القناة',
    'حالة القناة',
    'الإجراءات',
  ] as const;

  /** Channel-number suffix letters, keyed by channel type. */
  static readonly TYPE_LETTERS: Record<string, string> = {
    'رسائل نصية': 'S',
    واتساب: 'W',
    إشعارات: 'N',
    مكالمات: 'C',
    'مساحة إعلانية': 'B',
    'نوافذ منبثقة': 'P',
  };

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
    /* Like Requests — and unlike the other admin lists — this is a real table. */
    this.table = new DataTable(page, 'table');
    this.pagination = new Pagination(page);
  }

  get applyButton(): Locator {
    return this.page.getByRole('button', { name: 'تطبيق' });
  }

  get resetButton(): Locator {
    return this.page.getByRole('button', { name: 'إعادة التعيين' });
  }

  statusFilter(): Dropdown {
    return new Dropdown(this.page, 'الحالة');
  }

  channelTypeFilter(): Dropdown {
    return new Dropdown(this.page, 'نوع القناة');
  }

  /**
   * The header row paints well before the body: `/api/campaigns` resolves and
   * populates `<tbody>` several seconds after the table itself exists, so
   * waiting on the container alone yields a table with zero rows.
   */
  async open(): Promise<void> {
    const response = this.page.waitForResponse(
      (r) => r.url().includes('/api/campaigns?') && r.status() === 200,
      { timeout: 60_000 },
    );
    await this.goto();
    await response.catch(() => null);
    await expect(this.table.container).toBeVisible();
    await expect(this.table.rows.first()).toBeVisible();
    await this.shell.expectReady();
  }

  /** Rows as `{ channelNumber, requestNumber, type, status }`. */
  async rows(): Promise<Array<{ channel: string; request: string; type: string; status: string }>> {
    const raw = await this.table.allRowTexts();
    return raw.map((c) => ({
      channel: (c[0] ?? '').trim(),
      request: (c[1] ?? '').trim(),
      type: (c[3] ?? '').trim(),
      status: (c[5] ?? '').trim(),
    }));
  }
}
