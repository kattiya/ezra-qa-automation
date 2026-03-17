import { Page } from '@playwright/test';
import { SelectPlanPage } from '../pages/SelectPlanPage';
import { ScheduleScanPage } from '../pages/ScheduleScanPage';

export async function completePlanSelection(page: Page): Promise<void> {
  const planPage = new SelectPlanPage(page);
  console.log('\n── Step 1: Select Plan ──────────────────────────────');
  await planPage.goto();
  await planPage.selectMriScan();
  await planPage.clickContinue();
}

export async function completeScheduling(page: Page): Promise<void> {
  const schedulePage = new ScheduleScanPage(page);
  console.log('\n── Step 2: Schedule Scan ────────────────────────────');
  await schedulePage.waitForLoad();
  await schedulePage.selectState();
  await schedulePage.selectAventuraLocation();
  await schedulePage.navigateToApril();
  await schedulePage.selectFirstDayWithAtLeastThreeSlots();
  await schedulePage.selectThreeTimeSlots();
  await schedulePage.clickContinue();
}

export async function completeSteps1And2(page: Page): Promise<void> {
  await completePlanSelection(page);
  await completeScheduling(page);
}