# 12 · Campaign requests — list

**Spec** `tests/requests/requests-list.spec.ts` · **Project** `sayal` · **Cases** 10 · **Time** 57.3s

`/main/admin/Requests` — two tabs backed by the same endpoint with different parameters:

- حملات النشر السريع → `is_quick=1` (Quick Promo) — the **default** tab
- الحملات → `is_quick=0` (standard requests)

This is one of only three lists in the product built on a real HTML `<table>`, and its
pager renders as `role="tab"` rather than the MUI pagination nav the other lists use.

**A synchronisation hazard specific to this screen**: the previous tab's or page's rows stay
mounted while a new payload is applied. Waiting for the response alone means reading stale
rows while believing the switch completed. Every tab switch and page change below therefore
anchors on the first record from the response payload before reading anything.

---

### TC-064 · SAYAL-REQ-001 — Standard list renders all 10 columns and 15 rows

**Priority** P0 · **Tags** `@smoke` · **Result (26 Aug 2026)** Passed · 5.4s

**Steps**
1. Open `/main/admin/Requests` and switch to the الحملات tab, waiting for `is_quick=0` and
   for its first record to appear in the grid.
2. Read the header row.
3. Count the rendered rows.

**Expected result**
- Columns are exactly, in order: رقم الحملة · عنوان الحملة · مصدر الحملة ·
  تاريخ انشاء الحملة · اسم العميل · رقم السجل التجاري · سبب الإلغاء · نوع القناة ·
  حالة الحملة · الإجراءات.
- Exactly 15 rows — the product's page size.

---

### TC-065 · SAYAL-REQ-002 — Quick Promo tab queries a different dataset

**Priority** P1 · **Result (26 Aug 2026)** Passed · 4.7s

**Steps**
1. Start listening for `GET /api/campaign-requests…is_quick=1`.
2. Open `/main/admin/Requests`, which lands on the Quick Promo tab by default.
3. Inspect the request URL and the rendered rows.

**Expected result**
- The default tab queries with `is_quick=1` — the two tabs are genuinely different
  datasets, not a client-side filter over one.
- The tab is populated. This **corrects an earlier report** that recorded the Quick Promo
  tab as empty in pre-production.

---

### TC-066 · SAYAL-FLT-001 — Status filter offers exactly the 7 API statuses

**Priority** P1 · **Result (26 Aug 2026)** Passed · 6.0s

**Steps**
1. Open the standard tab.
2. Open the الحالة filter and read its options.

**Expected result** — the options are exactly, in order: جديد · في انتظار الموافقه · مقبول ·
معتمد · تم الرفض · مكتمله · ملغاة — matching `GET /api/campaign-requests/statuses`
verbatim.

Asserted as an ordered equality rather than a count, so a renamed or reordered status
fails. Note these are custom `dgaui` widgets, not `<select>` elements: `selectOption()`
silently does nothing on them, and each dropdown keeps its own permanently-mounted listbox,
so the options must be read from within that control's own scope. A page-level
`[role=listbox]` lookup reads a different control and passes whenever the two happen to
offer the same number of options.

---

### TC-067 · SAYAL-FLT-002 — Channel-type filter offers the 7 channel types

**Priority** P2 · **Result (26 Aug 2026)** Passed · 5.5s

**Steps**
1. Open the standard tab.
2. Open the نوع القناة filter and read its options.

**Expected result** — 7 options, matching the seven channel types the product supports and
the seven offered by the add-channel menu in TC-063.

---

### TC-068 · SAYAL-FLT-003 — Source filter lists all 8 upstream platforms

**Priority** P2 · **Result (26 Aug 2026)** Passed · 5.4s

**Steps**
1. Open the standard tab.
2. Open the مصدر الحملة filter and read its options.

**Expected result** — 8 options, matching the platform catalogue from `GET /api/platforms`
asserted in TC-004. A campaign request can originate from any registered platform, so the
filter and the catalogue must not drift apart.

---

### TC-069 · SAYAL-REQ-012 — Search by exact request number returns that row

**Priority** P1 · **Result (26 Aug 2026)** Passed · 4.9s

**Steps**
1. Open the standard tab and take the first rendered request number as the seed.
2. Enter it in the بحث field and submit, waiting for the request carrying `keyword=`.
3. Read the request numbers in the result.

**Expected result** — the searched-for number is among the returned rows. The seed is taken
from live data rather than hard-coded, so the case cannot rot when the fixture record moves
off page one.

---

### TC-070 · SAYAL-REQ-013 — Search with no matches shows the empty state, not an error

**Priority** P2 · **Result (26 Aug 2026)** Passed · 5.1s

**Steps**
1. Open the standard tab.
2. Search for a generated `NO_SUCH_CAMPAIGN_<timestamp>` value.

**Expected result**
- The empty state لا يوجد بيانات is shown.
- The grid holds exactly zero rows — no stale results left behind from the previous query.

---

### TC-071 · SAYAL-REQ-014 — Injection payloads in search are handled safely

**Priority** P1 · **Result (26 Aug 2026)** Passed · 6.5s

**Steps**
1. Open the standard tab and start watching for browser dialogs, dismissing any that fire.
2. Search for `' OR 1=1 --`.
3. Search for `<script>alert(1)</script>`.
4. After each, check whether a dialog fired and whether the payload was rendered back as
   live markup.

**Expected result** — for both payloads: no dialog is triggered, and no `script` element
containing `alert(1)` exists in the document. The payload is treated as a search term, not
as code.

This is a reflected-XSS and injection smoke check on the product's most exposed input, not
a full security assessment.

---

### TC-072 · SAYAL-FLT-005 — Pagination returns distinct, correctly ordered pages

**Priority** P1 · **Result (26 Aug 2026)** Passed · 6.3s

**Steps**
1. Open the standard tab and confirm the pager is visible and sitting at the first-page
   boundary.
2. Record every request number on page 1.
3. Go to page 2, waiting for `page=2` and for its first record to reach the grid.
4. Record every request number on page 2.

**Expected result**
- Page 2 is populated.
- **No** request number appears on both pages. Overlapping pages mean records are being
  skipped elsewhere in the set — the failure mode that silently hides data from an operator
  paging through 261 requests.

---

### TC-073 · SAYAL-FLT-005b — List spans the expected number of pages

**Priority** P2 · **Result (26 Aug 2026)** Passed · 7.5s

**Steps**
1. Open the standard tab.
2. Read the last page number from the pager.

**Expected result** — at least 10 pages. Pre-production held 261 standard requests across
18 pages when this was written; the assertion is a lower bound rather than an equality,
because the record count in a shared environment legitimately grows. Pinning the exact
number would fail on ordinary data change and teach the team to ignore the case.
