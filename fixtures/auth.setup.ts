import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const STORAGE_STATE = path.join(__dirname, '../.auth/member.json');

setup('authenticate as Member A', async ({ page }) => {
  const email = process.env.MEMBER_EMAIL || 'kate.kuril@gmail.com';
  const password = process.env.MEMBER_PASSWORD || '';

  if (!password) {
    throw new Error('MEMBER_PASSWORD is not set in .env file');
  }

  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);

  // Navigate to dashboard explicitly before saving state
  await page.goto('https://myezra-staging.ezra.com');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  console.log(`💾 Saving session from: ${page.url()}`);
  await page.context().storageState({ path: STORAGE_STATE });
  console.log(`✅ Session saved`);
});
