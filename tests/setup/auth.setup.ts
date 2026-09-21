import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '@pages/LoginPage';
import { AppShell } from '@components/AppShell';
import { ADMIN_USER, ROUTES } from '@data/testData';
import { ADMIN_STORAGE_STATE } from '@data/authState';

/**
 * Authenticate once and persist the session — reusing it across runs when it is
 * still good.
 *
 * This exists because of a hard environment constraint, not for speed. Sayal
 * rate-limits **login attempts**, not merely failed ones, and answers
 * `429 SE0053` with a ~10-minute block that also refuses correct credentials.
 * The observed budget is only a handful of attempts per window, so two things
 * matter:
 *
 *  1. The functional suite must never log in per test — it reuses this state.
 *  2. Re-running the suite must not spend a fresh attempt each time, or an
 *     ordinary edit-run-fix cycle locks the account out within minutes.
 *
 * So this verifies the stored session against a real protected route first and
 * only authenticates when it has genuinely expired. Verification is a plain
 * GET, which the limiter does not count.
 */
setup('authenticate as admin', async ({ browser }) => {
  setup.setTimeout(180_000);

  if (await storedSessionIsValid(browser)) {
    setup.info().annotations.push({
      type: 'note',
      description: 'Reused the stored admin session; no login attempt spent.',
    });
    return;
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  const login = new LoginPage(page);
  await login.login();
  await new AppShell(page).expectAuthenticatedAs(ADMIN_USER.name);

  fs.mkdirSync(path.dirname(ADMIN_STORAGE_STATE), { recursive: true });
  await context.storageState({ path: ADMIN_STORAGE_STATE });
  await context.close();
});

/**
 * Load the stored state and confirm it still opens a protected route.
 * Returns false — rather than throwing — whenever anything about it is unusable,
 * so the caller falls back to a real login.
 */
async function storedSessionIsValid(browser: import('@playwright/test').Browser): Promise<boolean> {
  if (!fs.existsSync(ADMIN_STORAGE_STATE)) return false;

  const context = await browser.newContext({ storageState: ADMIN_STORAGE_STATE });
  const page = await context.newPage();
  try {
    await page.goto(ROUTES.dashboard, { waitUntil: 'commit' });
    await expect(new AppShell(page).navLink('لوحة التحكم')).toBeVisible({
      timeout: AppShell.HYDRATION_TIMEOUT,
    });
    /* Landing anywhere under /auth means the token was rejected. */
    return !/\/auth\//.test(page.url());
  } catch {
    return false;
  } finally {
    await context.close();
  }
}
