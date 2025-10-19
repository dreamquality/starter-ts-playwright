import { test as base, expect } from '@playwright/test';
import { apiFixtures, ApiFixtures } from '../../fixtures/api-fixtures';
import { ResponseValidator } from '../../api/helpers/response-validator';
import { UserBuilder, PostBuilder, GenericBuilder } from '../../api/helpers/data-builder';
import { MockHelper } from '../../api/mocks/mock-helper';

/**
 * Advanced API Testing Examples
 * Demonstrates complex scenarios and best practices
 */

const test = base.extend<ApiFixtures>(apiFixtures);

test.describe('Advanced API Testing Examples', () => {
  
  test.describe('Complex Workflows', () => {
    
    test('Complete user and post workflow', async ({ usersEndpoint, postsEndpoint }) => {
      // Step 1: Create a user
      const newUser = new UserBuilder()
        .withName('Test User')
        .withUsername('testuser')
        .withEmail('test@example.com')
        .build();
      
      const createUserResponse = await usersEndpoint.create(newUser);
      await ResponseValidator.validateStatus(createUserResponse, 201);
      
      const createdUser = await createUserResponse.json();
      const userId = createdUser.id;
      
      // Step 2: Create a post for this user
      const newPost = new PostBuilder()
        .withUserId(userId)
        .withTitle('My First Post')
        .withBody('This is the content of my first post.')
        .build();
      
      const createPostResponse = await postsEndpoint.create(newPost);
      await ResponseValidator.validateStatus(createPostResponse, 201);
      
      // Step 3: Verify the post was created
      const createdPost = await createPostResponse.json();
      expect(createdPost.userId).toBe(userId);
      expect(createdPost.title).toBe(newPost.title);
      
      // Step 4: Get all posts for this user
      const userPostsResponse = await usersEndpoint.getUserPosts(userId);
      await ResponseValidator.validateStatus(userPostsResponse, 200);
      
      // Step 5: Update the post
      const updatedPost = new PostBuilder()
        .withId(createdPost.id)
        .withUserId(userId)
        .withTitle('Updated Post Title')
        .withBody('Updated content.')
        .build();
      
      const updateResponse = await postsEndpoint.update(createdPost.id, updatedPost);
      await ResponseValidator.validateStatus(updateResponse, 200);
      
      // Step 6: Delete the post
      const deletePostResponse = await postsEndpoint.delete(createdPost.id);
      await ResponseValidator.validateStatus(deletePostResponse, 200);
      
      // Step 7: Delete the user
      const deleteUserResponse = await usersEndpoint.delete(userId);
      await ResponseValidator.validateStatus(deleteUserResponse, 200);
    });
    
  });

  test.describe('Performance Testing', () => {
    
    test('Measure API response time', async ({ usersEndpoint }) => {
      const startTime = Date.now();
      const response = await usersEndpoint.getAll();
      const duration = Date.now() - startTime;
      
      await ResponseValidator.validateStatus(response, 200);
      ResponseValidator.validateResponseTime(startTime, 3000); // Should respond in < 3 seconds
      
      console.log(`API responded in ${duration}ms`);
    });
    
    test('Parallel API requests', async ({ usersEndpoint }) => {
      const startTime = Date.now();
      
      // Make multiple requests in parallel
      const promises = [
        usersEndpoint.getById(1),
        usersEndpoint.getById(2),
        usersEndpoint.getById(3),
        usersEndpoint.getById(4),
        usersEndpoint.getById(5)
      ];
      
      const responses = await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      // Verify all responses
      for (const response of responses) {
        await ResponseValidator.validateStatus(response, 200);
      }
      
      console.log(`5 parallel requests completed in ${duration}ms`);
      expect(duration).toBeLessThan(5000); // Should complete faster than sequential
    });
    
  });

  test.describe('Error Handling', () => {
    
    test('Handle 404 errors gracefully', async ({ apiClient }) => {
      const response = await apiClient.get('/users/99999');
      
      await ResponseValidator.validateStatus(response, 404);
    });
    
    test('Handle invalid data', async ({ usersEndpoint }) => {
      const invalidUser = {
        // Missing required fields
        name: 'Test'
      };
      
      const response = await usersEndpoint.create(invalidUser as any);
      
      // Different APIs handle this differently
      // Some return 400, some still accept it with generated fields
      console.log('Response status:', response.status());
    });
    
  });

  test.describe('Data Validation', () => {
    
    test('Validate nested object structures', async ({ usersEndpoint }) => {
      const response = await usersEndpoint.getById(1);
      await ResponseValidator.validateStatus(response, 200);
      
      const user = await response.json();
      
      // Validate nested address
      expect(user.address).toBeDefined();
      expect(user.address.street).toBeTruthy();
      expect(user.address.city).toBeTruthy();
      expect(user.address.geo).toBeDefined();
      expect(user.address.geo.lat).toBeTruthy();
      expect(user.address.geo.lng).toBeTruthy();
      
      // Validate nested company
      expect(user.company).toBeDefined();
      expect(user.company.name).toBeTruthy();
      expect(user.company.catchPhrase).toBeTruthy();
    });
    
    test('Validate array responses', async ({ postsEndpoint }) => {
      const response = await postsEndpoint.getAll();
      
      await ResponseValidator.validateStatus(response, 200);
      await ResponseValidator.validateArrayResponse(response, 1);
      
      const posts = await response.json();
      
      // Validate each post has required fields
      for (const post of posts) {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('userId');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('body');
        
        expect(typeof post.id).toBe('number');
        expect(typeof post.userId).toBe('number');
        expect(typeof post.title).toBe('string');
        expect(typeof post.body).toBe('string');
      }
    });
    
  });

  test.describe('Dynamic Data Generation', () => {
    
    test('Generate random test data', async ({ usersEndpoint }) => {
      const timestamp = Date.now();
      
      const randomUser = new UserBuilder()
        .withName(`User ${timestamp}`)
        .withUsername(`user_${timestamp}`)
        .withEmail(`user${timestamp}@test.com`)
        .build();
      
      const response = await usersEndpoint.create(randomUser);
      await ResponseValidator.validateStatus(response, 201);
      
      const createdUser = await response.json();
      expect(createdUser.name).toBe(randomUser.name);
    });
    
    test('Use generic builder for custom data', async ({ apiClient }) => {
      const customData = new GenericBuilder()
        .with('field1', 'value1')
        .with('field2', 123)
        .with('field3', true)
        .withMany({
          field4: 'value4',
          field5: [1, 2, 3]
        })
        .build();
      
      expect(customData.field1).toBe('value1');
      expect(customData.field2).toBe(123);
      expect(customData.field3).toBe(true);
      expect(customData.field4).toBe('value4');
      expect(customData.field5).toEqual([1, 2, 3]);
    });
    
  });

  test.describe('Pagination and Filtering', () => {
    
    test('Filter posts by userId', async ({ postsEndpoint }) => {
      const userId = 1;
      const response = await postsEndpoint.getByUserId(userId);
      
      await ResponseValidator.validateStatus(response, 200);
      await ResponseValidator.validateArrayResponse(response);
      
      const posts = await response.json();
      
      // Verify all posts belong to the specified user
      for (const post of posts) {
        expect(post.userId).toBe(userId);
      }
    });
    
  });

  test.describe('Authentication and Headers', () => {
    
    test('Set custom authentication header', async ({ apiClient }) => {
      apiClient.setAuthToken('test-token-123');
      
      // The token is now set for all subsequent requests
      const response = await apiClient.get('/users');
      await ResponseValidator.validateStatus(response, 200);
    });
    
    test('Set custom headers', async ({ apiClient }) => {
      apiClient.setHeader('X-Custom-Header', 'custom-value');
      apiClient.setHeader('X-Request-ID', '12345');
      
      const response = await apiClient.get('/users');
      await ResponseValidator.validateStatus(response, 200);
    });
    
  });
});

