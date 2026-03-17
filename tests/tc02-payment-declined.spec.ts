import { test, expect } from '@playwright/test';
import { ReserveAppointmentPage } from '../pages/ReserveAppointmentPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { completeSteps1And2 } from '../utils/bookingHelpers';
import { STRIPE } from '../fixtures/testData';

test.describe('TC-02: Payment declined', () => {
  test('should keep user on payment page after decline and allow retry with valid card', async ({ page }) => {
    await completeSteps1And2(page);

    const reservePage = new ReserveAppointmentPage(page);
    await reservePage.waitForLoad();

    // Attempt 1 — declined card
    console.log('\n── Attempt 1: Declined card ─────────────────────────');
    await reservePage.fillCardDetails(
      STRIPE.declinedCard.number,
      STRIPE.declinedCard.expiry,
      STRIPE.declinedCard.cvc,
      STRIPE.declinedCard.zip
    );

    await reservePage.clickContinue();

    // User stays on payment page after decline
    await expect(page).toHaveURL(/reserve-appointment/);
    console.log('✅ User remained on payment page after invalid card');

    // Attempt 2 — valid card on the same page
    console.log('\n── Attempt 2: Valid card retry on same page ─────────');
    await reservePage.fillCardDetails(
      STRIPE.validVisa.number,
      STRIPE.validVisa.expiry,
      STRIPE.validVisa.cvc,
      STRIPE.validVisa.zip
    );

    await reservePage.clickContinue();

    const confirmPage = new ConfirmationPage(page);
    await confirmPage.waitForLoad();
    await confirmPage.assertConfirmationVisible();

    console.log('🎉 User successfully proceeded after retrying with valid card');
  });
});