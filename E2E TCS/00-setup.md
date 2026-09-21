# 00 · Session setup

**Spec** `tests/setup/auth.setup.ts` · **Project** `setup` · **Cases** 1

Runs first, and everything else depends on it. It exists because of a hard environment
constraint rather than for speed: Sayal rate-limits login *attempts*, so the functional
suite must not authenticate per test, and re-running the suite must not spend a fresh
attempt each time.

---

### TC-001 — Authenticate as admin and store the session

**Case ref** — · **Priority** — · **Tags** — · **Result (26 Aug 2026)** Passed · 5.4s

**Preconditions**
- `SAYAL_EMAIL`, `SAYAL_PASSWORD` and `SAYAL_CAPTCHA` are set in `.env`.
- Pre-production serves the static CAPTCHA image that always reads `12345` (ISS-21).

**Steps**
1. If a stored session file exists, open `/main/admin/Dashboard` with it and wait for the
   drawer link لوحة التحكم to become visible (up to 60s for shell hydration).
2. If the drawer renders and the browser did not land anywhere under `/auth/`, keep the
   stored session and stop — record the annotation and spend no login attempt.
3. Otherwise open `/auth/Login`, fill email, password and CAPTCHA, submit, and wait for
   `/main/admin/Dashboard`.
4. Confirm the operator name `Admin 4` is rendered in the shell.
5. Write the browser storage state to `playwright/.auth/admin.json`.

**Expected result**
- A usable admin session exists at `playwright/.auth/admin.json` for the three downstream
  projects.
- Verification is a plain `GET`, which the rate limiter does not count, so an ordinary
  edit-run-fix cycle spends no login attempts.
- A rejected login raises a named error stating the HTTP status — and, for `429`, that the
  shared account is rate-limited under `SE0053` — rather than surfacing as a navigation
  timeout.

**Observed on this run** — the stored session was still valid and was reused. The test
recorded the annotation *"Reused the stored admin session; no login attempt spent."*
