import { test, expect } from '@playwright/test';
import { ReserveAppointmentPage } from '../pages/ReserveAppointmentPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { completeSteps1And2 } from '../utils/bookingHelpers';
import { STRIPE, SCAN, LOCATION } from '../fixtures/testData';

/**
 * TC-01: Successful end-to-end booking with valid Stripe payment
 *
 * WHY AUTOMATE THIS:
 * This is the single most critical test in the suite — it covers the
 * core revenue-generating transaction. If this test fails in CI, it
 * means Ezra cannot accept a booking, which is an immediate P0 incident.
 * Automating it gives the team a fast regression safety net on every deploy.
 *
 * ASSUMPTIONS:
 * - The staging environment accepts Stripe test cards
 * - A new member account is used per test run to avoid conflicts
 * - The booking flow requires an authenticated session (member is pre-logged in)
 * - Stripe iframes load within the default 10s timeout
 *
 * TRADE-OFFS:
 * - We use Stripe test cards which only work in test mode — this test
 *   cannot run against production
 * - The calendar date (April 1) is hardcoded — a more robust approach
 *   would dynamically find the next available weekday
 * - Payment processing adds ~5-10s to test runtime
 */
test.describe('TC-01: Successful end-to-end booking', () => {
  test('should complete booking with valid Stripe Visa card and show confirmation', async ({ page }) => {
    // ─── Precondition: complete Steps 1 and 2 ─────────────────────────
    await completeSteps1And2(page);

    // ─── Step 3: Reserve Appointment (Payment) ─────────────────────────
    const reservePage = new ReserveAppointmentPage(page);
    await reservePage.waitForLoad();

    // Assert order summary shows correct scan type and price
    await expect(page.getByText(SCAN.type)).toBeVisible();
    await expect(page.getByText('$999')).toBeVisible();
    await expect(page.getByText(LOCATION.name)).toBeVisible();

    // Fill valid Stripe test card
    await reservePage.fillCardDetails(
      STRIPE.validVisa.number,
      STRIPE.validVisa.expiry,
      STRIPE.validVisa.cvc,
      STRIPE.validVisa.zip
    );

    // Submit payment
    await reservePage.clickContinue();

    // ─── Confirmation page assertions ──────────────────────────────────
    const confirmPage = new ConfirmationPage(page);
    await confirmPage.waitForLoad();

    // Core assertion: confirmation message is visible
    await expect(confirmPage.confirmationHeading).toBeVisible();

    // Scan type is correct on confirmation card
    await expect(page.getByText(SCAN.type)).toBeVisible();

    // Location is correct
    await expect(page.getByText(LOCATION.name)).toBeVisible();

    // Exactly 3 time slots are shown on the confirmation card
    const times = await confirmPage.getRequestedTimes();
    expect(times.length).toBe(3);

    // "Begin Medical Questionnaire" CTA is present
    await expect(confirmPage.beginQuestionnaireButton).toBeVisible();

    // "Go to Dashboard" link is present
    await expect(confirmPage.goToDashboardLink).toBeVisible();
  });
});
