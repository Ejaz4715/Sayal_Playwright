# 05 · Known-defect guards — authentication shell

**Spec** `tests/auth/known-defects.spec.ts` · **Project** `sayal` · **Cases** 2 · **Time** 11.5s

Both cases guard **ISS-30**, from two directions: the interaction a real user attempts, and
the property of the DOM that makes it fail. Both are marked `test.fail()` and report as
expected failures while the defect stands.

This one is worth stressing because it is easily dismissed as an automation problem: the
overlay is present in the live DOM and intercepts real pointer events. It affects users,
not just Playwright. Elsewhere in the suite, logout is driven with `dispatchEvent` — a
deliberate workaround so that token teardown, redirect and back-navigation safety remain
testable instead of being blocked by this defect.

---

### TC-026 · ISS-30 — Logout responds to an ordinary user click

**Priority** P2 · **Tags** `@known-defect` · **Result (26 Aug 2026)** Expected failure · 9.6s

**Steps**
1. Open the authenticated shell.
2. Confirm the تسجيل الخروج control is visible to the user — the precondition that makes
   this a defect rather than a missing feature.
3. Click it the way a user would (a real click, 8s timeout).
4. Wait for `/auth/Login`.

**Expected result (the product should)** — a visible control responds to a click and signs
the operator out.

**Actual behaviour** — the click is intercepted and never reaches the control, so the
browser stays on the current page.

---

### TC-027 · ISS-30 — No hidden overlay claims pointer events over the shell

**Priority** P2 · **Tags** `@known-defect` · **Result (26 Aug 2026)** Expected failure · 1.9s

**Steps**
1. Open the authenticated shell and wait for the drawer to hydrate.
2. Collect every `.MuiBackdrop-root` in the document and read its computed `visibility`,
   `opacity`, `pointerEvents` and `zIndex`.
3. Keep only the ones that are hidden or fully transparent yet still accept pointer events.

**Expected result (the product should)** — no such element exists; a hidden overlay sets
`pointer-events: none`.

**Actual behaviour** — a full-viewport `.MuiBackdrop-root` ships with
`visibility: hidden`, `opacity: 0`, `pointer-events: auto` and `z-index: 2147483647`, so it
swallows clicks across the whole shell. The failure message prints the offending computed
styles, so the report carries the evidence rather than a bare assertion.

This case states the defect as a property rather than an interaction, which is what makes
it diagnostic: TC-026 shows a user cannot log out, TC-027 shows exactly why.
