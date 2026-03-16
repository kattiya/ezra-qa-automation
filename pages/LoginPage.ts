import { Page } from '@playwright/test';

/**
 * LoginPage — /sign-in
 * Handles member authentication on the Ezra member portal.
 * Locators verified via Playwright recorder on staging environment.
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

    // Accept cookie consent if present
    const acceptBtn = this.page.getByRole('button', { name: 'Accept' });
    const isVisible = await acceptBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      console.log('🍪 Accepting cookie consent...');
      await acceptBtn.click();
    }

    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Submit' }).click();

    // Wait for dashboard
    await this.page.waitForURL(/myezra-staging\.ezra\.com\/?$/, { timeout: 20000 });
    console.log('✅ Login successful');
  }
}
