import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object: Reserve your Appointment (Step 3 — Payment)
 * URL: /sign-up/reserve-appointment
 *
 * Responsibilities:
 * - Fill Stripe card details (card number, expiry, CVC, ZIP)
 * - Apply promo codes
 * - Assert order summary values
 * - Submit payment
 *
 * Note: Stripe embeds its card fields in iframes. We use
 * page.frameLocator() to interact with them correctly.
 */
export class ReserveAppointmentPage {
  readonly page: Page;

  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly promoCodeInput: Locator;
  readonly applyCodeButton: Locator;
  readonly totalAmount: Locator;

  constructor(page: Page) {
    this.page = page;

    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.backButton = page.getByRole('button', { name: /back/i });
    this.promoCodeInput = page.getByPlaceholder(/promo code/i);
    this.applyCodeButton = page.getByRole('button', { name: /apply code/i });
    this.totalAmount = page.getByText('Total').locator('..').locator('text=/\\$[\\d,]+/');
  }

  async waitForLoad() {
    await this.page.waitForURL('**/reserve-appointment');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fills Stripe card fields.
   * Stripe renders card inputs inside iframes — we must use frameLocator.
   * If the app uses Stripe Elements (separate iframes per field), we target each individually.
   */
  async fillCardDetails(cardNumber: string, expiry: string, cvc: string, zip: string) {
    // Stripe card number iframe
    const cardFrame = this.page.frameLocator('iframe[name*="card-number"], iframe[title*="card number"]').first();
    await cardFrame.locator('[name="cardnumber"], input').fill(cardNumber);

    // Expiry iframe
    const expiryFrame = this.page.frameLocator('iframe[name*="card-expiry"], iframe[title*="expiration"]').first();
    await expiryFrame.locator('[name="exp-date"], input').fill(expiry);

    // CVC iframe
    const cvcFrame = this.page.frameLocator('iframe[name*="card-cvc"], iframe[title*="CVC"]').first();
    await cvcFrame.locator('[name="cvc"], input').fill(cvc);

    // ZIP — may be outside iframe
    const zipInput = this.page.locator('[placeholder="12345"], input[name="postalCode"], input[autocomplete="postal-code"]');
    await zipInput.fill(zip);
  }

  async getTotalAmount(): Promise<string> {
    return (await this.totalAmount.textContent()) ?? '';
  }

  async getErrorMessage(): Promise<string> {
    const error = this.page.locator('[role="alert"], .error-message, [data-testid="payment-error"]');
    await error.waitFor({ timeout: 10000 });
    return (await error.textContent()) ?? '';
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async isContinueEnabled(): Promise<boolean> {
    return await this.continueButton.isEnabled();
  }

  async applyPromoCode(code: string) {
    await this.promoCodeInput.fill(code);
    await this.applyCodeButton.click();
  }
}
