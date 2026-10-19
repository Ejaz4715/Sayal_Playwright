/**
 * Every locator and endpoint used by tests/campaigns/campaigns-page-filters.spec.ts,
 * gathered in one place. Each entry notes where it is consumed in the page objects.
 *
 * Playwright locator kinds are kept explicit so each can be rebuilt unambiguously:
 *   role  → page.getByRole(role, { name, exact? })
 *   css   → page.locator(selector)
 *   text  → page.getByText(text, { exact? })
 *   placeholder → page.getByPlaceholder(text)
 */
export const CampaignsPageFiltersObjects = {
  /** Route and list endpoint */
  route: '/main/admin/Requests',
  api: {
    list: '/api/campaign-requests',
    standardTabParam: 'is_quick=0',
    quickPromoTabParam: 'is_quick=1',
    keywordParam: 'keyword=',
  },

  /** Tabs — RequestsPage.standardTab / quickPromoTab */
  tabs: {
    standard: { role: 'tab', name: 'الحملات', exact: true },
    quickPromo: { role: 'tab', name: 'حملات النشر السريع' },
  },

  /** Keyword search — RequestsPage.searchInput / searchButton / emptyState.
   *  The same بحث button also applies the dropdown filters (one shared form). */
  search: {
    input: { placeholder: 'بحث' },
    button: { role: 'button', name: 'بحث' },
    emptyState: { text: 'لا يوجد بيانات' },
  },

  /** Filter dropdowns — Dropdown component, keyed by the placeholder label.
   *  These are custom `dgaui` dropdowns, not <select>. */
  filters: {
    status: { label: 'الحالة' },
    channelType: { label: 'نوع القناة' },
    source: { label: 'مصدر الحملة' },
  },
  dropdown: {
    wrapper: '.dgaui_dropdown',
    placeholder: '.placeholder',
    combobox: '[role="combobox"]',
    items: '[role="listbox"] .dgaui_dropdownItem',
    selectedValue: '.valueDisplay',
  },

  /** Values selected by the spec */
  values: {
    status: 'معتمد',
    channelType: 'واتساب',
    source: 'منصة سكني',
  },

  /** Table — DataTable('table') */
  table: {
    root: 'table',
    headerRow: 'thead tr',
    headerCell: 'th',
    rows: 'tbody tr',
    cell: 'td',
  },

  /** Columns read by the assertions — RequestsPage.COLUMNS */
  columns: {
    requestNumber: 'رقم الحملة',
    source: 'مصدر الحملة',
    channelType: 'نوع القناة',
    status: 'حالة الحملة',
  },

  /** App shell readiness — AppShell.expectReady / expectAuthenticatedAs,
   *  run by the authedPage fixture and by every page open(). */
  shell: {
    sidebar: '.sidebar-right',
    sidebarLinks: 'a[href^="/main/admin/"]',
    dashboardNavLink: { role: 'link', name: 'لوحة التحكم', exact: true },
    adminName: { text: 'Admin 4', exact: true },
  },
} as const;
