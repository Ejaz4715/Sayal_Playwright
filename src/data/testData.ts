/**
 * Test data and observed constants for the Sayal suite.
 *
 * Every value here was read from the running pre-production application during
 * exploration (20 and 23 Aug 2026). Nothing is assumed. Where a value is a
 * reference to a shared PRE record it is marked read-only, meaning the suite may
 * open it but must never mutate it.
 */

export const CREDENTIALS = {
  email: process.env.SAYAL_EMAIL ?? 'Admin@sayal.sa',
  password: process.env.SAYAL_PASSWORD ?? 'Sayal@123',
  /** PRE serves a static CAPTCHA image that always reads 12345 (ISS-21). */
  captcha: process.env.SAYAL_CAPTCHA ?? '12345',
} as const;

/** The authenticated operator behind CREDENTIALS. */
export const ADMIN_USER = {
  name: 'Admin 4',
  email: 'admin@sayal.sa',
  role: 'admin',
  uuid: '93fbf926-8756-4c83-834a-a01d90f72d2e',
} as const;

export const ROUTES = {
  login: '/auth/Login',
  register: '/auth/Register',
  forgotPassword: '/auth/ForgetPassword',
  dashboard: '/main/admin/Dashboard',
  audience: '/main/admin/Audience',
  audienceCreate: '/main/admin/Audience/Create',
  requests: '/main/admin/Requests',
  campaigns: '/main/admin/Campaigns',
  quotations: '/main/admin/Quotations',
  invoice: '/main/admin/Invoice',
  clients: '/main/admin/Clients',
  clientAdd: '/main/admin/Clients/Add',
  reports: '/main/admin/ReportsManagement?tab=0',
  permissions: '/main/admin/Permissions',
  filters: '/main/admin/Filters',
  users: '/main/admin/Users',
  platforms: '/main/admin/Platforms',
  platformAdd: '/main/admin/Platforms/Add',
  campaignTypes: '/main/admin/CampaignsTypes',
  bannerDefinitions: '/main/admin/Campaigns/Banner/Definitions',
  smsSenders: '/main/admin/Settings/IdentitySmsSender',
  generalSettings: '/main/admin/Settings/General',
  profile: '/main/admin/Profile',
  publicQuotation: '/public/Quotations',
} as const;

/**
 * Campaign-request status catalogue, verbatim from
 * `GET /api/campaign-requests/statuses`.
 */
export const REQUEST_STATUS = {
  1: 'جديد',
  2: 'في انتظار الموافقه',
  3: 'مقبول',
  4: 'معتمد',
  5: 'تم الرفض',
  6: 'مكتمله',
  7: 'ملغاة',
} as const;

/** Channel status catalogue, from `GET /api/campaigns/statuses`. */
export const CHANNEL_STATUS = ['جديد', 'جدولة', 'قيد التنفيذ', 'معطلة', 'ألغيت', 'مكتملة'] as const;

/** The seven channel types offered by the اضافة قناة menu on a request detail page. */
export const CHANNEL_TYPES = [
  'الرسائل النصية',
  'البريد الإلكتروني',
  'مساحة إعلانية',
  'إشعارات',
  'واتساب',
  'الاتصال البيعي',
  'نافذة منبثقة',
] as const;

/** The eight source platforms, from `GET /api/platforms`. */
export const PLATFORMS = [
  'Sayal Platform',
  'Sakani',
  'Ejar - tenant',
  'Ejar - lessor',
  'Ejar - broker',
  'Sakani Partner Platform',
  'Sakani Mobile App',
  'Comprehensive data',
] as const;

/** The nine registered SMS sender identities, from `GET /api/sms-senders`. */
export const SMS_SENDERS = [
  'Ejar',
  'Ejar_AD',
  'Idlelands',
  'Mostadam',
  'Mullak',
  'NHC',
  'Sakani',
  'Sakani-AD',
  'Srei',
] as const;

