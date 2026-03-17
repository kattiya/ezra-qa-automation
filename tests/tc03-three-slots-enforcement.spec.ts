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

  test('visual demo: 2 slots blocked → 3rd unlocks CTA', async ({ page }) => {
    const schedulePage = new ScheduleScanPage(page);

    await schedulePage.waitForLoad();
    await schedulePage.selectState();
    await schedulePage.selectAventuraLocation();
    await schedulePage.navigateToApril();
    await schedulePage.selectFirstDayWithAtLeastThreeSlots();

    const slots = page.locator('div.appointments__list.--large-fields > div > label:visible');
    const continueBtn = page.locator('[data-test="submit"]');

    console.log('\n🎬 DEMO MODE: Minimum slot enforcement\n');

    // STEP 1 — select first slot
    await slots.nth(0).click({ force: true });
    await page.waitForTimeout(800);

    const understandBtn1 = page.getByRole('button', { name: 'I understand' });
    if (await understandBtn1.isVisible().catch(() => false)) {
      await understandBtn1.click();
    }

    // STEP 2 — select second slot
    await slots.nth(1).click({ force: true });
    await page.waitForTimeout(1000);

    const understandBtn2 = page.getByRole('button', { name: 'I understand' });
    if (await understandBtn2.isVisible().catch(() => false)) {
      await understandBtn2.click();
    }

    console.log('🛑 PAUSE: User selected ONLY 2 slots');
    console.log('👉 Observe: Continue button should still be DISABLED');

    await expect(continueBtn).toBeDisabled();

    await page.waitForTimeout(3000);

    // OPTIONAL: inject visible UI banner (see below)
    await page.evaluate(() => {
      const banner = document.createElement('div');
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

    // STEP 3 — select third slot
    console.log('▶️ Resuming: Selecting 3rd slot...');

    await slots.nth(2).click({ force: true });
    await page.waitForTimeout(800);

    const understandBtn3 = page.getByRole('button', { name: 'I understand' });
    if (await understandBtn3.isVisible().catch(() => false)) {
      await understandBtn3.click();
    }

    await expect(continueBtn).toBeEnabled();

    console.log('✅ CTA ENABLED after selecting 3rd slot');
    console.log('\n🎉 RESULT: PASS\n');
  });
});