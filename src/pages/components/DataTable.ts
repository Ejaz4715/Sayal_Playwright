import { Page, Locator, expect } from '@playwright/test';

/**
 * Sayal ships **two** different list implementations, and a locator that works
 * on one silently matches nothing on the other. This component wraps both.
 *
 *  - `grid`  — a div-based grid (`.TableNhc` › `.rowTabel` › `.colTbl`) used by
 *              Clients, Users, Filters, Platforms, SMS senders, Invoice,
 *              Quotations and Banner Definitions. It exposes **no ARIA roles at
 *              all**, so role-based locators cannot reach it and the stable
 *              semantic class names are the only option available.
 *  - `table` — a real HTML `<table>` used by Campaign Requests.
 *
 * The styled-components hash classes on the table (`.sc-kHpCdB`) are
 * deliberately not used: they are build-generated and change between deploys.
 */
export type TableVariant = 'grid' | 'table';

export class DataTable {
  readonly page: Page;
  readonly variant: TableVariant;
  readonly root: Locator;

  constructor(page: Page, variant: TableVariant, root?: Locator) {
    this.page = page;
    this.variant = variant;
    this.root = root ?? (variant === 'grid' ? page.locator('.TableNhc').first() : page.locator('table').first());
  }

  /** The element that proves the list has rendered. */
  get container(): Locator {
    return this.root;
  }

  get headerRow(): Locator {
    return this.variant === 'grid'
      ? this.root.locator('.rowTabel.headerItemTbl')
      : this.root.locator('thead tr');
  }

  /** Data rows only — the grid keeps its header row as a sibling of the data rows. */
  get rows(): Locator {
    return this.variant === 'grid'
      ? this.root.locator('.rowTabel:not(.headerItemTbl)')
      : this.root.locator('tbody tr');
  }

  row(index: number): Locator {
    return this.rows.nth(index);
  }

  cells(row: Locator): Locator {
    return this.variant === 'grid' ? row.locator('.colTbl') : row.locator('td');
  }

  /** Column header labels, in visual order, with empty action columns dropped. */
  async headers(): Promise<string[]> {
    const cellSel = this.variant === 'grid' ? '.colTbl' : 'th';
    const raw = await this.headerRow.locator(cellSel).allInnerTexts();
    return raw.map((t) => t.trim()).filter(Boolean);
  }

  async rowCount(): Promise<number> {
    return this.rows.count();
  }

  /** Cell text for one row, in visual order. */
  async rowTexts(index: number): Promise<string[]> {
    const raw = await this.cells(this.row(index)).allInnerTexts();
    return raw.map((t) => t.trim());
  }

  /** Every row's cell text. Used for column-wide assertions. */
  async allRowTexts(): Promise<string[][]> {
    const total = await this.rowCount();
    const out: string[][] = [];
    for (let i = 0; i < total; i++) out.push(await this.rowTexts(i));
    return out;
  }

  /** The first row containing `text` anywhere in it. */
  rowContaining(text: string | RegExp): Locator {
    return this.rows.filter({ hasText: text }).first();
  }

  /**
   * Open the row action menu.
   *
   * On the grid this is an inline `svg[name="menu"]` in the trailing cell, not a
   * `<button>` — which is why a button-based search finds nothing. On the table
   * the actions column holds text controls instead.
   */
  async openRowMenu(index: number): Promise<void> {
    const row = this.row(index);
    const kebab = row.locator('svg[name="menu"]');
    await expect(kebab).toBeVisible();
    await kebab.click();
  }

  /** Assert the list rendered with at least one row. */
  async expectLoaded(): Promise<void> {
    await expect(this.container).toBeVisible();
    await expect(this.rows.first()).toBeVisible();
  }

  /** Assert the list rendered but holds no data rows. */
  async expectEmpty(): Promise<void> {
    await expect(this.rows).toHaveCount(0);
  }

  /** Assert a specific column, identified by header label, holds only `value`. */
  async expectColumnAllEqual(header: string, value: string | RegExp): Promise<void> {
    const headers = await this.headers();
    const col = headers.indexOf(header);
    expect(col, `column "${header}" not found in [${headers.join(' | ')}]`).toBeGreaterThan(-1);

    const rows = await this.allRowTexts();
    expect(rows.length, 'expected at least one row to assert against').toBeGreaterThan(0);
    for (const cells of rows) {
      const actual = cells[col] ?? '';
      if (value instanceof RegExp) expect(actual).toMatch(value);
      else expect(actual).toBe(value);
    }
  }
}
