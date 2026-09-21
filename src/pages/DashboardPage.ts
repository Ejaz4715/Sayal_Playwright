import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { ROUTES, SMS_SENDERS } from '@data/testData';

/** `/main/admin/Dashboard` — calendar plus six widgets. */
export class DashboardPage extends BasePage {
  protected readonly path = ROUTES.dashboard;
  readonly shell: AppShell;

  /** The six widget captions, in render order. */
  static readonly WIDGETS = [
    'اجمالي القنوات',
    'اجمالي تسجيل المستخدمين',
    'حالات المستخدمين',
    'هوية المرسلين',
    'انواع القنوات',
    'حالات القنوات',
  ] as const;

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
  }

  get quickPromoButton(): Locator {
    return this.page.getByRole('button', { name: 'النشر السريع' });
  }

  get calendar(): Locator {
    return this.page.locator('.fc').first();
  }

  get todayButton(): Locator {
    return this.page.getByRole('button', { name: 'اليوم' });
  }

  get nextMonthButton(): Locator {
    return this.page.locator('.fc-next-button');
  }

  get previousMonthButton(): Locator {
    return this.page.locator('.fc-prev-button');
  }

  widget(caption: string): Locator {
    return this.page.getByText(caption, { exact: true }).first();
  }

  async open(): Promise<void> {
    await this.gotoUntilReady(this.quickPromoButton);
    await this.shell.expectReady();
  }

  async expectAllWidgets(): Promise<void> {
    for (const w of DashboardPage.WIDGETS) {
      await expect(this.widget(w), `dashboard widget "${w}"`).toBeVisible();
    }
  }

  /** The sender-identity widget lists the same nine identities as the settings module. */
  async expectSenderIdentities(): Promise<void> {
    for (const sender of SMS_SENDERS) {
      await expect(this.page.getByText(sender, { exact: true }).first()).toBeVisible();
    }
  }
}
