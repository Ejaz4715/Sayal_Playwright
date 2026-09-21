import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { ROUTES } from '@data/testData';

/**
 * `/main/admin/Audience` and its builder at `/Audience/Create`.
 *
 * The create route is `/Create`, not `/Add` — `/Add` is parsed as a record id
 * and the API answers 400, which renders an indefinite "analysing data" state
 * rather than a not-found page.
 *
 * The audience list is empty in pre-production (`total: 0`), so the empty state
 * is the observable behaviour here and creation is not exercised: a saved
 * audience cannot be removed through the UI, so the suite would accumulate
 * undeletable records in a shared environment.
 */
export class AudiencePage extends BasePage {
  protected path = ROUTES.audience;
  readonly shell: AppShell;

  /** Filters the builder offers, all observed on the Sakani platform tab. */
  static readonly BUILDER_FILTERS = [
    'المدينة',
    'الجنس',
    'الضمان الإجتماعي',
    'الدخل',
    'حالة العقد',
    'حالة الاستحقاق في سكني',
    'التفضيلات',
    'عدد افراد الأسرة',
    'العمر',
    'المهنة',
    'لديه تصميم هندسي',
    'لديه رخصة بناء',
    'السكن الحالي',
    'موقع العقار الجديد',
    'الحالة الاجتماعية',
    'حالة الحجز',
  ] as const;

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
  }

  get emptyStateHeading(): Locator {
    return this.page.getByText('ليس لديك جمهور');
  }

  get emptyStateCta(): Locator {
    return this.page.getByText('إنشاء مجموعة مستهدفة جديدة');
  }

  get createButton(): Locator {
    return this.page.getByRole('button', { name: 'اضافة جمهور' });
  }

  get nameField(): Locator {
    return this.page.getByPlaceholder('أدخل اسم الجمهور');
  }

  get descriptionField(): Locator {
    return this.page.getByPlaceholder('وصف الجمهور');
  }

  filterField(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  async open(): Promise<void> {
    await this.gotoUntilReady(this.emptyStateHeading);
    await this.shell.expectReady();
  }

  async openBuilder(): Promise<void> {
    await this.gotoUntilReady(this.nameField, ROUTES.audienceCreate);
    await this.shell.expectReady();
  }

  /** Assert the builder offers a given targeting filter. */
  async expectFilterOffered(placeholder: string): Promise<void> {
    await expect(this.filterField(placeholder), `audience filter "${placeholder}"`).toBeVisible();
  }
}
