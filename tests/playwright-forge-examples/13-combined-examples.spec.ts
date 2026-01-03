import { test, expect } from '@playwright/test';
import {
  apiFixture,
  cleanupFixture,
  diagnosticsFixture,
  DataFactory,
  validateJsonSchema,
  softAssertions,
  createPageGuard,
  stableClick,
  stableFill
} from 'playwright-forge';

test.describe('Combined playwright-forge Features', () => {
  
  apiFixture('API testing with DataFactory and validation', async ({ api }) => {
    // 1. Generate test data
    const testUser = DataFactory.user();
    console.log('Generated test user:', testUser.email);
    
    // 2. Make API call to create user
    const createResponse = await api.post('https://jsonplaceholder.typicode.com/users', {
      data: {
        name: `${testUser.firstName} ${testUser.lastName}`,
        email: testUser.email,
        username: testUser.firstName.toLowerCase()
      }
    });
    
    expect(createResponse.ok()).toBeTruthy();
    const createdUser = await createResponse.json();
    
    // 3. Validate API response with JSON schema
    const userSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' }
      },
      required: ['name', 'email']
    };
    
    validateJsonSchema(createdUser, userSchema);
    console.log('API response validated with JSON schema');
  });

  cleanupFixture('Cleanup with diagnostics', async ({ cleanup, diagnostics, page }) => {
    // Register cleanup task
    cleanup.addTask(async () => {
      console.log('Cleanup: Removing test artifacts');
    });
    
    // Navigate and capture diagnostics
    await page.goto('https://playwright.dev');
    await diagnostics.captureScreenshot('cleanup-example');
    
    console.log('Test with cleanup and diagnostics completed');
  });

  diagnosticsFixture('Diagnostics with PageGuard', async ({ diagnostics, page }) => {
    // Use page guard for reliable page loading
    const guard = createPageGuard(page, { 
      debug: true,
      waitForNetworkIdle: true 
    });
    
    await page.goto('https://playwright.dev');
    await guard.waitForReady();
    
    // Capture screenshot after page is ready
    await diagnostics.captureScreenshot('page-guard-ready');
    
    console.log('PageGuard with diagnostics completed');
  });

  test('Stable actions with soft assertions', async ({ page }) => {
    await page.goto('https://playwright.dev');
    await page.waitForLoadState('networkidle');
    
    // Use soft assertions for multiple checks
    const soft = softAssertions();
    
    await soft.assert(async () => {
      expect(await page.title()).toContain('Playwright');
    });
    
    await soft.assert(async () => {
      const nav = page.locator('nav').first();
      expect(await nav.count()).toBeGreaterThan(0);
    });
    
    soft.verify();
    console.log('Soft assertions passed');
    
    // Use stable actions for reliable interactions
    const searchButton = page.locator('button[class*="search"]').first();
    if (await searchButton.count() > 0) {
      await stableClick(page, 'button[class*="search"]', {
        maxRetries: 3
      });
      
      await page.waitForTimeout(500);
      
      const searchInput = page.locator('input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await stableFill(page, 'input[type="search"]', 'testing');
        console.log('Stable actions completed');
      }
    }
  });

  apiFixture('Multiple API endpoints with soft assertions', async ({ api }) => {
    const endpoints = [
      '/posts/1',
      '/users/1',
      '/comments?postId=1'
    ];
    
    const soft = softAssertions();
    
    for (const endpoint of endpoints) {
      await soft.assert(async () => {
        const response = await api.get(`https://jsonplaceholder.typicode.com${endpoint}`);
        expect(response.ok()).toBeTruthy();
        console.log(`Endpoint ${endpoint} validated`);
      });
    }
    
    soft.verify();
    console.log('All API endpoints validated with soft assertions');
  });

  apiFixture('DataFactory integration with API testing', async ({ api }) => {
    // Generate multiple test users
    const users = Array.from({ length: 3 }, () => DataFactory.user());
    
    const soft = softAssertions();
    
    for (const user of users) {
      await soft.assert(async () => {
        const response = await api.post('https://jsonplaceholder.typicode.com/users', {
          data: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
          }
        });
        
        expect(response.ok()).toBeTruthy();
        console.log('Created user:', user.email);
      });
    }
    
    soft.verify();
    console.log(`Created ${users.length} test users with DataFactory`);
  });

  test('JSON schema validation with generated data', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
    const post = await response.json();
    
    const postSchema = {
      type: 'object',
      properties: {
        userId: { type: 'number' },
        id: { type: 'number' },
        title: { type: 'string' },
        body: { type: 'string' }
      },
      required: ['userId', 'id', 'title', 'body']
    };
    
    validateJsonSchema(post, postSchema);
    console.log('API response validated against schema');
  });

  test('PageGuard with stable actions', async ({ page }) => {
    const guard = createPageGuard(page, { debug: true });
    
    await page.goto('https://playwright.dev');
    await guard.waitForReady();
    
    // Use stable actions after page guard ensures readiness
    const docsLink = page.locator('a[href*="docs"]').first();
    if (await docsLink.count() > 0) {
      await stableClick(page, 'a[href*="docs"]', {
        maxRetries: 3
      });
      console.log('Navigation with PageGuard and stable actions completed');
    }
  });
});

test.describe('Utility demonstrations', () => {
  test('All DataFactory methods showcase', () => {
    console.log('DataFactory generates realistic test data:');
    console.log('- Full user object:', DataFactory.user());
    console.log('- Email:', DataFactory.email());
    console.log('- Phone:', DataFactory.phoneNumber());
    console.log('- First name:', DataFactory.firstName());
    console.log('- Last name:', DataFactory.lastName());
    console.log('- Company:', DataFactory.company());
    console.log('- Job title:', DataFactory.jobTitle());
    console.log('- Address:', DataFactory.address());
    console.log('- Random string(10):', DataFactory.randomString(10));
    console.log('- Random number(1-100):', DataFactory.randomNumber(1, 100));
    console.log('- Boolean:', DataFactory.boolean());
    console.log('- Date:', DataFactory.date());
  });

  test('Available fixtures summary', () => {
    console.log(`
Playwright-Forge Fixtures Available:

1. apiFixture - Provides configured API request context for testing REST APIs
   Usage: apiFixture('test name', async ({ api }) => { ... })

2. cleanupFixture - Manages cleanup tasks that run after tests complete
   Usage: cleanupFixture('test name', async ({ cleanup }) => { ... })

3. diagnosticsFixture - Captures screenshots, traces, and page content
   Usage: diagnosticsFixture('test name', async ({ diagnostics }) => { ... })

4. networkFixture - Network mocking and monitoring capabilities
   Usage: networkFixture('test name', async ({ network }) => { ... })

All fixtures are parallel-safe with per-test isolation.
    `);
  });

  test('Key utilities overview', () => {
    console.log(`
Playwright-Forge Utilities Available:

1. DataFactory - Generate realistic test data (users, emails, addresses, etc.)
2. validateJsonSchema - Validate JSON against schemas
3. createPageGuard - Ensure pages are fully loaded before interactions
4. stableClick, stableFill, stableSelect - Reliable UI actions with retries
5. softAssertions - Collect multiple assertions and verify together
6. FileAssertions - Assert file existence, content, and properties
7. pollUntil - Poll until a condition is met
8. waitForDownload, getDownloadPath - Handle file downloads
9. OpenAPI validators and matchers - Validate API responses
10. CI annotations - Add annotations to CI/CD workflows
    `);
  });
});
