import { Page, Locator } from '@playwright/test';

/**
 * Page Object: Scan Confirmation Page
 * URL: /sign-up/scan-confirm
 *
 * Responsibilities:
 * - Assert booking confirmation details
 * - Verify scan type, location, and requested time slots are correct
 * - Provide access to Begin Medical Questionnaire CTA
 */
export class ConfirmationPage {
  readonly page: Page;

  readonly confirmationHeading: Locator;
  readonly beginQuestionnaireButton: Locator;
  readonly goToDashboardLink: Locator;
  readonly appointmentCard: Locator;
  readonly openInGoogleMapsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.confirmationHeading = page.getByText(/your requested time slots have been received/i);
    this.beginQuestionnaireButton = page.getByRole('button', { name: /begin medical questionnaire/i });
    this.goToDashboardLink = page.getByText(/go to dashboard/i);
    this.appointmentCard = page.locator('[data-testid="appointment-card"]').first();
    this.openInGoogleMapsLink = page.getByText(/open in google maps/i);
  }

  async waitForLoad() {
    await this.page.waitForURL('**/scan-confirm');
    await this.confirmationHeading.waitFor({ timeout: 15000 });
  }

  async getScanType(): Promise<string> {
    return (await this.page.getByText(/MRI Scan|Heart CT Scan/i).first().textContent()) ?? '';
  }

  async getLocationName(): Promise<string> {
    // Location name appears in the appointment card
    return (await this.page.locator('text=Location').locator('..').locator('h3, strong, b').textContent()) ?? '';
  }

  async getRequestedTimes(): Promise<string[]> {
    const timeElements = await this.page.locator('text=/\\w+ \\d+, \\d{4} • \\d{1,2}:\\d{2}/').allTextContents();
    return timeElements;
  }

  async isConfirmationVisible(): Promise<boolean> {
    return await this.confirmationHeading.isVisible();
  }
}
