import { test, expect } from '@playwright/test';
import { createPageGuard } from 'playwright-forge';

test.describe('PageGuard Utility Examples', () => {
  test('Basic page guard - wait for ready', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Create page guard and wait for page to be fully ready
    const guard = createPageGuard(page);
    await guard.waitForReady();
    
    console.log('Page is fully ready');
    expect(await page.title()).toContain('Playwright');
  });

  test('Page guard with custom configuration', async ({ page }) => {
    const guard = createPageGuard(page, {
      timeout: 10000,
      interval: 100,
      mode: 'strict',
      debug: true
    });
    
    await page.goto('https://playwright.dev');
    await guard.waitForReady();
    
    console.log('Page ready with custom config');
  });

  test('Wait for component with specific conditions', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const guard = createPageGuard(page);
    await guard.waitForReady();
    
    // Wait for specific component to be visible
    await guard.waitForComponent([
      { selector: 'nav', state: 'visible' },
      { selector: 'main', state: 'visible' }
    ]);
    
    console.log('Required components are visible');
  });

  test('Safe click with page guard', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const guard = createPageGuard(page, {
      retryCount: 3,
      retryInterval: 1000
    });
    
    await guard.waitForReady();
    
    // Click with automatic retry
    const docsLink = page.getByRole('link', { name: 'Docs' }).first();
    if (await docsLink.count() > 0) {
      await guard.click('a[href*="docs"]');
      console.log('Clicked with page guard');
    }
  });

  test('Safe fill with page guard', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const guard = createPageGuard(page);
    await guard.waitForReady();
    
    // Check if search input exists
    const searchButton = page.locator('button[class*="search"]').first();
    if (await searchButton.count() > 0) {
      await searchButton.click();
      await page.waitForTimeout(500);
      
      const searchInput = page.locator('input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await guard.fill('input[type="search"]', 'testing');
        console.log('Filled input with page guard');
      }
    }
  });

  test('Wait for URL pattern', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const guard = createPageGuard(page);
    await guard.waitForReady();
    
    // Current URL should match pattern
    await guard.waitForUrl(/playwright.dev/);
    
    console.log('URL pattern matched');
  });

  test('Guard element before interaction', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const guard = createPageGuard(page);
    await guard.waitForReady();
    
    // Guard element ensures it's ready before interaction
    const navElement = await guard.guardElement('nav');
    expect(navElement).toBeTruthy();
    
    console.log('Element guarded and ready');
  });

  test('Wait for network idle with page guard', async ({ page }) => {
    const guard = createPageGuard(page, {
      waitForNetworkIdle: true,
      debug: true
    });
    
    await page.goto('https://playwright.dev');
    await guard.waitForReady();
    
    console.log('Page ready with network idle');
  });

  test('Tolerant mode - collect warnings', async ({ page }) => {
    const guard = createPageGuard(page, {
      mode: 'tolerant'
    });
    
    await page.goto('https://playwright.dev');
    await guard.waitForReady();
    
    // Get any warnings that occurred
    const warnings = guard.getWarnings();
    console.log('Warnings collected:', warnings.length);
    
    // Clear warnings
    guard.clearWarnings();
  });

  test('Verify page state', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const guard = createPageGuard(page);
    await guard.waitForReady();
    
    // Verify page state matches expectations
    await guard.verify({
      urlPattern: /playwright.dev/,
      titlePattern: /Playwright/
    });
    
    console.log('Page state verified');
  });

  test('Retry custom action', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const guard = createPageGuard(page, {
      retryCount: 3
    });
    
    await guard.waitForReady();
    
    // Retry custom action
    const title = await guard.retryAction(async () => {
      return await page.title();
    }, 'get page title');
    
    expect(title).toBeTruthy();
    console.log('Custom action completed with retry support');
  });
});
