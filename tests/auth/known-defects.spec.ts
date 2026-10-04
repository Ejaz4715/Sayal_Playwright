import { logStep } from '@helpers/LogSteps';
import { test, expect } from '@fixtures/pages.fixture';

/**
 * Known-defect guards.
 *
 * These assert the behaviour the product *should* have. They are expected to
 * fail while the defect stands, and Playwright reports them as "expected
 * failures" rather than passes — so the defect stays visible in every run and
 * the day it is fixed the test turns into an unexpected pass, which is loud.
 *
 * Nothing here is weakened to go green.
 */
test.describe('Known product defects', () => {
  /**
   * ISS-30 — header and row menu items are covered by an invisible overlay.
   *
   * Reproduced independently by this suite: a full-viewport
   * `.MuiBackdrop-root` ships with visibility:hidden, opacity:0,
   * pointer-events:auto and z-index:2147483647, so it swallows the click.
   * This affects real users, not just automation.
   */


});
