import { Page } from '@playwright/test';

/**
 * LoginPage — /sign-in
 *
 * Handles member authentication on the Ezra member portal.
 * Locators verified via Playwright recorder on staging environment.
 */
export class LoginPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Navigation ──────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto('/sign-in');
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Actions ─────────────────────────────────────────────────────────

  /**
   * Accepts the cookie consent banner if present.
   * The banner appears on first visit — safe to skip if already accepted.
   */
  private async acceptCookiesIfPresent(): Promise<void> {
    const acceptBtn = this.page.getByRole('button', { name: 'Accept' });
    const isVisible = await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      console.log('🍪 Accepting cookie consent...');
      await acceptBtn.click();
    }
  }

  /**
   * Performs full login flow.
   * Waits for the dashboard to confirm successful authentication.
   */
  async login(email: string, password: string): Promise<void> {
    console.log(`🔐 Logging in as ${email}...`);

    await this.goto();
    await this.acceptCookiesIfPresent();

    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Submit' }).click();

    // Wait for dashboard — confirms login was successful
    await this.page.waitForURL(/myezra-staging\.ezra\.com\/?$/, { timeout: 20000 });
    await this.page.waitForLoadState('networkidle');

    console.log('✅ Login successful');
  }
}
