import { APIResponse } from '@playwright/test';
import { ApiClient } from '../clients/api-client';
import { CreatePostRequest, UpdatePostRequest } from '../schemas/post-schema';

/**
 * Posts endpoint wrapper
 * Provides methods for interacting with the posts API
 */
export class PostsEndpoint {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get all posts
   */
  async getAll(): Promise<APIResponse> {
    return await this.apiClient.get('/posts');
  }

  /**
   * Get post by ID
   */
  async getById(id: number): Promise<APIResponse> {
    return await this.apiClient.get(`/posts/${id}`);
  }

  /**
   * Get posts by user ID
   */
  async getByUserId(userId: number): Promise<APIResponse> {
    return await this.apiClient.get('/posts', { userId });
  }

  /**
   * Create a new post
   */
  async create(postData: CreatePostRequest): Promise<APIResponse> {
    return await this.apiClient.post('/posts', postData);
  }

  /**
   * Update a post
   */
  async update(id: number, postData: UpdatePostRequest): Promise<APIResponse> {
    return await this.apiClient.put(`/posts/${id}`, postData);
  }

  /**
   * Partially update a post
   */
  async partialUpdate(id: number, postData: Partial<UpdatePostRequest>): Promise<APIResponse> {
    return await this.apiClient.patch(`/posts/${id}`, postData);
  }

  /**
   * Delete a post
   */
  async delete(id: number): Promise<APIResponse> {
    return await this.apiClient.delete(`/posts/${id}`);
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: number): Promise<APIResponse> {
    return await this.apiClient.get(`/posts/${postId}/comments`);
  }
}
