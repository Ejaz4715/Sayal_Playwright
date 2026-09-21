# 08 · Clients

**Spec** `tests/clients/clients.spec.ts` · **Project** `sayal` · **Cases** 7 · **Time** 46.6s

Corporate client records. This module gets its own page object because of the filter panel,
the only one of its kind in the product: four named text filters plus apply and reset, each
mapping to a query parameter.

Three of these cases together establish a defect that no single case could prove — the
client detail and edit screens render a 14-digit CR and 13-digit VAT correctly, while the
Add form cannot accept values that long.

---

### TC-041 · SAYAL-CLI-001 — Client list renders its 6 columns

**Priority** P1 · **Tags** `@smoke` · **Result (26 Aug 2026)** Passed · 4.9s

**Steps**
1. Open `/main/admin/Clients`, waiting for `GET /api/clients` → 200, the grid and its first
   row.
2. Read the header row.

**Expected result**
- Columns are exactly: اسم الشركة · اسم العميل · رقم السجل التجاري · رقم الهاتف ·
  البريد الإلكتروني · مصدر العميل.
- The list is populated.

---

### TC-042 · SAYAL-GAP-003 — Filter narrows the list and reset restores it

**Priority** P2 · **Result (26 Aug 2026)** Passed · 4.0s

**Steps**
1. Open `/main/admin/Clients` and record the baseline row count.
2. Open the filter panel via تصفية and fill اسم الشركة with `NHC`.
3. Apply with تطبيق, waiting for the filtered `GET /api/clients` → 200.
4. Read every company name in the result.
5. Reset with إعادة التعيين, waiting for the request to return.

**Expected result**
- A populated baseline exists to filter (more than one row).
- The filtered set is strictly smaller than the baseline — filtering narrows rather than
  reorders.
- **Every** returned company name contains `NHC`. Asserting the count alone would pass on a
  filter that returned the wrong rows.
- After reset, the row count returns to exactly the baseline.

---

### TC-043 — Filtering on a value that matches nothing yields an empty list

**Case ref** — · **Priority** P2 · **Result (26 Aug 2026)** Passed · 3.7s

**Steps**
1. Open `/main/admin/Clients` and open the filter panel.
2. Fill اسم الشركة with a generated `NO_SUCH_COMPANY_<timestamp>` value.
3. Apply the filter.

**Expected result** — the list renders its empty state. No error, no stale rows from the
previous query, and no spinner left running.

The search term is generated with a timestamp so it is recognisable in server logs and
cannot accidentally match a real record.

---

### TC-044 · SAYAL-GAP-001 — Client detail renders the stored CR and VAT in full

**Priority** P1 · **Result (26 Aug 2026)** Passed · 4.4s

**Preconditions** — the read-only client fixture `الشركة الوطنية للاسكان`, CR
`19065734264534` (14 digits), VAT `3337778980983` (13 digits).

**Steps**
1. Open `/main/admin/Clients/{uuid}` and wait for معلومات العميل.
2. Look for the stored CR, VAT and company name as rendered values.
3. Count the tabs.

**Expected result**
- All three values render in full, at their real length.
- The detail page exposes 4 tabs.

This is the evidence half of ISS-02 / ISS-03: the product stores and displays values that
its own Add form cannot accept.

---

### TC-045 — Client edit form prefills the full stored CR and VAT despite maxlength=10

**Case ref** — · **Priority** P1 · **Result (26 Aug 2026)** Passed · 2.8s

**Steps**
1. Open `/main/admin/Clients/{uuid}/Edit`.
2. Read the `maxlength` attribute and the value of the CR field.
3. Read the `maxlength` attribute and the value of the VAT field.

**Expected result**
- Both fields carry `maxlength=10`.
- Both fields nonetheless hold the full 14- and 13-digit stored values.

`maxlength` constrains typing only, never a programmatically-set value — which is precisely
why a no-op save cannot silently truncate the record, and why the defect is an entry
problem rather than a data-loss one. Recording that distinction is the point of this case.

---

### TC-046 · SAYAL-CLI-004/005 — Add form caps CR and VAT at 10 characters

**Priority** P1 · **Tags** `@known-defect` · **Result (26 Aug 2026)** Expected failure · 23.1s

**Steps**
1. Open the blank Add form at `/main/admin/Clients/Add`.
2. Enter the valid 15-digit Saudi VAT number `300000000000003`.
3. Read the field's value back.

**Expected result (the product should)** — the field holds all 15 digits.

**Actual behaviour** — the value is truncated to 10 characters. A real Saudi VAT number is
15 digits, and the 14-digit CR already present in the data (TC-044) cannot be re-entered
either. New clients with correct registration numbers cannot be created through the UI.

Nothing is submitted; the form is filled and read back only.

---

### TC-047 · SAYAL-CLI-008 — Sector dropdown offers all 12 options

**Priority** P2 · **Result (26 Aug 2026)** Passed · 3.8s

**Steps**
1. Open `/main/admin/Clients/{uuid}/Edit`.
2. Wait for the sector select to hold 13 options — 12 sectors plus its placeholder. The
   list is fetched from `GET /api/industries/get-industries`, so the control starts with
   only the placeholder and must be waited on rather than read half-built.
3. Read every option's text.

**Expected result** — all twelve sectors are offered: بنك · صاحب عمل · مطور ·
سياحة محلية · مؤسسة تعليمية · مؤسسة مالية · صاحب اساس · وكالة اعلانات ·
متجر بيع بالتجزئه · مطعم · اتصالات · اخرى.

Each is asserted individually so a failure names the missing sector.
