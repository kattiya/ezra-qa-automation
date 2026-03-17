import { Page, expect } from '@playwright/test';

/**
 * SelectPlanPage — Step 1
 * Real locators confirmed via Playwright recorder.
 * MRI Scan: locator('div').filter({ hasText: /^MRI Scan$/ })
 */
export class SelectPlanPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    console.log('📋 Navigating to Select Plan...');
    await this.page.goto('https://myezra-staging.ezra.com/book-scan/select-plan');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
    console.log(`📋 URL: ${this.page.url()}`);
  }

  async selectMriScan(): Promise<void> {
    console.log('🔬 Selecting MRI Scan...');
    await this.page.locator('div').filter({ hasText: /^MRI Scan$/ }).click();
  }

  async assertContinueEnabled(): Promise<void> {
    await expect(
      this.page.getByTestId('select-plan-submit-btn'),
      'Continue should be enabled'
    ).toBeEnabled();
  }

  async assertContinueDisabled(): Promise<void> {
    await expect(
      this.page.getByTestId('select-plan-submit-btn'),
      'Continue should be disabled'
    ).toBeDisabled();
  }

  async isContinueEnabled(): Promise<boolean> {
    return this.page.getByTestId('select-plan-submit-btn').isEnabled();
  }

  async clickContinue(): Promise<void> {
    console.log('➡️  Continue Step 1...');
    await this.assertContinueEnabled();
    await this.page.getByTestId('select-plan-submit-btn').click();
    await this.page.waitForURL('**/schedule-scan');
    console.log('✅ Moved to Step 2');
  }
}
