import { test, expect } from '@playwright/test';
import { stableClick, stableFill, stableSelect } from 'playwright-forge';

test.describe('Stable Action Helpers Examples', () => {
  test('Stable click - basic usage', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Click with automatic retries and stability checks
    const docsLink = page.locator('a[href*="docs"]').first();
    if (await docsLink.count() > 0) {
      await stableClick(page, 'a[href*="docs"]');
      console.log('Stable click completed');
    }
  });

  test('Stable click with configuration', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const config = {
      timeout: 10000,
      retryInterval: 100,
      maxRetries: 5,
      debug: true,
      stabilityThreshold: 3,
      stabilityCheckInterval: 100
    };
    
    const searchButton = page.locator('button[class*="search"]').first();
    if (await searchButton.count() > 0) {
      await stableClick(page, 'button[class*="search"]', config);
      console.log('Stable click with config completed');
    }
  });

  test('Stable fill - input field', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Open search
    const searchButton = page.locator('button[class*="search"]').first();
    if (await searchButton.count() > 0) {
      await searchButton.click();
      await page.waitForTimeout(500);
      
      const searchInput = page.locator('input[type="search"]').first();
      if (await searchInput.count() > 0) {
        // Fill with automatic retry and verification
        await stableFill(page, 'input[type="search"]', 'testing');
        console.log('Stable fill completed');
        
        // Verify value was set
        const value = await searchInput.inputValue();
        expect(value).toBe('testing');
      }
    }
  });

  test('Stable fill with configuration', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const config = {
      timeout: 10000,
      retryInterval: 100,
      maxRetries: 3,
      debug: true
    };
    
    const searchButton = page.locator('button[class*="search"]').first();
    if (await searchButton.count() > 0) {
      await searchButton.click();
      await page.waitForTimeout(500);
      
      const searchInput = page.locator('input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await stableFill(page, 'input[type="search"]', 'playwright', config);
        console.log('Stable fill with config completed');
      }
    }
  });

  test('Multiple stable actions in sequence', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const config = {
      maxRetries: 3,
      timeout: 10000
    };
    
    // Click to open search
    const searchButton = page.locator('button[class*="search"]').first();
    if (await searchButton.count() > 0) {
      await stableClick(page, 'button[class*="search"]', config);
      await page.waitForTimeout(500);
      
      // Fill search input
      const searchInput = page.locator('input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await stableFill(page, 'input[type="search"]', 'api', config);
        console.log('Multiple stable actions completed');
      }
    }
  });

  test('Stable actions with dynamic content', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on a link that might be loading
    const getStartedLink = page.locator('a:has-text("Get started")').first();
    if (await getStartedLink.count() > 0) {
      await stableClick(page, 'a:has-text("Get started")');
      console.log('Clicked dynamic content with stable action');
    }
  });

  test('Handle loading states with stable actions', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const config = {
      timeout: 15000,
      maxRetries: 5
    };
    
    // Navigate through multiple pages with stable actions
    await page.waitForLoadState('networkidle');
    
    const docsLink = page.locator('a[href*="docs"]').first();
    if (await docsLink.count() > 0) {
      await stableClick(page, 'a[href*="docs"]', config);
      console.log('Navigated with stable action');
    }
  });

  test('Tolerant mode with stable actions', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const config = {
      mode: 'tolerant' as const,
      debug: true,
      maxRetries: 2
    };
    
    // Try to interact with element that might not exist
    try {
      const searchButton = page.locator('button[class*="search"]').first();
      if (await searchButton.count() > 0) {
        await stableClick(page, 'button[class*="search"]', config);
        console.log('Tolerant mode action completed');
      }
    } catch (error) {
      console.log('Action failed in tolerant mode:', error);
    }
  });

  test('Stable actions form interaction', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const config = {
      timeout: 10000,
      maxRetries: 3
    };
    
    // Simulate form interaction with stable actions
    const searchButton = page.locator('button[class*="search"]').first();
    if (await searchButton.count() > 0) {
      await stableClick(page, 'button[class*="search"]', config);
      await page.waitForTimeout(500);
      
      const searchInput = page.locator('input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await stableFill(page, 'input[type="search"]', 'test automation', config);
        console.log('Form interaction with stable actions completed');
      }
    }
  });

  test('Stable actions with retry logging', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const config = {
      debug: true,  // Enable debug logging
      maxRetries: 3,
      retryInterval: 500
    };
    
    const mainContent = page.locator('main').first();
    if (await mainContent.count() > 0) {
      // This will log retry attempts if any occur
      await stableClick(page, 'main', config);
      console.log('Stable action with retry logging completed');
    }
  });
});
