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
  stableFill,
  FileAssertions
} from 'playwright-forge';

// Combine multiple fixtures
const combinedTest = test
  .extend(apiFixture.fixtures)
  .extend(cleanupFixture.fixtures)
  .extend(diagnosticsFixture.fixtures);

test.describe('Combined playwright-forge Features', () => {
  combinedTest('Complete workflow example', async ({ 
    api, 
    cleanup, 
    diagnostics, 
    page 
  }) => {
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
    console.log('API response validated');
    
    // 4. Register cleanup task
    cleanup.addTask(async () => {
      console.log('Cleanup: Would delete user', createdUser.id);
      // In real scenario: await api.delete(`/users/${createdUser.id}`);
    });
    
    // 5. Navigate to website with page guard
    const guard = createPageGuard(page, { 
      debug: true,
      waitForNetworkIdle: true 
    });
    
    await page.goto('https://playwright.dev');
    await guard.waitForReady();
    
    // 6. Capture screenshot
    await diagnostics.captureScreenshot('user-workflow-homepage');
    
    // 7. Use soft assertions for multiple checks
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
    
    // 8. Use stable actions for interaction
    const searchButton = page.locator('button[class*="search"]').first();
    if (await searchButton.count() > 0) {
      await stableClick(page, 'button[class*="search"]', {
        maxRetries: 3,
        debug: true
      });
      
      await page.waitForTimeout(500);
      
      const searchInput = page.locator('input[type="search"]').first();
      if (await searchInput.count() > 0) {
        await stableFill(page, 'input[type="search"]', 'testing');
        
        // Capture another screenshot
        await diagnostics.captureScreenshot('user-workflow-search');
      }
    }
    
    console.log('Combined workflow completed successfully');
  });

  combinedTest('API testing with fixtures', async ({ api, diagnostics }) => {
    // Test multiple endpoints
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
      });
    }
    
    soft.verify();
    console.log('All API endpoints validated');
  });

  combinedTest('Data factory with API', async ({ api }) => {
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
    console.log(`Created ${users.length} test users`);
  });

  combinedTest('Full diagnostic capture', async ({ page, diagnostics, cleanup }) => {
    // Start trace
    await diagnostics.startTrace();
    
    // Perform actions
    await page.goto('https://playwright.dev');
    await diagnostics.captureScreenshot('step-1');
    
    await page.getByRole('link', { name: 'Docs' }).first().click();
    await page.waitForLoadState('networkidle');
    await diagnostics.captureScreenshot('step-2');
    
    // Stop trace
    await diagnostics.stopTrace('full-diagnostic-trace');
    
    // Capture final page content
    await diagnostics.capturePageContent('final-state');
    
    console.log('Full diagnostic capture completed');
  });

  combinedTest('Complex validation scenario', async ({ api, page }) => {
    // 1. API test with schema validation
    const response = await api.get('https://jsonplaceholder.typicode.com/posts/1');
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
    
    // 2. Use page guard for UI
    const guard = createPageGuard(page);
    await page.goto('https://playwright.dev');
    await guard.waitForReady();
    
    // 3. Soft assertions for UI elements
    const soft = softAssertions();
    
    await soft.assert(async () => {
      expect(await page.title()).toBeTruthy();
    });
    
    await soft.assert(async () => {
      const links = page.locator('a');
      expect(await links.count()).toBeGreaterThan(0);
    });
    
    soft.verify();
    
    console.log('Complex validation scenario completed');
  });
});

test.describe('Individual utility demonstrations', () => {
  test('All DataFactory methods', () => {
    console.log('DataFactory methods:');
    console.log('- user():', DataFactory.user());
    console.log('- email():', DataFactory.email());
    console.log('- phoneNumber():', DataFactory.phoneNumber());
    console.log('- firstName():', DataFactory.firstName());
    console.log('- lastName():', DataFactory.lastName());
    console.log('- company():', DataFactory.company());
    console.log('- jobTitle():', DataFactory.jobTitle());
    console.log('- address():', DataFactory.address());
    console.log('- randomString(10):', DataFactory.randomString(10));
    console.log('- randomNumber(1, 100):', DataFactory.randomNumber(1, 100));
    console.log('- boolean():', DataFactory.boolean());
    console.log('- date():', DataFactory.date());
  });

  test('JSON Schema validation patterns', () => {
    console.log(`
JSON Schema Validation Patterns:

1. Simple object validation
2. Array validation
3. Nested objects
4. String constraints (minLength, maxLength, pattern)
5. Number constraints (minimum, maximum)
6. Enum validation
7. Required vs optional fields
8. Type checking (string, number, boolean, array, object)
    `);
  });

  test('Available fixtures summary', () => {
    console.log(`
Available playwright-forge Fixtures:

1. apiFixture - Provides configured API request context
2. cleanupFixture - Manages cleanup tasks after tests
3. diagnosticsFixture - Screenshots, traces, page content capture
4. networkFixture - Network mocking and monitoring
5. authFixture - Authentication helpers (requires configuration)

Usage:
  const test = apiFixture
    .extend(cleanupFixture.fixtures)
    .extend(diagnosticsFixture.fixtures);
    `);
  });
});
