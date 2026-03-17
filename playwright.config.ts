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
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
    ['allure-playwright'],
  ],
  timeout: 120000,
  expect: { timeout: 15000 },

  use: {
    baseURL: process.env.BASE_URL || 'https://myezra-staging.ezra.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false,
    slowMo: 800,
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: './fixtures',
      use: {
        headless: false,
        slowMo: 500,
      },
    },
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