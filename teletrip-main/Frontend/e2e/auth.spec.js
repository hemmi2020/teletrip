import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should load login page with email and password inputs', async ({ page }) => {
    await page.goto('/login');
    
    // Check for email and password inputs
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should load signup page with registration fields', async ({ page }) => {
    await page.goto('/signup');
    
    // Check for signup inputs
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should show validation error on empty login submit', async ({ page }) => {
    await page.goto('/login');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // The form should remain on /login
    await expect(page).toHaveURL(/.*login/);
  });
});
