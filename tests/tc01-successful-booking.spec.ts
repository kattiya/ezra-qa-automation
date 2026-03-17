import { test } from '@playwright/test';
import { ReserveAppointmentPage } from '../pages/ReserveAppointmentPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { completeSteps1And2 } from '../utils/bookingHelpers';
import { STRIPE, SCAN, LOCATION } from '../fixtures/testData';

/**
 * TC-01: Successful end-to-end booking with valid Stripe payment
 *
 * COVERAGE: Step 1 → Step 2 → Step 3 (Payment) → Confirmation
 */
test.describe('TC-01: Successful end-to-end booking', () => {
  test('should complete booking with valid Stripe Visa card and show confirmation', async ({ page }) => {
    // Step 1 + Step 2
    await completeSteps1And2(page);

    // Step 3
    console.log('\n── Step 3: Reserve Appointment (Payment) ────────────');
    const reservePage = new ReserveAppointmentPage(page);
    await reservePage.waitForLoad();

    // Summary checks
    await reservePage.assertScanType(SCAN.type);
    await reservePage.assertTotalAmount(SCAN.price);
    await reservePage.assertLocationName(LOCATION.name);

    // Valid card on first attempt
    await reservePage.fillCardDetails(
      STRIPE.validVisa.number,
      STRIPE.validVisa.expiry,
      STRIPE.validVisa.cvc,
      STRIPE.validVisa.zip
    );

    // Submit and wait for real success URL
    await Promise.all([
      page.waitForURL('**/book-scan/scan-confirm', { timeout: 30000 }),
      reservePage.clickContinue(),
    ]);

    // Confirmation
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