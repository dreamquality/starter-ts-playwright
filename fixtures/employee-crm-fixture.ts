import { Fixtures, PlaywrightTestArgs, APIRequestContext } from '@playwright/test';
import { DataFactory, validateJsonSchema } from 'playwright-forge';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

interface ApiContext {
  get: APIRequestContext['get'];
  post: APIRequestContext['post'];
  put: APIRequestContext['put'];
  delete: APIRequestContext['delete'];
  patch: APIRequestContext['patch'];
}

export type EmployeeCrmFixture = {
  api: ApiContext;
  dataFactory: typeof DataFactory;
  validateJsonSchema: typeof validateJsonSchema;
  apiBaseUrl: string;
  getAuthToken: (role?: 'admin' | 'employee') => Promise<string>;
};

export const employeeCrmFixture: Fixtures<EmployeeCrmFixture, PlaywrightTestArgs> = {
  api: async ({ request }, use) => {
    // Create API context from playwright-forge
    const apiContext = {
      get: async (url: string, options?: any) => {
        return await request.get(url, options);
      },
      post: async (url: string, options?: any) => {
        return await request.post(url, options);
      },
      put: async (url: string, options?: any) => {
        return await request.put(url, options);
      },
      delete: async (url: string, options?: any) => {
        return await request.delete(url, options);
      },
      patch: async (url: string, options?: any) => {
        return await request.patch(url, options);
      }
    };
    
    await use(apiContext);
  },

  dataFactory: async ({}, use) => {
    await use(DataFactory);
  },

  validateJsonSchema: async ({}, use) => {
    await use(validateJsonSchema);
  },

  apiBaseUrl: async ({}, use) => {
    await use(API_BASE_URL);
  },

  getAuthToken: async ({ request }, use) => {
    const getToken = async (role: 'admin' | 'employee' = 'employee'): Promise<string> => {
      const testUser = {
        email: role === 'admin' ? 'admin@test.com' : 'employee@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        middleName: 'Middle',
        birthDate: '1990-01-01',
        phone: '+1234567890',
        programmingLanguage: 'JavaScript',
        ...(role === 'admin' && { role: 'admin', secretWord: 'test_secret_word' })
      };

      // Try to register first (might fail if already exists, that's ok)
      await request.post(`${API_BASE_URL}/api/auth/register`, { data: testUser });

      // Login
      const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
        data: {
          email: testUser.email,
          password: testUser.password
        }
      });

      const loginData = await loginResponse.json();
      return loginData.token;
    };

    await use(getToken);
  }
};
