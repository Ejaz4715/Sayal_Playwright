import { Page, Locator, expect } from '@playwright/test';
import { ROUTES } from '@data/testData';

/**
 * The authenticated shell: left navigation drawer plus the header user menu.
 *
 * Navigation entries are real anchors, so they are reachable by role even
 * though the surrounding markup exposes no other accessibility information.
 * The CSS-module hash classes (`NavigationDrawerItem_title__k8jim`) are
 * avoided — they are build-generated.
 */
export class AppShell {
  readonly page: Page;

  /** Sidebar destinations, in the order they render. */
  static readonly NAV_ITEMS: ReadonlyArray<{ label: string; route: string }> = [
    { label: 'لوحة التحكم', route: ROUTES.dashboard },
    { label: 'الجمهور', route: ROUTES.audience },
    { label: 'الحملات', route: ROUTES.requests },
    { label: 'القنوات', route: ROUTES.campaigns },
    { label: 'عروض الاسعار', route: ROUTES.quotations },
    { label: 'الفواتير', route: ROUTES.invoice },
    { label: 'إدارة العملاء', route: ROUTES.clients },
    { label: 'إدارة التقارير', route: '/main/admin/ReportsManagement' },
    { label: 'إدارة الصلاحيات', route: ROUTES.permissions },
    { label: 'إدارة المرشحات', route: ROUTES.filters },
    { label: 'إدارة المستخدمين', route: ROUTES.users },
    { label: 'تعريف المنصات', route: ROUTES.platforms },
    { label: 'تعريف انواع القنوات', route: ROUTES.campaignTypes },
    { label: 'تعريف المساحات الإعلانية', route: ROUTES.bannerDefinitions },
    { label: 'إعدادات هوية المرسل', route: ROUTES.smsSenders },
    { label: 'إعدادات عامة', route: ROUTES.generalSettings },
  ];

  constructor(page: Page) {
    this.page = page;
  }

  get sidebar(): Locator {
    return this.page.locator('.sidebar-right').first();
  }

  navLink(label: string): Locator {
    return this.sidebar.getByRole('link', { name: label, exact: true }).first();
  }

  /** Every anchor in the drawer that points at an admin route. */
  get navLinks(): Locator {
    return this.sidebar.locator('a[href^="/main/admin/"]');
  }

  get greeting(): Locator {
    return this.page.getByText('مرحباً،');
  }

  get profileLink(): Locator {
    return this.page.getByText('الملف الشخصي', { exact: true }).first();
  }

  get logoutLink(): Locator {
    return this.page.getByText('تسجيل الخروج', { exact: true }).first();
  }

  get languageToggle(): Locator {
    return this.page.getByText('English', { exact: true }).first();
  }

  /**
   * How long the shell may take to hydrate.
   *
   * Deliberately far above the suite's default expect timeout. The drawer
   * renders only once `/api/users/get-profile` resolves, and that call was
   * measured at 2.9–4.2s in the best case and beyond 20s repeatedly (ISS-14) —
   * so until the page is usable it shows nothing but a "Loading" status. This
   * is a product performance defect, tracked as ISS-14; the timeout accommodates
   * it so that unrelated tests fail for their own reasons rather than for this.
   */
  static readonly HYDRATION_TIMEOUT = 60_000;

  /**
   * The shell is only usable once the drawer has hydrated. Waiting on a nav
   * link is the honest readiness signal — the URL changes long before the page
   * is usable.
   */
  async expectReady(): Promise<void> {
    await expect(this.navLink('لوحة التحكم')).toBeVisible({
      timeout: AppShell.HYDRATION_TIMEOUT,
    });
  }

  async expectAuthenticatedAs(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible({
      timeout: AppShell.HYDRATION_TIMEOUT,
    });
  }

  async navigateTo(label: string): Promise<void> {
    await this.navLink(label).click();
  }

  /**
   * Log out.
   *
   * Uses `dispatchEvent` rather than a real click, and that is a deliberate
   * workaround for **ISS-30**, not a convenience. The header menu items sit
   * under a full-viewport `MuiBackdrop-root` that ships with
   * `visibility: hidden`, `opacity: 0`, `pointer-events: auto` and
   * `z-index: 2147483647`, so an ordinary click is intercepted and times out.
   *
   * The defect itself is asserted directly by the known-defect test in
   * `tests/auth/known-defects.spec.ts`; this helper exists so that the *other*
   * logout behaviours — token teardown, redirect, back-navigation safety —
   * remain testable instead of being blocked by an unrelated UI defect.
   */
  async logout(): Promise<void> {
    await expect(this.logoutLink).toBeVisible();
    await this.logoutLink.dispatchEvent('click');
  }

  /**
   * Attempt logout the way a user would. Expected to fail while ISS-30 stands —
   * used only by the known-defect test.
   */
  async logoutByRealClick(timeout = 8000): Promise<void> {
    await this.logoutLink.click({ timeout });
  }

  /** The overlay behind ISS-30. Exposed so the defect test can assert on it. */
  get blockingBackdrop(): Locator {
    return this.page.locator('.MuiBackdrop-root');
  }
}
