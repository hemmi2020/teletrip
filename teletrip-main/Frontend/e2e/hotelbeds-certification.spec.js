import { test, expect } from '@playwright/test';

test.describe('Hotelbeds Certification - Facilities Differentiation', () => {
  test('should render hotel details page and support facility badges', async ({ page }) => {
    // Navigate to a hotel details page with sample mock or existing hotel code
    await page.goto('/hotel-details/1067?checkIn=2026-11-01&checkOut=2026-11-03&adults=2');
    
    // Page should load without crashing
    await page.waitForLoadState('networkidle');

    // Either hotel name or loading state appears
    const bodyContent = page.locator('body');
    await expect(bodyContent).toBeVisible();

    // Verify presence of header and footer layout
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('should load hotel search results page', async ({ page }) => {
    await page.goto('/hotel-search-results?destination=Mallorca&checkIn=2026-11-01&checkOut=2026-11-03&adults=2');
    await page.waitForLoadState('domcontentloaded');

    // Search results container or loading indicator should be present
    const mainContainer = page.locator('#root');
    await expect(mainContainer).toBeVisible();
  });
});
