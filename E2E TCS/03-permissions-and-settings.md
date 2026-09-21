# 03 · Roles, permissions and general settings

**Spec** `tests/admin/permissions.spec.ts` · **Project** `sayal` · **Cases** 5 · **Time** 24.0s

Two screens. `/main/admin/Permissions` is the RBAC screen with a roles tab and a permission
catalogue; `/main/admin/Settings/General` holds five numeric parameters that silently
govern behaviour across the product, which is why other modules derive their expected
values from it and why it is read-only here.

---

### TC-016 · SAYAL-ROLE-001 — Permissions screen exposes both tabs and the roles grid

**Priority** P1 · **Result (26 Aug 2026)** Passed · 5.0s

**Steps**
1. Open `/main/admin/Permissions`, waiting for `GET /api/roles/all` → 200 and the grid.
2. Read the header row of the roles grid.
3. Look for the إضافة دور button.

**Expected result**
- Columns are exactly: اسم الدور · عدد الصلاحيات.
- The إضافة دور button is available to an admin.

**Note** — the roles grid legitimately contains entries named after screens that hold zero
permissions. That is real seed data rather than a rendering fault, and is the root cause
behind ISS-25.

---

### TC-017 · SAYAL-GAP-008 — Permission catalogue is grouped by screen

**Priority** P1 · **Result (26 Aug 2026)** Passed · 4.7s

**Steps**
1. Open `/main/admin/Permissions`.
2. Switch to the الصلاحيات tab and wait for its header to read اسم الشاشة.
3. Read the header row, then collect the distinct screen names down the first column.

**Expected result**
- Columns are exactly: اسم الشاشة · اسم الصلاحية · الحالة.
- All 15 screen groups are present: لوحة التحكم · الجمهور · الحملات · المرشحات ·
  تعريف المساحات الاعلانية · العملاء · الصناعات · هوية المرسلين · المستخدمين · المنصات ·
  أنواع الحملات · إعدادات الموقع · القنوات · التقارير · الحملات السريعة.

That is one group more than the Add Role matrix was previously believed to offer.

---

### TC-018 — Every permission in the catalogue is active

**Case ref** — · **Priority** P2 · **Result (26 Aug 2026)** Passed · 5.0s

**Steps**
1. Open the الصلاحيات tab.
2. Read the الحالة cell of every catalogue row.

**Expected result**
- The catalogue is not empty.
- Every single permission reads فعال. A disabled permission in the catalogue would silently
  remove capability from every role that holds it, so this is asserted per row with the
  offending screen and permission named in the failure message.

---

### TC-019 · SAYAL-SET-001 — Settings load with the five governing parameters

**Priority** P1 · **Result (26 Aug 2026)** Passed · 3.8s

**Steps**
1. Open `/main/admin/Settings/General` and wait for the quotation-validity field.
2. Read all five parameter values.
3. Confirm the حفظ button is present.

**Expected result** — the five values are exactly:

| Field | Value |
|---|--:|
| `nb_allowed_preview_messages` — preview messages | 5 |
| `min_audience_count` — minimum audience | 50 |
| `default_target_count` — default target | 1000 |
| `quotation_validity_per_day` — quotation validity | 7 |
| `invoice_validity_per_day` — invoice validity | 7 |

These are the source of truth other modules assert against — TC-009 checks quotation expiry
against the 7-day window here — so drift fails loudly rather than quietly moving
expectations elsewhere. Nothing on this screen is saved by the suite.

---

### TC-020 · SAYAL-SET-004 — Validity fields are capped at 3 characters

**Priority** P3 · **Result (26 Aug 2026)** Passed · 5.5s

**Steps**
1. Open `/main/admin/Settings/General`.
2. Read the `maxlength` attribute of the quotation-validity, invoice-validity and
   minimum-audience fields.

**Expected result**
- Quotation validity: `maxlength=3`.
- Invoice validity: `maxlength=3`.
- Minimum audience count: `maxlength=7`.

The caps are recorded as observed behaviour rather than judged. Three characters allows up
to 999 days of validity, which is a defensible ceiling.
