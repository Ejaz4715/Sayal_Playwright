# 02 · Known-defect guards — admin

**Spec** `tests/admin/known-defects.spec.ts` · **Project** `sayal` · **Cases** 5 · **Time** 79.9s

Every case in this file asserts the behaviour the product **should** have and is marked
`test.fail()`. While the defect stands, Playwright reports an *expected failure* — never a
pass — so the defect stays visible in every run. The day one is fixed, its guard becomes an
unexpected pass and the suite goes red until someone removes the marker.

No assertion here is weakened to go green, and nothing writes to shared data: the two cases
that need a write path intercept the request and abort it in the browser.

---

### TC-011 · ISS-38 — An existing client can be saved without inventing address data

**Priority** P1 · **Tags** `@known-defect` · **Result (26 Aug 2026)** Expected failure · 15.0s

**Preconditions** — the read-only client fixture `الشركة الوطنية للاسكان`, whose stored
address fields are all `null`.

**Steps**
1. Open `/main/admin/Clients/{uuid}/Edit`.
2. Assert the preconditions *before* the business assertion, so a form that failed to load
   can never be mistaken for the defect reproducing: the CR field holds `19065734264534`
   and the حفظ button is visible.
3. Install a route handler on `**/api/clients**` that lets `GET` through, and records then
   **aborts** every non-GET — this test must never mutate pre-production.
4. Click حفظ without changing a single field.
5. Poll for up to 10s for a recorded write attempt.

**Expected result (the product should)** — a no-op save of an unchanged record issues a
request.

**Actual behaviour** — no request is ever issued. Ten address fields are mandatory on the
Edit form but `null` in every stored record, so client-side validation blocks the submit.
A legacy client cannot be edited at all: correcting a phone number means inventing street,
district, city, province, building number and postal code in both languages.

---

### TC-012 · ISS-39 — Platform URL rejects a `javascript:` scheme

**Priority** P1 · **Tags** `@known-defect` · **Result (26 Aug 2026)** Expected failure · 2.2s

**Steps**
1. Open `/main/admin/Platforms/Add` and wait for the رابط المنصة field.
2. Control case first — enter `not a url` and read `checkValidity()`. This proves the field
   validates at all, isolating the scheme as the gap rather than blaming validation
   generally.
3. Enter `javascript:alert(1)` and read `checkValidity()`.

**Expected result (the product should)** — `checkValidity()` returns `false` for
`javascript:alert(1)`, as it does for `not a url`.

**Actual behaviour** — the field is `type="url"`, which rejects a malformed value but
accepts any scheme, so `javascript:alert(1)` is treated as valid. Stored XSS if the value
is ever rendered as an href. Nothing is submitted by this case.

---

### TC-013 · ISS-40 — An unknown role id does not render an editable form

**Priority** P2 · **Tags** `@known-defect` · **Result (26 Aug 2026)** Expected failure · 24.5s

**Steps**
1. Start listening for `GET /api/roles/undefined`.
2. Navigate to `/main/admin/Roles/undefined/Edit`. The literal segment `undefined` is used
   deliberately — an arbitrary bad id is handled correctly and the form does not render, so
   the defect is specific to the value the app itself produces when it builds the URL from
   an unset variable. Testing a random id would quietly pass and hide the fault.
3. Wait for the role lookup to resolve and assert its status is ≥ 400 — the precise moment
   the app knows the role does not exist. Asserting absence straight after a `commit`
   navigation would pass trivially, reporting the defect as fixed while it stands.
4. Confirm the permission matrix rendered, then look for the حفظ التعديل button.

**Expected result (the product should)** — a nonexistent role offers no working save
control.

**Actual behaviour** — the lookup answers 400 and the page throws an unhandled TypeError,
yet a fully usable 90-checkbox permission form and its save button render anyway.

---

### TC-014 · ISS-41 — A report tab deep link restores that tab

**Priority** P3 · **Tags** `@known-defect` · **Result (26 Aug 2026)** Expected failure · 33.6s

**Steps**
1. Start listening for `GET /api/report/campaign?…` → 200 — the channels-report endpoint.
2. Navigate directly to `/main/admin/ReportsManagement?tab=1`.
3. Wait for the export buttons, then for the channel-report request.
4. Look for the heading تقارير القنوات.

**Expected result (the product should)** — arriving directly on `?tab=1` opens the channels
report.

**Actual behaviour** — the parameter is written to the URL when a tab is clicked but the
tab is restored from component state, not from the URL. A bookmark, a shared link or a
refresh silently shows the campaigns report instead.

---

### TC-015 · ISS-42 — User status wording matches between list and detail

**Priority** P3 · **Tags** `@known-defect` · **Result (26 Aug 2026)** Expected failure · 4.5s

**Preconditions** — the read-only deactivated user fixture `Test Automation User`.

**Steps**
1. Open `/main/admin/Users` and locate the fixture user's row.
2. Read its الحالة cell.
3. Open that user's detail page and wait for معلومات المستخدم.
4. Compare the list value with the detail value.

**Expected result (the product should)** — one state is described by one word in both
places.

**Actual behaviour** — the list says غير فعال where the detail page says معطل. Cheap to
fix, and it undermines confidence in every status column in the product.
