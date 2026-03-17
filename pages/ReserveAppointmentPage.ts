import { Page, expect } from '@playwright/test';

/**
 * ReserveAppointmentPage — Step 3 (Payment)
 * Uses the selectors you recorded for Stripe manual card entry.
 */
export class ReserveAppointmentPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForURL('**/reserve-appointment');
    await this.page.waitForLoadState('domcontentloaded');
    console.log('💳 Reserve Appointment page loaded');
  }

  async fillCardDetails(
    cardNumber: string,
    expiry: string,
    cvc: string,
    zip: string
  ): Promise<void> {
    console.log('💳 Filling card details...');

    const stripeFrame = this.page
      .locator('iframe[name^="__privateStripeFrame"]')
      .first()
      .contentFrame();

    console.log('   → Card number');
    await stripeFrame.getByRole('textbox', { name: 'Card number' }).click();
    await stripeFrame.getByRole('textbox', { name: 'Card number' }).fill(cardNumber);

    console.log('   → Expiry');

// Use flexible locator because Stripe label changes after interaction / retry
const expiryInput = stripeFrame.getByRole('textbox', { name: /Expiration.*MM \/ YY/i });

    await expiryInput.click();
    await expiryInput.fill(expiry);

    console.log('   → CVC');
    await stripeFrame.getByRole('textbox', { name: 'Security code' }).click();
    await stripeFrame.getByRole('textbox', { name: 'Security code' }).fill(cvc);

    console.log('   → ZIP');
    await stripeFrame.getByRole('textbox', { name: 'ZIP code' }).click();
    await stripeFrame.getByRole('textbox', { name: 'ZIP code' }).fill(zip);

    console.log('✅ Card details filled');
  }

  async assertTotalAmount(amount: string): Promise<void> {
    await expect(this.page.getByText(amount).last()).toBeVisible();
  }

  async assertScanType(scanType: string): Promise<void> {
    await expect(this.page.getByText(scanType)).toBeVisible();
  }

  async assertLocationName(name: string): Promise<void> {
  await expect(this.page.getByText(name, { exact: true })).toBeVisible();

  }

  async getErrorMessage(): Promise<string> {
    console.log('🔍 Checking for payment error...');

    const possibleErrors = [
      this.page.getByText(/declined/i),
      this.page.getByText(/card was declined/i),
      this.page.getByText(/payment failed/i),
      this.page.getByText(/your card/i),
    ];

    for (const locator of possibleErrors) {
      const element = locator.first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        const text = await element.textContent();
        console.log(`❌ Found error: ${text}`);
        return text ?? '';
      }
    }

    console.log('⚠️ No visible error message found');
    return '';
  }

  /*async clickContinue(): Promise<void> {
    console.log('➡️  Submitting payment...');
    await this.page.locator('[data-test="submit"]').click();
    console.log('✅ Submit clicked');
  }*/
 async clickContinue(): Promise<void> {
  console.log('➡️  Submitting payment...');

  const continueButton = this.page.getByRole('button', { name: /^continue$/i }).last();

  await expect(continueButton).toBeEnabled();
  await continueButton.scrollIntoViewIfNeeded();

  // direct DOM click to avoid flaky CTA tap after rerender
  await continueButton.evaluate((el: HTMLElement) => el.click());

  console.log('✅ Continue clicked');
}
}
