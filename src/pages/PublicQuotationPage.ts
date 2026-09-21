import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '@data/testData';

/**
 * `/public/Quotations?token=…` — the unauthenticated client-facing quotation.
 *
 * Reachable with no session at all, which is the point of the page and also its
 * main risk: a six-character token exposes company name, CR, VAT, phone and a
 * live payment link (ISS-19).
 *
 * The accept and reject actions are deliberately **not** driven by this suite.
 * Invoking them mutates a shared quotation and cascades into invoice creation,
 * which cannot be undone in pre-production.
 */
export class PublicQuotationPage extends BasePage {
  protected path = ROUTES.publicQuotation;

  constructor(page: Page) {
    super(page);
  }

  get clientInfoTab(): Locator {
    return this.page.getByText('معلومات العميل', { exact: true }).first();
  }

  get campaignDetailsTab(): Locator {
    return this.page.getByText('تفاصيل الحملة', { exact: true }).first();
  }

  async openWithToken(token: string): Promise<void> {
    await this.page.goto(`${ROUTES.publicQuotation}?token=${token}`, { waitUntil: 'commit' });
  }

  /** Assert the quotation rendered for a valid token. */
  async expectRendered(): Promise<void> {
    await expect(this.clientInfoTab).toBeVisible();
  }

  /** True when the page is showing content rather than an error. */
  async hasContent(): Promise<boolean> {
    return this.clientInfoTab.isVisible().catch(() => false);
  }
}
