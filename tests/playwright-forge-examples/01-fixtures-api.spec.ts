import { expect } from '@playwright/test';
import { apiFixture } from 'playwright-forge';

apiFixture.describe('API Fixture Examples', () => {
  apiFixture('Basic API request with fixture', async ({ api }) => {
    // The api fixture provides a configured request context
    const response = await api.get('https://jsonplaceholder.typicode.com/posts/1');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('body');
  });

  apiFixture('POST request with API fixture', async ({ api }) => {
    const newPost = {
      title: 'Test Post',
      body: 'This is a test post created with playwright-forge',
      userId: 1
    };

    const response = await api.post('https://jsonplaceholder.typicode.com/posts', {
      data: newPost
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data.title).toBe(newPost.title);
    expect(data.body).toBe(newPost.body);
  });

  apiFixture('Multiple API calls in sequence', async ({ api }) => {
    // Get list of posts
    const listResponse = await api.get('https://jsonplaceholder.typicode.com/posts');
    expect(listResponse.ok()).toBeTruthy();
    const posts = await listResponse.json();
    expect(Array.isArray(posts)).toBeTruthy();
    expect(posts.length).toBeGreaterThan(0);

    // Get specific post
    const postId = posts[0].id;
    const detailResponse = await api.get(`https://jsonplaceholder.typicode.com/posts/${postId}`);
    expect(detailResponse.ok()).toBeTruthy();
    
    const postDetail = await detailResponse.json();
    expect(postDetail.id).toBe(postId);
  });
});
