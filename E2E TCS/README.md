# Sayal — E2E test cases

The complete test-case catalogue for the Sayal Playwright UI suite, exported from the
automation itself. **83 test cases**, every one of them automated and executed.

Nothing here is aspirational: each case below corresponds to a test that exists in
`tests/`, and every expected result is the assertion that test actually makes. Results are
taken from the run of **26 August 2026, 16:42–16:49 (+03)** recorded in
`test-results/results.json`.

---

## Contents

Files are numbered in the order the suite executes them.

| File | Spec | Cases | Project |
|---|---|--:|---|
| [00-setup.md](00-setup.md) | `setup/auth.setup.ts` | 1 | setup |
| [01-admin-lists.md](01-admin-lists.md) | `admin/admin-lists.spec.ts` | 9 | sayal |
| [02-admin-known-defects.md](02-admin-known-defects.md) | `admin/known-defects.spec.ts` | 5 | sayal |
| [03-permissions-and-settings.md](03-permissions-and-settings.md) | `admin/permissions.spec.ts` | 5 | sayal |
| [04-audience-and-public-quotation.md](04-audience-and-public-quotation.md) | `audience/audience.spec.ts` | 5 | sayal |
| [05-auth-known-defects.md](05-auth-known-defects.md) | `auth/known-defects.spec.ts` | 2 | sayal |
| [06-session-and-route-guard.md](06-session-and-route-guard.md) | `auth/session.spec.ts` | 3 | sayal |
| [07-channels.md](07-channels.md) | `channels/channel-forms.spec.ts` | 10 | sayal |
| [08-clients.md](08-clients.md) | `clients/clients.spec.ts` | 7 | sayal |
| [09-dashboard-and-navigation.md](09-dashboard-and-navigation.md) | `dashboard/dashboard.spec.ts` | 5 | sayal |
| [10-reports.md](10-reports.md) | `reports/reports.spec.ts` | 5 | sayal |
| [11-request-detail.md](11-request-detail.md) | `requests/request-detail.spec.ts` | 6 | sayal |
| [12-requests-list.md](12-requests-list.md) | `requests/requests-list.spec.ts` | 10 | sayal |
| [13-auth-journey.md](13-auth-journey.md) | `auth/journey.spec.ts` | 7 | auth-journey |
| [14-auth-negative.md](14-auth-negative.md) | `auth/auth-negative.spec.ts` | 3 | auth-negative |

`Sayal-E2E-Test-Cases.csv` holds all 83 in one flat sheet for import into a test
management tool. It opens directly in Excel — UTF-8 with BOM, so the Arabic values render
correctly.

---

## Totals

| | |
|---|--:|
| Test cases | 83 |
| Automated | 83 (100%) |
| Passed on 26 Aug 2026 | 75 |
| Expected failures — known-defect guards | 8 |
| Unexpected failures / flaky / skipped | 0 / 0 / 0 |

**Priority** — P0 16 · P1 31 · P2 31 · P3 4 (the setup case carries no priority tag).
**Tags** — `@smoke` 7 · `@known-defect` 8.

---

## How to read a case

**TC ID** is this export's own sequential identifier, numbered in execution order.
**Case ref** is the identifier carried in the test title where the original test plan
supplied one (`SAYAL-REQ-001`, `ISS-38`); a dash means the case was added during
implementation and has no upstream reference.

**Result** is one of two values:

- **Passed** — the assertion held.
- **Expected failure** — the case is a known-defect guard. It asserts the behaviour the
  product *should* have and is marked `test.fail()`, so while the defect stands Playwright
  reports it as an expected failure rather than a pass. If one of these ever passes, the
  suite goes red and the defect has been fixed.

---

## Preconditions that apply to every case

1. The corporate network or VPN is connected. `pre-sayal.housingapps.sa` is served by
   split-horizon DNS and public resolvers return `NXDOMAIN` by design — a DNS failure means
   you are off the VPN, not that the environment is down.
2. Chromium runs with `--disable-http2`. Without it, Next.js chunk delivery fails with
   `ERR_HTTP2_PROTOCOL_ERROR` on this host.
3. Cases in the `sayal` project reuse the stored admin session created by TC-001 and never
   log in. Login attempts — not just failures — are rate-limited, and the block refuses
   correct credentials for about ten minutes.
4. Every case is read-only against shared pre-production data. Where a write path must be
   exercised to demonstrate a defect, the request is intercepted and aborted in the browser
   before it leaves.

---

## Read-only fixtures these cases depend on

| Fixture | Value | Used by |
|---|---|---|
| Client record | `الشركة الوطنية للاسكان` · CR `19065734264534` · VAT `3337778980983` | Clients, ISS-38 |
| Request — جديد | `2511031` | Request detail, all channel forms |
| Request — في انتظار الموافقه | `2501020188` | Request detail |
| Request — مقبول | `2508036` | Request detail |
| Request — معتمد | `2511023` | Request detail |
| Deactivated user | `Test Automation User` | ISS-42 |
| Public quotation token | `qTHCWt` | Public quotation |

These are real pre-production records. The suite opens them and never modifies them.
