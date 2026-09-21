# 04 · Audience and public quotation

**Spec** `tests/audience/audience.spec.ts` · **Project** `sayal` · **Cases** 5 · **Time** 14.6s

Two areas in one file. The audience list is empty in pre-production (`total: 0`), so the
empty state *is* the observable behaviour and creation is not exercised — a saved audience
cannot be removed through the UI, so the suite would accumulate undeletable records in a
shared environment.

The public quotation page is the product's only unauthenticated route, and the last two
cases deliberately run on a bare browser context with cookies cleared.

Worth knowing: the create route is `/Audience/Create`, not `/Add`. `/Add` is parsed as a
record id, the API answers 400, and the page renders an indefinite "analysing data" state
rather than a not-found page.

---

### TC-021 · SAYAL-AUD-001 — Empty state guides the user to create

**Priority** P1 · **Result (26 Aug 2026)** Passed · 4.2s

**Steps**
1. Open `/main/admin/Audience` and wait for the empty-state heading.
2. Look for the empty-state call to action and the toolbar button.

**Expected result**
- The heading ليس لديك جمهور is shown.
- The call to action إنشاء مجموعة مستهدفة جديدة is shown.
- The اضافة جمهور button is available.

An empty list is answered with a route forward rather than a blank screen.

---

### TC-022 · SAYAL-GAP-011 — The builder offers the active targeting filters

**Priority** P1 · **Result (26 Aug 2026)** Passed · 4.7s

**Steps**
1. Open `/main/admin/Audience/Create` and wait for the audience-name field.
2. Confirm the name and description fields are present.
3. Confirm each of the 16 targeting filters is offered.

**Expected result** — the builder exposes أدخل اسم الجمهور and وصف الجمهور, plus all
sixteen filters observed on the Sakani platform tab: المدينة · الجنس · الضمان الإجتماعي ·
الدخل · حالة العقد · حالة الاستحقاق في سكني · التفضيلات · عدد افراد الأسرة · العمر ·
المهنة · لديه تصميم هندسي · لديه رخصة بناء · السكن الحالي · موقع العقار الجديد ·
الحالة الاجتماعية · حالة الحجز.

Each filter is asserted individually, so a failure names the missing one rather than
reporting a count mismatch.

---

### TC-023 — The builder requests the active filter set for its platform

**Case ref** — · **Priority** P2 · **Result (26 Aug 2026)** Passed · 4.0s

**Steps**
1. Start listening for `GET /api/filters/get-active-filters/{id}` → 200.
2. Open the audience builder.
3. Inspect the URL that was actually requested.

**Expected result** — the builder fetches its filter set per platform, and the request path
carries a numeric platform id (`get-active-filters/\d+`). The filters in TC-022 are served
by the product, not hard-coded in the page.

---

### TC-024 · SAYAL-PUB-002 — Canonical public URL renders without a session

**Priority** P0 · **Result (26 Aug 2026)** Passed · 1.2s

**Preconditions** — the read-only public quotation token `qTHCWt`. Runs on a bare page with
cookies cleared: the point of this route is that it works with no authentication at all.

**Steps**
1. Clear all cookies on the browser context.
2. Navigate to `/public/Quotations?token=qTHCWt`.
3. Look for the معلومات العميل tab and read the resulting URL.

**Expected result**
- The quotation renders for an anonymous visitor.
- The browser is **not** redirected to `/auth/Login`.

**Standing risk** — this is intended behaviour, but a six-character token exposes company
name, CR, VAT, phone and a live payment link (ISS-19). The accept and reject actions on
this page are deliberately not automated: invoking them mutates a shared quotation and
cascades into invoice creation, which cannot be undone in pre-production.

---

### TC-025 · SAYAL-PUB-003 — An invalid token does not render a quotation

**Priority** P1 · **Result (26 Aug 2026)** Passed · 0.4s

**Steps**
1. Clear all cookies on the browser context.
2. Navigate to `/public/Quotations?token=INVALID123`.
3. Look for the معلومات العميل tab.

**Expected result** — no client data is rendered for an unknown token. The negative half of
TC-024, and the one that matters for data exposure: an unauthenticated route that leaks on
a guessed token would be a far more serious finding than the token length itself.
