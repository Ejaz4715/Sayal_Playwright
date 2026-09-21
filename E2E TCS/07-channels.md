# 07 · Channel forms and channel list

**Spec** `tests/channels/channel-forms.spec.ts` · **Project** `sayal` · **Cases** 10 · **Time** 53.9s

The seven channel Add forms — the area exploration flagged as the largest unmapped part of
the product — plus the channel list at `/main/admin/Campaigns`.

**Nothing here is submitted.** A saved channel attaches to a shared request and cannot be
removed cleanly, so empty-submit validation is asserted from each form's own required
markers rather than by posting. Every form case opens the read-only request fixture
`2511031` (status جديد) and picks a type from its اضافة قناة menu.

These inputs carry no `name` attribute, so they are addressed by placeholder — which is
also the label a user actually sees.

---

### TC-031 — SMS form exposes its scheduling, link and message fields

**Case ref** — · **Priority** P0 · **Result (26 Aug 2026)** Passed · 4.4s

**Steps**
1. Open request `2511031` and choose الرسائل النصية from اضافة قناة.
2. Look for the date field (التاريخ), the channel-link field (أدخل رابط القناة) and a time
   input.
3. Read the `maxlength` of the message body.

**Expected result**
- Date, time and channel-link fields are present — an SMS channel is schedulable.
- The message body is capped at **196 characters**, a concrete constraint discovered during
  exploration and pinned here so a silent change to it fails.

---

### TC-032 — Notification form exposes a 5000-character body and an audience selector

**Case ref** — · **Priority** P1 · **Result (26 Aug 2026)** Passed · 4.3s

**Steps**
1. Open request `2511031` and choose إشعارات.
2. Look for عنوان الرسالة, رابط الرسالة and الفئة المستهدفة.
3. Read the `maxlength` of the message body.

**Expected result**
- Title, link and target-audience fields are present.
- The body is capped at **5000 characters** — twenty-five times the SMS limit, which is the
  substantive difference between the two channels.

---

### TC-033 — Banner form exposes a date range and an indexed banner array

**Case ref** — · **Priority** P1 · **Result (26 Aug 2026)** Passed · 4.3s

**Steps**
1. Open request `2511031` and choose مساحة إعلانية.
2. Look for تاريخ بداية الحملة and تاريخ نهاية الحملة.
3. Look for the first banner's title and URL inputs, addressed by attribute as
   `[id="banners_arr.0.title"]` and `[id="banners_arr.0.url"]`.

**Expected result**
- The form takes a start and end date, not a single scheduled moment.
- The banner fields are an **indexed array** — adding a banner appends `.1`, `.2` and so
  on. They are addressed by attribute rather than `#`, because the id contains dots which
  a CSS id selector would parse as class boundaries.

---

### TC-034 to TC-037 — Single-field channel forms

**Case ref** — · **Priority** P2 · **Result (26 Aug 2026)** All passed

| TC | Channel | Time |
|---|---|--:|
| TC-034 | البريد الإلكتروني (email) | 4.9s |
| TC-035 | واتساب (WhatsApp) | 4.7s |
| TC-036 | الاتصال البيعي (cold calling) | 5.6s |
| TC-037 | نافذة منبثقة (popup) | 3.8s |

**Steps** (each case, one channel type)
1. Open request `2511031` and choose the channel type from اضافة قناة.
2. Look for the الوصف field.
3. Count message-body textareas.

**Expected result**
- The form offers a description field.
- There is **no** message body — asserted with the channel type named in the failure
  message.

These four render an identical single-field form. That is not a rendering fault: the stored
API records for these types hold only a title, with no body, schedule or audience. Pinning
the field set means that if these channels ever gain a real form, the case fails and
someone re-reads the model rather than discovering the change in production.

---

### TC-038 — Channel list renders its 7 columns

**Case ref** — · **Priority** P1 · **Result (26 Aug 2026)** Passed · 6.7s

**Steps**
1. Open `/main/admin/Campaigns`, waiting for `GET /api/campaigns?…` → 200 **and** the first
   row. The header row paints seconds before `<tbody>` is populated, so waiting on the
   table alone yields zero rows.
2. Read the header row.

**Expected result** — columns are exactly: رقم القناة · رقم الحملة · عنوان الحملة ·
نوع القناة · تاريخ جدولة القناة · حالة القناة · الإجراءات.

---

### TC-039 — Channel numbers encode their channel type

**Case ref** — · **Priority** P2 · **Result (26 Aug 2026)** Passed · 8.0s

**Steps**
1. Open `/main/admin/Campaigns` and read every row's channel number, request number and
   type.
2. For each row, derive the expected type letter and match the channel number against
   `^{requestNumber}{letter}\d+$`.

**Expected result** — every channel number follows `{request}{TypeLetter}{sequence}`, e.g.
`2607001S01`, with the letter matching the row's own channel type:

| Type | Letter |
|---|:-:|
| رسائل نصية | S |
| واتساب | W |
| إشعارات | N |
| مكالمات | C |
| مساحة إعلانية | B |
| نوافذ منبثقة | P |

The failure message names the offending channel and states which letter its type should
carry. This is a data-integrity assertion: a mismatch means a channel is filed under the
wrong request or the wrong type.

---

### TC-040 — Every channel status is one of the six known values

**Case ref** — · **Priority** P2 · **Result (26 Aug 2026)** Passed · 7.2s

**Steps**
1. Open `/main/admin/Campaigns` and read the status of every row.
2. Check each against the catalogue from `GET /api/campaigns/statuses`.

**Expected result** — every status is one of جديد · جدولة · قيد التنفيذ · معطلة · ألغيت ·
مكتملة. An unmapped seventh value would mean the UI is rendering a state the catalogue does
not define, and the failure message quotes the offending value.
