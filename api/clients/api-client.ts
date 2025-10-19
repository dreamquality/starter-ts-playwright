import { APIRequestContext, APIResponse, request } from '@playwright/test';

/**
 * Base API Client using Playwright's APIRequestContext
 * Provides reusable methods for making HTTP requests with common configurations
 */
export class ApiClient {
  private context: APIRequestContext | null = null;
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string = '', headers: Record<string, string> = {}) {
    this.baseURL = baseURL || process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    };
  }

  /**
   * Initialize the API request context
   */
  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: this.headers,
      ignoreHTTPSErrors: true,
    });
  }

  /**
   * Dispose the API request context
   */
  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
    }
  }

  /**
   * GET request
   */
  async get(endpoint: string, params?: Record<string, any>): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized. Call init() first.');
    
    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
    return await this.context.get(url);
  }

  /**
   * POST request
   */
  async post(endpoint: string, data?: any, headers?: Record<string, string>): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized. Call init() first.');
    
    return await this.context.post(endpoint, {
      data,
      headers: { ...this.headers, ...headers }
    });
  }

  /**
   * PUT request
   */
  async put(endpoint: string, data?: any, headers?: Record<string, string>): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized. Call init() first.');
    
    return await this.context.put(endpoint, {
      data,
      headers: { ...this.headers, ...headers }
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint: string, data?: any, headers?: Record<string, string>): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized. Call init() first.');
    
    return await this.context.patch(endpoint, {
      data,
      headers: { ...this.headers, ...headers }
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string): Promise<APIResponse> {
    if (!this.context) throw new Error('API context not initialized. Call init() first.');
    
    return await this.context.delete(endpoint);
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set custom header
   */
  setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Get API context (for advanced usage)
   */
  getContext(): APIRequestContext | null {
    return this.context;
  }
}
