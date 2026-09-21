/**
 * Where the authenticated session is persisted between the setup project and
 * the functional suite. Kept in its own module so `playwright.config.ts` can
 * import the path without loading a spec file — importing the setup file from
 * the config executes `setup()` during config load and Playwright rejects it.
 */
export const ADMIN_STORAGE_STATE = 'playwright/.auth/admin.json';
