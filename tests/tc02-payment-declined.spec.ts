import { test, expect } from '@playwright/test';
import { ReserveAppointmentPage } from '../pages/ReserveAppointmentPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { completeSteps1And2 } from '../utils/bookingHelpers';
import { STRIPE } from '../fixtures/testData';

/**
 * TC-02: Payment declined — invalid card is rejected gracefully
 *
 * WHY AUTOMATE THIS:
 * Payment failures are the second most common real-world scenario.
 * Silent failures or unhandled exceptions can cause double-charges
 * or orphaned booking records. The error path must be as robust
 * as the happy path.
 *
 * COVERAGE: Step 3 error handling + retry flow
 */
test.describe('TC-02: Payment declined', () => {

  test('should show error and stay on Step 3 when card is declined', async ({ page }) => {

    // ─── Precondition: Complete Steps 1 & 2 ───────────────────────────
    await completeSteps1And2(page);

    // ─── Step 3: Attempt payment with declined card ────────────────────
    console.log('\n── Step 3: Payment with declined card ───────────────');
    const reservePage = new ReserveAppointmentPage(page);
    await reservePage.waitForLoad();

    // Fill with Stripe decline test card
    await reservePage.fillCardDetails(
      STRIPE.declinedCard.number,
      STRIPE.declinedCard.expiry,
      STRIPE.declinedCard.cvc,
      STRIPE.declinedCard.zip,
      'kate.kuril@gmail.com',
      '(347) 977-0179'
    );

    await reservePage.clickContinue();

    // ─── Assertions: must stay on Step 3 with error ────────────────────
    console.log('🔍 Verifying error state...');

    // Must NOT redirect to confirmation
    await expect(page, 'Should NOT redirect to confirmation on decline')
      .not.toHaveURL(/scan-confirm/);

    // Must stay on payment page
    await expect(page, 'Should remain on reserve-appointment page')
      .toHaveURL(/reserve-appointment/);

    // Error message must be visible
    const errorMsg = await reservePage.getErrorMessage();
    expect(errorMsg.toLowerCase(), 'Error message should mention card decline')
      .toMatch(/declined|card|payment|error/i);

    console.log(`✅ Error shown: "${errorMsg.trim()}"`);
    console.log('\n🎉 TC-02 PASSED — Declined card handled gracefully!');
  });

  test('should allow retry with valid card after initial decline', async ({ page }) => {

    // ─── Precondition: Complete Steps 1 & 2 ───────────────────────────
    await completeSteps1And2(page);

    const reservePage = new ReserveAppointmentPage(page);
    await reservePage.waitForLoad();

    // ─── First attempt: declined card ─────────────────────────────────
    console.log('\n── Attempt 1: Declined card ─────────────────────────');
    await reservePage.fillCardDetails(
      STRIPE.declinedCard.number,
      STRIPE.declinedCard.expiry,
      STRIPE.declinedCard.cvc,
      STRIPE.declinedCard.zip,
      'kate.kuril@gmail.com',
      '(347) 977-0179'
    );
    await reservePage.clickContinue();

    const errorMsg = await reservePage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
    console.log(`✅ Decline confirmed: "${errorMsg.trim()}"`);

    // ─── Second attempt: valid card ────────────────────────────────────
    console.log('\n── Attempt 2: Valid card (retry) ────────────────────');
    await reservePage.fillCardDetails(
      STRIPE.validVisa.number,
      STRIPE.validVisa.expiry,
      STRIPE.validVisa.cvc,
      STRIPE.validVisa.zip,
      'kate.kuril@gmail.com',
      '(347) 977-0179'
    );
    await reservePage.clickContinue();

    // Should now succeed
    const confirmPage = new ConfirmationPage(page);
    await confirmPage.waitForLoad();
    await confirmPage.assertConfirmationVisible();

    console.log('\n🎉 TC-02 retry PASSED — User successfully booked after initial decline!');
  });
});
