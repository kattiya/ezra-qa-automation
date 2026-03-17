import { test, expect } from '@playwright/test';
import { SelectPlanPage } from '../pages/SelectPlanPage';
import { ScheduleScanPage } from '../pages/ScheduleScanPage';

test.describe('TC-03: minimum 3 slots required', () => {
  test.beforeEach(async ({ page }) => {
    const planPage = new SelectPlanPage(page);
    await planPage.goto();
    await planPage.selectMriScan();
    await planPage.clickContinue();
  });

  test('visual demo: user cannot proceed with only 2 selected slots', async ({ page }) => {
    const schedulePage = new ScheduleScanPage(page);

    await schedulePage.waitForLoad();
    await schedulePage.selectState();
    await schedulePage.selectAventuraLocation();
    await schedulePage.navigateToApril();
    await schedulePage.selectFirstDayWithAtLeastThreeSlots();

    const slots = page.locator('div.appointments__list.--large-fields > div > label:visible');
    const continueBtn = page.locator('[data-test="submit"]');

    // Capture the first 2 slot labels once, before the DOM changes
    const slot1Text = (await slots.nth(0).textContent())?.trim();
    const slot2Text = (await slots.nth(1).textContent())?.trim();

    if (!slot1Text || !slot2Text) {
      throw new Error('Could not capture 2 slot labels');
    }

    console.log('\n🎬 DEMO MODE: Minimum slot enforcement\n');

    // STEP 1 — select first slot
    await page
      .locator('div.appointments__list.--large-fields > div > label:visible')
      .filter({ hasText: slot1Text })
      .first()
      .click({ force: true });
    await page.waitForTimeout(800);

    const understandBtn1 = page.getByRole('button', { name: 'I understand' });
    if (await understandBtn1.isVisible().catch(() => false)) {
      await understandBtn1.click();
    }

    // STEP 2 — select second slot
    await page
      .locator('div.appointments__list.--large-fields > div > label:visible')
      .filter({ hasText: slot2Text })
      .first()
      .click({ force: true });
    await page.waitForTimeout(1000);

    const understandBtn2 = page.getByRole('button', { name: 'I understand' });
    if (await understandBtn2.isVisible().catch(() => false)) {
      await understandBtn2.click();
    }

    console.log('🛑 PAUSE: User selected ONLY 2 slots');
    console.log('👉 Observe: Continue button should still be DISABLED');

    // 🔒 HARD ASSERT: CTA must remain disabled
    await expect(continueBtn).toBeDisabled();

    // 🔍 Double-check: button has disabled attribute
    await expect(continueBtn).toHaveAttribute('disabled', '');

    // 🚫 Attempt to click — should NOT navigate
    await continueBtn.click({ force: true }).catch(() => {});

    // still on schedule page
    await expect(page).toHaveURL(/schedule|scan/i);

    await page.waitForTimeout(3000);

    await page.evaluate(() => {
      const existing = document.getElementById('qa-demo-banner');
      if (existing) existing.remove();

      const banner = document.createElement('div');
      banner.id = 'qa-demo-banner';
      banner.innerText = '⚠️ QA DEMO: Select at least 3 time slots';
      banner.style.position = 'fixed';
      banner.style.top = '20px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.background = '#ff4d4f';
      banner.style.color = 'white';
      banner.style.padding = '12px 20px';
      banner.style.borderRadius = '8px';
      banner.style.zIndex = '9999';
      banner.style.fontSize = '16px';
      banner.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      document.body.appendChild(banner);
    });

    await page.waitForTimeout(1500);

    console.log('🔒 VERIFIED: CTA is blocked with < 3 slots (UI + DOM + behavior)');
    console.log('✅ PASS: Continue button remains disabled with only 2 slots selected');
    console.log('\n🎉 RESULT: PASS — User cannot proceed with less than 3 slots\n');
  });
});