import { Page, Locator, expect } from '@playwright/test';

/**
 * The custom `dgaui` dropdown used by every Sayal filter.
 *
 * These are **not** `<select>` elements, so `selectOption()` silently does
 * nothing on them — a trap worth stating plainly, because the markup looks
 * conventional. Structure:
 *
 *   div.dgaui_dropdown                      ← wrapper, one per control
 *     div[role=combobox][aria-expanded]     ← div.placeholder holds the label
 *     div[role=listbox]                     ← div.dgaui_dropdownItem[data-value]
 *
 * Everything is scoped to the wrapper. Several dropdowns coexist on the
 * Requests list and each keeps its own permanently-mounted listbox, so a
 * page-level `[role=listbox]` lookup returns whichever happens to be first —
 * which reads the wrong control's options and, when two controls happen to
 * offer the same number of items, produces a passing test asserting the wrong
 * thing.
 */
export class Dropdown {
  readonly page: Page;
  readonly root: Locator;

  /** @param label the placeholder text shown when nothing is selected, e.g. الحالة */
  constructor(page: Page, label: string) {
    this.page = page;
    this.root = page
      .locator('.dgaui_dropdown')
      .filter({ has: page.locator('.placeholder', { hasText: label }) })
      .first();
  }

  private get combobox(): Locator {
    return this.root.locator('[role="combobox"]').first();
  }

  private get items(): Locator {
    return this.root.locator('[role="listbox"] .dgaui_dropdownItem');
  }

  async open(): Promise<void> {
    if ((await this.combobox.getAttribute('aria-expanded')) !== 'true') {
      await this.combobox.click();
      await expect(this.combobox).toHaveAttribute('aria-expanded', 'true');
    }
  }

  async close(): Promise<void> {
    if ((await this.combobox.getAttribute('aria-expanded')) === 'true') {
      await this.page.keyboard.press('Escape');
    }
  }

  /** Option labels in order. Opens the dropdown first. */
  async options(): Promise<string[]> {
    await this.open();
    await expect(this.items.first()).toBeVisible();
    const raw = await this.items.allInnerTexts();
    return raw.map((t) => t.trim()).filter(Boolean);
  }

  /** Select by visible label. */
  async select(option: string): Promise<void> {
    await this.open();
    const item = this.items
      .filter({ hasText: new RegExp(`^\\s*${escapeRegex(option)}\\s*$`) })
      .first();
    await expect(item).toBeVisible();
    await item.click();
    /* `root` is located by its placeholder, which is replaced by the chosen value,
       so the combobox cannot be re-resolved once an option is selected. The list
       closing (or the control no longer matching its placeholder) is the signal. */
    await expect(item).toBeHidden();
  }

  /** Select by the stable `data-value` attribute, which mirrors the API id. */
  async selectByValue(value: string | number): Promise<void> {
    await this.open();
    await this.root.locator(`[role="listbox"] [data-value="${value}"]`).first().click();
    await expect(this.combobox).toHaveAttribute('aria-expanded', 'false');
  }

  /** Text currently displayed as the selection. */
  async selectedText(): Promise<string> {
    return (await this.root.locator('.valueDisplay').innerText()).trim();
  }

  async expectSelected(option: string): Promise<void> {
    await expect(this.root.locator('.valueDisplay')).toHaveText(option);
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
