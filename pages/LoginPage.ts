import { Page } from '@playwright/test';

/**
 * LoginPage — /sign-in
 * Locators 100% from Playwright recorder recording.
 */
export class LoginPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(email: string, password: string): Promise<void> {
    console.log(`🔐 Logging in as ${email}...`);

    await this.page.goto('/sign-in');
    await this.page.waitForLoadState('domcontentloaded');

    // Accept cookie consent — always present on first load
    await this.page.getByRole('button', { name: 'Accept' }).click();

    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Submit' }).click();

    // Wait for dashboard — "Book a scan" button confirms login success
    await this.page.getByRole('button', { name: 'Book a scan' }).waitFor({
      state: 'visible',
      timeout: 30000,
    });

    console.log('✅ Login successful');
  }
}
