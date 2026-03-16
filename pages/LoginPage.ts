import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object: Member Login
 * URL: /sign-in or /login
 *
 * Handles authentication for the member-facing portal.
 * Used by the auth setup fixture to establish a session
 * that is reused across all tests.
 */
export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.submitButton = page.getByRole('button', { name: /sign in|log in|continue|submit/i }).first();
    this.errorMessage = page.locator('[role="alert"], .error, [data-testid="error"]').first();
  }

  async goto() {
    await this.page.goto('/sign-in');
    // Fallback URLs if /sign-in doesn't work
    if (await this.emailInput.isVisible().catch(() => false) === false) {
      await this.page.goto('/login');
    }
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();

    // Wait for successful login — dashboard or home page loads
    await this.page.waitForURL(/dashboard|home|myezra-staging\.ezra\.com\/?$/, {
      timeout: 15000,
    });
  }

  async isLoggedIn(): Promise<boolean> {
    return !this.page.url().includes('sign-in') && !this.page.url().includes('login');
  }
}
