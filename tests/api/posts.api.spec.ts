import { test as base } from '@playwright/test';
import { apiFixtures, ApiFixtures } from '../../fixtures/api-fixtures';
import { ResponseValidator } from '../../api/helpers/response-validator';
import { PostBuilder } from '../../api/helpers/data-builder';
import { postSchema } from '../../api/schemas/post-schema';

/**
 * Posts API Tests
 * Tests for post management endpoints
 */

const test = base.extend<ApiFixtures>(apiFixtures);

test.describe('Posts API', () => {
  
  test('GET /posts - should return list of posts', async ({ postsEndpoint }) => {
    const startTime = Date.now();
    const response = await postsEndpoint.getAll();
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateHeaders(response, {
      'content-type': /application\/json/
    });
    await ResponseValidator.validateArrayResponse(response, 1);
    ResponseValidator.validateResponseTime(startTime, 5000);
  });

  test('GET /posts/:id - should return a specific post', async ({ postsEndpoint }) => {
    const postId = 1;
    const response = await postsEndpoint.getById(postId);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateBodyFields(response, ['id', 'userId', 'title', 'body']);
    await ResponseValidator.validateBodyContains(response, { id: postId });
  });

  test('GET /posts/:id - should validate post schema', async ({ postsEndpoint }) => {
    const postId = 1;
    const response = await postsEndpoint.getById(postId);
    
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateSchema(response, postSchema);
  });

  test('GET /posts?userId=:userId - should filter posts by user', async ({ postsEndpoint }) => {
    const userId = 1;
    const response = await postsEndpoint.getByUserId(userId);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateArrayResponse(response);
    
    // Validate all posts belong to the user
    const posts = await response.json();
    posts.forEach((post: any) => {
      if (post.userId !== userId) {
        throw new Error(`Expected userId ${userId}, but got ${post.userId}`);
      }
    });
  });

  test('POST /posts - should create a new post', async ({ postsEndpoint }) => {
    const newPost = new PostBuilder()
      .withUserId(1)
      .withTitle('Test Post Title')
      .withBody('This is a test post body content.')
      .build();
    
    const response = await postsEndpoint.create(newPost);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 201);
    await ResponseValidator.validateBodyFields(response, ['id']);
    
    // Validate created post data
    await ResponseValidator.validateBodyContains(response, {
      userId: newPost.userId,
      title: newPost.title,
      body: newPost.body
    });
  });

  test('PUT /posts/:id - should update a post', async ({ postsEndpoint }) => {
    const postId = 1;
    const updatedData = new PostBuilder()
      .withId(postId)
      .withUserId(1)
      .withTitle('Updated Post Title')
      .withBody('Updated post body content.')
      .build();
    
    const response = await postsEndpoint.update(postId, updatedData);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateBodyContains(response, {
      id: postId,
      title: updatedData.title,
      body: updatedData.body
    });
  });

  test('PATCH /posts/:id - should partially update a post', async ({ postsEndpoint }) => {
    const postId = 1;
    const partialUpdate = { title: 'Partially Updated Title' };
    
    const response = await postsEndpoint.partialUpdate(postId, partialUpdate);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateBodyContains(response, {
      id: postId,
      title: partialUpdate.title
    });
  });

  test('DELETE /posts/:id - should delete a post', async ({ postsEndpoint }) => {
    const postId = 1;
    const response = await postsEndpoint.delete(postId);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
  });

  test('GET /posts/:id/comments - should return post comments', async ({ postsEndpoint }) => {
    const postId = 1;
    const response = await postsEndpoint.getComments(postId);
    
    // Validate response
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateArrayResponse(response);
    
    // Validate each comment has required fields
    const comments = await response.json();
    if (comments.length > 0) {
      const firstComment = comments[0];
      await ResponseValidator.validateBodyContains(
        { json: async () => firstComment } as any,
        { postId: postId }
      );
    }
  });
});
