import { Page, expect } from '@playwright/test';

/**
 * ScheduleScanPage — Step 2
 * Final confirmed locators via Playwright recorder.
 */
export class ScheduleScanPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForURL('**/schedule-scan');
    await this.page.waitForLoadState('domcontentloaded');
    console.log('📍 Schedule Scan page loaded');
  }

  async selectState(): Promise<void> {
    console.log('🗺️  Opening state dropdown...');
    await this.page.getByRole('combobox').click();
    await this.page.waitForTimeout(500);

    console.log('🗺️  Selecting Florida...');
    await this.page.locator('li[role="option"]', { hasText: 'Florida' }).click();
    await this.page.waitForTimeout(500);
  }

  async selectAventuraLocation(): Promise<void> {
    console.log('📍 Selecting Aventura...');
    await this.page.getByText(/Aventura|20803 Biscayne Blvd/i).first().click();
    await this.page.waitForTimeout(500);
  }

  async navigateToApril(): Promise<void> {
  console.log('📅 Navigating to April...');
  await this.page.getByRole('button', { name: 'March' }).click();
  await this.page.waitForTimeout(300);
  await this.page.getByLabel('April').click();
  await this.page.waitForTimeout(800);
}

private getVisibleSlots() {
  return this.page.locator(
    'div.appointments__list.--large-fields > div > label:visible'
  );
}

async selectFirstDayWithAtLeastThreeSlots(): Promise<void> {
  console.log('📅 Looking for first day with at least 3 visible slots...');

  const days = this.page.locator('[data-testid*="cal-day-content"]');
  const dayCount = await days.count();

  for (let i = 0; i < dayCount; i++) {
    const day = days.nth(i);

    if (!(await day.isVisible().catch(() => false))) continue;

    const ariaDisabled = await day.getAttribute('aria-disabled');
    if (ariaDisabled === 'true') continue;

    await day.click();
    await this.page.waitForTimeout(1000);

    const slotCount = await this.getVisibleSlots().count();
    console.log(`   → Day index ${i}: ${slotCount} visible slot(s)`);

    if (slotCount >= 3) {
      console.log(`✅ Picked day index ${i} with at least 3 slots`);
      return;
    }
  }

  throw new Error('❌ No day found with at least 3 visible slots');
}

async selectThreeTimeSlots(): Promise<void> {
  console.log('⏰ Selecting 3 visible time slots...');

  const slots = this.getVisibleSlots();
  const slotCount = await slots.count();

  if (slotCount < 3) {
    throw new Error(`Could only find ${slotCount} visible slot(s)`);
  }

  for (let i = 0; i < 3; i++) {
    await slots.nth(i).click({ force: true });
    await this.page.waitForTimeout(300);

    const modal = this.page.getByRole('button', { name: 'I understand' });
    if (await modal.isVisible({ timeout: 1500 }).catch(() => false)) {
      await modal.click();
      await this.page.waitForTimeout(300);
    }

    console.log(`   ✓ SLOT ${i + 1} selected`);
  }

  await expect(this.page.locator('[data-test="submit"]')).toBeEnabled();
  console.log('✅ 3 time slots selected');
}

  async removeSlot(index: number = 0): Promise<void> {
    console.log(`🗑️  Removing slot ${index}...`);
    await this.page.locator('button').filter({ hasText: /×|✕/ }).nth(index).click();
    await this.page.waitForTimeout(300);
  }

  async assertContinueEnabled(): Promise<void> {
    await expect(
      this.page.locator('[data-test="submit"]'),
      'Continue should be enabled after 3 slots'
    ).toBeEnabled();
  }

  async assertContinueDisabled(): Promise<void> {
    await expect(
      this.page.locator('[data-test="submit"]'),
      'Continue should be disabled with fewer than 3 slots'
    ).toBeDisabled();
  }

  async isContinueEnabled(): Promise<boolean> {
    return this.page.locator('[data-test="submit"]').isEnabled();
  }

  async clickContinue(): Promise<void> {
    console.log('➡️  Continue Step 2...');
    await this.assertContinueEnabled();
    await this.page.locator('[data-test="submit"]').click();
    await this.page.waitForURL('**/reserve-appointment');
    console.log('✅ Moved to Step 3');
  }
}
