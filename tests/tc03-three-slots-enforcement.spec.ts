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

    // Capture the 3 slot labels once, before the DOM changes
    const slot1Text = (await slots.nth(0).textContent())?.trim();
    const slot2Text = (await slots.nth(1).textContent())?.trim();
    const slot3Text = (await slots.nth(2).textContent())?.trim();

    if (!slot1Text || !slot2Text || !slot3Text) {
      throw new Error('Could not capture 3 slot labels');
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

    await expect(continueBtn).toBeDisabled();

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

    // STEP 3 — select third slot
   // STEP 3 — select third slot (SAFE selection)
console.log('▶️ Resuming: Selecting 3rd slot...');

const thirdSlot = page
  .locator('div.appointments__list.--large-fields > div > label:visible')
  .filter({ hasText: slot3Text })
  .first();

// ensure it's not already selected (important)
const isSelected = await thirdSlot.getAttribute('class');

if (!isSelected?.includes('selected')) {
  await thirdSlot.scrollIntoViewIfNeeded();
  await thirdSlot.click();
  await page.waitForTimeout(800);
}

// handle modal
const understandBtn3 = page.getByRole('button', { name: 'I understand' });
if (await understandBtn3.isVisible().catch(() => false)) {
  await understandBtn3.click();
}

// 🔥 wait until we ACTUALLY have 3 selected
await expect(
  page.locator('label.selected')
).toHaveCount(3);

// THEN assert CTA
await expect(continueBtn).toBeEnabled();

    console.log('✅ CTA ENABLED after selecting 3rd slot');
    console.log('\n🎉 RESULT: PASS\n');
  });
});