# 10 · Reports

**Spec** `tests/reports/reports.spec.ts` · **Project** `sayal` · **Cases** 5 · **Time** 37.5s

`/main/admin/ReportsManagement` — three report tabs, each with its own endpoint, plus PDF
and Excel export.

| Tab | Endpoint | Heading |
|---|---|---|
| الحملات | `/api/report/campaign-request` | تقارير الحملات |
| القنوات | `/api/report/campaign` | تقارير القنوات |
| العملاء | `/api/report/client` | تقارير العملاء |

The report tabs are MUI `<button role="tab">` elements and must be addressed by the `tab`
role: the sidebar carries links with the same Arabic labels, so a looser locator reaches
the wrong control entirely and the case passes while testing navigation instead of tabs.

The `?tab=` deep link is **not** honoured on direct navigation — that is ISS-41, guarded by
TC-014 rather than worked around here.

---

### TC-053 · SAYAL-RPT-001 — Reports open on the campaigns tab with data

**Priority** P2 · **Result (26 Aug 2026)** Passed · 3.2s

**Steps**
1. Open `/main/admin/ReportsManagement?tab=0` and wait for the PDF export button.
2. Look for the heading تقارير الحملات.
3. Confirm both export buttons are present.

**Expected result** — the module opens on the campaigns report with تنزيل PDF and
تنزيل EXCEL both offered.

---

### TC-054 · SAYAL-RPT-002 — Each tab loads its own dataset

**Priority** P2 · **Result (26 Aug 2026)** Passed · 7.5s

**Steps**
1. Open the reports module.
2. Switch to القنوات, waiting for `GET /api/report/campaign` → 200 and the heading
   تقارير القنوات.
3. Switch to العملاء, waiting for `GET /api/report/client` → 200 and تقارير العملاء.
4. Switch back to الحملات, waiting for `GET /api/report/campaign-request` → 200 and
   تقارير الحملات.

**Expected result** — each tab genuinely re-queries its own endpoint and renders its own
heading. Because every switch waits for that tab's request before asserting, passing this
case proves the data changed rather than that the previous view was left up.

---

### TC-055 · SAYAL-RPT-003 — PDF export downloads a file

**Priority** P2 · **Result (26 Aug 2026)** Passed · 12.6s

**Steps**
1. Open the reports module.
2. Start listening for a download event (60s allowance — export generation is slow).
3. Click تنزيل PDF.
4. Read the suggested filename and the file's path on disk.

**Expected result**
- The suggested filename ends in `.pdf`.
- The download produces a real file on disk — not merely a triggered event.

---

### TC-056 · SAYAL-RPT-004 — Excel export downloads a file

**Priority** P2 · **Result (26 Aug 2026)** Passed · 8.7s

**Steps**
1. Open the reports module.
2. Start listening for a download event.
3. Click تنزيل EXCEL.
4. Read the suggested filename and the file's path on disk.

**Expected result**
- The suggested filename ends in `.xlsx`, `.xls` or `.csv`.
- The download produces a real file on disk.

The extension is asserted as a set rather than a single value because the export format is
the server's choice, and pinning it to one value would fail on a legitimate change without
indicating a real fault.

---

### TC-057 — Exports are offered on every report tab

**Case ref** — · **Priority** P3 · **Result (26 Aug 2026)** Passed · 5.5s

**Steps**
1. Open the reports module.
2. Switch to القنوات and confirm both export buttons are present.
3. Switch to العملاء and confirm both again.

**Expected result** — PDF and Excel export are available on all three tabs, with the tab
named in each failure message. TC-055 and TC-056 prove export works on the default tab;
this proves the capability is not exclusive to it.
