import { Page, Route, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Mock Helper for API responses
 * Provides utilities to mock API calls in UI tests
 */
export class MockHelper {
  
  /**
   * Load mock data from JSON file
   */
  static loadMockData<T>(fileName: string): T {
    const filePath = path.join(__dirname, 'data', fileName);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  }

  /**
   * Mock API response on page level
   */
  static async mockPageRoute(
    page: Page,
    urlPattern: string | RegExp,
    responseData: unknown,
    status: number = 200,
    headers?: Record<string, string>
  ): Promise<void> {
    await page.route(urlPattern, (route: Route) => {
      route.fulfill({
        status,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
          ...headers
        },
        body: JSON.stringify(responseData)
      });
    });
  }

  /**
   * Mock API response on context level (affects all pages)
   */
  static async mockContextRoute(
    context: BrowserContext,
    urlPattern: string | RegExp,
    responseData: unknown,
    status: number = 200,
    headers?: Record<string, string>
  ): Promise<void> {
    await context.route(urlPattern, (route: Route) => {
      route.fulfill({
        status,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': '*',
          ...headers
        },
        body: JSON.stringify(responseData)
      });
    });
  }

  /**
   * Mock error response
   */
  static async mockErrorResponse(
    page: Page,
    urlPattern: string | RegExp,
    errorMessage: string,
    status: number = 500
  ): Promise<void> {
    await page.route(urlPattern, (route: Route) => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          error: errorMessage,
          message: errorMessage
        })
      });
    });
  }

  /**
   * Mock network failure
   */
  static async mockNetworkFailure(
    page: Page,
    urlPattern: string | RegExp
  ): Promise<void> {
    await page.route(urlPattern, (route: Route) => {
      route.abort('failed');
    });
  }

  /**
   * Mock delayed response
   */
  static async mockDelayedResponse(
    page: Page,
    urlPattern: string | RegExp,
    responseData: unknown,
    delayMs: number,
    status: number = 200
  ): Promise<void> {
    await page.route(urlPattern, async (route: Route) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(responseData)
      });
    });
  }

  /**
   * Mock with dynamic data generator
   */
  static async mockWithGenerator(
    page: Page,
    urlPattern: string | RegExp,
    dataGenerator: () => unknown,
    status: number = 200
  ): Promise<void> {
    await page.route(urlPattern, (route: Route) => {
      const data = dataGenerator();
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data)
      });
    });
  }

  /**
   * Mock specific HTTP method
   */
  static async mockByMethod(
    page: Page,
    urlPattern: string | RegExp,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    responseData: unknown,
    status: number = 200
  ): Promise<void> {
    await page.route(urlPattern, (route: Route) => {
      if (route.request().method() === method) {
        route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(responseData)
        });
      } else {
        route.continue();
      }
    });
  }

  /**
   * Remove all mocks from page
   */
  static async removePageMocks(page: Page): Promise<void> {
    await page.unroute('**/*');
  }

  /**
   * Remove all mocks from context
   */
  static async removeContextMocks(context: BrowserContext): Promise<void> {
    await context.unroute('**/*');
  }
}
