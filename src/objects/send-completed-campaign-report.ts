/**
 * Locators and values for tests/reports/send-completed-campaign-report.spec.ts —
 * the row action « إرسال التقرير للعميل » on the Campaigns tab of
 * `/main/admin/ReportsManagement`.
 */
export const SendCompletedCampaignReportObjects = {
  /** The three-dot icon in a grid row's trailing cell. */
  rowMenuIcon: '.colTbl svg',
  menuItem: 'إرسال التقرير للعميل',

  /** Confirmation dialog shown before anything is sent. */
  dialog: {
    question: 'هل أنت متأكد أنك تريد الإرسال ؟',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
  },

  /**
   * Sending is a GET to this endpoint, not a POST — blocking only non-GET requests
   * would not stop it. The test intercepts exactly this path.
   */
  sendEndpoint: '**/api/report/campaign-request/send-report-to-client/**',
  sendPath: /\/api\/report\/campaign-request\/send-report-to-client\/[0-9a-f-]{36}$/,

  /** Toast shown once the report has been sent. */
  successMessage: 'تم إرسال التقرير بنجاح',

  /** The campaign status the report may be sent for. */
  data: { status: 'مكتمله' },
} as const;
