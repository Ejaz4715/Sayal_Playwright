# 11 · Campaign request detail

**Spec** `tests/requests/request-detail.spec.ts` · **Project** `sayal` · **Cases** 6 · **Time** 28.1s

`/main/admin/Requests/{uuid}` — the core business entity. The interesting property here is
that the available actions are gated by status, and the gating was observed directly across
all seven statuses.

**No case in this file performs a state transition.** Accepting, rejecting, approving or
cancelling a real request cannot be undone in this environment. What *is* asserted is which
actions the product offers per status — the testable half of the gating rule — using one
read-only fixture per status found by scanning all 261 standard requests.

The observed gating:

| Status | Actions offered |
|---|---|
| جديد | تعديل الحملة · حذف الحملة · اضافة قناة |
| في انتظار الموافقه | + قبول الطلب · رفض الطلب · جدولة القناة |
| مقبول | + إنشاء عرض السعر |
| معتمد | تنزيل الملف · تتبع الحملة الإعلانية · عرض النتائج |

---

### TC-058 — Detail page renders the request, client block and audit trail

**Case ref** — · **Priority** P0 · **Result (26 Aug 2026)** Passed · 5.7s

**Preconditions** — read-only request fixture `2511031` (status جديد).

**Steps**
1. Open the request and wait for the heading تفاصيل الحملة.
2. Look for the request number `2511031` rendered exactly.
3. Look for the معلومات العميل block.
4. Wait for the audit table — it is populated by a second request and lands a beat after
   the rest of the page, so it needs its own readiness wait.
5. Read the audit table's headers.

**Expected result**
- Request identity, client block and audit trail all render.
- The audit columns are exactly: مصدر الإجراء · اسم الإجراء · متخذ الإجراء · التاريخ ·
  الزمن.

---

### TC-059 · SAYAL-REQ-009 — A جديد request offers edit, delete and add-channel

**Priority** P1 · **Result (26 Aug 2026)** Passed · 3.7s

**Steps**
1. Open request `2511031` (جديد).
2. Look for تعديل الحملة, حذف الحملة and the اضافة قناة combobox.
3. Count the قبول الطلب and إنشاء عرض السعر controls.

**Expected result**
- All three new-status actions are available.
- Approval actions belong to later statuses and are **absent** — count zero, not merely
  hidden.

Asserting the absence is the half that makes this a gating test rather than a rendering
test.

---

### TC-060 · SAYAL-REQ-015 — An awaiting-approval request offers accept and reject

**Priority** P0 · **Result (26 Aug 2026)** Passed · 6.2s

**Preconditions** — read-only request fixture `2501020188` (status في انتظار الموافقه).

**Steps**
1. Open the request and wait for تفاصيل الحملة.
2. Look for قبول الطلب and رفض الطلب.

**Expected result** — both decision actions are offered at this status. Neither is clicked:
the transition cannot be undone in pre-production.

---

### TC-061 — An accepted request is where quotation creation becomes available

**Case ref** — · **Priority** P0 · **Result (26 Aug 2026)** Passed · 3.2s

**Preconditions** — read-only request fixture `2508036` (status مقبول).

**Steps**
1. Open the request and wait for تفاصيل الحملة.
2. Look for إنشاء عرض السعر.
3. Count the قبول الطلب controls.

**Expected result**
- Quotation creation is offered at مقبول.
- The accept action is gone, because the request has already been accepted.

This **corrects an earlier assumption** that quotation creation lives on a جديد request. It
does not — it appears one status later.

---

### TC-062 — An approved request offers delivery actions, not lifecycle actions

**Case ref** — · **Priority** P1 · **Result (26 Aug 2026)** Passed · 4.6s

**Preconditions** — read-only request fixture `2511023` (status معتمد).

**Steps**
1. Open the request and wait for تفاصيل الحملة.
2. Read every visible action-button label.
3. Count the قبول الطلب, إنشاء عرض السعر and حذف الحملة controls.

**Expected result**
- At least one delivery action is offered — تنزيل الملف, تتبع الحملة or عرض النتائج.
- Accept, quotation creation and delete are all absent. An approved campaign is in
  execution: it can be tracked and its results read, but it can no longer be deleted or
  re-decided.

---

### TC-063 · SAYAL-CHAN-004 — The add-channel menu offers all seven channel types

**Priority** P1 · **Result (26 Aug 2026)** Passed · 4.5s

**Steps**
1. Open request `2511031` (جديد).
2. Open the اضافة قناة combobox.
3. Look for each of the seven channel types.

**Expected result** — all seven are offered, each asserted by name: الرسائل النصية ·
البريد الإلكتروني · مساحة إعلانية · إشعارات · واتساب · الاتصال البيعي · نافذة منبثقة.

This is the entry point every case in [07-channels.md](07-channels.md) uses.
