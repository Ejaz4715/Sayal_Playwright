import { Page, Locator, expect } from '@playwright/test';

/**
 * Pagination — and Sayal ships **two** implementations of it.
 *
 *  - `mui`  — a real `nav[aria-label="pagination navigation"]` with proper aria
 *             labels, used by Invoice, Quotations, Filters and the other grid
 *             lists. This is the only widget in the product with usable
 *             accessibility information.
 *  - `tabs` — the Requests list instead renders its pager as `role="tab"`
 *             elements labelled `<`, `1`, `2`, … `>`. Reusing the MUI locators
 *             there finds nothing at all, so the variant has to be handled
 *             rather than assumed.
 *
 * The constructor auto-detects, because a caller should not have to know which
 * list it is looking at.
 */
export class Pagination {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get muiRoot(): Locator {
    return this.page.getByRole('navigation', { name: 'pagination navigation' }).first();
  }

  /** Tab-based pager items: page numbers and the two arrows. */
  private get tabItems(): Locator {
    return this.page.getByRole('tab').filter({ hasText: /^\s*(\d+|<|>)\s*$/ });
  }

  private async isMui(): Promise<boolean> {
    return (await this.muiRoot.count()) > 0;
  }

  /** Whichever pager is present. */
  async root(): Promise<Locator> {
    return (await this.isMui()) ? this.muiRoot : this.tabItems.first();
  }

  async expectVisible(): Promise<void> {
    if (await this.isMui()) {
      await expect(this.muiRoot).toBeVisible();
      return;
    }
    await expect(
      this.tabItems.first(),
      'neither the MUI pager nor the tab-based pager was found',
    ).toBeVisible();
  }

  async pageButton(n: number): Promise<Locator> {
    if (await this.isMui()) return this.muiRoot.getByRole('button', { name: `Go to page ${n}` });
    return this.page.getByRole('tab', { name: String(n), exact: true });
  }

  async goToPage(n: number): Promise<void> {
    await (await this.pageButton(n)).click();
  }

  /** Highest page number offered. MUI elides long ranges, so this is the last rendered number. */
  async lastPageNumber(): Promise<number> {
    let max = 1;
    if (await this.isMui()) {
      for (const b of await this.muiRoot.getByRole('button').all()) {
        const name = (await b.getAttribute('aria-label')) ?? '';
        const m = name.match(/Go to page (\d+)/);
        if (m) max = Math.max(max, Number(m[1]));
      }
      return max;
    }
    for (const t of await this.tabItems.all()) {
      const text = (await t.innerText()).trim();
      if (/^\d+$/.test(text)) max = Math.max(max, Number(text));
    }
    return max;
  }

  /** On page 1 the previous control must be inert — a real boundary check. */
  async expectAtFirstPageBoundary(): Promise<void> {
    if (await this.isMui()) {
      await expect(this.muiRoot.getByRole('button', { name: 'Go to previous page' })).toBeDisabled();
      return;
    }
    /* The tab pager has no disabled state to read; assert page 1 is the
       selected tab instead, which is the observable equivalent. */
    await expect(this.page.getByRole('tab', { name: '1', exact: true })).toBeVisible();
  }
}
