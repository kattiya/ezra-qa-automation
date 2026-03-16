import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

/**
 * Auth Setup Fixture
 *
 * This runs ONCE before all tests.
 * It logs in as Member A, saves the browser session (cookies + localStorage)
 * to a file, and all subsequent tests reuse that session — no repeated logins.
 *
 * This is the production-level approach used by real QA teams:
 * - Faster test runs (login happens once, not per test)
 * - More stable (login failures don't cascade into every test)
 * - Separates auth concerns from test logic
 */

export const STORAGE_STATE = path.join(__dirname, '../.auth/member.json');

setup('authenticate as Member A', async ({ page }) => {
  const email = process.env.MEMBER_EMAIL || 'kate.kuril@gmail.com';
  const password = process.env.MEMBER_PASSWORD || '';

  if (!password) {
    throw new Error('MEMBER_PASSWORD is not set in .env file');
  }

  console.log(`🔐 Logging in as ${email}...`);

  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);

  console.log(`✅ Login successful — saving session state`);

  // Save session to file — reused by all tests
  await page.context().storageState({ path: STORAGE_STATE });

  console.log(`💾 Session saved to ${STORAGE_STATE}`);
});
