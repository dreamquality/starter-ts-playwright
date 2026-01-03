import { test, expect } from '@playwright/test';
import { poll, pollValue } from 'playwright-forge';

test.describe('Polling Utility Examples', () => {
  test('Poll until condition is met', async () => {
    let counter = 0;
    
    // Poll until counter reaches 5
    const result = await poll(
      async () => {
        counter++;
        return counter >= 5;
      },
      {
        timeout: 5000,
        interval: 100
      }
    );
    
    expect(counter).toBeGreaterThanOrEqual(5);
    console.log(`Polled ${counter} times until condition met`);
  });

  test('Poll with custom interval', async () => {
    let attempts = 0;
    
    const result = await poll(
      async () => {
        attempts++;
        return attempts >= 3;
      },
      {
        timeout: 10000,
        interval: 500  // Check every 500ms
      }
    );
    
    expect(attempts).toBe(3);
    console.log(`Polling completed in ${attempts} attempts`);
  });

  test('Poll for element state', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Poll until element is visible
    await poll(
      async () => {
        const nav = page.locator('nav').first();
        return await nav.count() > 0 && await nav.isVisible();
      },
      {
        timeout: 5000,
        interval: 100
      }
    );
    
    console.log('Element became visible');
  });

  test('Poll for API response', async ({ request }) => {
    let responseReceived = false;
    
    const result = await poll(
      async () => {
        const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
        responseReceived = response.ok();
        return responseReceived;
      },
      {
        timeout: 10000,
        interval: 500
      }
    );
    
    expect(result).toBeTruthy();
    expect(responseReceived).toBe(true);
    console.log('API response received');
  });

  test('Poll with timeout handling', async () => {
    let attempts = 0;
    
    try {
      const result = await poll(
        async () => {
          attempts++;
          return false;  // Never becomes true
        },
        {
          timeout: 2000,  // Short timeout
          interval: 100
        }
      );
    } catch (error) {
      console.log(`Polling timed out after ${attempts} attempts`);
      expect(attempts).toBeGreaterThan(0);
    }
  });

  test('Poll for dynamic content', async ({ page }) => {
    await page.goto('https://playwright.dev');
    await page.waitForLoadState('networkidle');
    
    // Poll until page title is loaded
    await poll(
      async () => {
        const title = await page.title();
        return title.length > 0;
      },
      {
        timeout: 5000,
        interval: 100
      }
    );
    
    
    console.log('Page title loaded');
  });

  test('Poll for multiple conditions', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Poll until both nav and main are visible
    await poll(
      async () => {
        const nav = page.locator('nav').first();
        const main = page.locator('main').first();
        
        const navVisible = await nav.count() > 0;
        const mainVisible = await main.count() > 0;
        
        return navVisible && mainVisible;
      },
      {
        timeout: 5000,
        interval: 100
      }
    );
    
    
    console.log('All required elements visible');
  });

  test('Poll with return value', async () => {
    let value = 0;
    
    const result = await poll(
      async () => {
        value += 10;
        return value >= 50;
      },
      {
        timeout: 5000,
        interval: 100
      }
    );
    
    expect(result).toBeTruthy();
    expect(value).toBeGreaterThanOrEqual(50);
    console.log(`Final value: ${value}`);
  });

  test('Poll for text content', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Poll until specific text appears
    await poll(
      async () => {
        const content = await page.content();
        return content.includes('Playwright');
      },
      {
        timeout: 5000,
        interval: 100
      }
    );
    
    
    console.log('Expected text found');
  });

  test('Poll with exponential backoff simulation', async () => {
    let attempts = 0;
    const intervals = [100, 200, 400, 800];
    
    for (const interval of intervals) {
      const result = await poll(
        async () => {
          attempts++;
          return attempts >= 2;
        },
        {
          timeout: 5000,
          interval: interval
        }
      );
      
      if (result) break;
    }
    
    expect(attempts).toBeGreaterThan(0);
    console.log(`Polling with varying intervals completed: ${attempts} attempts`);
  });
});
