import { Page, expect } from '@playwright/test';

/**
 * SelectPlanPage — /sign-up/select-plan (Step 1)
 *
 * Handles scan type selection, DOB input, and sex at birth.
 * Locators verified via Playwright recorder on staging environment.
 *
 * Key findings from recording:
 * - Submit button uses data-testid="select-plan-submit-btn"
 * - Scan cards are identified by their full text content
 * - State dropdown is a combobox with an img trigger
 */
export class SelectPlanPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Navigation ──────────────────────────────────────────────────────

  async goto(): Promise<void> {
    console.log('📋 Navigating to Select Plan page...');
    await this.page.getByRole('button', { name: 'Book a scan' }).click();
    await this.page.waitForURL('**/select-plan');
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Form actions ────────────────────────────────────────────────────

  async fillDateOfBirth(dob: string): Promise<void> {
    console.log(`📅 Filling date of birth: ${dob}`);
    await this.page.getByRole('textbox', { name: 'Date of birth' }).fill(dob);
  }

  async selectSexAtBirth(sex: 'Male' | 'Female'): Promise<void> {
    console.log(`👤 Selecting sex at birth: ${sex}`);
    await this.page.getByRole('combobox').selectOption(sex);
  }

  // ─── Scan selection ──────────────────────────────────────────────────

  async selectMriScan(): Promise<void> {
    console.log('🔬 Selecting MRI Scan ($999)...');
    await this.page.getByText(
      'MRI Scan Available at $999 Scans for hundreds of potential conditions including'
    ).click();
  }

  async selectHeartCtScan(): Promise<void> {
    console.log('❤️ Selecting Heart CT Scan ($349)...');
    await this.page.getByText('Heart CT Scan Available at $349').click();
  }

  // ─── Assertions ──────────────────────────────────────────────────────

  async assertContinueEnabled(): Promise<void> {
    await expect(
      this.page.getByTestId('select-plan-submit-btn'),
      'Continue button should be enabled when all fields are filled'
    ).toBeEnabled();
  }

  async assertContinueDisabled(): Promise<void> {
    await expect(
      this.page.getByTestId('select-plan-submit-btn'),
      'Continue button should be disabled when fields are incomplete'
    ).toBeDisabled();
  }

  async isContinueEnabled(): Promise<boolean> {
    return this.page.getByTestId('select-plan-submit-btn').isEnabled();
  }

  // ─── Navigation ──────────────────────────────────────────────────────

  async clickContinue(): Promise<void> {
    console.log('➡️  Clicking Continue on Step 1...');
    await this.assertContinueEnabled();
    await this.page.getByTestId('select-plan-submit-btn').click();
    await this.page.waitForURL('**/schedule-scan');
  }
}
