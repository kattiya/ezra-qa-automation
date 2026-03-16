import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object: Select your Scan (Step 1)
 * URL: /sign-up/select-plan
 *
 * Responsibilities:
 * - Fill date of birth and sex at birth
 * - Select a scan type card
 * - Assert Continue button state
 */
export class SelectPlanPage {
  readonly page: Page;

  // Form fields
  readonly dobInput: Locator;
  readonly sexDropdown: Locator;

  // Scan cards
  readonly mriScanCard: Locator;
  readonly mriWithSpineCard: Locator;
  readonly heartCtScanCard: Locator;

  // Navigation
  readonly continueButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dobInput = page.getByPlaceholder('MM-DD-YYYY');
    this.sexDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /sex at birth/i }).first();

    // Scan cards identified by their title text
    this.mriScanCard = page.getByText('MRI Scan').first();
    this.mriWithSpineCard = page.getByText('MRI Scan with Spine').first();
    this.heartCtScanCard = page.getByText('Heart CT Scan').first();

    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
  }

  async goto() {
    await this.page.goto('/sign-up/select-plan');
  }

  async fillDateOfBirth(dob: string) {
    await this.dobInput.click();
    await this.dobInput.fill(dob);
  }

  async selectSexAtBirth(sex: 'Male' | 'Female') {
    // The sex dropdown may be a native select or a custom dropdown
    const dropdown = this.page.locator('[data-testid="sex-dropdown"], select').first();
    if (await dropdown.evaluate(el => el.tagName) === 'SELECT') {
      await dropdown.selectOption(sex);
    } else {
      await this.page.getByText('What was your sex at birth?').locator('..').click();
      await this.page.getByRole('option', { name: sex }).click();
    }
  }

  async selectScan(scanType: 'MRI Scan' | 'MRI Scan with Spine' | 'Heart CT Scan') {
    await this.page.getByText(scanType, { exact: true }).click();
  }

  async isContinueButtonEnabled(): Promise<boolean> {
    return await this.continueButton.isEnabled();
  }

  async clickContinue() {
    await expect(this.continueButton).toBeEnabled();
    await this.continueButton.click();
  }

  async fillAndSelectPlan(
    dob: string,
    sex: 'Male' | 'Female',
    scanType: 'MRI Scan' | 'MRI Scan with Spine' | 'Heart CT Scan'
  ) {
    await this.fillDateOfBirth(dob);
    await this.selectSexAtBirth(sex);
    await this.selectScan(scanType);
  }
}
