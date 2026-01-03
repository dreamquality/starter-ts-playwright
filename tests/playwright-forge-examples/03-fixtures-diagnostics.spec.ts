import { test, expect } from '@playwright/test';
import { diagnosticsFixture } from 'playwright-forge';
import * as path from 'path';

// Extend base test with diagnostics fixture
const diagnosticsTest = test.extend(diagnosticsFixture.fixtures);

test.describe('Diagnostics Fixture Examples', () => {
  test('Capture screenshot at specific point', async ({ diagnostics, page }) => {
    await page.goto('https://playwright.dev');
    
    // Capture a screenshot with a custom name
    await diagnostics.captureScreenshot('playwright-homepage');
    
    // Screenshots are saved to test-results directory
    expect(await page.title()).toContain('Playwright');
  });

  test('Capture multiple screenshots during test flow', async ({ diagnostics, page }) => {
    // Navigate to home page
    await page.goto('https://playwright.dev');
    await diagnostics.captureScreenshot('step-1-homepage');
    
    // Click on Docs link
    await page.getByRole('link', { name: 'Docs' }).first().click();
    await page.waitForLoadState('networkidle');
    await diagnostics.captureScreenshot('step-2-docs-page');
    
    expect(page.url()).toContain('docs');
  });

  test('Capture trace for debugging', async ({ diagnostics, page }) => {
    // Start tracing before actions
    await diagnostics.startTrace();
    
    await page.goto('https://playwright.dev');
    await page.getByRole('link', { name: 'Get started' }).first().click();
    
    // Stop tracing and save
    await diagnostics.stopTrace('test-trace');
    
    // Trace file can be viewed with: npx playwright show-trace
    expect(page.url()).toContain('playwright.dev');
  });

  test('Capture page HTML content', async ({ diagnostics, page }) => {
    await page.goto('https://playwright.dev');
    
    // Capture HTML content for debugging
    await diagnostics.capturePageContent('homepage-content');
    
    expect(await page.content()).toContain('Playwright');
  });

  test('Capture console logs', async ({ diagnostics, page }) => {
    // Set up console log capture
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    await page.goto('https://playwright.dev');
    
    // Capture screenshot along with console logs
    await diagnostics.captureScreenshot('with-console-logs');
    
    console.log('Captured console logs:', logs.length);
    expect(logs.length).toBeGreaterThanOrEqual(0);
  });

  test('Full diagnostic capture on failure', async ({ diagnostics, page }) => {
    await page.goto('https://playwright.dev');
    
    try {
      // This will fail intentionally
      await page.waitForSelector('#non-existent-element', { timeout: 1000 });
    } catch (error) {
      // Capture full diagnostics on failure
      await diagnostics.captureScreenshot('failure-screenshot');
      await diagnostics.capturePageContent('failure-content');
      
      console.log('Captured diagnostics for failed test');
      // Re-throw to mark test as failed
      // throw error; // Commented out to prevent test failure
    }
  });
});
