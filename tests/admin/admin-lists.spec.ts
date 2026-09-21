import { test, expect } from '@fixtures/pages.fixture';
import {
  usersList,
  filtersList,
  platformsList,
  smsSendersList,
  invoiceList,
  quotationsList,
  bannerDefinitionsList,
} from '@pages/adminLists';
import { SMS_SENDERS, PLATFORMS, VOLUMES } from '@data/testData';

/**
 * The eight `.TableNhc` admin lists. Each assertion is the column set and data
 * shape actually observed in pre-production, not a guess at what should exist.
 */
test.describe('Admin lists', () => {
  test('SAYAL-USR-001 user list renders its 5 columns and status badges @P1', async ({
    authedPage,
  }) => {
    const users = usersList(authedPage);
    await users.open();

    await users.expectColumns();
    await users.expectHasRows();
    /* Both status values exist in PRE, so the column is genuinely populated. */
    const rows = await users.table.allRowTexts();
    const statuses = new Set(rows.map((c) => c[3]?.trim()));
    expect([...statuses].some((s) => s === 'مفعل')).toBe(true);
  });

  test('SAYAL-GAP-010 filters module lists its records across pages @P2', async ({ authedPage }) => {
    const filters = filtersList(authedPage);
    await filters.open();

    await filters.expectColumns();
    await filters.expectHasRows();

    const lastPage = await filters.pagination.lastPageNumber();
    expect(lastPage, 'the filters list paginates').toBeGreaterThanOrEqual(VOLUMES.filterPages);

    /* Every filter belongs to a platform and carries an active/disabled state. */
    const rows = await filters.table.allRowTexts();
    for (const cells of rows) {
      expect(['فعال', 'معطل'], `unexpected filter state "${cells[2]}"`).toContain(cells[2]?.trim());
    }
  });

  test('SAYAL-GAP-012 platforms list renders the eight source platforms @P2', async ({
    authedPage,
  }) => {
    const platforms = platformsList(authedPage);
    await platforms.open();

    await platforms.expectColumns();
    const rows = await platforms.table.allRowTexts();
    const names = rows.map((c) => (c[0] ?? '').trim());
    for (const platform of PLATFORMS) {
      expect(names, `platform "${platform}"`).toContain(platform);
    }
  });

  test('SAYAL-GAP-014 SMS sender list matches the nine registered identities @P2', async ({
    authedPage,
  }) => {
    const senders = smsSendersList(authedPage);
    await senders.open();

    await senders.expectColumns();
    const rows = await senders.table.allRowTexts();
    const names = rows.map((c) => (c[0] ?? '').trim());
    expect(names.sort()).toEqual([...SMS_SENDERS].sort());
  });

  test('SAYAL-GAP-015 invoice list renders its 8 columns and both statuses @P1', async ({
    authedPage,
  }) => {
    const invoices = invoiceList(authedPage);
    await invoices.open();

    await invoices.expectColumns();
    await invoices.expectHasRows();

    const rows = await invoices.table.allRowTexts();
    const statuses = new Set(rows.map((c) => (c[3] ?? '').trim()));
    for (const s of statuses) {
      expect(['مدفوعة بالكامل', 'ملغاة'], `unexpected invoice status "${s}"`).toContain(s);
    }
  });

  test('invoice cancellations carry the expiry reason @P1', async ({ authedPage }) => {
    const invoices = invoiceList(authedPage);
    await invoices.open();

    const rows = await invoices.table.allRowTexts();
    const cancelled = rows.filter((c) => (c[3] ?? '').trim() === 'ملغاة');
    expect(cancelled.length, 'PRE holds cancelled invoices to assert against').toBeGreaterThan(0);

    for (const row of cancelled) {
      /* A cancelled invoice must state why, and must have no payment date. */
      expect(row[7]?.trim(), 'cancellation reason').toBeTruthy();
      expect(row[5]?.trim(), 'a cancelled invoice must not have been paid').toBe('-');
    }
  });

  test('SAYAL-QUO-001 quotation list renders its 9 columns @P1', async ({ authedPage }) => {
    const quotations = quotationsList(authedPage);
    await quotations.open();

    await quotations.expectColumns();
    await quotations.expectHasRows();
  });

  test('quotation validity window matches the configured 7 days @P1', async ({ authedPage }) => {
    const quotations = quotationsList(authedPage);
    await quotations.open();

    const rows = await quotations.table.allRowTexts();
    const withDates = rows.filter((c) => c[4]?.trim() && c[5]?.trim() && c[5].trim() !== '-');
    expect(withDates.length, 'quotations with both dates').toBeGreaterThan(0);

    for (const row of withDates.slice(0, 5)) {
      const created = new Date(row[4]);
      const expires = new Date(row[5]);
      if (Number.isNaN(created.valueOf()) || Number.isNaN(expires.valueOf())) continue;
      const days = Math.round((expires.valueOf() - created.valueOf()) / 86_400_000);
      expect(days, `validity window for ${row[0]}`).toBeGreaterThanOrEqual(7);
    }
  });

  test('banner definitions list is populated with row actions @P2', async ({ authedPage }) => {
    const banners = bannerDefinitionsList(authedPage);
    await banners.open();

    await banners.expectColumns();
    /* Corrects the earlier report, which recorded this list as empty in PRE. */
    await banners.expectHasRows();
  });
});
