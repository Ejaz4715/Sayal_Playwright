import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { AppShell } from './components/AppShell';
import { DataTable } from './components/DataTable';
import { ROUTES } from '@data/testData';

/**
 * `/main/admin/Permissions` — the RBAC screen, with two tabs.
 *
 *   الأدوار    roles, with a permission count per role
 *   الصلاحيات  the permission catalogue, grouped by screen
 *
 * Worth knowing when reading assertions here: the roles grid legitimately
 * contains entries named after screens with zero permissions. That is real seed
 * data, not a rendering fault — the root cause behind ISS-25.
 */
export class PermissionsPage extends BasePage {
  protected path = ROUTES.permissions;
  readonly shell: AppShell;
  readonly table: DataTable;

  static readonly ROLE_COLUMNS = ['اسم الدور', 'عدد الصلاحيات'] as const;
  static readonly PERMISSION_COLUMNS = ['اسم الشاشة', 'اسم الصلاحية', 'الحالة'] as const;

  /** The 15 screen groups the permission catalogue is organised into. */
  static readonly PERMISSION_SCREENS = [
    'لوحة التحكم',
    'الجمهور',
    'الحملات',
    'المرشحات',
    'تعريف المساحات الاعلانية',
    'العملاء',
    'الصناعات',
    'هوية المرسلين',
    'المستخدمين',
    'المنصات',
    'أنواع الحملات',
    'إعدادات الموقع',
    'القنوات',
    'التقارير',
    'الحملات السريعة',
  ] as const;

  constructor(page: Page) {
    super(page);
    this.shell = new AppShell(page);
    this.table = new DataTable(page, 'grid');
  }

  get rolesTab(): Locator {
    return this.page.getByText('الأدوار', { exact: true }).first();
  }

  get permissionsTab(): Locator {
    return this.page.getByText('الصلاحيات', { exact: true }).last();
  }

  get addRoleButton(): Locator {
    return this.page.getByRole('button', { name: 'إضافة دور' });
  }

  async open(): Promise<void> {
    const roles = this.page.waitForResponse(
      (r) => r.url().includes('/api/roles/all') && r.status() === 200,
      { timeout: 60_000 },
    );
    await this.goto();
    await roles.catch(() => null);
    await expect(this.table.container).toBeVisible();
    await this.shell.expectReady();
  }

  /** Switch to the permission catalogue and wait for its rows. */
  async openPermissionsTab(): Promise<void> {
    await this.permissionsTab.click();
    await expect(this.table.headerRow).toContainText('اسم الشاشة');
  }

  /** Role names currently listed. */
  async roleNames(): Promise<string[]> {
    const rows = await this.table.allRowTexts();
    return rows.map((c) => (c[0] ?? '').trim()).filter(Boolean);
  }

  /** Distinct screen names in the permission catalogue. */
  async permissionScreens(): Promise<string[]> {
    const rows = await this.table.allRowTexts();
    return [...new Set(rows.map((c) => (c[0] ?? '').trim()).filter(Boolean))];
  }
}
