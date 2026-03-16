import { Page, expect } from '@playwright/test';

/**
 * ScheduleScanPage — /sign-up/schedule-scan (Step 2)
 *
 * Handles location selection, calendar date picking, and time slot selection.
 * Locators verified via Playwright recorder on staging environment.
 *
 * Key findings from recording:
 * - Submit button uses [data-test="submit"]
 * - Calendar days use data-testid format: "{month}-{day}-cal-day-content"
 * - Time slots are <label> elements containing time strings
 * - Modal "I understand" appears on first location click
 * - State dropdown trigger is a combobox > img
 */
export class ScheduleScanPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Navigation ──────────────────────────────────────────────────────

  async waitForLoad(): Promise<void> {
    await this.page.waitForURL('**/schedule-scan');
    await this.page.waitForLoadState('networkidle');
    console.log('📍 Schedule Scan page loaded');
  }

  // ─── Location selection ──────────────────────────────────────────────

  async selectState(state: string): Promise<void> {
    console.log(`🗺️  Selecting state: ${state}`);
    await this.page.getByRole('combobox').getByRole('img').click();
    await this.page.getByText(state).click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectAventuraLocation(): Promise<void> {
    console.log('📍 Selecting Aventura location...');
    await this.page.getByText('Aventura20803 Biscayne Blvd,').click();
  }

  // ─── Modal handling ──────────────────────────────────────────────────

  async dismissThreeSlotsModalIfPresent(): Promise<void> {
    const modal = this.page.getByRole('button', { name: 'I understand' });
    const isVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      console.log('💬 Dismissing "Please select 3 times" modal...');
      await modal.click();
    }
  }

  // ─── Calendar ────────────────────────────────────────────────────────

  /**
   * Navigate calendar to a specific month.
   * Uses the month label button (e.g. "May", "June").
   */
  async navigateToMonth(month: string): Promise<void> {
    console.log(`📅 Navigating calendar to ${month}...`);
    await this.page.getByLabel(month).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Select a specific day on the calendar.
   * @param testId - format: "{month}-{day}-cal-day-content" e.g. "5-2-cal-day-content"
   */
  async selectCalendarDay(testId: string): Promise<void> {
    console.log(`📅 Selecting calendar day: ${testId}`);
    await this.page.getByTestId(testId).click();
    await this.page.waitForTimeout(500);
  }

  // ─── Time slot selection ─────────────────────────────────────────────

  /**
   * Selects exactly 3 time slots from the available options.
   * Time slot labels contain time strings like "9:34 AM", "10:04 AM" etc.
   */
  async selectThreeTimeSlots(): Promise<void> {
    console.log('⏰ Selecting 3 available time slots...');

    await this.dismissThreeSlotsModalIfPresent();

    const timeSlotLabels = this.page.locator('label').filter({ hasText: /:\d{2}\s?(AM|PM)/i });
    const allSlots = await timeSlotLabels.all();

    let selected = 0;
    for (const slot of allSlots) {
      if (selected >= 3) break;
      const isEnabled = await slot.isEnabled().catch(() => false);
      if (isEnabled) {
        const slotText = await slot.textContent();
        console.log(`   ✓ Selecting slot: ${slotText?.trim()}`);
        await slot.click();
        selected++;
        await this.page.waitForTimeout(400);
      }
    }

    console.log(`⏰ Selected ${selected}/3 time slots`);

    if (selected < 3) {
      throw new Error(`Could only select ${selected} time slots — need exactly 3`);
    }
  }

  async removeSlot(index: number = 0): Promise<void> {
    console.log(`🗑️  Removing time slot at index ${index}...`);
    const removeButtons = this.page.locator('button').filter({ hasText: /×|✕/ });
    await removeButtons.nth(index).click();
    await this.page.waitForTimeout(300);
  }

  // ─── Assertions ──────────────────────────────────────────────────────

  async assertContinueEnabled(): Promise<void> {
    await expect(
      this.page.locator('[data-test="submit"]'),
      'Continue should be enabled after selecting 3 time slots'
    ).toBeEnabled();
  }

  async assertContinueDisabled(): Promise<void> {
    await expect(
      this.page.locator('[data-test="submit"]'),
      'Continue should be disabled with fewer than 3 time slots'
    ).toBeDisabled();
  }

  async isContinueEnabled(): Promise<boolean> {
    return this.page.locator('[data-test="submit"]').isEnabled();
  }

  // ─── Navigation ──────────────────────────────────────────────────────

  async clickContinue(): Promise<void> {
    console.log('➡️  Clicking Continue on Step 2...');
    await this.assertContinueEnabled();
    await this.page.locator('[data-test="submit"]').click();
    await this.page.waitForURL('**/reserve-appointment');
  }
}