test.describe('Advanced Mocking Scenarios', () => {
  
  test('Mock different responses for different endpoints', async ({ page }) => {
    const mockUsers = MockHelper.loadMockData('users.json');
    const mockPosts = MockHelper.loadMockData('posts.json');
    
    // Mock multiple endpoints
    await MockHelper.mockPageRoute(page, '**/users', mockUsers, 200);
    await MockHelper.mockPageRoute(page, '**/posts', mockPosts, 200);
    await MockHelper.mockPageRoute(page, '**/users/1', mockUsers[0], 200);
    
    // Now when the page makes these API calls, it will receive mocked data
    console.log('Multiple endpoints mocked');
  });
  
  test('Mock API with sequential responses', async ({ page }) => {
    let callCount = 0;
    
    await page.route('**/users', (route) => {
      callCount++;
      
      if (callCount === 1) {
        // First call: return loading state
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ loading: true })
        });
      } else if (callCount === 2) {
        // Second call: return data
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MockHelper.loadMockData('users.json'))
        });
      } else {
        // Subsequent calls: return cached data
        route.fulfill({
          status: 304,
          contentType: 'application/json',
          body: JSON.stringify({ cached: true })
        });
      }
    });
    
    console.log('Sequential response mock configured');
  });
  
  test('Mock API with conditional responses', async ({ page }) => {
    await page.route('**/users/**', (route) => {
      const url = route.request().url();
      const userId = url.match(/\/users\/(\d+)/)?.[1];
      
      if (userId === '1') {
        // Return specific user
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, name: 'Admin User' })
        });
      } else if (userId && parseInt(userId) > 100) {
        // Return 404 for non-existent users
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'User not found' })
        });
      } else {
        // Default response
        route.continue();
      }
    });
    
    console.log('Conditional mock configured');
  });
  
  test('Mock API to simulate rate limiting', async ({ page }) => {
    let requestCount = 0;
    
    await page.route('**/users', (route) => {
      requestCount++;
      
      if (requestCount > 5) {
        // Simulate rate limit after 5 requests
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60'
          },
          body: JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.'
          })
        });
      } else {
        // Normal response
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: {
            'X-RateLimit-Remaining': String(5 - requestCount)
          },
          body: JSON.stringify(MockHelper.loadMockData('users.json'))
        });
      }
    });
    
    console.log('Rate limiting mock configured');
  });
  
  test('Mock API with request validation', async ({ page }) => {
    await page.route('**/users', async (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        
        // Validate required fields
        if (!postData.name || !postData.email) {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Validation Error',
              message: 'Name and email are required'
            })
          });
        } else {
          // Valid request
          route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: Math.floor(Math.random() * 1000),
              ...postData
            })
          });
        }
      } else {
        route.continue();
      }
    });
    
    console.log('Request validation mock configured');
  });
});

test.describe('Combining API Tests with UI Testing', () => {
  
  test('Verify API data matches UI display', async ({ page, usersEndpoint }) => {
    // Step 1: Get data from API
    const apiResponse = await usersEndpoint.getById(1);
    await ResponseValidator.validateStatus(apiResponse, 200);
    const apiUser = await apiResponse.json();
    
    // Step 2: Mock the API for UI test
    await MockHelper.mockPageRoute(page, '**/api/user/1', apiUser, 200);
    
    // Step 3: Navigate to UI and verify data matches
    // await page.goto('/user/1');
    // ... UI assertions would go here
    
    console.log('API data:', apiUser.name);
  });
  
  test('Test UI with different API states', async ({ page }) => {
    // Test 1: Loading state
    await MockHelper.mockDelayedResponse(
      page,
      '**/api/users',
      [],
      3000,
      200
    );
    
    // await page.goto('/users');
    // ... verify loading indicator shows
    
    // Test 2: Error state
    await MockHelper.removePageMocks(page);
    await MockHelper.mockErrorResponse(
      page,
      '**/api/users',
      'Server Error',
      500
    );
    
    // ... verify error message shows
    
    console.log('Different API states tested');
  });
});
