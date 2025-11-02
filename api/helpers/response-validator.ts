import { APIResponse, expect } from '@playwright/test';

/**
 * Response validation helper
 * Provides reusable methods to validate API responses
 */
export class ResponseValidator {
  
  /**
   * Validate response status code
   */
  static async validateStatus(response: APIResponse, expectedStatus: number): Promise<void> {
    expect(response.status(), `Expected status ${expectedStatus}, but got ${response.status()}`).toBe(expectedStatus);
  }

  /**
   * Validate response has expected headers
   */
  static async validateHeaders(response: APIResponse, expectedHeaders: Record<string, string | RegExp>): Promise<void> {
    const headers = response.headers();
    
    for (const [key, expectedValue] of Object.entries(expectedHeaders)) {
      const actualValue = headers[key.toLowerCase()];
      
      if (expectedValue instanceof RegExp) {
        expect(actualValue, `Header ${key} should match pattern ${expectedValue}`).toMatch(expectedValue);
      } else {
        expect(actualValue, `Header ${key} should equal ${expectedValue}`).toBe(expectedValue);
      }
    }
  }

  /**
   * Validate response body contains expected fields
   */
  static async validateBodyFields(response: APIResponse, expectedFields: string[]): Promise<void> {
    const body = await response.json();
    
    for (const field of expectedFields) {
      expect(body, `Response should contain field: ${field}`).toHaveProperty(field);
    }
  }

  /**
   * Validate response body matches schema
   */
  static async validateSchema(response: APIResponse, schema: Record<string, any>): Promise<void> {
    const body = await response.json();
    
    for (const [key, type] of Object.entries(schema)) {
      expect(body).toHaveProperty(key);
      
      if (typeof type === 'string') {
        expect(typeof body[key], `Field ${key} should be of type ${type}`).toBe(type);
      } else if (typeof type === 'object' && !Array.isArray(type)) {
        // Nested object validation
        await this.validateNestedSchema(body[key], type);
      } else if (Array.isArray(type)) {
        expect(Array.isArray(body[key]), `Field ${key} should be an array`).toBeTruthy();
      }
    }
  }

  /**
   * Validate nested schema
   */
  private static async validateNestedSchema(obj: any, schema: Record<string, any>): Promise<void> {
    for (const [key, type] of Object.entries(schema)) {
      expect(obj).toHaveProperty(key);
      
      if (typeof type === 'string') {
        expect(typeof obj[key], `Field ${key} should be of type ${type}`).toBe(type);
      }
    }
  }

  /**
   * Validate response time
   */
  static validateResponseTime(startTime: number, maxTime: number): void {
    const duration = Date.now() - startTime;
    expect(duration, `Response time ${duration}ms should be less than ${maxTime}ms`).toBeLessThan(maxTime);
  }

  /**
   * Validate response body matches exact object
   */
  static async validateBodyEquals(response: APIResponse, expectedBody: any): Promise<void> {
    const actualBody = await response.json();
    expect(actualBody).toEqual(expectedBody);
  }

  /**
   * Validate response body contains subset
   */
  static async validateBodyContains(response: APIResponse, expectedSubset: any): Promise<void> {
    const actualBody = await response.json();
    expect(actualBody).toMatchObject(expectedSubset);
  }

  /**
   * Validate array response
   */
  static async validateArrayResponse(response: APIResponse, minLength?: number, maxLength?: number): Promise<void> {
    const body = await response.json();
    expect(Array.isArray(body), 'Response should be an array').toBeTruthy();
    
    if (minLength !== undefined) {
      expect(body.length, `Array length should be at least ${minLength}`).toBeGreaterThanOrEqual(minLength);
    }
    
    if (maxLength !== undefined) {
      expect(body.length, `Array length should be at most ${maxLength}`).toBeLessThanOrEqual(maxLength);
    }
  }

  /**
   * Validate error response
   */
  static async validateErrorResponse(response: APIResponse, errorMessage?: string): Promise<void> {
    expect(response.ok(), 'Response should not be ok').toBeFalsy();
    
    const body = await response.json().catch(() => ({}));
    
    if (errorMessage) {
      const message = body.message || body.error || body.detail || '';
      expect(message.toLowerCase()).toContain(errorMessage.toLowerCase());
    }
  }
}
