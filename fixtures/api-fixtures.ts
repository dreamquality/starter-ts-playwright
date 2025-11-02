import { Fixtures } from '@playwright/test';
import { ApiClient } from '../api/clients/api-client';
import { UsersEndpoint } from '../api/endpoints/users-endpoint';
import { PostsEndpoint } from '../api/endpoints/posts-endpoint';

/**
 * API Fixtures for testing
 * Provides reusable API client and endpoint instances
 */

export type ApiFixtures = {
  apiClient: ApiClient;
  usersEndpoint: UsersEndpoint;
  postsEndpoint: PostsEndpoint;
};

export const apiFixtures: Fixtures<ApiFixtures> = {
  apiClient: async ({}, use) => {
    const client = new ApiClient();
    await client.init();
    
    await use(client);
    
    await client.dispose();
  },

  usersEndpoint: async ({ apiClient }, use) => {
    const usersEndpoint = new UsersEndpoint(apiClient);
    await use(usersEndpoint);
  },

  postsEndpoint: async ({ apiClient }, use) => {
    const postsEndpoint = new PostsEndpoint(apiClient);
    await use(postsEndpoint);
  }
};
