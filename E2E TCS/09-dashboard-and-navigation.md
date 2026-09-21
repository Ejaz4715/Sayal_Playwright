# 09 · Dashboard and navigation

**Spec** `tests/dashboard/dashboard.spec.ts` · **Project** `sayal` · **Cases** 5 · **Time** 25.0s

The landing screen after login, and the drawer that reaches every other module. Two of
these are the suite's structural smoke tests: if the drawer is wrong, nothing else in the
product is reachable.

---

### TC-048 · SAYAL-DASH-001 — All six widgets and the calendar render

**Priority** P0 · **Tags** `@smoke` · **Result (26 Aug 2026)** Passed · 5.0s

**Steps**
1. Open `/main/admin/Dashboard` and wait for the النشر السريع button, then for the drawer
   to hydrate.
2. Look for the calendar.
3. Look for each of the six widget captions.

**Expected result** — the calendar renders, and all six widgets are present, each asserted
by name: اجمالي القنوات · اجمالي تسجيل المستخدمين · حالات المستخدمين · هوية المرسلين ·
انواع القنوات · حالات القنوات.

---

### TC-049 · SAYAL-DASH-001b — Sender-identity widget lists the nine registered identities

**Priority** P2 · **Result (26 Aug 2026)** Passed · 5.5s

**Steps**
1. Open the dashboard.
2. Look for each of the nine sender identities inside the هوية المرسلين widget.

**Expected result** — Ejar, Ejar_AD, Idlelands, Mostadam, Mullak, NHC, Sakani, Sakani-AD
and Srei are all shown.

This is deliberately the same catalogue asserted in TC-005 against
`/main/admin/Settings/IdentitySmsSender`. The dashboard widget and the settings module must
agree; a divergence means one of the two is reading a stale source.

---

### TC-050 · SAYAL-NAV-001 — The drawer exposes all 16 admin destinations

**Priority** P0 · **Tags** `@smoke` · **Result (26 Aug 2026)** Passed · 5.1s

**Steps**
1. Open the dashboard.
2. Look for each of the sixteen drawer entries by its exact label.

**Expected result** — all sixteen are present, each asserted by name so a failure states
which one is missing: لوحة التحكم · الجمهور · الحملات · القنوات · عروض الاسعار · الفواتير ·
إدارة العملاء · إدارة التقارير · إدارة الصلاحيات · إدارة المرشحات · إدارة المستخدمين ·
تعريف المنصات · تعريف انواع القنوات · تعريف المساحات الإعلانية · إعدادات هوية المرسل ·
إعدادات عامة.

---

### TC-051 · SAYAL-NAV-003 — Every sidebar link points at its module route

**Priority** P0 · **Result (26 Aug 2026)** Passed · 4.4s

**Steps**
1. Open the dashboard.
2. For each of the sixteen entries, read its `href`.
3. Compare against that module's known route, ignoring any query string.

**Expected result** — every label resolves to its own module route, with the label named in
the failure message. TC-050 proves the entries exist; this proves they lead somewhere
correct. A drawer with the right labels and swapped destinations would pass TC-050 alone.

---

### TC-052 · SAYAL-DASH-004 — Quick Promo CTA opens the express wizard

**Priority** P1 · **Result (26 Aug 2026)** Passed · 5.0s

**Steps**
1. Open the dashboard.
2. Click النشر السريع.
3. Read the resulting URL.

**Expected result** — the browser lands on the Quick Promo add route (`QuickPromo/Add`).
The wizard itself is not driven any further: completing it would create a real campaign
request in shared pre-production.
