import { test, expect } from '@playwright/test';

test.describe('Admin Moderation & Governance Flow', () => {
  test('Admin login -> Dashboard metrics -> Pending approvals -> Halls directory -> Owners governance', async ({ page }) => {
    // 1. Visit Login page
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Tizimga kirish/i })).toBeVisible();

    // 2. Log in as Admin
    await page.fill('input[type="text"]', 'admin@toyxonahub.uz');
    await page.fill('input[type="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');

    // 3. Redirected to Admin Workspace
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Administrator Boshqaruv/i })).toBeVisible();

    // 4. Verify system statistics cards
    await expect(page.locator('text=Tasdiqlash navbati').first()).toBeVisible();
    await expect(page.locator('text=Tasdiqlangan zallar')).toBeVisible();

    // 5. Navigate to Approvals page
    await page.getByRole('link', { name: /Tasdiqlash navbati/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/approvals/);
    await expect(page.getByRole('heading', { name: 'Tasdiqlash navbati', exact: true })).toBeVisible();

    // 6. Navigate to All Halls management
    await page.getByRole('link', { name: /Barcha to'yxonalar/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/halls/);
    await expect(page.getByRole('heading', { name: /Barcha to'yxonalar/i })).toBeVisible();

    // 7. Navigate to Owners governance
    await page.getByRole('link', { name: /Mulkdorlar/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/owners/);
    await expect(page.getByRole('heading', { name: /Mulkdorlar boshqaruvi/i })).toBeVisible();
    await expect(page.locator('text=owner1@toyxonahub.uz')).toBeVisible();
  });
});
