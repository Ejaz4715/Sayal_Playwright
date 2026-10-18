import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { ADMIN_STORAGE_STATE } from './src/data/authState';

dotenv.config();

const timestamp = new Date().toISOString().replace(/[:T]/g, '-').replace(/\..+/, '');

export default defineConfig({
  testMatch: ['tests/**/*.spec.{js,ts}', 'e2e-scenarios/tests/**/*.spec.{js,ts}'],

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list'], ['json', { outputFile: 'test-results/results.json' }], ['json', { outputFile: `report-dashboard/test-reports-history/results-${timestamp}.json` }]],
  metadata: {
    // Default fallback environment
    environment: process.env.TEST_ENV || 'Pre-Prod',

    // Per-product environment mapping
    environments: {
      Sakani: process.env.MARKETPLACE_ENV || 'Pre-Prod',
      Digitar: process.env.DIGITAR_ENV || 'STG',
      Sayal: process.env.SAYAL_ENV || 'Pre-Prod',
    },
  },

  timeout: 180_000,
  expect: { timeout: 20_000 },

  use: {
    baseURL: process.env.BASE_URL ?? 'https://pre-sayal.housingapps.sa',
    navigationTimeout: 90_000,
    actionTimeout: 40_000,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: ['--start-maximized', '--disable-http2'],
    },
    headless: false,
    permissions: ['geolocation'],
    geolocation: { latitude: 24.7136, longitude: 46.6753 },
  },

  projects: [
    /**
     * One login per run. Sayal rate-limits login *attempts* (not just failures)
     * and answers `429 SE0053` with a ~10-minute block that refuses correct
     * credentials too — so every test authenticating for itself is not viable
     * here. See tests/setup/auth.setup.ts.
     */
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: null,
        deviceScaleFactor: undefined,
      },
    },

    /** The functional suite: reuses the stored session, never logs in. */
    {
      name: 'sayal',
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.ts/, /auth[\\/]authentication-and-logout-journey\.spec\.ts/, /auth-negative\.spec\.ts/],
      use: {
        ...devices['Desktop Chrome'],
        viewport: null,
        deviceScaleFactor: undefined,
        storageState: ADMIN_STORAGE_STATE,
      },
    },

    /**
     * The login and logout journeys themselves, which must start signed out and
     * therefore cannot use the stored session. Runs after the functional suite
     * because logging out invalidates the shared token server-side.
     */
    {
      name: 'auth-journey',
      dependencies: ['sayal'],
      testMatch: /auth[\\/]authentication-and-logout-journey\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: null,
        deviceScaleFactor: undefined,
      },
    },

    /**
     * Negative authentication runs last and alone. Each case here deliberately
     * spends a failed login attempt, so isolating it behind a dependency
     * guarantees it can never lock the account midway through the functional
     * suite — the failure mode that would be hardest to diagnose.
     */
    {
      name: 'auth-negative',
      dependencies: ['auth-journey'],
      testMatch: /auth-negative\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: null,
        deviceScaleFactor: undefined,
      },
    },
  ],
});
