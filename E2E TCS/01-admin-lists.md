# 01 · Admin lists

**Spec** `tests/admin/admin-lists.spec.ts` · **Project** `sayal` · **Cases** 9 · **Time** 36.6s

Seven admin screens built on the `.TableNhc` div grid, plus Banner Definitions which
renders a real `<table>`. Every column set below is exactly what the running application
serves, in order.

Each case opens its screen by waiting for the list endpoint to return 200 **and** the first
row to appear — these grids paint their header row well before the data arrives, so reading
rows any earlier intermittently returns an empty set and fails claiming the environment
holds no data.

---

### TC-002 · SAYAL-USR-001 — User list renders its 5 columns and status badges

**Priority** P1 · **Result (26 Aug 2026)** Passed · 3.8s

**Steps**
1. Open `/main/admin/Users`, waiting for `GET /api/users` → 200, the grid and its first row.
2. Read the header row.
3. Read the status cell of every rendered row.

**Expected result**
- Columns are exactly, in order: الاسم · البريد الإلكتروني · نوع المستخدم · الحالة · اسم الدور.
- The list renders at least one row.
- At least one row carries the status مفعل, proving the column is genuinely populated
  rather than blank.

---

### TC-003 · SAYAL-GAP-010 — Filters module lists its records across pages

**Priority** P2 · **Result (26 Aug 2026)** Passed · 3.8s

**Steps**
1. Open `/main/admin/Filters`, waiting for `GET /api/filters` → 200 and the first row.
2. Read the header row.
3. Read the last page number from the pager.
4. Read the الحالة cell of every rendered row.

**Expected result**
- Columns are exactly: الاسم باللغه الإنجليزية · الاسم باللغه العربية · الحالة · الترتيب · النوع · المنصة.
- The list is populated and spans at least 5 pages.
- Every row's state is one of فعال or معطل — no third, unmapped value.

---

### TC-004 · SAYAL-GAP-012 — Platforms list renders the eight source platforms

**Priority** P2 · **Result (26 Aug 2026)** Passed · 5.1s

**Steps**
1. Open `/main/admin/Platforms`, waiting for `GET /api/platforms` → 200 and the first row.
2. Read the header row.
3. Read the English-name column of every row.

**Expected result**
- Columns are exactly: الاسم باللغه الإنجليزية · الاسم باللغه العربية · الوصف.
- All eight upstream platforms are listed: Sayal Platform, Sakani, Ejar - tenant,
  Ejar - lessor, Ejar - broker, Sakani Partner Platform, Sakani Mobile App,
  Comprehensive data.

---

### TC-005 · SAYAL-GAP-014 — SMS sender list matches the nine registered identities

**Priority** P2 · **Result (26 Aug 2026)** Passed · 3.1s

**Steps**
1. Open `/main/admin/Settings/IdentitySmsSender`, waiting for `GET /api/sms-senders` → 200
   and the first row.
2. Read the header row.
3. Read the identity-name column of every row.

**Expected result**
- Columns are exactly: اسم هوية المرسل · الرصيد.
- The identities are exactly these nine, no more and no fewer: Ejar, Ejar_AD, Idlelands,
  Mostadam, Mullak, NHC, Sakani, Sakani-AD, Srei.

---

### TC-006 · SAYAL-GAP-015 — Invoice list renders its 8 columns and both statuses

**Priority** P1 · **Result (26 Aug 2026)** Passed · 6.7s

**Steps**
1. Open `/main/admin/Invoice`, waiting for `GET /api/invoice` → 200 and the first row.
2. Read the header row.
3. Collect the distinct values in the حالة الفاتورة column.

**Expected result**
- Columns are exactly: رقم الحملة · اسم الشركة · عنوان الحملة · حالة الفاتورة ·
  تاريخ إنشاء الفاتورة · تاريخ سداد الفاتورة · تاريخ إلغاء الفاتورة · سبب الإلغاء.
- The list is populated, and every invoice status is one of مدفوعة بالكامل or ملغاة.

---

### TC-007 — Invoice cancellations carry the expiry reason

**Case ref** — · **Priority** P1 · **Result (26 Aug 2026)** Passed · 3.0s

**Steps**
1. Open `/main/admin/Invoice` and read every row.
2. Select the rows whose status is ملغاة.
3. For each, read the سبب الإلغاء and تاريخ سداد الفاتورة cells.

**Expected result**
- Pre-production holds at least one cancelled invoice to assert against.
- Every cancelled invoice states a cancellation reason — the field is never empty.
- Every cancelled invoice has no payment date; the cell reads `-`. A record that is both
  cancelled and paid would be a data-integrity fault.

---

### TC-008 · SAYAL-QUO-001 — Quotation list renders its 9 columns

**Priority** P1 · **Result (26 Aug 2026)** Passed · 4.5s

**Steps**
1. Open `/main/admin/Quotations`, waiting for `GET /api/quotation` → 200 and the first row.
2. Read the header row.

**Expected result**
- Columns are exactly: رقم الحملة · اسم الشركة · عنوان الحملة · حالة عرض السعر ·
  تاريخ إنشاء عرض السعر · تاريخ إنتهاء عرض السعر · تاريخ قبول عرض السعر ·
  تاريخ رفض عرض السعر · سبب الرفض.
- The list is populated.

---

### TC-009 — Quotation validity window matches the configured 7 days

**Case ref** — · **Priority** P1 · **Result (26 Aug 2026)** Passed · 3.4s

**Steps**
1. Open `/main/admin/Quotations` and read every row.
2. Select rows carrying both a creation date and a real expiry date (not `-`).
3. For the first five such rows, subtract creation from expiry.

**Expected result**
- At least one quotation carries both dates.
- Every validity window is at least 7 days — the value configured in
  إعدادات عامة → `quotation_validity_per_day`. This links the settings screen to the
  behaviour it governs, so a silent change to the parameter surfaces here.

---

### TC-010 — Banner definitions list is populated with row actions

**Case ref** — · **Priority** P2 · **Result (26 Aug 2026)** Passed · 3.3s

**Steps**
1. Open `/main/admin/Campaigns/Banner/Definitions`, waiting for `GET /api/banner_zones`
   → 200 and the first row. This screen is a real `<table>`, not the `.TableNhc` grid.
2. Read the header row.
3. Confirm the list has rows.

**Expected result**
- Columns are exactly: الصورة الإفتراضية · المنصة · اسم المساحة الإعلانية ·
  طول المساحة الإعلانية · عرض المساحة الإعلانية · الإجراءات.
- The list is populated. This **corrects an earlier exploration finding** that recorded
  this list as empty in pre-production.
