/**
 * Locators only for the campaign specs (pop-up, notification— paid & unpaid).
 * Test data is written in the spec steps, not here.
 *
 * Locator kinds are kept explicit so each can be rebuilt unambiguously:
 *   role → page.getByRole(role, { name, exact? })
 *   text → page.getByText(text, { exact? })
 *   css / xpath → page.locator(selector)
 */
export const CampaignWithPopupObjects = {
  /** Sidebar entry that opens the campaign requests list. */
  sidebarLink: 'الحملات',

  buttons: {
    addCampaign: 'إضافة حملة',
    next: 'التالي',
    save: 'حفظ',
    reviewCampaign: 'استعراض الحملة',
    approveRequest: 'موافقة على الطلب',
    confirm: 'تأكيد',
    editCampaign: 'تعديل الحملة',
    createQuotation: 'إنشاء عرض السعر',
    send: 'إرسال',
    done: 'تم',
    accept: 'قبول',
  },

  /** Step 1 — campaign details form. */
  form: {
    title: 'عنوان الحملة *',
    clientDropdown: 'اسم العميل',
    goalDropdown: 'هدف الحملة',
  },

  /** Step 2 — channel. */
  channel: {
    add: 'اضافة قناة',
    description: 'الوصف *',
  },

  /** Quotation form. */
  quotation: {
    price: 'السعر',
    successDialogClose: '.AppDialog_tsx_icon__Ei2d3',
    /** Matched by address: a notification page also shows its own message link. */
    publicLink: 'a[href*="/public/Quotations"]',
  },

  /** Public quotation page, opened in a new tab from the link above. */
  publicPage: {
    detailsTab: 'تفاصيل الحملة',
  },

  /** Step 1 — shown for a paid campaign: the second radio group, then the agreement number. */
  agreement: {
    paidRadiobutton: "//label[@for = 'paid_1'][1]",
    number: '#agreement_number',
  },

  messages: {
    channelAdded: 'تمت الإضافة بنجاح',
    campaignApproved: 'تم الموافقة علي الحملة بنجاح',
    campaignUpdated: 'تمت التعديل بنجاح',  },

  /** VAT added to the quoted price; the public page shows `price × (1 + vatRate)`. */
  vatRate: 0.15,
  currency: 'ريال',
} as const;

/** Notification channel form. */
export const CampaignWithNotificationObjects = {
  fields: {
    messageTitle: 'عنوان الرسالة *',
    link: 'رابط الرسالة',
    date: 'التاريخ',
    audience: 'الفئة المستهدفة',
    content: 'محتوى الرسالة',
  },

  /**
   * The picker's day buttons are labelled ".
   */
  dayLabel: (day: string) => new RegExp(`Choose .+ ${day} of`),
} as const;

