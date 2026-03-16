import { test, expect } from '@playwright/test';
import { ReserveAppointmentPage } from '../pages/ReserveAppointmentPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { completeSteps1And2 } from '../utils/bookingHelpers';
import { STRIPE, SCAN, LOCATION } from '../fixtures/testData';

/**
 * TC-01: Successful end-to-end booking with valid Stripe payment
 *
 * WHY AUTOMATE THIS:
 * This is the core revenue-generating transaction. If this fails in CI,
 * Ezra cannot accept bookings — an immediate P0 incident. This test
 * provides the team a fast regression signal on every deploy.
 *
 * COVERAGE: Step 1 → Step 2 → Step 3 (Payment) → Confirmation
 */
test.describe('TC-01: Successful end-to-end booking', () => {

  test('should complete booking with valid Stripe Visa card and show confirmation', async ({ page }) => {

    // ─── Precondition: Complete Steps 1 & 2 ───────────────────────────
    await completeSteps1And2(page);

    // ─── Step 3: Payment ───────────────────────────────────────────────
    console.log('\n── Step 3: Reserve Appointment (Payment) ────────────');
    const reservePage = new ReserveAppointmentPage(page);
    await reservePage.waitForLoad();

    // Assert order summary before paying
    await reservePage.assertScanType(SCAN.type);
    await reservePage.assertTotalAmount(SCAN.price);
    await reservePage.assertLocationName(LOCATION.name);

    // Fill valid Stripe test card
    await reservePage.fillCardDetails(
      STRIPE.validVisa.number,
      STRIPE.validVisa.expiry,
      STRIPE.validVisa.cvc,
      STRIPE.validVisa.zip,
      'kate.kuril@gmail.com',
      '(347) 977-0179'
    );

    // Submit payment
    await reservePage.clickContinue();

    // ─── Confirmation assertions ───────────────────────────────────────
    console.log('\n── Confirmation Page ────────────────────────────────');
    const confirmPage = new ConfirmationPage(page);
    await confirmPage.waitForLoad();

    await confirmPage.assertConfirmationVisible();
    await confirmPage.assertScanType(SCAN.type);
    await confirmPage.assertLocationName(LOCATION.name);
    await confirmPage.assertThreeTimeSlotsShown();
    await confirmPage.assertBeginQuestionnaireVisible();
    await confirmPage.assertGoToDashboardVisible();

    console.log('\n🎉 TC-01 PASSED — Full booking flow completed successfully!');
  });
});
