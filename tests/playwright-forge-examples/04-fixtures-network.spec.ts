import { test, expect } from '@playwright/test';
import { networkFixture } from 'playwright-forge';

// Extend base test with network fixture
const networkTest = test.extend(networkFixture.fixtures);

test.describe('Network Fixture Examples', () => {
  test('Mock API response', async ({ network, page }) => {
    // Mock a specific API endpoint
    await network.mockRoute('**/api/data', {
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ mocked: true, data: 'test data' })
    });

    // When the page makes a request to /api/data, it will get the mocked response
    await page.goto('https://playwright.dev');
    
    console.log('Network mock configured');
  });

  test('Mock multiple endpoints', async ({ network, page }) => {
    // Mock user endpoint
    await network.mockRoute('**/api/user', {
      status: 200,
      body: JSON.stringify({ id: 1, name: 'Test User' })
    });

    // Mock posts endpoint
    await network.mockRoute('**/api/posts', {
      status: 200,
      body: JSON.stringify([
        { id: 1, title: 'First Post' },
        { id: 2, title: 'Second Post' }
      ])
    });

    await page.goto('https://playwright.dev');
    
    console.log('Multiple network mocks configured');
  });

  test('Intercept and modify request', async ({ network, page }) => {
    // Intercept requests and modify them
    await page.route('**/*', async (route) => {
      const request = route.request();
      
      // Modify headers
      const headers = {
        ...request.headers(),
        'X-Custom-Header': 'Test-Value'
      };
      
      await route.continue({ headers });
    });

    await page.goto('https://playwright.dev');
    
    console.log('Request interception configured');
  });

  test('Block specific resources', async ({ page }) => {
    // Block images and stylesheets to speed up test
    await page.route('**/*', async (route) => {
      const request = route.request();
      const resourceType = request.resourceType();
      
      if (resourceType === 'image' || resourceType === 'stylesheet') {
        await route.abort();
      } else {
        await route.continue();
      }
    });

    await page.goto('https://playwright.dev');
    
    console.log('Resource blocking configured');
  });

  test('Monitor network activity', async ({ page }) => {
    const requests: string[] = [];
    const responses: string[] = [];

    // Monitor all requests
    page.on('request', request => {
      requests.push(request.url());
    });

    // Monitor all responses
    page.on('response', response => {
      responses.push(`${response.status()} ${response.url()}`);
    });

    await page.goto('https://playwright.dev');
    await page.waitForLoadState('networkidle');

    console.log(`Captured ${requests.length} requests`);
    console.log(`Captured ${responses.length} responses`);
    
    expect(requests.length).toBeGreaterThan(0);
    expect(responses.length).toBeGreaterThan(0);
  });

  test('Wait for specific API call', async ({ page }) => {
    // Wait for a specific API call to complete
    const responsePromise = page.waitForResponse(
      response => response.url().includes('playwright.dev') && response.status() === 200
    );

    await page.goto('https://playwright.dev');
    
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    
    console.log('Waited for specific API response:', response.url());
  });
});
