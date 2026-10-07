import { test, expect } from '@playwright/test';

test.describe('Static & Policy Pages', () => {
  const pages = [
    { url: '/contact', text: /contact/i },
    { url: '/about', text: /about/i },
    { url: '/faqs', text: /faq/i },
    { url: '/privacy-policy', text: /privacy/i },
    { url: '/terms', text: /terms/i },
  ];

  for (const p of pages) {
    test(`should load ${p.url} successfully`, async ({ page }) => {
      await page.goto(p.url);
      await expect(page).toHaveURL(new RegExp(p.url));
      
      const body = page.locator('body');
      await expect(body).toContainText(p.text);
    });
  }

  test('should handle unknown routes with 404 page', async ({ page }) => {
    await page.goto('/some-unknown-random-route-404');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
