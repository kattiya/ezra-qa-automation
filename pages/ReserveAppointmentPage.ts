import { Page, expect } from '@playwright/test';

/**
 * ReserveAppointmentPage — /sign-up/reserve-appointment (Step 3)
 *
 * Handles Stripe payment form and order summary.
 * Locators verified via Playwright recorder on staging environment.
 *
 * Key findings from recording:
 * - Stripe uses a SINGLE iframe: __privateStripeFrame[sessionId]
 * - All card fields live inside this one iframe
 * - Submit button uses [data-test="submit"]
 * - Stripe also collects email and mobile number inside the iframe
 */
export class ReserveAppointmentPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Navigation ──────────────────────────────────────────────────────

  async waitForLoad(): Promise<void> {
    await this.page.waitForURL('**/reserve-appointment');
    await this.page.waitForLoadState('networkidle');
    console.log('💳 Reserve Appointment page loaded');
  }

  // ─── Stripe iframe ───────────────────────────────────────────────────

  /**
   * Locates the Stripe iframe dynamically.
   * The iframe name changes per session (e.g. __privateStripeFrame62914)
   * so we match by the consistent name prefix.
   */
  private async getStripeFrame() {
    console.log('🔍 Locating Stripe iframe...');

    // Wait for iframe to appear
    await this.page.waitForSelector('iframe[name*="__privateStripeFrame"]', {
      timeout: 15000,
    });

    const frames = this.page.frames();
    const stripeFrame = frames.find(f => f.name().includes('__privateStripeFrame'));

    if (!stripeFrame) {
      throw new Error('❌ Stripe iframe not found — page may not have loaded correctly');
    }

    console.log(`✅ Found Stripe iframe: ${stripeFrame.name()}`);
    return stripeFrame;
  }

  // ─── Payment form ────────────────────────────────────────────────────

  /**
   * Fills all Stripe card fields inside the Stripe iframe.
   * Email and phone are optional — Stripe may pre-fill them.
   */
  async fillCardDetails(
    cardNumber: string,
    expiry: string,
    cvc: string,
    zip: string,
    email?: string,
    phone?: string
  ): Promise<void> {
    console.log('💳 Filling Stripe card details...');

    const frame = await this.getStripeFrame();

    console.log('   → Card number');
    await frame.getByRole('textbox', { name: 'Card number' }).fill(cardNumber);

    console.log('   → Expiry date');
    await frame.getByRole('textbox', { name: 'Expiration date MM / YY' }).fill(expiry);

    console.log('   → Security code');
    await frame.getByRole('textbox', { name: 'Security code' }).fill(cvc);

    console.log('   → ZIP code');
    await frame.getByRole('textbox', { name: 'ZIP code' }).fill(zip);

    if (email) {
      console.log('   → Email');
      const emailField = frame.getByRole('textbox', { name: 'Email' });
      if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emailField.fill(email);
      }
    }

    if (phone) {
      console.log('   → Mobile number');
      const phoneField = frame.getByRole('textbox', { name: 'Mobile number' });
      if (await phoneField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await phoneField.fill(phone);
      }
    }

    console.log('✅ Card details filled');
  }

  // ─── Assertions ──────────────────────────────────────────────────────

  async assertTotalAmount(expectedAmount: string): Promise<void> {
    await expect(
      this.page.getByText(expectedAmount),
      `Total should show ${expectedAmount}`
    ).toBeVisible();
  }

  async assertScanType(scanType: string): Promise<void> {
    await expect(
      this.page.getByText(scanType),
      `Order summary should show scan type: ${scanType}`
    ).toBeVisible();
  }

  async assertLocationName(locationName: string): Promise<void> {
    await expect(
      this.page.getByText(locationName),
      `Order summary should show location: ${locationName}`
    ).toBeVisible();
  }

  async getErrorMessage(): Promise<string> {
    const error = this.page.locator('[role="alert"], .StripeElement--invalid, [data-testid="payment-error"]');
    await error.waitFor({ timeout: 10000 });
    return (await error.textContent()) ?? '';
  }

  // ─── Navigation ──────────────────────────────────────────────────────

  async clickContinue(): Promise<void> {
    console.log('➡️  Submitting payment...');
    await this.page.locator('[data-test="submit"]').click();
  }

  async applyPromoCode(code: string): Promise<void> {
    console.log(`🎟️  Applying promo code: ${code}`);
    await this.page.getByPlaceholder(/promo code/i).fill(code);
    await this.page.getByRole('button', { name: /apply code/i }).click();
  }
}