/** The 12 client sectors, from `GET /api/industries/get-industries`. */
export const CLIENT_SECTORS = [
  'بنك',
  'صاحب عمل',
  'مطور',
  'سياحة محلية',
  'مؤسسة تعليمية',
  'مؤسسة مالية',
  'صاحب اساس',
  'وكالة اعلانات',
  'متجر بيع بالتجزئه',
  'مطعم',
  'اتصالات',
  'اخرى',
] as const;

/**
 * Global business parameters read from إعدادات عامة. These govern behaviour
 * across the product, so several assertions elsewhere derive from them.
 */
export const SETTINGS = {
  previewMessages: '5',
  minAudienceCount: '50',
  defaultTargetCount: '1000',
  quotationValidityDays: '7',
  invoiceValidityDays: '7',
} as const;

/**
 * Shared PRE records used read-only as stable fixtures.
 *
 * These are real records belonging to the environment. The suite opens them and
 * asserts against them; it must never edit, delete or transition them.
 */
export const READONLY_FIXTURES = {
  /** Client holding a 14-digit CR and 13-digit VAT — the ISS-38 / ISS-02 / ISS-03 subject. */
  client: {
    uuid: '42eee395-7684-4155-86cd-1d8ab0bd1395',
    companyName: 'الشركة الوطنية للاسكان',
    crNumber: '19065734264534',
    vatNumber: '3337778980983',
    mobile: '555000333',
    email: 'salma.zaki909@gmail.com',
    idNumber: '2420333444',
  },
  /** One campaign request per status, found by scanning all 261 standard requests. */
  requests: {
    new: { number: '2511031', uuid: '2d0f7f61-75f9-4a0f-a188-89cc005060ba', status: 'جديد' },
    awaitingApproval: {
      number: '2501020188',
      uuid: '4424e4ca-8f67-4513-b2f4-3af65e111443',
      status: 'في انتظار الموافقه',
    },
    accepted: { number: '2508036', uuid: 'a45393ba-43ba-4108-aee3-d689abec1aa6', status: 'مقبول' },
    approved: { number: '2511023', uuid: '89583223-10b8-41c2-bdd2-e034fbf3c5d4', status: 'معتمد' },
    rejected: { number: '2412010125', uuid: '47bd9159-5eab-496d-a96e-b3881aa45f41', status: 'تم الرفض' },
    completed: { number: '2605002', uuid: 'ce07cbf7-e434-4724-986d-3884bc687b8e', status: 'مكتمله' },
    cancelled: { number: '2602002', uuid: 'b140495e-3578-45ae-a231-c20d2eec6384', status: 'ملغاة' },
  },
  /** A user account that is deactivated in PRE — the ISS-42 subject. */
  inactiveUser: {
    uuid: '54c22a95-3bec-4b83-8ccb-660ea29923d4',
    name: 'Test Automation User',
    email: 'Test_automation@email.com',
    listStatus: 'غير فعال',
    detailStatus: 'معطل',
  },
  /** A public quotation token that resolves without a session. */
  quotationToken: 'qTHCWt',
} as const;

/** Observed list volumes. Used as lower bounds, never as exact equality. */
export const VOLUMES = {
  standardRequests: 261,
  standardRequestPages: 18,
  quickRequests: 31,
  quickRequestPages: 3,
  channels: 366,
  channelPages: 25,
  invoicePages: 4,
  quotationPages: 5,
  filterPages: 5,
  perPage: 15,
} as const;

/** Server error codes surfaced verbatim to users (ISS-07). */
export const ERROR_CODES = {
  notFound: 'SE0010',
  badCredentials: 'SE0011',
  lockedOut: 'SE0053',
  badCaptcha: 'SE0054',
} as const;

/** Generates a recognisable, collision-free name for data this suite creates. */
export function autoName(prefix = 'AUTO_SAYAL'): string {
  return `${prefix}_${Date.now()}`;
}
