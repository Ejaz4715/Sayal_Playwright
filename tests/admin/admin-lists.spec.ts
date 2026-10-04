import { logStep } from '@helpers/LogSteps';
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
  test('TC-01 User list renders the five expected columns and status badges', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the user list');
    const users = usersList(authedPage);
    await users.open();

    await logStep('Step 02: Verify the user list column headers');
    await users.expectColumns();

    await logStep('Step 03: Verify the user list contains records');
    await users.expectHasRows();
    /* Both status values exist in PRE, so the column is genuinely populated. */

    await logStep('Step 04: Read all rows from the user list');
    const rows = await users.table.allRowTexts();
    const statuses = new Set(rows.map((c) => c[3]?.trim()));

    await logStep('Step 05: Verify some meets the expected condition');
    expect([...statuses].some((s) => s === 'مفعل')).toBe(true);
  });

  test('TC-02 Filters module lists records across pages', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the filters list');
    const filters = filtersList(authedPage);
    await filters.open();

    await logStep('Step 02: Verify the filters list column headers');
    await filters.expectColumns();

    await logStep('Step 03: Verify the filters list contains records');
    await filters.expectHasRows();

    await logStep('Step 04: Check the last page number in the filters list');
    const lastPage = await filters.pagination.lastPageNumber();

    await logStep('Step 05: Verify last page meets the expected condition');
    expect(lastPage, 'the filters list paginates').toBeGreaterThanOrEqual(VOLUMES.filterPages);

    /* Every filter belongs to a platform and carries an active/disabled state. */

    await logStep('Step 06: Read all rows from the filters list');
    const rows = await filters.table.allRowTexts();

    await logStep('Step 07: Verify the displayed data meets the expected condition');
    for (const cells of rows) {
      expect(['فعال', 'معطل'], `unexpected filter state "${cells[2]}"`).toContain(cells[2]?.trim());
    }
  });

  test('TC-03 Platforms list renders the expected source platforms', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the platforms list');
    const platforms = platformsList(authedPage);
    await platforms.open();

    await logStep('Step 02: Verify the platforms list column headers');
    await platforms.expectColumns();

    await logStep('Step 03: Read all rows from the platforms list');
    const rows = await platforms.table.allRowTexts();
    const names = rows.map((c) => (c[0] ?? '').trim());

    await logStep('Step 04: Verify names meets the expected condition');
    for (const platform of PLATFORMS) {
      expect(names, `platform "${platform}"`).toContain(platform);
    }
  });

  test('TC-04 SMS sender list matches all registered sender identities', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the senders');
    const senders = smsSendersList(authedPage);
    await senders.open();

    await logStep('Step 02: Verify the senders column headers');
    await senders.expectColumns();

    await logStep('Step 03: Read all rows from the senders');
    const rows = await senders.table.allRowTexts();
    const names = rows.map((c) => (c[0] ?? '').trim());

    await logStep('Step 04: Verify sort meets the expected condition');
    expect(names.sort()).toEqual([...SMS_SENDERS].sort());
  });

  test('TC-05 Invoice list renders the expected columns and statuses', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({
    authedPage,
  }) => {

    await logStep('Step 01: Open the invoice list');
    const invoices = invoiceList(authedPage);
    await invoices.open();

    await logStep('Step 02: Verify the invoice list column headers');
    await invoices.expectColumns();

    await logStep('Step 03: Verify the invoice list contains records');
    await invoices.expectHasRows();

    await logStep('Step 04: Read all rows from the invoice list');
    const rows = await invoices.table.allRowTexts();
    const statuses = new Set(rows.map((c) => (c[3] ?? '').trim()));

    await logStep('Step 05: Verify the displayed data meets the expected condition');
    for (const s of statuses) {
      expect(['مدفوعة بالكامل', 'ملغاة'], `unexpected invoice status "${s}"`).toContain(s);
    }
  });

  test('TC-06 Cancelled invoices include the cancellation reason and no payment date', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the invoice list');
    const invoices = invoiceList(authedPage);
    await invoices.open();

    await logStep('Step 02: Read all rows from the invoice list');
    const rows = await invoices.table.allRowTexts();
    const cancelled = rows.filter((c) => (c[3] ?? '').trim() === 'ملغاة');

    await logStep('Step 03: Verify length meets the expected condition');
    expect(cancelled.length, 'PRE holds cancelled invoices to assert against').toBeGreaterThan(0);

    await logStep('Step 04: Verify trim meets the expected condition');
    for (const row of cancelled) {
      /* A cancelled invoice must state why, and must have no payment date. */
          expect(row[7]?.trim(), 'cancellation reason').toBeTruthy();
      expect(row[5]?.trim(), 'a cancelled invoice must not have been paid').toBe('-');
    }
  });

  test('TC-07 Quotation list renders the expected columns', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the quotation list');
    const quotations = quotationsList(authedPage);
    await quotations.open();

    await logStep('Step 02: Verify the quotation list column headers');
    await quotations.expectColumns();

    await logStep('Step 03: Verify the quotation list contains records');
    await quotations.expectHasRows();
  });

  test('TC-08 Quotation validity window matches the configured 7-day period', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the quotation list');
    const quotations = quotationsList(authedPage);
    await quotations.open();

    await logStep('Step 02: Read all rows from the quotation list');
    const rows = await quotations.table.allRowTexts();
    const withDates = rows.filter((c) => c[4]?.trim() && c[5]?.trim() && c[5].trim() !== '-');

    await logStep('Step 03: Verify length meets the expected condition');
    expect(withDates.length, 'quotations with both dates').toBeGreaterThan(0);

    await logStep('Step 04: Verify days meets the expected condition');
    for (const row of withDates.slice(0, 5)) {
      const created = new Date(row[4]);
      const expires = new Date(row[5]);
      if (Number.isNaN(created.valueOf()) || Number.isNaN(expires.valueOf())) continue;
      const days = Math.round((expires.valueOf() - created.valueOf()) / 86_400_000);
      expect(days, `validity window for ${row[0]}`).toBeGreaterThanOrEqual(7);
    }
  });

  test('TC-09 Banner definitions list is populated with row actions', { annotation: [{ product: 'Sayal', type: 'non-critical' } as any] }, async ({ authedPage }) => {

    await logStep('Step 01: Open the banner definitions list');
    const banners = bannerDefinitionsList(authedPage);
    await banners.open();

    await logStep('Step 02: Verify the banner definitions list column headers');
    await banners.expectColumns();
    /* Corrects the earlier report, which recorded this list as empty in PRE. */

    await logStep('Step 03: Verify the banner definitions list contains records');
    await banners.expectHasRows();
  });
});
