# 14 · Authentication — negative

**Spec** `tests/auth/auth-negative.spec.ts` · **Project** `auth-negative` · **Cases** 3 · **Time** 11.3s

Runs last, in its own project, serially, and never alongside anything else.

Every case here deliberately spends a **failed login attempt** against the shared admin
account. Sayal locks that account after roughly three, and the lock refuses *correct*
credentials for about ten minutes — so an accidental extra attempt here fails every other
test in the run and looks exactly like an environment outage. That is why this file is
last, why retries are 0 suite-wide, and why the file is marked serial.

Each case asserts the **server response** rather than a toast, because the product surfaces
error codes verbatim (ISS-07) and the code is the stable contract.

---

### TC-081 · SAYAL-AUTH-009 — Valid credentials with a wrong CAPTCHA are rejected

**Priority** P0 · **Result (26 Aug 2026)** Passed · 4.1s

**Steps**
1. Open `/auth/Login`.
2. Fill the correct email and password with the wrong CAPTCHA value `99999`.
3. Submit and capture the login `POST` response.
4. Read its status and body, then the browser URL and stored token.

**Expected result**
- HTTP **422**, body containing `SE0054`.
- The browser stays on `/auth/Login`.
- No token is stored.

Valid credentials plus a wrong CAPTCHA must fail: this proves the CAPTCHA is enforced
server-side rather than being decorative.

---

### TC-082 · SAYAL-AUTH-010 — A wrong password is rejected

**Priority** P0 · **Result (26 Aug 2026)** Passed · 3.4s

**Steps**
1. Open `/auth/Login`.
2. Fill the correct email with the password `WrongPass@999` and the correct CAPTCHA.
3. Submit and capture the login `POST` response.
4. Read its status and body, then the browser URL and stored token.

**Expected result**
- HTTP **400**, body containing `SE0011`.
- The browser stays on `/auth/Login`.
- No token is stored.

---

### TC-083 · SAYAL-AUTH-011 — An unknown account returns the same error as a wrong password

**Priority** P1 · **Result (26 Aug 2026)** Passed · 3.7s

**Steps**
1. Open `/auth/Login`.
2. Fill the non-existent address `qa.notexist.9931@sayal.sa` with the correct password and
   CAPTCHA.
3. Submit and capture the login `POST` response.
4. Compare its status and body with TC-082's.
5. Read the stored token.

**Expected result**
- HTTP **400** — matching the wrong-password status exactly.
- Body containing `SE0011` — the same code as a wrong password.
- No token is stored.

This is the security property worth having: an unknown account and a wrong password must be
indistinguishable, or the login form becomes an account-enumeration oracle. It is asserted
by comparing the two responses against the same expected values, not by eyeballing one of
them.

---

## Not automated in this area

**SAYAL-AUTH-012 / AUTH-013 — account lockout behaviour.** Verifying a lockout means
causing one, and there is no disposable account to cause it on. Locking the shared admin
account would block every other case in the suite for ten minutes. These stay **manual**
until a dedicated account exists in pre-production.

The lockout response itself (`429 SE0053`) is not unobserved, though: the shared login
helper detects it and names it explicitly in the failure message, so if it ever fires
during a run the cause is stated rather than being reported as a navigation timeout.
