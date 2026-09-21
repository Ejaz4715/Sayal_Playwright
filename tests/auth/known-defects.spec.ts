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
  test('ISS-30 logout responds to an ordinary user click @known-defect @P2', async ({
    authedPage,
    shell,
  }) => {
    test.fail(true, 'ISS-30: an invisible MuiBackdrop intercepts pointer events over the menu');

    await expect(shell.logoutLink, 'the control is visible to the user').toBeVisible();
    await shell.logoutByRealClick();
    await expect(authedPage).toHaveURL(/\/auth\/Login/);
  });

  /**
   * ISS-30, stated as a property rather than an interaction — this one documents
   * the overlay itself and is expected to fail until the backdrop stops
   * claiming pointer events while hidden.
   */
  test('ISS-30 no hidden overlay claims pointer events over the shell @known-defect @P2', async ({
    authedPage,
    shell,
  }) => {
    test.fail(true, 'ISS-30: the backdrop remains pointer-interactive while hidden');

    await shell.expectReady();
    const offenders = await authedPage.evaluate(() => {
      return [...document.querySelectorAll('.MuiBackdrop-root')]
        .map((el) => {
          const s = getComputedStyle(el);
          return {
            visibility: s.visibility,
            opacity: s.opacity,
            pointerEvents: s.pointerEvents,
            zIndex: s.zIndex,
          };
        })
        .filter((s) => s.pointerEvents !== 'none' && (s.visibility === 'hidden' || s.opacity === '0'));
    });

    expect(
      offenders,
      `hidden overlays still accepting pointer events: ${JSON.stringify(offenders)}`,
    ).toHaveLength(0);
  });
});
