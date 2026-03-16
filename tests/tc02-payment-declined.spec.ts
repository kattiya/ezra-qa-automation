import { test, expect } from '@playwright/test';
import { ReserveAppointmentPage } from '../pages/ReserveAppointmentPage';
import { completeSteps1And2 } from '../utils/bookingHelpers';
import { STRIPE } from '../fixtures/testData';

/**
 * TC-02: Payment declined — invalid card is rejected gracefully
 *
 * WHY AUTOMATE THIS:
 * Payment failure handling is the second most critical scenario.
 * A silent failure or unhandled exception can cause double-charges,
 * orphaned bookings, or member confusion. Automating this ensures
 * the error path is as robust as the happy path and is tested on
 * every deploy without manual intervention.
 *
 * ASSUMPTIONS:
 * - Stripe test card 4000 0000 0000 0002 always returns a decline in test mode
 * - The app displays a user-visible error message (not just a console error)
 * - The user remains on Step 3 after a decline (no redirect)
 * - No booking record is created in the backend on decline
 *
 * TRADE-OFFS:
 * - We cannot assert that no backend record was created without API access —
 *   this test only covers the UI layer. A full integration test would also
 *   verify via the admin API that no booking exists post-decline.
 * - Stripe error messages may vary slightly — we use a partial match
 *   rather than an exact string to avoid brittle assertions.
 */
test.describe('TC-02: Payment declined', () => {
  test('should show error message and stay on Step 3 when card is declined', async ({ page }) => {
    // ─── Precondition: complete Steps 1 and 2 ─────────────────────────
    await completeSteps1And2(page);

    // ─── Step 3: Reserve Appointment (Payment) ─────────────────────────
    const reservePage = new ReserveAppointmentPage(page);
    await reservePage.waitForLoad();

    // Confirm we are on Step 3
    await expect(page).toHaveURL(/reserve-appointment/);

    // Fill with Stripe decline test card
    await reservePage.fillCardDetails(
      STRIPE.declinedCard.number,
      STRIPE.declinedCard.expiry,
      STRIPE.declinedCard.cvc,
      STRIPE.declinedCard.zip
    );

    // Submit payment attempt
    await reservePage.clickContinue();

    // ─── Error state assertions ────────────────────────────────────────

    // User must remain on Step 3 — no redirect to confirmation
    await expect(page).toHaveURL(/reserve-appointment/);
    await expect(page).not.toHaveURL(/scan-confirm/);

    // A user-visible error message must appear
    const errorMessage = await reservePage.getErrorMessage();
    expect(errorMessage.toLowerCase()).toMatch(/declined|card|payment|error/i);

    // The Continue button must still be present (user can retry)
    await expect(reservePage.continueButton).toBeVisible();

    // The Back button must still be present
    await expect(reservePage.backButton).toBeVisible();
  });

  test('should allow retry with a valid card after an initial decline', async ({ page }) => {
    // ─── Precondition: complete Steps 1 and 2 ─────────────────────────
    await completeSteps1And2(page);

    const reservePage = new ReserveAppointmentPage(page);
    await reservePage.waitForLoad();

    // First attempt — declined card
    await reservePage.fillCardDetails(
      STRIPE.declinedCard.number,
      STRIPE.declinedCard.expiry,
      STRIPE.declinedCard.cvc,
      STRIPE.declinedCard.zip
    );
    await reservePage.clickContinue();

    // Confirm error appears
    const errorMessage = await reservePage.getErrorMessage();
    expect(errorMessage).toBeTruthy();

    // Second attempt — valid card (retry)
    await reservePage.fillCardDetails(
      STRIPE.validVisa.number,
      STRIPE.validVisa.expiry,
      STRIPE.validVisa.cvc,
      STRIPE.validVisa.zip
    );
    await reservePage.clickContinue();

    // Should now succeed and redirect to confirmation
    await expect(page).toHaveURL(/scan-confirm/, { timeout: 15000 });
    await expect(page.getByText(/your requested time slots have been received/i)).toBeVisible();
  });
});
