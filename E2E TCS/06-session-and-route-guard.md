# 06 · Session and route guard

**Spec** `tests/auth/session.spec.ts` · **Project** `sayal` · **Cases** 3 · **Time** 6.7s

Authentication behaviour that can be asserted from an already-authenticated session, so
none of these cases costs a login attempt. The two that need a signed-out browser build one
by clearing storage and cookies rather than by logging out, which would invalidate the
shared token server-side for every case after it.

---

### TC-028 · SAYAL-AUTH-022 — Visiting login while authenticated redirects to the dashboard

**Priority** P2 · **Result (26 Aug 2026)** Passed · 3.2s

**Steps**
1. With a valid session, navigate to `/auth/Login`.
2. Read the resulting URL.

**Expected result** — the browser lands on `/main/admin/Dashboard`. An authenticated
operator is never shown the login form.

---

### TC-029 — Route guard refuses a protected route without a session

**Case ref** — · **Priority** P0 · **Result (26 Aug 2026)** Passed · 1.6s

**Steps**
1. On a clean page — deliberately not the authenticated fixture — open `/auth/Login`.
2. Clear `localStorage`, `sessionStorage` and all cookies.
3. Navigate directly to the protected route `/main/admin/Users`.
4. Read the resulting URL and look for the operator name.

**Expected result**
- The browser is redirected to `/auth/Login`.
- The operator name `Admin 4` is not rendered anywhere — the guard withholds content, it
  does not merely change the address bar.

The second assertion is the one that matters. A guard that redirects while still painting
authenticated data has leaked it.

---

### TC-030 — Every sidebar destination is reachable and renders

**Case ref** — · **Priority** P0 · **Result (26 Aug 2026)** Passed · 1.9s

**Steps**
1. Open the authenticated shell and wait for the drawer to hydrate.
2. Count the anchors in the drawer that point at `/main/admin/`.

**Expected result** — the drawer exposes at least all 16 admin destinations. The
per-destination assertions live in TC-051 and TC-052, which check each label and each
`href` individually; this case is the cheap structural guard that the drawer hydrated at
all.

**Note on timing** — drawer hydration is allowed up to 60s throughout the suite. It renders
only once `GET /api/users/get-profile` resolves, and that call was measured at 2.9–4.2s at
best and repeatedly beyond 20s (ISS-14). The allowance is there so unrelated cases fail for
their own reasons rather than for this known performance defect.
