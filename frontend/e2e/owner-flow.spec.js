import { test, expect } from '@playwright/test';

test.describe('Owner Management Flow', () => {
  test('Owner login -> Dashboard metrics -> Hall management -> Bookings inspection', async ({ page }) => {
    // 1. Visit Login page
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Tizimga kirish/i })).toBeVisible();

    // 2. Log in as verified Owner
    await page.fill('input[type="text"]', 'owner1@toyxonahub.uz');
    await page.fill('input[type="password"]', 'OwnerPassword123!');
    await page.click('button[type="submit"]');

    // 3. Redirected to Owner Workspace
    await expect(page).toHaveURL(/\/owner/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Xush kelibsiz/i })).toBeVisible();

    // 4. Verify Dashboard metric cards are populated
    await expect(page.locator('text=To\'yxonalarim').first()).toBeVisible();
    await expect(page.locator('text=Jami buyurtmalar')).toBeVisible();

    // 5. Navigate to Halls page
    await page.getByRole('link', { name: /To'yxonalarim/i }).click();
    await expect(page).toHaveURL(/\/owner\/halls/);
    await expect(page.getByRole('heading', { name: /Mening to'yxonalarim/i })).toBeVisible();

    // Verify hall cards or add button
    await expect(page.getByRole('button', { name: /Yangi to'yxona qo'shish/i })).toBeVisible();

    // 6. Navigate to Bookings page
    await page.getByRole('link', { name: /Kelgan buyurtmalar/i }).click();
    await expect(page).toHaveURL(/\/owner\/bookings/);
    await expect(page.getByRole('heading', { name: /Kelgan buyurtmalar/i })).toBeVisible();
  });
});
