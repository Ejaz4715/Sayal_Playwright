/**
 * Locators, request parameters and test data for
 * tests/reports/reports-management-filters.spec.ts — the filter panel on the
 * three tabs of `/main/admin/ReportsManagement`.
 *
 * Each control is described once:
 *   placeholder → how it is located (what the user sees)
 *   param       → the query parameter the filter sends
 *   column      → the grid column whose cells must match (omit when none shows it)
 */
export const ReportsManagementFiltersObjects = {
  buttons: { reset: 'إعادة التعيين', closePanel: 'إغلاق التصفية' },

  /** react-select dropdowns. `emptyInput__*` is stable; the `css-xxxx` hashes are not used. */
  select: { control: '.emptyInput__control', chip: '.emptyInput__multi-value' },

  panelInputs: 'form input[type=text]',
  loadingBackdrop: '.MuiBackdrop-root',

  tabs: {
    campaigns: {
      submit: 'تطبيق',
      fields: {
        title: { placeholder: 'عنوان الحملة', param: 'title', column: 'عنوان الحملة' },
        requestNumber: { placeholder: 'رقم الحملة', param: 'request_number', column: 'رقم الحملة' },
        clientName: { placeholder: 'اسم العميل', param: 'name', column: 'اسم العميل' },
        crNumber: { placeholder: 'رقم السجل التجاري', param: 'cr_number', column: 'رقم السجل التجاري' },
      },
      selects: {
        platform: { placeholder: 'اختر المنصة', param: 'platform_id[]' },
        status: { placeholder: 'الحالة', param: 'status[]', column: 'حالة الحملة' },
      },
    },
    channels: {
      submit: 'تطبيق',
      fields: {
        channelNumber: { placeholder: 'رقم القناة', param: 'campaign_number', column: 'رقم القناة' },
        requestNumber: { placeholder: 'رقم الحملة', param: 'request_number', column: 'رقم الحملة' },
        title: { placeholder: 'عنوان الحملة', param: 'campaign_request_title', column: 'عنوان الحملة' },
      },
      selects: {
        channelType: { placeholder: 'نوع القناة', param: 'campaign_type[]', column: 'نوع القناة' },
        status: { placeholder: 'الحالة', param: 'status[]', column: 'حالة القناة' },
      },
    },
    clients: {
      /** Clients is the one tab that applies with بحث instead of تطبيق. */
      submit: 'بحث',
      fields: {
        clientName: { placeholder: 'اسم العميل', param: 'name', column: 'اسم العميل' },
        companyName: { placeholder: 'اسم الشركة', param: 'company_name', column: 'اسم الشركة' },
      },
      selects: {},
    },
  },

  /**
   * Real PRE data: campaign 2610008, its channel 2610008S01, and the largest client.
   * A dropdown option and the grid cell for the same value are worded differently
   * (الرسائل النصية vs رسائل نصية), so the channel data has a `filters` and a `rows` form.
   */
  data: {
    campaigns: {
      title: 'Sms Ejaz',
      requestNumber: '2610008',
      clientName: 'Testing Client for Automation test',
      crNumber: '7920383209',
      platform: 'منصة سيال',
    },
    channels: {
      filters: {
        channelNumber: '2610008S01',
        requestNumber: '2610008',
        title: 'Sms Ejaz',
        channelType: 'الرسائل النصية',
        status: 'مجدولة',
      },
      rows: {
        channelNumber: '2610008S01',
        requestNumber: '2610008',
        title: 'Sms Ejaz',
        channelType: 'رسائل نصية',
        status: 'جدولة',
      },
    },
    clients: {
      clientName: 'الشركة الوطنية للاسكان',
      companyName: 'الشركة الوطنية للاسكان',
    },
  },
} as const;
