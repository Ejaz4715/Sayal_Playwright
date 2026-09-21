import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { ROUTES } from '@data/testData';

/**
 * `/main/admin/Clients/{uuid}` and its `/Edit` form.
 *
 * The detail page is where display and entry demonstrably disagree: it renders
 * the stored 14-digit CR and 13-digit VAT in full, values the Add form's
 * `maxlength=10` cannot accept (ISS-02 / ISS-03).
 */
export class ClientDetailPage extends BasePage {
  readonly shell: AppShell;

  /** Ten address fields the Edit form marks mandatory but stores as null (ISS-38). */
  static readonly MANDATORY_ADDRESS_FIELDS = [
    'street_name_english',
    'street_name_arabic',
    'district_name_english',
    'district_name_arabic',
    'city_name_english',
    'city_name_arabic',
    'province_name_english',
    'province_name_arabic',
    'building_number',
    'postal_code',
  ] as const;

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
  }

  get tabs(): Locator {
    return this.page.getByRole('tab');
  }

  field(name: string): Locator {
    return this.page.locator(`input[name="${name}"]`);
  }

  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'حفظ' });
  }

  get cancelButton(): Locator {
    return this.page.getByRole('button', { name: 'إلغاء' });
  }

  get requiredFieldErrors(): Locator {
    return this.page.getByText('حقل إجباري');
  }

  async openDetail(uuid: string): Promise<void> {
    await this.gotoUntilReady(
      this.page.getByText('معلومات العميل').first(),
      `/main/admin/Clients/${uuid}`,
    );
  }

  async openEdit(uuid: string): Promise<void> {
    await this.gotoUntilReady(this.field('cr_number'), `/main/admin/Clients/${uuid}/Edit`);
  }

  /** The blank Add form. Read-only in this suite — nothing here is submitted. */
  async gotoAdd(): Promise<void> {
    await this.gotoUntilReady(this.field('cr_number'), ROUTES.clientAdd);
  }

  /** Assert a labelled value is rendered on the detail page. */
  async expectDisplayedValue(value: string): Promise<void> {
    await expect(this.page.getByText(value, { exact: true }).first()).toBeVisible();
  }
}
