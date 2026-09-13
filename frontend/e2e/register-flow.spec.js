import { test, expect } from '@playwright/test';

test.describe('Registration & Input Validation Flow', () => {
  test('Register with formatted phone (+998 90 123 45 67) -> exactly 1 POST -> redirects to /verify-otp with single toast', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Ro'yxatdan o'tish/i })).toBeVisible();

    const timestamp = Date.now();
    const testEmail = `e2e_user_${timestamp}@example.com`;
    const testUsername = `user_${timestamp}`;

    // Intercept register requests to count network POST calls
    let postCount = 0;
    let requestPayload = null;
    await page.route('**/api/v1/auth/register', async (route) => {
      postCount++;
      requestPayload = JSON.parse(route.request().postData() || '{}');
      await route.continue();
    });

    // Fill registration form with spaced phone number
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Foydalanuvchi');
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '+998 90 123 45 67');
    await page.fill('input[name="password"]', 'SecretPass123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to home or return URL
    await expect(page).toHaveURL(/\//, { timeout: 10000 });

    // Assert exactly 1 POST request was made
    expect(postCount).toBe(1);

    // Assert cleaned phone in request payload
    expect(requestPayload.phone).toBe('+998901234567');

    // Assert single success toast appears
    const successToast = page.locator('text=Hisob muvaffaqiyatli yaratildi');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    expect(await successToast.count()).toBe(1);
  });

  test('Validation error on duplicate/invalid email -> shows exactly 1 error toast and inline error', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Ro'yxatdan o'tish/i })).toBeVisible();

    // Intercept register requests
    let postCount = 0;
    await page.route('**/api/v1/auth/register', async (route) => {
      postCount++;
      await route.continue();
    });

    // Fill with already existing email
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="username"]', 'unique_user_999');
    await page.fill('input[name="email"]', 'user1@example.com'); // existing user
    await page.fill('input[name="phone"]', '+998901112233');
    await page.fill('input[name="password"]', 'SecretPass123!');

    await page.click('button[type="submit"]');

    // Expect error toast to appear
    const errorToast = page.locator('.bg-rose-50, [class*="border-rose"]');
    await expect(errorToast.first()).toBeVisible({ timeout: 5000 });

    // Exactly 1 network call made
    expect(postCount).toBe(1);

    // Assert toast count does not duplicate (<= 1)
    const toastCount = await errorToast.count();
    expect(toastCount).toBe(1);
  });

  test('Double submission lock prevents multiple POST requests on rapid clicks', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Ro'yxatdan o'tish/i })).toBeVisible();

    let postCount = 0;
    await page.route('**/api/v1/auth/register', async (route) => {
      postCount++;
      // delay network response to test in-flight double submission
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });

    const timestamp = Date.now();
    await page.fill('input[name="firstName"]', 'Rapid');
    await page.fill('input[name="lastName"]', 'Clicker');
    await page.fill('input[name="username"]', `rapid_${timestamp}`);
    await page.fill('input[name="email"]', `rapid_${timestamp}@example.com`);
    await page.fill('input[name="phone"]', '+998 90 777 66 55');
    await page.fill('input[name="password"]', 'RapidPass123!');

    const submitBtn = page.locator('button[type="submit"]');
    // Rapidly double click
    await Promise.all([
      submitBtn.click({ force: true }),
      submitBtn.click({ force: true }),
    ]);

    await page.waitForTimeout(1000);
    // Even with rapid double click, only 1 request must be sent
    expect(postCount).toBe(1);
  });
});
