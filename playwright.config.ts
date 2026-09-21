import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { ADMIN_STORAGE_STATE } from './src/data/authState';

dotenv.config();

/**
 * Playwright configuration for the Sayal campaign platform (pre-production).
 *
 * Two environment facts drive most of what follows, both established during
 * exploration rather than assumed:
 *
 *  1. `pre-sayal.housingapps.sa` resolves only on the corporate network
 *     (split-horizon DNS → 10.200.1.206). Public resolvers return NXDOMAIN by
 *     design, so a DNS failure here means "off VPN", not "environment down".
 *
 *  2. The app is a Next.js SPA whose `load` event never settles, so navigation
 *     uses `commit` and each page object waits on its own readiness element.
 *     `networkidle` is deliberately never used as a readiness strategy.
 */
export default defineConfig({
  testDir: './tests',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,

  /**
   * Retries are OFF even in CI.
   *
   * This is a deliberate departure from the sibling project. The suite shares a
   * single pre-production admin account, and three failed logins trigger a
   * ~10-minute lockout that rejects *correct* credentials too. With retries a
   * single flaky negative-auth test would burn three attempts on its own and
   * lock the account for every remaining test, which then reads as a total
   * environment outage. Stability here is worth more than a retry.
   */
  retries: 0,

  /* Serial: one shared admin account, and several journeys mutate list state. */
  workers: 1,

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  timeout: 180_000,
  expect: { timeout: 20_000 },

  use: {
    baseURL: process.env.BASE_URL ?? 'https://pre-sayal.housingapps.sa',
    navigationTimeout: 90_000,
    actionTimeout: 20_000,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,

    /**
     * `--disable-http2` is required, not cosmetic. On the default HTTP/2 path
     * this host fails Next.js chunk delivery with ERR_HTTP2_PROTOCOL_ERROR and
     * the post-login redirect never completes — which previously looked like an
     * application bug (ENV-01) and is not one.
     */
    launchOptions: {
      args: ['--disable-http2'],
    },
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
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },

    /** The functional suite: reuses the stored session, never logs in. */
    {
      name: 'sayal',
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.ts/, /auth[\\/]journey\.spec\.ts/, /auth-negative\.spec\.ts/],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
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
      testMatch: /auth[\\/]journey\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
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
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
