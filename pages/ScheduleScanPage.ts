import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object: Schedule your Scan (Step 2)
 * URL: /sign-up/schedule-scan
 *
 * Responsibilities:
 * - Select a state and location
 * - Select exactly 3 time slots from the calendar
 * - Assert Continue button state based on slot selection count
 */
export class ScheduleScanPage {
  readonly page: Page;

  readonly stateDropdown: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly selectedSlotsContainer: Locator;
  readonly additionalInfoTextarea: Locator;

  constructor(page: Page) {
    this.page = page;

    this.stateDropdown = page.locator('select, [role="combobox"]').first();
    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.backButton = page.getByRole('button', { name: /back/i });
    this.selectedSlotsContainer = page.getByText('You have selected:').locator('..');
    this.additionalInfoTextarea = page.getByPlaceholder(/weekday mornings/i);
  }

  async waitForLoad() {
    await this.page.waitForURL('**/schedule-scan');
    await this.page.waitForLoadState('networkidle');
  }

  async selectState(state: string) {
    await this.stateDropdown.click();
    await this.page.getByRole('option', { name: state }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectLocation(locationName: string) {
    // Click the location card that matches the name and does NOT have "Available instead" badge
    const locationCard = this.page
      .locator('.location-card, [data-testid="location-card"]')
      .filter({ hasText: locationName })
      .filter({ hasNot: this.page.getByText('Available instead') });

    // Fallback: click any card with the location name
    if (await locationCard.count() === 0) {
      await this.page.getByText(locationName).first().click();
    } else {
      await locationCard.first().click();
    }

    // Dismiss the "Please select 3 times" modal if it appears
    const modal = this.page.getByText('Please select 3 times you are available');
    if (await modal.isVisible()) {
      await this.page.getByRole('button', { name: /i understand/i }).click();
    }
  }

  async selectDateOnCalendar(dayNumber: number) {
    // Click a specific day number on the calendar (must be a future, non-Sunday date)
    await this.page.locator('.calendar [data-day], [data-testid="calendar-day"]')
      .filter({ hasText: String(dayNumber) })
      .first()
      .click();
  }

  async selectTimeSlot(timeLabel: string) {
    // Click a time slot button by its label (e.g. "11:04 AM")
    await this.page.getByRole('button', { name: timeLabel }).click();
  }

  async selectAvailableTimeSlots(count: number = 3) {
    /**
     * Selects `count` available time slots from the calendar.
     * Assumes a date is already selected.
     * Strategy: click the first `count` non-selected time buttons visible.
     */
    const timeButtons = this.page.locator('button').filter({ hasText: /\d{1,2}:\d{2}\s?(AM|PM)/i });
    const available = await timeButtons.all();

    let selected = 0;
    for (const btn of available) {
      if (selected >= count) break;
      if (await btn.isEnabled()) {
        await btn.click();
        selected++;
        await this.page.waitForTimeout(300); // brief wait between selections
      }
    }
  }

  async getSelectedSlotCount(): Promise<number> {
    // Count slots that are NOT showing "No time / date selected"
    const slots = this.page.locator('[data-testid="selected-slot"]');
    if (await slots.count() > 0) return await slots.count();

    // Fallback: count pill-style selected slot indicators
    const filled = await this.page
      .locator('text=/\\w+ \\d+, \\d{4}/')
      .count();
    return filled;
  }

  async isContinueButtonEnabled(): Promise<boolean> {
    return await this.continueButton.isEnabled();
  }

  async clickContinue() {
    await expect(this.continueButton).toBeEnabled();
    await this.continueButton.click();
  }

  async removeSlot(index: number = 0) {
    // Click the × button on a selected slot to remove it
    const removeButtons = this.page.locator('button[aria-label="Remove"], [data-testid="remove-slot"]');
    if (await removeButtons.count() > index) {
      await removeButtons.nth(index).click();
    } else {
      // Fallback: find × character buttons
      await this.page.locator('button:has-text("×"), button:has-text("✕")').nth(index).click();
    }
  }
}
