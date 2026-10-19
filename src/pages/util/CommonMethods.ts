import { expect, Page } from '@playwright/test';
type Element =
  | { readonly xpath: string }
  | {
      readonly role: Parameters<Page['getByRole']>[0];
      readonly name: string;
      readonly exact?: boolean;
    }
  | {
      readonly text: string;
      readonly exact?: boolean;
    };
export class CommonMethods {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  /**
   * Clicks on a locator if it is visible.
   * @param locator The locator to click.
   * @param options Timeout options.
   */
  async clickIfVisible(locator: any, options: { timeout?: number } = {}) {
    const timeout = options.timeout ?? 5000;
    const isVisible = await locator.isVisible({ timeout }).catch(() => false);
    if (isVisible) {
      await locator.click();
    }
  }

  async clickElement(elementObject: Element) {
    const element =
      'xpath' in elementObject
        ? this.page.locator(elementObject.xpath)
        : 'role' in elementObject
          ? this.page.getByRole(elementObject.role, {
              name: elementObject.name,
              exact: elementObject.exact,
            })
          : this.page.getByText(elementObject.text, {
              exact: elementObject.exact,
            });

    await element.waitFor({ state: 'visible' });
    await element.click();
  }

  async verifyElementVisible(elementObject: Element) {
    const element =
      'xpath' in elementObject
        ? this.page.locator(elementObject.xpath)
        : 'role' in elementObject
          ? this.page.getByRole(elementObject.role, {
              name: elementObject.name,
              exact: elementObject.exact,
            })
          : this.page.getByText(elementObject.text, {
              exact: elementObject.exact,
            });

    await expect(element).toBeVisible();
  }
}
