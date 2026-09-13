import { test, expect } from '@playwright/test';

test.describe('Critical Guest Booking Flow', () => {
  test('Guest -> Discovery -> Select Hall -> Pick Date -> Login -> Restore Draft -> Create Booking -> Pay Advance -> My Bookings', async ({ page }) => {
    // 1. Visit Home page
    await page.goto('/');
    await expect(page).toHaveTitle(/ToyxonaHub/i);
    await expect(page.getByRole('heading', { name: /To'yingiz uchun eng go'zal/i })).toBeVisible();

    // 2. Discover halls - click on Catalog navigation link
    await page.getByRole('link', { name: /Katalog/i }).first().click();
    await expect(page).toHaveURL(/\/catalog/);
    await page.waitForSelector('text=topildi', { timeout: 10000 });

    // 3. Open first available hall
    const firstHallLink = page.locator('a[href^="/halls/"]').first();
    await expect(firstHallLink).toBeVisible();
    await firstHallLink.click();

    // 4. Verify Hall Detail page loaded
    await expect(page).toHaveURL(/\/halls\/[a-zA-Z0-9-]+/);

    // 5. Select an available future date in the calendar
    const nextMonthBtn = page.getByRole('button', { name: /Keyingi oy/i });
    if (await nextMonthBtn.isVisible()) {
      await nextMonthBtn.click();
      await page.waitForTimeout(300);
      await nextMonthBtn.click();
      await page.waitForTimeout(300);
    }

    // Find available days and pick one
    const availableDays = page.locator('button[aria-label*="bo\'sh"]:not([disabled])');
    await expect(availableDays.first()).toBeVisible();
    const count = await availableDays.count();
    const randomIndex = Math.floor(Math.random() * count);
    await availableDays.nth(randomIndex).click();

    // 6. Click "Bron qilishni davom etish" as unauthenticated guest
    await page.getByRole('button', { name: /Bron qilish/i }).first().click();

    // 7. Verify redirection to Login with message
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /Tizimga kirish/i })).toBeVisible();

    // 8. Log in with existing User account
    await page.fill('input[type="text"]', 'user1@example.com');
    await page.fill('input[type="password"]', 'UserPassword123!');
    await page.click('button[type="submit"]');

    // 9. Verify redirected back to hall page with draft restored
    await expect(page).toHaveURL(/\/halls\/[a-zA-Z0-9-]+/);

    // Modal should be automatically opened by draft restoration
    const modalHeading = page.getByRole('heading', { name: /To'yxonani bron qilish/i });
    await expect(modalHeading).toBeVisible({ timeout: 10000 });

    // Contact info pre-filled, submit booking
    const nameInput = page.locator('input[placeholder="Ali"]');
    await expect(nameInput).not.toHaveValue('', { timeout: 5000 });
    const submitBookingBtn = page.getByRole('button', { name: /Tasdiqlash va bron qilish/i });
    await expect(submitBookingBtn).toBeVisible();
    await submitBookingBtn.click();

    // 10. Verify Payment Modal appears with 20% advance
    await expect(page.getByRole('heading', { name: /20% Avans to'lovini amalga oshirish/i })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=To\'lanishi kerak bo\'lgan avans (20%):')).toBeVisible();

    // 11. Click "20% avansni to'lash"
    const payBtn = page.getByRole('button', { name: /20% avansni to'lash/i });
    await expect(payBtn).toBeVisible();
    await payBtn.click();

    // Assert payment success toast
    await expect(page.locator("text=Muvaffaqiyatli to'landi")).toBeVisible({ timeout: 10000 });

    // 12. Verify redirection to My Bookings and verify booking exists
    await expect(page).toHaveURL(/\/my-bookings/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Mening buyurtmalarim/i })).toBeVisible();
    
    // Check that at least one booking card is rendered with PAID / ACTIVE status
    await expect(page.locator('text=20% avans to\'langan').or(page.locator('text=Faol')).first()).toBeVisible({ timeout: 10000 });
  });
});
