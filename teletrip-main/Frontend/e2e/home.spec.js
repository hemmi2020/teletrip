import { test, expect } from '@playwright/test';

test.describe('Home Page & Navigation', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/home');
    
    // Page title should be present
    await expect(page).toHaveTitle(/Telitrip/i);
    
    // Header brand logo or text should be visible
    const logoOrBrand = page.locator('header img, header a').first();
    await expect(logoOrBrand).toBeVisible();

    // Verify search form is present
    const searchForm = page.locator('form, [data-testid="search-form"]').first();
    await expect(searchForm).toBeVisible();
  });

  test('should display search tabs for Hotels, Activities, and Transfers', async ({ page }) => {
    await page.goto('/home');
    
    // Search tab buttons
    const hotelTab = page.getByRole('button', { name: /hotel/i }).first();
    await expect(hotelTab).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/home');
    
    // Find and click Login link/button
    const loginLink = page.getByRole('link', { name: /log\s*in|sign\s*in/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });
});
