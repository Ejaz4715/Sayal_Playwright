import { Page } from '@playwright/test';
import { AdminListPage } from './AdminListPage';
import { ROUTES } from '@data/testData';

/**
 * Factories for the admin screens that are plain `.TableNhc` lists.
 *
 * These eight differ only in route, column set and backing endpoint, so they
 * are configured here rather than as eight near-identical classes. Screens with
 * real behaviour of their own — Clients' filter panel, Permissions' tabs,
 * General Settings' form — get proper page objects instead.
 *
 * Column sets are exactly what was observed in the running application.
 */

export const USERS_COLUMNS = [
  'الاسم',
  'البريد الإلكتروني',
  'نوع المستخدم',
  'الحالة',
  'اسم الدور',
] as const;

export const FILTERS_COLUMNS = [
  'الاسم باللغه الإنجليزية',
  'الاسم باللغه العربية',
  'الحالة',
  'الترتيب',
  'النوع',
  'المنصة',
] as const;

export const PLATFORMS_COLUMNS = [
  'الاسم باللغه الإنجليزية',
  'الاسم باللغه العربية',
  'الوصف',
] as const;

export const SMS_SENDER_COLUMNS = ['اسم هوية المرسل', 'الرصيد'] as const;

export const INVOICE_COLUMNS = [
  'رقم الحملة',
  'اسم الشركة',
  'عنوان الحملة',
  'حالة الفاتورة',
  'تاريخ إنشاء الفاتورة',
  'تاريخ سداد الفاتورة',
  'تاريخ إلغاء الفاتورة',
  'سبب الإلغاء',
] as const;

export const QUOTATION_COLUMNS = [
  'رقم الحملة',
  'اسم الشركة',
  'عنوان الحملة',
  'حالة عرض السعر',
  'تاريخ إنشاء عرض السعر',
  'تاريخ إنتهاء عرض السعر',
  'تاريخ قبول عرض السعر',
  'تاريخ رفض عرض السعر',
  'سبب الرفض',
] as const;

export const BANNER_DEFINITION_COLUMNS = [
  'الصورة الإفتراضية',
  'المنصة',
  'اسم المساحة الإعلانية',
  'طول المساحة الإعلانية',
  'عرض المساحة الإعلانية',
  'الإجراءات',
] as const;

export const usersList = (page: Page) =>
  new AdminListPage(page, ROUTES.users, USERS_COLUMNS, '/api/users');

export const filtersList = (page: Page) =>
  new AdminListPage(page, ROUTES.filters, FILTERS_COLUMNS, '/api/filters');

export const platformsList = (page: Page) =>
  new AdminListPage(page, ROUTES.platforms, PLATFORMS_COLUMNS, '/api/platforms');

export const smsSendersList = (page: Page) =>
  new AdminListPage(page, ROUTES.smsSenders, SMS_SENDER_COLUMNS, '/api/sms-senders');

export const invoiceList = (page: Page) =>
  new AdminListPage(page, ROUTES.invoice, INVOICE_COLUMNS, '/api/invoice');

export const quotationsList = (page: Page) =>
  new AdminListPage(page, ROUTES.quotations, QUOTATION_COLUMNS, '/api/quotation');

/**
 * Banner Definitions is the exception in this family: it renders a real HTML
 * `<table>` rather than the `.TableNhc` div grid the other seven use.
 */
export const bannerDefinitionsList = (page: Page) =>
  new AdminListPage(
    page,
    ROUTES.bannerDefinitions,
    BANNER_DEFINITION_COLUMNS,
    '/api/banner_zones',
    'table',
  );
