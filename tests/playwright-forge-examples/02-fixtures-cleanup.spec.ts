import { test, expect } from '@playwright/test';
import { cleanupFixture } from 'playwright-forge';

// Extend base test with cleanup fixture
const cleanupTest = test.extend(cleanupFixture.fixtures);

test.describe('Cleanup Fixture Examples', () => {
  test('Cleanup after test - basic example', async ({ cleanup, page }) => {
    // Register cleanup task to be executed after test
    cleanup.addTask(async () => {
      console.log('Cleanup task executed: closing resources');
    });

    await page.goto('https://playwright.dev');
    expect(await page.title()).toContain('Playwright');
    
    // Cleanup will automatically run after test completes
  });

  test('Multiple cleanup tasks in order', async ({ cleanup, page }) => {
    const logs: string[] = [];

    // Cleanup tasks are executed in LIFO order (last in, first out)
    cleanup.addTask(async () => {
      logs.push('Task 1 cleanup');
      console.log('Task 1 cleanup');
    });

    cleanup.addTask(async () => {
      logs.push('Task 2 cleanup');
      console.log('Task 2 cleanup');
    });

    cleanup.addTask(async () => {
      logs.push('Task 3 cleanup');
      console.log('Task 3 cleanup');
    });

    await page.goto('https://playwright.dev');
    
    // All cleanup tasks will execute automatically after test
    // Expected order: Task 3, Task 2, Task 1
  });

  test('Cleanup with resource management', async ({ cleanup, page }) => {
    const tempData = {
      id: Date.now(),
      name: 'Temporary Resource'
    };

    console.log('Created temporary resource:', tempData);

    // Register cleanup to remove temporary data
    cleanup.addTask(async () => {
      console.log('Cleaning up temporary resource:', tempData.id);
      // In real scenario, you would delete from database or filesystem
    });

    await page.goto('https://playwright.dev');
    expect(await page.title()).toBeTruthy();
  });

  test('Cleanup with error handling', async ({ cleanup, page }) => {
    cleanup.addTask(async () => {
      try {
        // Simulating cleanup that might fail
        console.log('Attempting cleanup operation');
        // In real scenario, this could be API call or file deletion
      } catch (error) {
        console.error('Cleanup failed:', error);
        // Cleanup fixture handles errors gracefully
      }
    });

    await page.goto('https://playwright.dev');
  });
});
