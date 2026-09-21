import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { ROUTES, SETTINGS } from '@data/testData';

/**
 * `/main/admin/Settings/General` — the highest-leverage screen in the product.
 *
 * Five numeric parameters here silently govern behaviour elsewhere: quotation
 * and invoice validity windows drive the expiry-cancellation path, and the
 * minimum audience count gates audience creation. Assertions in other modules
 * derive their expected values from these, so this page is read-only in the
 * suite — changing a value here would move the goalposts for several other
 * tests against a shared environment.
 */
export class GeneralSettingsPage extends BasePage {
  protected path = ROUTES.generalSettings;
  readonly shell: AppShell;

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
  }

  field(name: string): Locator {
    return this.page.locator(`input[name="${name}"]`);
  }

  get previewMessages(): Locator {
    return this.field('nb_allowed_preview_messages');
  }

  get minAudienceCount(): Locator {
    return this.field('min_audience_count');
  }

  get defaultTargetCount(): Locator {
    return this.field('default_target_count');
  }

  get quotationValidity(): Locator {
    return this.field('quotation_validity_per_day');
  }

  get invoiceValidity(): Locator {
    return this.field('invoice_validity_per_day');
  }

  get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'حفظ' });
  }

  async open(): Promise<void> {
    await this.gotoUntilReady(this.quotationValidity);
    await this.shell.expectReady();
  }

  /** Assert every parameter matches the value recorded during exploration. */
  async expectGoverningValues(): Promise<void> {
    await expect(this.previewMessages).toHaveValue(SETTINGS.previewMessages);
    await expect(this.minAudienceCount).toHaveValue(SETTINGS.minAudienceCount);
    await expect(this.defaultTargetCount).toHaveValue(SETTINGS.defaultTargetCount);
    await expect(this.quotationValidity).toHaveValue(SETTINGS.quotationValidityDays);
    await expect(this.invoiceValidity).toHaveValue(SETTINGS.invoiceValidityDays);
  }
}
