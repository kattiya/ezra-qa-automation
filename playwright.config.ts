import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const STORAGE_STATE = path.join(__dirname, '.auth/member.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
    ['list'],
  ],
  timeout: 120000,
  expect: { timeout: 15000 },

  use: {
    baseURL: process.env.BASE_URL || 'https://myezra-staging.ezra.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false,        // show browser
    slowMo: 800,            // 800ms between actions so you can watch
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    // Step 1: Login once and save session
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: './fixtures',
      use: {
        headless: false,
        slowMo: 500,
      },
    },
    // Step 2: Run all tests reusing saved session
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
  ],
});
