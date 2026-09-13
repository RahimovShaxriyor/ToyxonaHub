import { test, expect } from '@playwright/test';

test.describe('Owner Hall Management & Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Visit Login page
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Tizimga kirish/i })).toBeVisible();

    // 2. Log in as verified Owner
    await page.fill('input[type="text"]', 'owner1@toyxonahub.uz');
    await page.fill('input[type="password"]', 'OwnerPassword123!');
    await page.click('button[type="submit"]');

    // 3. Redirected to Owner Workspace
    await expect(page).toHaveURL(/\/owner/, { timeout: 10000 });
  });

  test('Validation error on empty hall form -> inline error & single error toast, 0 POST calls', async ({ page }) => {
    await page.goto('/owner/halls/new');
    await expect(page.getByRole('heading', { name: /Yangi to'yxona qo'shish/i })).toBeVisible();

    let postCount = 0;
    await page.route('**/api/v1/wedding-halls', async (route) => {
      postCount++;
      await route.continue();
    });

    // Clear any pre-filled or submit empty
    await page.click('button[type="submit"]');

    // Should NOT send network call due to client-side validation
    expect(postCount).toBe(0);

    // Verify error toast appears and is not duplicated
    const errorToast = page.locator('div[role="alert"]');
    await expect(errorToast.first()).toBeVisible({ timeout: 5000 });
    expect(await errorToast.count()).toBe(1);
  });

  test('Create hall with spaced phone & uppercase district enum -> exactly 1 POST -> redirected to halls list', async ({ page }) => {
    await page.goto('/owner/halls/new');
    await expect(page.getByRole('heading', { name: /Yangi to'yxona qo'shish/i })).toBeVisible();

    const timestamp = Date.now();
    const hallName = `E2E Saroy ${timestamp}`;

    page.on('console', (m) => console.log('PAGE LOG:', m.text()));
    page.on('request', (r) => console.log('PAGE REQ:', r.method(), r.url()));

    let postCount = 0;
    let requestPayload = null;
    await page.route('**/api/v1/wedding-halls', async (route) => {
      if (route.request().method() === 'POST') {
        postCount++;
        requestPayload = JSON.parse(route.request().postData() || '{}');
      }
      await route.continue();
    });

    // Fill form
    await page.fill('input[name="name"]', hallName);
    await page.selectOption('select[name="district"]', 'CHILONZOR');
    await page.fill('input[name="address"]', "Bunyodkor shoh ko'chasi 45");
    await page.fill('input[name="capacity"]', '450');
    await page.fill('input[name="pricePerSeat"]', '250000');
    await page.fill('input[name="phone"]', '+998 90 987 65 43');
    await page.fill('textarea[name="description"]', 'E2E avtomatlashtirilgan test uchun yaratilgan zal');

    // Submit form and wait for response
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/wedding-halls') && r.request().method() === 'POST',
        { timeout: 10000 }
      ),
      page.click('button[type="submit"]'),
    ]);

    expect(response.status()).toBe(201);

    // Redirected to /owner/halls (not /owner/halls/new)
    await expect(page).toHaveURL(/.*\/owner\/halls(?!\/new)/, { timeout: 10000 });

    // Assert exactly 1 POST was sent
    expect(postCount).toBe(1);

    // Assert strict payload contract
    expect(requestPayload).toMatchObject({
      name: hallName,
      district: 'CHILONZOR',
      address: "Bunyodkor shoh ko'chasi 45",
      capacity: 450,
      pricePerSeat: 250000,
      phone: '+998909876543',
    });

    // Verify the newly created hall appears in the list
    await expect(page.locator(`text=${hallName}`)).toBeVisible({ timeout: 10000 });
  });

  test('Double submission lock prevents multiple POST requests on rapid clicks', async ({ page }) => {
    await page.goto('/owner/halls/new');
    await expect(page.getByRole('heading', { name: /Yangi to'yxona qo'shish/i })).toBeVisible();

    const timestamp = Date.now();
    const hallName = `Rapid Hall ${timestamp}`;

    let postCount = 0;
    await page.route('**/api/v1/wedding-halls', async (route) => {
      if (route.request().method() === 'POST') {
        postCount++;
        // Delay to test in-flight double submission lock
        await new Promise((res) => setTimeout(res, 800));
      }
      await route.continue();
    });

    await page.fill('input[name="name"]', hallName);
    await page.selectOption('select[name="district"]', 'YUNUSOBOD');
    await page.fill('input[name="address"]', "Amir Temur ko'chasi 10");
    await page.fill('input[name="capacity"]', '300');
    await page.fill('input[name="pricePerSeat"]', '200000');
    await page.fill('input[name="phone"]', '+998 93 111 22 33');

    const submitBtn = page.locator('button[type="submit"]');
    await Promise.all([
      submitBtn.click({ force: true }),
      submitBtn.click({ force: true }),
    ]);

    await page.waitForTimeout(1000);
    expect(postCount).toBe(1);
  });
});
