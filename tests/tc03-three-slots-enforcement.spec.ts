import { test, expect } from '@playwright/test';
import { SelectPlanPage } from '../pages/SelectPlanPage';
import { ScheduleScanPage } from '../pages/ScheduleScanPage';
import { MEMBER, SCAN, LOCATION, CALENDAR } from '../fixtures/testData';

/**
 * TC-03: Enforcing exactly 3 time slots before proceeding from Step 2
 *
 * WHY AUTOMATE THIS:
 * The 3-slot requirement is a hard operational constraint tied directly
 * to how Ezra's imaging center partners confirm appointments. This is
 * a pure UI validation rule that is fast to test and extremely valuable
 * to guard — a regression here would allow members to submit bookings
 * without time preferences, breaking the scheduling workflow entirely.
 * This test has no payment step, making it the fastest and most stable
 * test in the suite — ideal for smoke test runs.
 *
 * ASSUMPTIONS:
 * - Continue button is disabled (not just visually hidden) with < 3 slots
 * - The modal "Please select 3 times you are available" appears on first location click
 * - Slots can be removed via an × button after selection
 * - The calendar defaults to the current/next available month automatically
 *
 * TRADE-OFFS:
 * - We check button disabled state via Playwright's isEnabled() which checks
 *   the HTML disabled attribute. If the app uses CSS pointer-events:none instead,
 *   this check would pass incorrectly — visual regression tests would catch this.
 * - Time slot availability is dynamic (depends on the imaging center's schedule)
 *   so we select slots generically rather than by specific time label.
 */
test.describe('TC-03: 3 time slots enforcement', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Step 1 and proceed to Step 2
    const planPage = new SelectPlanPage(page);
    await planPage.goto();
    await planPage.fillAndSelectPlan(MEMBER.dateOfBirth, MEMBER.sex, SCAN.type);
    await planPage.clickContinue();
  });

  test('Continue is disabled with 0 slots selected', async ({ page }) => {
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();

    // Select state and location but NO time slots yet
    await schedulePage.selectState(LOCATION.state);
    await schedulePage.selectLocation(LOCATION.name);

    // Continue must be disabled
    expect(await schedulePage.isContinueButtonEnabled()).toBe(false);
  });

  test('Continue is disabled with only 1 slot selected', async ({ page }) => {
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();

    await schedulePage.selectState(LOCATION.state);
    await schedulePage.selectLocation(LOCATION.name);
    await schedulePage.selectDateOnCalendar(CALENDAR.slotDayNumber);

    // Select only 1 slot
    await schedulePage.selectAvailableTimeSlots(1);

    // Continue must still be disabled
    expect(await schedulePage.isContinueButtonEnabled()).toBe(false);
  });

  test('Continue is disabled with only 2 slots selected', async ({ page }) => {
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();

    await schedulePage.selectState(LOCATION.state);
    await schedulePage.selectLocation(LOCATION.name);
    await schedulePage.selectDateOnCalendar(CALENDAR.slotDayNumber);

    // Select only 2 slots
    await schedulePage.selectAvailableTimeSlots(2);

    // Continue must still be disabled
    expect(await schedulePage.isContinueButtonEnabled()).toBe(false);
  });

  test('Continue is enabled when exactly 3 slots are selected', async ({ page }) => {
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();

    await schedulePage.selectState(LOCATION.state);
    await schedulePage.selectLocation(LOCATION.name);
    await schedulePage.selectDateOnCalendar(CALENDAR.slotDayNumber);

    // Select exactly 3 slots
    await schedulePage.selectAvailableTimeSlots(3);

    // Continue must now be enabled
    expect(await schedulePage.isContinueButtonEnabled()).toBe(true);
  });

  test('Continue disables again after removing a slot from a full selection of 3', async ({ page }) => {
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();

    await schedulePage.selectState(LOCATION.state);
    await schedulePage.selectLocation(LOCATION.name);
    await schedulePage.selectDateOnCalendar(CALENDAR.slotDayNumber);

    // Select 3 slots — Continue should be enabled
    await schedulePage.selectAvailableTimeSlots(3);
    expect(await schedulePage.isContinueButtonEnabled()).toBe(true);

    // Remove one slot — Continue should disable again
    await schedulePage.removeSlot(0);
    expect(await schedulePage.isContinueButtonEnabled()).toBe(false);
  });

  test('Modal appears explaining the 3-slot requirement on first location selection', async ({ page }) => {
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();

    await schedulePage.selectState(LOCATION.state);

    // Click location without dismissing modal — verify it appears
    const locationCard = page.getByText(LOCATION.name).first();
    await locationCard.click();

    const modal = page.getByText(/please select 3 times you are available/i);
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Dismiss modal
    await page.getByRole('button', { name: /i understand/i }).click();
    await expect(modal).not.toBeVisible();
  });
});
