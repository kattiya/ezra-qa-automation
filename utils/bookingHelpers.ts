import { Page } from '@playwright/test';
import { SelectPlanPage } from '../pages/SelectPlanPage';
import { ScheduleScanPage } from '../pages/ScheduleScanPage';

/**
 * bookingHelpers.ts
 *
 * Shared orchestration helpers that compose multiple page objects
 * to drive precondition steps for TC-01 and TC-02.
 *
 * Using real locators confirmed via Playwright recorder.
 * Calendar is set to May 2026, day 2 — update if needed.
 */

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
  await schedulePage.selectState('Florida');
  await schedulePage.selectAventuraLocation();

  // Navigate to May 2026 and select day 2
  // Update month/day if this date is no longer available
  await schedulePage.navigateToMonth('May');
  await schedulePage.selectCalendarDay('5-2-cal-day-content');
  await schedulePage.selectThreeTimeSlots();
  await schedulePage.clickContinue();
}

export async function completeSteps1And2(page: Page): Promise<void> {
  await completePlanSelection(page);
  await completeScheduling(page);
}
