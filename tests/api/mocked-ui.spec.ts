import { test } from '@playwright/test';
import { MockHelper } from '../../api/mocks/mock-helper';
import { User } from '../../api/schemas/user-schema';
import { Post } from '../../api/schemas/post-schema';

/**
 * Example: UI Tests with Mocked API Responses
 * Demonstrates how to mock API calls in UI tests to simulate specific backend states
 */

test.describe('UI Tests with API Mocking', () => {
  
  test('Mock users API - load from JSON file', async ({ page }) => {
    // Load mock data from JSON file
    const mockUsers = MockHelper.loadMockData<User[]>('users.json');
    
    // Mock the API endpoint
    await MockHelper.mockPageRoute(
      page,
      '**/api/users',
      mockUsers,
      200
    );
    
    // Your UI test logic here
    // The page will receive mocked user data when calling /api/users
    console.log('Mocked users loaded:', mockUsers.length);
  });

  test('Mock posts API - with custom data', async ({ page }) => {
    const mockPosts: Post[] = [
      {
        id: 1,
        userId: 1,
        title: 'Mocked Post Title',
        body: 'This is a mocked post body'
      }
    ];
    
    // Mock the API endpoint with custom data
    await MockHelper.mockPageRoute(
      page,
      '**/api/posts',
      mockPosts,
      200
    );
    
    console.log('Mocked posts loaded:', mockPosts.length);
  });

  test('Mock API error response', async ({ page }) => {
    // Mock an error response
    await MockHelper.mockErrorResponse(
      page,
      '**/api/users',
      'Internal Server Error',
      500
    );
    
    // Your UI test can now verify error handling
    console.log('Error response mocked');
  });

  test('Mock network failure', async ({ page }) => {
    // Simulate network failure
    await MockHelper.mockNetworkFailure(
      page,
      '**/api/users'
    );
    
    // Your UI test can verify offline behavior
    console.log('Network failure mocked');
  });

  test('Mock delayed API response', async ({ page }) => {
    const mockUsers = MockHelper.loadMockData<User[]>('users.json');
    
    // Mock a delayed response (3 seconds)
    await MockHelper.mockDelayedResponse(
      page,
      '**/api/users',
      mockUsers,
      3000,
      200
    );
    
    // Your UI test can verify loading states
    console.log('Delayed response mocked');
  });

  test('Mock with dynamic data generator', async ({ page }) => {
    // Mock with a function that generates data
    await MockHelper.mockWithGenerator(
      page,
      '**/api/users',
      () => {
        return [
          {
            id: Math.floor(Math.random() * 1000),
            name: `User ${Date.now()}`,
            username: `user_${Date.now()}`,
            email: `user${Date.now()}@example.com`,
            phone: '123-456-7890',
            website: 'example.com',
            address: {
              street: 'Main St',
              suite: 'Apt 1',
              city: 'Anytown',
              zipcode: '12345',
              geo: { lat: '0', lng: '0' }
            },
            company: {
              name: 'Test Company',
              catchPhrase: 'Testing rocks',
              bs: 'test test test'
            }
          }
        ];
      },
      200
    );
    
    console.log('Dynamic data generator mocked');
  });

  test('Mock specific HTTP method', async ({ page }) => {
    const mockUsers = MockHelper.loadMockData<User[]>('users.json');
    
    // Only mock POST requests, let GET requests go through
    await MockHelper.mockByMethod(
      page,
      '**/api/users',
      'POST',
      { id: 999, message: 'User created successfully' },
      201
    );
    
    console.log('POST method mocked');
  });

  test('Combine multiple mocks', async ({ page }) => {
    const mockUsers = MockHelper.loadMockData<User[]>('users.json');
    const mockPosts = MockHelper.loadMockData<Post[]>('posts.json');
    
    // Mock multiple endpoints
    await MockHelper.mockPageRoute(page, '**/api/users', mockUsers, 200);
    await MockHelper.mockPageRoute(page, '**/api/posts', mockPosts, 200);
    
    // Mock specific user endpoint
    await MockHelper.mockPageRoute(
      page,
      '**/api/users/1',
      mockUsers[0],
      200
    );
    
    console.log('Multiple mocks combined');
  });

  test('Remove mocks after test', async ({ page }) => {
    const mockUsers = MockHelper.loadMockData<User[]>('users.json');
    
    // Set up mock
    await MockHelper.mockPageRoute(page, '**/api/users', mockUsers, 200);
    
    // Use the mock
    console.log('Mock active');
    
    // Remove all mocks
    await MockHelper.removePageMocks(page);
    
    // Now API calls will go through normally
    console.log('Mocks removed');
  });
});

/**
 * Example: Context-level mocking (affects all pages in the test)
 */
test.describe('Context-level API Mocking', () => {
  
  test('Mock at context level', async ({ context, page }) => {
    const mockUsers = MockHelper.loadMockData<User[]>('users.json');
    
    // Mock at context level - affects all pages
    await MockHelper.mockContextRoute(
      context,
      '**/api/users',
      mockUsers,
      200
    );
    
    // This mock will apply to the current page and any new pages opened
    console.log('Context-level mock set');
    
    // Open multiple pages - all will use the same mock
    const page2 = await context.newPage();
    
    // Both pages will receive mocked data
    await page2.close();
  });
});
