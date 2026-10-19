import { Locator, Page, expect } from '@playwright/test';
import { ReportsPage } from './ReportsPage';
import { DataTable } from './components/DataTable';
import { ReportsManagementFiltersObjects as O } from '../objects/reports-management-filters';

type Tab = keyof typeof O.tabs;
type Control = { placeholder: string; param: string; column?: string };
type TabConfig = { submit: string; fields: Record<string, Control>; selects: Record<string, Control> };
/** The filter keys that exist on a given tab, so a typo or a key from another tab fails to compile. */
type Keys<T extends Tab> = keyof (typeof O.tabs)[T]['fields'] | keyof (typeof O.tabs)[T]['selects'];
export type Values<T extends Tab> = Partial<Record<Keys<T>, string>>;

/**
 * The filter panel of the Reports management tabs (Campaigns, Channels, Clients).
 *
 * Every tab is described as data in the objects file, so the same four methods —
 * `filter`, `expectRows`, `reset`, `expectCleared` — serve all three. Opening the
 * page and switching tabs stay with `ReportsPage`; authentication with the
 * `authedPage` fixture.
 */
export class ReportsManagementFilters {
  private readonly reports: ReportsPage;
  private readonly grid: DataTable;

  constructor(private readonly page: Page) {
    this.reports = new ReportsPage(page);
    this.grid = new DataTable(page, 'grid');
  }

  private config(tab: Tab): TabConfig {
    return O.tabs[tab] as unknown as TabConfig;
  }

  private button(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  /** The loading overlay blocks clicks until a filtered request has been applied. */
  private async waitUntilIdle(): Promise<void> {
    await expect(this.page.locator(O.loadingBackdrop).first()).toBeHidden({ timeout: 60_000 });
  }

  async openPanel(): Promise<void> {
    await this.waitUntilIdle();
    await this.reports.filterButton.click();
    await expect(this.page.locator(O.panelInputs).first()).toBeVisible();
  }

  async closePanel(): Promise<void> {
    await this.button(O.buttons.closePanel).click();
    await expect(this.reports.filterButton).toBeVisible();
  }

  /** Click a button that reloads the report; resolves with the request URL once applied. */
  private async submit(tab: Tab, button: Locator): Promise<URL> {
    const api = ReportsPage.TABS[tab].api;
    /* Exact path match: `/api/report/campaign` is a prefix of `/api/report/campaign-request`. */
    const response = this.page.waitForResponse((r) => new URL(r.url()).pathname === api && r.status() === 200);
    await button.click();
    const url = new URL((await response).url());
    await this.waitUntilIdle();
    return url;
  }

  /** Fill every given filter, apply once, and confirm the request carried each one. */
  async filter<T extends Tab>(tab: T, values: Values<T>): Promise<void> {
    const { fields, selects, submit } = this.config(tab);
    const entries = Object.entries(values) as [string, string][];

    for (const [key, value] of entries) {
      if (fields[key]) await this.page.getByPlaceholder(fields[key].placeholder).fill(value);
      else await this.choose(selects[key], value);
    }

    const url = await this.submit(tab, this.button(submit));

    for (const [key, value] of entries) {
      const { param } = fields[key] ?? selects[key];
      if (fields[key]) expect(url.searchParams.get(param), `request parameter ${param}`).toBe(value);
      else expect(url.searchParams.getAll(param), `request parameter ${param}`).not.toHaveLength(0);
    }
  }

  private async choose(control: Control, option: string): Promise<void> {
    await this.page.locator(O.select.control).filter({ hasText: control.placeholder }).click();
    await this.page.getByRole('option', { name: option }).click();
    await expect(this.page.locator(O.select.chip).filter({ hasText: option })).toBeVisible();
    /* Some menus stay open after a pick and cover the apply button; Escape closes
       an open menu, but on a closed one it would clear the selection, hence the guard. */
    if (await this.page.getByRole('option').count()) await this.page.keyboard.press('Escape');
  }

  async reset(tab: Tab): Promise<void> {
    await this.submit(tab, this.button(O.buttons.reset));
  }

  /** Every row's cell in each filter's column contains that value (filters with no column are skipped). */
  async expectRows<T extends Tab>(tab: T, values: Values<T>): Promise<void> {
    const { fields, selects } = this.config(tab);
    const headers = await this.grid.headers();
    await expect.poll(() => this.grid.rowCount()).toBeGreaterThan(0);

    for (const [key, value] of Object.entries(values) as [string, string][]) {
      const column = (fields[key] ?? selects[key]).column;
      if (!column) continue;
      const index = headers.indexOf(column);
      expect(index, `column "${column}" in [${headers.join(' | ')}]`).toBeGreaterThan(-1);
      await expect
        .poll(async () => (await this.grid.allRowTexts()).every((cells) => cells[index]?.includes(value)))
        .toBe(true);
    }
  }

  /** After a reset: no text left in any box, no dropdown selection, and the unfiltered list is back. */
  async expectCleared(): Promise<void> {
    const inputs = this.page.locator(O.panelInputs);
    await expect.poll(() => inputs.evaluateAll((els) => els.every((e) => !(e as HTMLInputElement).value))).toBe(true);
    await expect(this.page.locator(O.select.chip)).toHaveCount(0);
    await expect.poll(() => this.grid.rowCount()).toBeGreaterThan(1);
  }
}
