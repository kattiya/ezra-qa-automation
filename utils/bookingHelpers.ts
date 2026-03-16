import { Page } from '@playwright/test';
import { SelectPlanPage } from '../pages/SelectPlanPage';
import { ScheduleScanPage } from '../pages/ScheduleScanPage';
import { MEMBER, SCAN, LOCATION, CALENDAR } from '../fixtures/testData';

/**
 * utils/bookingHelpers.ts
 *
 * Shared helper that drives Steps 1 and 2 of the booking flow.
 * Used as a precondition setup in TC-01 and TC-02 so we don't
 * repeat the same navigation logic in every test.
 *
 * This is intentionally NOT a Page Object — it's an orchestration
 * helper that composes multiple page objects together.
 */
export async function completePlanSelection(page: Page) {
  const planPage = new SelectPlanPage(page);
  await planPage.goto();
  await planPage.fillAndSelectPlan(MEMBER.dateOfBirth, MEMBER.sex, SCAN.type);
  await planPage.clickContinue();
}

export async function completeScheduling(page: Page) {
  const schedulePage = new ScheduleScanPage(page);
  await schedulePage.waitForLoad();
  await schedulePage.selectState(LOCATION.state);
  await schedulePage.selectLocation(LOCATION.name);

  // Select a date from the calendar (first available weekday)
  await schedulePage.selectDateOnCalendar(CALENDAR.slotDayNumber);

  // Select exactly 3 time slots
  await schedulePage.selectAvailableTimeSlots(CALENDAR.numberOfSlotsRequired);
  await schedulePage.clickContinue();
}

export async function completeSteps1And2(page: Page) {
  await completePlanSelection(page);
  await completeScheduling(page);
}
