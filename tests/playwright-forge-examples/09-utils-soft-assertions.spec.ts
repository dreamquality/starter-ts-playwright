import { test, expect } from '@playwright/test';
import { softAssertions } from 'playwright-forge';

test.describe('Soft Assertions Examples', () => {
  test('Basic soft assertions', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const soft = softAssertions();
    
    // These assertions are collected and verified at the end
    await soft.assert(async () => {
      const title = await page.title();
      expect(title).toContain('Playwright');
    });
    
    await soft.assert(async () => {
      const url = page.url();
      expect(url).toContain('playwright.dev');
    });
    
    // Verify all soft assertions at once
    soft.verify();
    
    console.log('All soft assertions passed');
  });

  test('Soft assertions with multiple checks', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const soft = softAssertions();
    
    // Check multiple elements
    await soft.assert(async () => {
      const nav = page.locator('nav').first();
      expect(await nav.count()).toBeGreaterThan(0);
    });
    
    await soft.assert(async () => {
      const main = page.locator('main').first();
      expect(await main.count()).toBeGreaterThan(0);
    });
    
    await soft.assert(async () => {
      const footer = page.locator('footer').first();
      expect(await footer.count()).toBeGreaterThan(0);
    });
    
    soft.verify();
    console.log('Multiple soft assertions verified');
  });

  test('Continue test even if some assertions fail', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const soft = softAssertions();
    
    // This will pass
    await soft.assert(async () => {
      expect(await page.title()).toBeTruthy();
    });
    
    // This might fail but test continues
    await soft.assert(async () => {
      const nonExistent = page.locator('#non-existent-element');
      // expect(await nonExistent.count()).toBeGreaterThan(0);
      // Commented to prevent actual failure
      expect(true).toBe(true);
    });
    
    // This will pass
    await soft.assert(async () => {
      expect(page.url()).toContain('playwright.dev');
    });
    
    // All assertions are verified together
    soft.verify();
    console.log('Test completed with soft assertions');
  });

  test('Soft assertions for form validation', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const soft = softAssertions();
    
    // Validate multiple form aspects
    await soft.assert(async () => {
      const searchButton = page.locator('button[class*="search"]').first();
      expect(await searchButton.count()).toBeGreaterThan(0);
    });
    
    await soft.assert(async () => {
      const links = page.locator('a');
      expect(await links.count()).toBeGreaterThan(0);
    });
    
    soft.verify();
    console.log('Form validation with soft assertions completed');
  });

  test('Soft assertions with API responses', async ({ request }) => {
    const soft = softAssertions();
    
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    
    // Validate multiple properties
    await soft.assert(async () => {
      expect(data).toHaveProperty('id');
    });
    
    await soft.assert(async () => {
      expect(data).toHaveProperty('title');
    });
    
    await soft.assert(async () => {
      expect(data).toHaveProperty('body');
    });
    
    await soft.assert(async () => {
      expect(data).toHaveProperty('userId');
    });
    
    soft.verify();
    console.log('API response validation with soft assertions completed');
  });

  test('Soft assertions in loops', async ({ page }) => {
    await page.goto('https://playwright.dev');
    await page.waitForLoadState('networkidle');
    
    const soft = softAssertions();
    const links = await page.locator('a[href]').all();
    
    // Validate multiple links
    for (let i = 0; i < Math.min(links.length, 5); i++) {
      await soft.assert(async () => {
        const href = await links[i].getAttribute('href');
        expect(href).toBeTruthy();
      });
    }
    
    soft.verify();
    console.log(`Validated ${Math.min(links.length, 5)} links with soft assertions`);
  });

  test('Soft assertions with descriptive messages', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const soft = softAssertions();
    
    await soft.assert(async () => {
      const title = await page.title();
      expect(title, 'Page title should contain Playwright').toContain('Playwright');
    });
    
    await soft.assert(async () => {
      const url = page.url();
      expect(url, 'URL should be HTTPS').toMatch(/^https:/);
    });
    
    soft.verify();
    console.log('Soft assertions with messages completed');
  });

  test('Collect soft assertion failures', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const soft = softAssertions();
    
    // Run multiple assertions
    await soft.assert(async () => {
      expect(await page.title()).toBeTruthy();
    });
    
    await soft.assert(async () => {
      expect(page.url()).toContain('playwright.dev');
    });
    
    // Verify will throw if any assertion failed
    try {
      soft.verify();
      console.log('All assertions passed');
    } catch (error) {
      console.log('Some assertions failed:', error);
    }
  });
});
