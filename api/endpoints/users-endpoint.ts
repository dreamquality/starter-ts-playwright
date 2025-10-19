import { APIResponse } from '@playwright/test';
import { ApiClient } from '../clients/api-client';
import { CreateUserRequest, UpdateUserRequest } from '../schemas/user-schema';

/**
 * Users endpoint wrapper
 * Provides methods for interacting with the users API
 */
export class UsersEndpoint {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get all users
   */
  async getAll(): Promise<APIResponse> {
    return await this.apiClient.get('/users');
  }

  /**
   * Get user by ID
   */
  async getById(id: number): Promise<APIResponse> {
    return await this.apiClient.get(`/users/${id}`);
  }

  /**
   * Create a new user
   */
  async create(userData: CreateUserRequest): Promise<APIResponse> {
    return await this.apiClient.post('/users', userData);
  }

  /**
   * Update a user
   */
  async update(id: number, userData: UpdateUserRequest): Promise<APIResponse> {
    return await this.apiClient.put(`/users/${id}`, userData);
  }

  /**
   * Partially update a user
   */
  async partialUpdate(id: number, userData: Partial<UpdateUserRequest>): Promise<APIResponse> {
    return await this.apiClient.patch(`/users/${id}`, userData);
  }

  /**
   * Delete a user
   */
  async delete(id: number): Promise<APIResponse> {
    return await this.apiClient.delete(`/users/${id}`);
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId: number): Promise<APIResponse> {
    return await this.apiClient.get(`/users/${userId}/posts`);
  }

  /**
   * Get user's albums
   */
  async getUserAlbums(userId: number): Promise<APIResponse> {
    return await this.apiClient.get(`/users/${userId}/albums`);
  }

  /**
   * Get user's todos
   */
  async getUserTodos(userId: number): Promise<APIResponse> {
    return await this.apiClient.get(`/users/${userId}/todos`);
  }
}
