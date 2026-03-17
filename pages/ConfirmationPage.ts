import { Page, expect } from '@playwright/test';

/**
 * ConfirmationPage — /sign-up/scan-confirm
 *
 * Validates the booking confirmation screen shown after successful payment.
 * Verifies scan type, location, requested time slots, and available CTAs.
 */
export class ConfirmationPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Navigation ──────────────────────────────────────────────────────

  async waitForLoad(): Promise<void> {
    console.log('✅ Waiting for confirmation page...');
    await this.page.waitForURL('**/scan-confirm', { timeout: 30000 });
   await this.page.waitForLoadState('domcontentloaded');
    await expect(
  this.page.getByText(/your requested time slots have been received/i)
).toBeVisible({ timeout: 15000 });
    console.log('🎉 Confirmation page loaded!');
  }

  // ─── Assertions ──────────────────────────────────────────────────────

  async assertConfirmationVisible(): Promise<void> {
    await expect(
      this.page.getByText(/your requested time slots have been received/i),
      'Confirmation heading should be visible'
    ).toBeVisible();
  }

  async assertScanType(scanType: string): Promise<void> {
    await expect(
      this.page.getByText(scanType),
      `Confirmation should show scan type: ${scanType}`
    ).toBeVisible();
  }

  async assertLocationName(locationName: string): Promise<void> {
    await expect(
      this.page.getByText(locationName),
      `Confirmation should show location: ${locationName}`
    ).toBeVisible();
  }

  async assertThreeTimeSlotsShown(): Promise<void> {
    const times = await this.page
      .locator('text=/\\w+ \\d+, \\d{4} •/')
      .allTextContents();
    expect(times.length, 'Confirmation should show exactly 3 requested time slots').toBe(3);
  }

  async assertBeginQuestionnaireVisible(): Promise<void> {
    await expect(
      this.page.getByRole('button', { name: /begin medical questionnaire/i }),
      '"Begin Medical Questionnaire" button should be visible'
    ).toBeVisible();
  }

  async assertGoToDashboardVisible(): Promise<void> {
    await expect(
      this.page.getByText(/go to dashboard/i),
      '"Go to Dashboard" link should be visible'
    ).toBeVisible();
  }
}
