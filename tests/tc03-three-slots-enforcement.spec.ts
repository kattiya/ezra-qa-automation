import { test, expect } from '@playwright/test';
import { SelectPlanPage } from '../pages/SelectPlanPage';
import { ScheduleScanPage } from '../pages/ScheduleScanPage';

/**
 * TC-03: Enforcing exactly 3 time slots before proceeding from Step 2
 *
 * WHY AUTOMATE THIS:
 * This is a hard operational constraint — imaging centers cannot confirm
 * appointments without 3 time preferences. This test is the fastest in
 * the suite (no payment step) and ideal for smoke test runs.
 *
 * COVERAGE: 6 sub-tests covering 0, 1, 2, 3 slot states + removal + modal
 */
test.describe('TC-03: 3 time slots enforcement', () => {

  // ─── Shared setup: navigate to Step 2 ─────────────────────────────
  test.beforeEach(async ({ page }) => {
    console.log('\n── Setup: Navigating to Step 2 ──────────────────────');
    const planPage = new SelectPlanPage(page);
    await planPage.goto();
    await planPage.selectMriScan();
    await planPage.clickContinue();
  });

  // ─── Test 1 ───────────────────────────────────────────────────────
  test('Continue is disabled with 0 slots selected', async ({ page }) => {
    console.log('🧪 Test: Continue disabled with 0 slots');
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();
    await schedulePage.selectState('Florida');
    await schedulePage.selectAventuraLocation();
    await schedulePage.dismissThreeSlotsModalIfPresent();

    await schedulePage.assertContinueDisabled();
    console.log('✅ PASSED — Continue is disabled with 0 slots');
  });

  // ─── Test 2 ───────────────────────────────────────────────────────
  test('Continue is disabled with only 1 slot selected', async ({ page }) => {
    console.log('🧪 Test: Continue disabled with 1 slot');
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();
    await schedulePage.selectState('Florida');
    await schedulePage.selectAventuraLocation();
    await schedulePage.navigateToMonth('May');
    await schedulePage.selectCalendarDay('5-2-cal-day-content');

    // Select only 1 slot manually
    const slots = page.locator('label').filter({ hasText: /:\d{2}\s?(AM|PM)/i });
    await slots.first().click();

    await schedulePage.assertContinueDisabled();
    console.log('✅ PASSED — Continue is disabled with 1 slot');
  });

  // ─── Test 3 ───────────────────────────────────────────────────────
  test('Continue is disabled with only 2 slots selected', async ({ page }) => {
    console.log('🧪 Test: Continue disabled with 2 slots');
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();
    await schedulePage.selectState('Florida');
    await schedulePage.selectAventuraLocation();
    await schedulePage.navigateToMonth('May');
    await schedulePage.selectCalendarDay('5-2-cal-day-content');
    await schedulePage.dismissThreeSlotsModalIfPresent();

    // Select only 2 slots
    const slots = page.locator('label').filter({ hasText: /:\d{2}\s?(AM|PM)/i });
    const allSlots = await slots.all();
    await allSlots[0].click();
    await page.waitForTimeout(300);
    await allSlots[1].click();

    await schedulePage.assertContinueDisabled();
    console.log('✅ PASSED — Continue is disabled with 2 slots');
  });

  // ─── Test 4 ───────────────────────────────────────────────────────
  test('Continue is enabled when exactly 3 slots are selected', async ({ page }) => {
    console.log('🧪 Test: Continue enabled with 3 slots');
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();
    await schedulePage.selectState('Florida');
    await schedulePage.selectAventuraLocation();
    await schedulePage.navigateToMonth('May');
    await schedulePage.selectCalendarDay('5-2-cal-day-content');
    await schedulePage.selectThreeTimeSlots();

    await schedulePage.assertContinueEnabled();
    console.log('✅ PASSED — Continue is enabled with 3 slots');
  });

  // ─── Test 5 ───────────────────────────────────────────────────────
  test('Continue disables again after removing a slot from 3', async ({ page }) => {
    console.log('🧪 Test: Continue disables after removing slot');
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();
    await schedulePage.selectState('Florida');
    await schedulePage.selectAventuraLocation();
    await schedulePage.navigateToMonth('May');
    await schedulePage.selectCalendarDay('5-2-cal-day-content');
    await schedulePage.selectThreeTimeSlots();

    // Verify enabled with 3
    await schedulePage.assertContinueEnabled();
    console.log('   → 3 slots selected: Continue is enabled ✓');

    // Remove one slot
    await schedulePage.removeSlot(0);

    // Verify disabled with 2
    await schedulePage.assertContinueDisabled();
    console.log('   → 1 slot removed: Continue is disabled ✓');
    console.log('✅ PASSED — Continue correctly disables after slot removal');
  });

  // ─── Test 6 ───────────────────────────────────────────────────────
  test('Modal appears explaining 3-slot requirement on first location click', async ({ page }) => {
    console.log('🧪 Test: Modal appears on location selection');
    const schedulePage = new ScheduleScanPage(page);
    await schedulePage.waitForLoad();
    await schedulePage.selectState('Florida');

    // Click location — modal should appear
    await page.getByText('Aventura20803 Biscayne Blvd,').click();

    // Verify modal is visible
    const modal = page.getByText(/please select 3 times you are available/i);
    await expect(modal, 'Modal should appear explaining 3-slot requirement').toBeVisible();
    console.log('   → Modal appeared ✓');

    // Dismiss it
    await page.getByRole('button', { name: 'I understand' }).click();
    await expect(modal, 'Modal should close after clicking I understand').not.toBeVisible();
    console.log('   → Modal dismissed ✓');

    console.log('✅ PASSED — Modal correctly explains the 3-slot requirement');
  });
});
