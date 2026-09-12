import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile-390px', width: 390, height: 844 },
  { name: 'tablet-768px', width: 768, height: 1024 },
  { name: 'laptop-1024px', width: 1024, height: 768 },
  { name: 'desktop-1440px', width: 1440, height: 900 },
];

test.describe('Responsive Layout & Visual Audit across 4 Viewports', () => {
  for (const vp of VIEWPORTS) {
    test(`Auditing ${vp.name} (${vp.width}x${vp.height}) for horizontal overflow and responsive integrity`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Home Page Audit
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Assert no horizontal scroll
      const hasHorizontalScrollHome = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScrollHome).toBe(false);

      // On mobile (< 768px), verify hamburger menu button exists and works. On >= 768px, desktop navigation is visible.
      if (vp.width < 768) {
        const menuBtn = page.locator('button[aria-label="Menyu"]');
        await expect(menuBtn).toBeVisible();
      } else {
        await expect(page.getByRole('link', { name: /Katalog/i }).first()).toBeVisible();
      }

      await page.screenshot({ path: `e2e-screenshots/home-${vp.name}.png`, fullPage: false });

      // 2. Catalog Page Audit
      await page.goto('/halls');
      await page.waitForLoadState('networkidle');

      const hasHorizontalScrollCatalog = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScrollCatalog).toBe(false);

      await page.screenshot({ path: `e2e-screenshots/catalog-${vp.name}.png`, fullPage: false });

      // 3. Login Page Audit
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const hasHorizontalScrollLogin = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScrollLogin).toBe(false);

      await page.screenshot({ path: `e2e-screenshots/login-${vp.name}.png`, fullPage: false });
    });
  }
});
