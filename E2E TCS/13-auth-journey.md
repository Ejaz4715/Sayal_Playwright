# 13 · Authentication journey

**Spec** `tests/auth/journey.spec.ts` · **Project** `auth-journey` · **Cases** 7 · **Time** 17.1s

Login and logout themselves. These start signed out, so they run in their own project
without the stored session, and **after** the functional suite — logging out invalidates
the shared token server-side.

Every case that actually submits the form spends a rate-limited login attempt against the
shared admin account, so the number of submits is kept deliberately small: only TC-079
submits. The form-level cases assert without submitting, which costs nothing.

There is **no separate OTP step** in this product. The "verification code" quoted in the
original brief is the value rendered inside the CAPTCHA image on this very form, so login
is a single request.

---

### TC-074 · SAYAL-AUTH-001 — Login page renders all three inputs and the CAPTCHA image

**Priority** P0 · **Tags** `@smoke` · **Result (26 Aug 2026)** Passed · 1.8s

**Steps**
1. Open `/auth/Login` and wait for the email field and the CAPTCHA to render.
2. Look for the email, password and CAPTCHA inputs, and the CAPTCHA image itself.

**Expected result** — all three inputs and the CAPTCHA image are present. The image is
asserted separately from its input: a form whose CAPTCHA field renders without the image is
unusable, and would otherwise pass.

---

### TC-075 · SAYAL-AUTH-002 — Submit is disabled until all three fields are filled

**Priority** P1 · **Result (26 Aug 2026)** Passed · 2.2s

**Steps**
1. Open `/auth/Login`.
2. Fill email and password only, leaving the CAPTCHA empty.
3. Read the submit button's state.
4. Fill the CAPTCHA.
5. Read the state again.

**Expected result**
- Submit stays **disabled** while the CAPTCHA field is empty.
- Submit becomes **enabled** once all three fields hold a value.

No attempt is spent — the form is never submitted. This gating is also relied on elsewhere:
the shared login helper asserts the button is enabled before clicking, which doubles as a
guard that the form is genuinely submittable.

---

### TC-076 · SAYAL-AUTH-005 — Email is trimmed of surrounding whitespace

**Priority** P2 · **Result (26 Aug 2026)** Passed · 1.6s

**Steps**
1. Open `/auth/Login`.
2. Enter `   Admin@sayal.sa   ` with leading and trailing spaces.
3. Move focus to the password field.
4. Read the email field's value.

**Expected result** — the field holds `Admin@sayal.sa` with no surrounding whitespace. A
pasted address with a trailing space is a common cause of "my password stopped working",
and the product handles it on blur.

---

### TC-077 · SAYAL-AUTH-006 — Required messages return after clearing a filled field

**Priority** P2 · **Result (26 Aug 2026)** Passed · 2.1s

**Steps**
1. Open `/auth/Login`.
2. Fill the email field, then clear it.
3. Move focus to the password field.

**Expected result** — the حقل إجباري required-field message is shown again. Validation state
recovers rather than latching on first-pass success — the case that catches a form which
validates once and then stops.

---

### TC-078 · SAYAL-AUTH-007 — Password eye toggle reveals and re-hides

**Priority** P2 · **Result (26 Aug 2026)** Passed · 2.8s

**Steps**
1. Open `/auth/Login` and fill the password.
2. Read the input's `type` — expected `password`.
3. Click the eye toggle and read `type` again.
4. Click it once more and read `type` a third time.

**Expected result** — the type moves `password` → `text` → `password`. The re-hide is the
half that matters: a toggle that reveals but never restores leaves the password on screen.

---

### TC-079 · SAYAL-AUTH-014/015 — Valid credentials issue a token and land on the dashboard, with no OTP step

**Priority** P0 · **Tags** `@smoke` · **Result (26 Aug 2026)** Passed · 3.7s

**Steps**
1. Open `/auth/Login` and fill valid credentials and the CAPTCHA.
2. Start recording every main-frame navigation.
3. Submit through the shared helper, which inspects the login response and names a server
   rejection explicitly — most often `429 SE0053`, the account rate limit — rather than
   letting it surface as a 90-second navigation timeout.
4. Wait for `/main/admin/Dashboard`, confirm the operator name renders, and read the stored
   bearer token.
5. Inspect the recorded navigation trail for any OTP or verification route.

**Expected result**
- The operator lands authenticated on the dashboard as `Admin 4`.
- A bearer token is persisted.
- **No** intermediate OTP or verification route was visited; the failure message prints the
  full navigation trail if one was.

AUTH-014 and AUTH-015 are separate cases in the test plan but describe a single submit, so
they are asserted from one login. Combining them costs no coverage and saves a rate-limited
attempt. **This is the only real login the functional run performs.**

---

### TC-080 · SAYAL-AUTH-020/021 — Logout clears the token, redirects, and Back does not restore the session

**Priority** P0 · **Tags** `@smoke` · **Result (26 Aug 2026)** Passed · 2.8s

**Preconditions** — reuses the stored session rather than logging in again. Logging out
needs *an* authenticated session, not a freshly-typed one, and every real login spends a
rate-limited attempt.

**Steps**
1. Open `/main/admin/Dashboard` with the stored session and confirm the operator name
   renders.
2. Log out.
3. Wait for `/auth/Login` and read the stored token.
4. Press Back.
5. Look for the operator name and read the token again.

**Expected result**
- Logout redirects to the login page and clears the bearer token.
- After Back, the operator name is **not** rendered and no token has been restored.

The back-navigation half is the security-relevant one: a cached authenticated page served
after logout on a shared machine is the realistic exposure. Note this case does invalidate
the shared token server-side, which is exactly why this project runs after the functional
suite and why TC-001 verifies the stored session and re-authenticates when it has gone
stale.

Logout is driven with `dispatchEvent` rather than a real click. That is a deliberate
workaround for **ISS-30** — guarded directly in
[05-auth-known-defects.md](05-auth-known-defects.md) — so these behaviours stay testable
instead of being blocked by an unrelated UI defect.
