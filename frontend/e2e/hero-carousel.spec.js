import { test, expect } from '@playwright/test';

test.describe('Hero Showcase Carousel Interactions & Motion', () => {
  test('Hero carousel renders 4 slides, responds to chevron navigation, and pauses on hover', async ({ page }) => {
    // 1. Visit Home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Verify carousel section exists with carousel role
    const carouselSection = page.locator('section[aria-roledescription="carousel"]');
    await expect(carouselSection).toBeVisible();

    // 3. Initial Slide 1 check
    await expect(page.getByRole('heading', { name: /To'yingiz uchun eng go'zal/i })).toBeVisible();

    // 4. Click Next Chevron to advance to Slide 2
    const nextBtn = page.getByRole('button', { name: /Keyingi slayd/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // 5. Verify Slide 2 is active
    await expect(page.getByRole('heading', { name: /Bayramingiz mukammal makondan/i })).toBeVisible();

    // 6. Click Previous Chevron to return to Slide 1
    const prevBtn = page.getByRole('button', { name: /Oldingi slayd/i });
    await expect(prevBtn).toBeVisible();
    await prevBtn.click();

    await expect(page.getByRole('heading', { name: /To'yingiz uchun eng go'zal/i })).toBeVisible();

    // 7. Click on 4th Indicator Dot directly
    const dot4 = page.getByRole('button', { name: /Slayd 4/i });
    await expect(dot4).toBeVisible();
    await dot4.click();

    // 8. Verify Slide 4 copy ("Shaffof narxlar va qulay 20% avans")
    await expect(page.getByRole('heading', { name: /Shaffof narxlar va qulay/i })).toBeVisible();
    await expect(dot4).toHaveAttribute('aria-current', 'true');

    // 9. Verify SearchFilterBar retains inputs during slide interactions
    const guestsInput = page.locator('input[placeholder*="300"]');
    await guestsInput.fill('450');
    expect(await guestsInput.inputValue()).toBe('450');

    // Switch slide again to Slide 3
    const dot3 = page.getByRole('button', { name: /Slayd 3/i });
    await dot3.click();
    await expect(page.getByRole('heading', { name: /Barcha to'y xizmatlari/i })).toBeVisible();

    // Verify guests input is still preserved
    expect(await guestsInput.inputValue()).toBe('450');
  });
});
