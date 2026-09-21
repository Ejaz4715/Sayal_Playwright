import { test, expect } from '@fixtures/pages.fixture';
import { ClientDetailPage } from '@pages/ClientDetailPage';
import { ReportsPage } from '@pages/ReportsPage';
import { usersList } from '@pages/adminLists';
import { READONLY_FIXTURES, ROUTES } from '@data/testData';

/**
 * Known-defect guards for the findings recorded during exploration.
 *
 * Each asserts the behaviour the product *should* have and is marked as an
 * expected failure, so Playwright reports it distinctly rather than as a pass.
 * The day a defect is fixed the guard becomes an unexpected pass, which is
 * loud — that is the point. Nothing here is weakened to go green, and none of
 * them writes to shared data.
 */
test.describe('Known product defects', () => {
  /**
   * ISS-38 — a legacy client cannot be edited at all.
   *
   * Ten address fields are mandatory on the Edit form but null in every stored
   * record, so an untouched save is refused client-side and no request is
   * issued. Correcting a phone number means inventing address data.
   */
  test('ISS-38 an existing client can be saved without inventing address data @known-defect @P1', async ({
    authedPage,
  }) => {
    test.fail(true, 'ISS-38: ten address fields are mandatory on edit but null in stored records');

    const detail = new ClientDetailPage(authedPage);
    await detail.openEdit(READONLY_FIXTURES.client.uuid);

    /* Preconditions asserted before the business assertion, so a failure to
       load the form can never be mistaken for the defect reproducing. */
    await expect(detail.field('cr_number')).toHaveValue(READONLY_FIXTURES.client.crNumber);
    await expect(detail.saveButton).toBeVisible();

    const writes: string[] = [];
    await authedPage.route('**/api/clients**', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') return route.continue();
      /* Record the attempt and abort it — this test must never mutate PRE. */
      writes.push(request.method());
      await route.abort();
    });

    await detail.saveButton.click();

    /* A no-op save should submit. It does not: validation blocks it first. */
    await expect
      .poll(() => writes.length, {
        message: 'saving an unchanged client must issue a request',
        timeout: 10_000,
      })
      .toBeGreaterThan(0);
  });

  /**
   * ISS-39 — `platform_url` accepts a `javascript:` URL.
   *
   * The field is `type="url"`, which correctly rejects a malformed value but
   * treats any scheme as valid. The submit is intercepted and aborted here, so
   * nothing is stored.
   */
  test('ISS-39 platform URL rejects a javascript: scheme @known-defect @P1', async ({
    authedPage,
  }) => {
    test.fail(true, 'ISS-39: type="url" accepts any scheme, including javascript:');

    await authedPage.goto(ROUTES.platformAdd, { waitUntil: 'commit' });
    const urlField = authedPage.getByPlaceholder('رابط المنصة');
    await expect(urlField).toBeVisible();

    /* Control case first: a malformed value really is rejected, which proves
       the field validates at all and isolates the scheme as the gap. */
    await urlField.fill('not a url');
    expect(await urlField.evaluate((el: HTMLInputElement) => el.checkValidity())).toBe(false);

    await urlField.fill('javascript:alert(1)');
    expect(
      await urlField.evaluate((el: HTMLInputElement) => el.checkValidity()),
      'a javascript: URL must not be considered valid',
    ).toBe(false);
  });

  /**
   * ISS-40 — an unknown role id renders a fully usable edit form.
   *
   * `GET /api/roles/undefined` answers 400 and the page throws an unhandled
   * TypeError, yet the permission matrix and its save button render anyway.
   */
  test('ISS-40 an unknown role id does not render an editable form @known-defect @P2', async ({
    authedPage,
  }) => {
    test.fail(true, 'ISS-40: the edit form renders despite the API returning 400');

    /**
     * The literal segment `undefined` is used deliberately. An arbitrary bad id
     * is handled correctly — the form does not render — so the defect is
     * specific to this value, which is exactly what the app itself produces
     * when it builds the URL from an undefined variable. Testing a random id
     * instead would quietly pass and hide the real fault.
     */
    const roleLookup = authedPage.waitForResponse((r) => r.url().includes('/api/roles/undefined'), {
      timeout: 30_000,
    });
    await authedPage.goto('/main/admin/Roles/undefined/Edit', { waitUntil: 'commit' });

    /**
     * Wait for the app to actually resolve the route before asserting absence.
     * Asserting straight after a `commit` navigation passes trivially — nothing
     * has rendered yet — which would report this defect as fixed while it
     * stands. The failing lookup is the precise moment the app knows the role
     * does not exist.
     */
    const lookup = await roleLookup;
    expect(lookup.status(), 'the role lookup is expected to fail').toBeGreaterThanOrEqual(400);
    await expect(authedPage.locator('input[type="checkbox"]').first()).toBeVisible();

    const saveButton = authedPage.getByRole('button', { name: /حفظ التعديل/ });
    await expect(
      saveButton,
      'a nonexistent role must not offer a working save control',
    ).toBeHidden();
  });

  /**
   * ISS-41 — the `?tab=` deep link is ignored on direct navigation.
   *
   * Clicking a tab writes the parameter to the URL, but arriving on that URL
   * directly — a bookmark, a shared link, or a refresh — renders the campaigns
   * report instead.
   */
  test('ISS-41 a report tab deep link restores that tab @known-defect @P3', async ({
    authedPage,
  }) => {
    test.fail(true, 'ISS-41: the tab is restored from component state, not the URL');

    const reports = new ReportsPage(authedPage);
    const channelReport = authedPage.waitForResponse(
      (r) => r.url().includes('/api/report/campaign?') && r.status() === 200,
      { timeout: 30_000 },
    );

    await authedPage.goto('/main/admin/ReportsManagement?tab=1', { waitUntil: 'commit' });
    await expect(reports.pdfButton).toBeVisible();

    await channelReport;
    await expect(reports.heading('تقارير القنوات')).toBeVisible();
  });

  /**
   * ISS-42 — the same user state is labelled differently in two places.
   */
  test('ISS-42 user status wording matches between list and detail @known-defect @P3', async ({
    authedPage,
  }) => {
    test.fail(true, 'ISS-42: the list says غير فعال where the detail page says معطل');

    const users = usersList(authedPage);
    await users.open();

    const row = users.table.rowContaining(READONLY_FIXTURES.inactiveUser.name);
    await expect(row, 'the deactivated fixture user must be present').toBeVisible();
    const cells = await users.table.cells(row).allInnerTexts();
    const listStatus = cells[3]?.trim();

    await authedPage.goto(`/main/admin/Users/${READONLY_FIXTURES.inactiveUser.uuid}`, {
      waitUntil: 'commit',
    });
    await expect(authedPage.getByText('معلومات المستخدم').first()).toBeVisible();

    const detailStatus = READONLY_FIXTURES.inactiveUser.detailStatus;
    expect(
      listStatus,
      `the list and detail pages must describe one state consistently (list "${listStatus}" vs detail "${detailStatus}")`,
    ).toBe(detailStatus);
  });
});
