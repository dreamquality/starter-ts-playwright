import { test as base } from '@playwright/test';
import { apiFixtures, ApiFixtures } from '../../fixtures/api-fixtures';
import { ResponseValidator } from '../../api/helpers/response-validator';
import { UserBuilder } from '../../api/helpers/data-builder';
import { userSchema } from '../../api/schemas/user-schema';

/**
 * Users API Tests
 * Tests for user management endpoints
 */

const test = base.extend<ApiFixtures>(apiFixtures);

test.describe('Users API', () => {
  
  test('GET /users - should return list of users', async ({ usersEndpoint }) => {
    const startTime = Date.now();
    const response = await usersEndpoint.getAll();
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateHeaders(response, {
      'content-type': /application\/json/
    });
    await ResponseValidator.validateArrayResponse(response, 1);
    ResponseValidator.validateResponseTime(startTime, 5000);
  });

  test('GET /users/:id - should return a specific user', async ({ usersEndpoint }) => {
    const userId = 1;
    const response = await usersEndpoint.getById(userId);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateBodyFields(response, ['id', 'name', 'email', 'username']);
    
    // Validate response body
    const user = await response.json();
    await ResponseValidator.validateBodyContains(response, { id: userId });
  });

  test('GET /users/:id - should validate user schema', async ({ usersEndpoint }) => {
    const userId = 1;
    const response = await usersEndpoint.getById(userId);
    
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateSchema(response, userSchema);
  });

  test('POST /users - should create a new user', async ({ usersEndpoint }) => {
    const newUser = new UserBuilder()
      .withName('John Doe')
      .withUsername('johndoe')
      .withEmail('john.doe@example.com')
      .build();
    
    const response = await usersEndpoint.create(newUser);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 201);
    await ResponseValidator.validateBodyFields(response, ['id']);
    
    // Validate created user data
    const createdUser = await response.json();
    await ResponseValidator.validateBodyContains(response, {
      name: newUser.name,
      username: newUser.username,
      email: newUser.email
    });
  });

  test('PUT /users/:id - should update a user', async ({ usersEndpoint }) => {
    const userId = 1;
    const updatedData = new UserBuilder()
      .withId(userId)
      .withName('Updated Name')
      .withEmail('updated@example.com')
      .build();
    
    const response = await usersEndpoint.update(userId, updatedData);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateBodyContains(response, {
      id: userId,
      name: updatedData.name
    });
  });

  test('PATCH /users/:id - should partially update a user', async ({ usersEndpoint }) => {
    const userId = 1;
    const partialUpdate = { name: 'Partially Updated Name' };
    
    const response = await usersEndpoint.partialUpdate(userId, partialUpdate);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateBodyContains(response, {
      id: userId,
      name: partialUpdate.name
    });
  });

  test('DELETE /users/:id - should delete a user', async ({ usersEndpoint }) => {
    const userId = 1;
    const response = await usersEndpoint.delete(userId);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
  });

  test('GET /users/:id - should return 404 for non-existent user', async ({ apiClient }) => {
    const nonExistentId = 99999;
    const response = await apiClient.get(`/users/${nonExistentId}`);
    
    await ResponseValidator.validateStatus(response, 404);
  });

  test('GET /users/:id/posts - should return user posts', async ({ usersEndpoint }) => {
    const userId = 1;
    const response = await usersEndpoint.getUserPosts(userId);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateArrayResponse(response);
    
    // Validate each post has required fields
    const posts = await response.json();
    if (posts.length > 0) {
      const firstPost = posts[0];
      await ResponseValidator.validateBodyContains(
        { json: async () => firstPost } as any,
        { userId: userId }
      );
    }
  });
});
