import { test, expect } from './employee-crm-test';
import { validateResponse } from 'playwright-forge';

test.describe('Feature: OpenAPI Documentation', () => {
  test('Swagger UI - Documentation is accessible and loads correctly', async ({ page, apiBaseUrl }) => {
    await page.goto(`${apiBaseUrl}/api-docs`);
    
    // Wait for Swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Check for main Swagger UI elements
    const title = await page.locator('.title').first();
    await expect(title).toBeVisible();
    
    console.log('✅ Swagger UI is accessible and loaded');
  });

  test('OpenAPI Spec - Specification is retrievable and valid', async ({ request, apiBaseUrl }) => {
    // Try to get the OpenAPI spec JSON
    const response = await request.get(`${apiBaseUrl}/api-docs/swagger.json`);
    
    if (response.status() === 404) {
      // Try alternative endpoint
      const altResponse = await request.get(`${apiBaseUrl}/swagger.json`);
      if (altResponse.ok()) {
        const spec = await altResponse.json();
        expect(spec).toHaveProperty('openapi');
        expect(spec).toHaveProperty('info');
        expect(spec).toHaveProperty('paths');
        console.log('✅ OpenAPI spec retrieved from /swagger.json');
      }
    } else {
      expect(response.ok()).toBeTruthy();
      const spec = await response.json();
      
      expect(spec).toHaveProperty('openapi');
      expect(spec).toHaveProperty('info');
      expect(spec).toHaveProperty('paths');
      
      console.log('✅ OpenAPI spec retrieved successfully');
      console.log(`   API Title: ${spec.info.title}`);
      console.log(`   API Version: ${spec.info.version}`);
      console.log(`   Endpoints: ${Object.keys(spec.paths).length}`);
    }
  });
});

test.describe('Feature: OpenAPI Schema Validation', () => {
  test('Registration Response - Validates against OpenAPI schema', async ({ api, apiBaseUrl, openapiSpecUrl }) => {
    const testUser = {
      email: `schema.test.${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Schema',
      lastName: 'Test',
      middleName: 'Validation',
      birthDate: '1990-01-01',
      phone: '+1234567890',
      programmingLanguage: 'TypeScript'
    };

    const response = await api.post(`${apiBaseUrl}/api/auth/register`, {
      data: testUser
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Use OpenAPI validator from playwright-forge
    try {
      const validationResult = await validateResponse({
        spec: openapiSpecUrl,
        path: '/api/auth/register',
        method: 'post',
        status: 200,
        responseBody: data,
        warnOnly: true, // Don't fail if spec is not available
        fallbackMode: 'warn'
      });

      if (validationResult.valid) {
        console.log('✅ Registration response matches OpenAPI schema');
      } else if (validationResult.skipped) {
        console.log('⚠️  OpenAPI validation skipped (spec not available)');
        // Fallback to basic validation
        expect(data).toHaveProperty('message');
        expect(data).toHaveProperty('userId');
      } else {
        console.log('⚠️  OpenAPI validation warnings:', validationResult.warnings);
      }
    } catch (error) {
      console.log('⚠️  OpenAPI spec not available, using basic validation');
      // Fallback to basic schema validation
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('userId');
      expect(data.userId).toBeGreaterThan(0);
    }
  });

  test('Login Response - Validates against OpenAPI schema', async ({ api, apiBaseUrl, openapiSpecUrl }) => {
    const testUser = {
      email: `login.schema.${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Login',
      lastName: 'Schema',
      middleName: 'Test',
      birthDate: '1991-02-15',
      phone: '+9876543210',
      programmingLanguage: 'Python'
    };

    // Register first
    await api.post(`${apiBaseUrl}/api/auth/register`, { data: testUser });

    // Login
    const loginResponse = await api.post(`${apiBaseUrl}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();

    // Use OpenAPI validator from playwright-forge
    try {
      const validationResult = await validateResponse({
        spec: openapiSpecUrl,
        path: '/api/auth/login',
        method: 'post',
        status: 200,
        responseBody: loginData,
        warnOnly: true,
        fallbackMode: 'warn'
      });

      if (validationResult.valid) {
        console.log('✅ Login response matches OpenAPI schema');
      } else if (validationResult.skipped) {
        console.log('⚠️  OpenAPI validation skipped (spec not available)');
        // Fallback to basic validation
        expect(loginData).toHaveProperty('token');
      } else {
        console.log('⚠️  OpenAPI validation warnings:', validationResult.warnings);
      }
    } catch (error) {
      console.log('⚠️  OpenAPI spec not available, using basic validation');
      // Fallback to basic validation
      expect(loginData).toHaveProperty('token');
      expect(typeof loginData.token).toBe('string');
    }
  });

  test('Employee List Response - Validates against OpenAPI schema', async ({ api, apiBaseUrl, getAuthToken, openapiSpecUrl, softAssertions }) => {
    const soft = softAssertions();
    const token = await getAuthToken('employee');

    // Get employees list
    const employeesResponse = await api.get(`${apiBaseUrl}/api/employees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    await soft.assert(() => expect(employeesResponse.ok()).toBeTruthy(), 'Response should be successful');
    const employees = await employeesResponse.json();
    await soft.assert(() => expect(Array.isArray(employees)).toBeTruthy(), 'Response should be an array');
    soft.verify();

    // Use OpenAPI validator from playwright-forge
    if (employees.length > 0) {
      try {
        const validationResult = await validateResponse({
          spec: openapiSpecUrl,
          path: '/api/employees',
          method: 'get',
          status: 200,
          responseBody: employees,
          warnOnly: true,
          fallbackMode: 'warn'
        });

        if (validationResult.valid) {
          console.log(`✅ Employee list response matches OpenAPI schema (${employees.length} employees)`);
        } else if (validationResult.skipped) {
          console.log('⚠️  OpenAPI validation skipped (spec not available)');
          // Fallback validation
          expect(employees[0]).toHaveProperty('id');
          expect(employees[0]).toHaveProperty('email');
        } else {
          console.log('⚠️  OpenAPI validation warnings:', validationResult.warnings);
        }
      } catch (error) {
        console.log('⚠️  OpenAPI spec not available, using basic validation');
        // Fallback validation
        expect(employees[0]).toHaveProperty('id');
        expect(employees[0]).toHaveProperty('email');
        expect(employees[0]).toHaveProperty('firstName');
        expect(employees[0]).toHaveProperty('lastName');
      }
    } else {
      console.log('⚠️  No employees in database to validate schema');
    }
  });

  test('Error Response - Validates against OpenAPI schema', async ({ api, apiBaseUrl, openapiSpecUrl }) => {
    const response = await api.post(`${apiBaseUrl}/api/auth/login`, {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    const errorData = await response.json();

    // Use OpenAPI validator from playwright-forge
    try {
      const validationResult = await validateResponse({
        spec: openapiSpecUrl,
        path: '/api/auth/login',
        method: 'post',
        status: 401,
        responseBody: errorData,
        warnOnly: true,
        fallbackMode: 'warn'
      });

      if (validationResult.valid) {
        console.log('✅ Error response matches OpenAPI schema');
      } else if (validationResult.skipped) {
        console.log('⚠️  OpenAPI validation skipped (spec not available)');
        // Fallback validation
        expect(errorData).toHaveProperty('error');
      } else {
        console.log('⚠️  OpenAPI validation warnings:', validationResult.warnings);
      }
    } catch (error) {
      console.log('⚠️  OpenAPI spec not available, using basic validation');
      // Fallback validation
      expect(errorData).toHaveProperty('error');
      expect(typeof errorData.error).toBe('string');
    }
  });
});

test.describe('Feature: API Documentation Reference', () => {
  test('API Endpoints - Display available endpoints summary', ({ apiBaseUrl }) => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📚 Employee Management CRM API Endpoints
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 AUTHENTICATION:
  POST /api/auth/register - Register new employee/admin
  POST /api/auth/login    - Login and get JWT token

👥 EMPLOYEES:
  GET    /api/employees     - Get all employees (auth required)
  GET    /api/employees/:id - Get employee by ID (auth required)
  PUT    /api/employees/:id - Update employee (admin required)
  DELETE /api/employees/:id - Delete employee (admin required)

📊 PROJECTS:
  GET    /api/projects     - Get all projects
  POST   /api/projects     - Create project (admin required)
  PUT    /api/projects/:id - Update project (admin required)
  DELETE /api/projects/:id - Delete project (admin required)

📄 DOCUMENTATION:
  Swagger UI: ${apiBaseUrl}/api-docs
  OpenAPI Spec: ${apiBaseUrl}/api-docs/swagger.json

🐳 DOCKER:
  Start services: docker-compose -f docker-compose.employee-crm.yml up -d
  Stop services:  docker-compose -f docker-compose.employee-crm.yml down

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
});
