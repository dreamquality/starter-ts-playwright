import { test, expect } from '@playwright/test';
import { apiFixture, validateJsonSchema } from 'playwright-forge';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Employee CRM - OpenAPI Documentation', () => {
  test('Verify Swagger UI is accessible', async ({ page }) => {
    await page.goto(`${API_BASE_URL}/api-docs`);
    
    // Wait for Swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    
    // Check for main Swagger UI elements
    const title = await page.locator('.title').first();
    await expect(title).toBeVisible();
    
    console.log('✅ Swagger UI is accessible and loaded');
  });

  test('Fetch OpenAPI spec from API', async ({ request }) => {
    // Try to get the OpenAPI spec JSON
    const response = await request.get(`${API_BASE_URL}/api-docs/swagger.json`);
    
    if (response.status() === 404) {
      // Try alternative endpoint
      const altResponse = await request.get(`${API_BASE_URL}/swagger.json`);
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

apiFixture.describe('Employee CRM - Schema Validation', () => {
  apiFixture('Validate registration response schema', async ({ api }) => {
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

    const response = await api.post(`${API_BASE_URL}/api/auth/register`, {
      data: testUser
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Define expected schema
    const registrationResponseSchema = {
      type: 'object',
      properties: {
        message: { type: 'string' },
        userId: { type: 'number' }
      },
      required: ['message', 'userId']
    };

    validateJsonSchema(data, registrationResponseSchema);
    console.log('✅ Registration response matches expected schema');
  });

  apiFixture('Validate login response schema', async ({ api }) => {
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
    await api.post(`${API_BASE_URL}/api/auth/register`, { data: testUser });

    // Login
    const loginResponse = await api.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();

    // Define expected schema
    const loginResponseSchema = {
      type: 'object',
      properties: {
        token: { type: 'string' }
      },
      required: ['token']
    };

    validateJsonSchema(loginData, loginResponseSchema);
    console.log('✅ Login response matches expected schema');
  });

  apiFixture('Validate employee list response schema', async ({ api }) => {
    // First register and login
    const testUser = {
      email: `employee.list.${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Employee',
      lastName: 'List',
      middleName: 'Test',
      birthDate: '1988-06-10',
      phone: '+5555555555',
      programmingLanguage: 'Java'
    };

    await api.post(`${API_BASE_URL}/api/auth/register`, { data: testUser });

    const loginResponse = await api.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    const { token } = await loginResponse.json();

    // Get employees list
    const employeesResponse = await api.get(`${API_BASE_URL}/api/employees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(employeesResponse.ok()).toBeTruthy();
    const employees = await employeesResponse.json();

    // Define expected schema for employee array
    const employeeSchema = {
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        middleName: { type: 'string' },
        birthDate: { type: 'string' },
        phone: { type: 'string' },
        programmingLanguage: { type: 'string' }
      },
      required: ['id', 'email', 'firstName', 'lastName']
    };

    // Validate each employee in the array
    if (employees.length > 0) {
      validateJsonSchema(employees[0], employeeSchema);
      console.log(`✅ Employee list response matches expected schema (${employees.length} employees)`);
    } else {
      console.log('⚠️  No employees in database to validate schema');
    }
  });

  apiFixture('Validate error response schema', async ({ api }) => {
    const response = await api.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    const errorData = await response.json();

    // Define expected error schema
    const errorSchema = {
      type: 'object',
      properties: {
        error: { type: 'string' }
      },
      required: ['error']
    };

    validateJsonSchema(errorData, errorSchema);
    console.log('✅ Error response matches expected schema');
  });
});

test.describe('Employee CRM - API Documentation Summary', () => {
  test('Display available endpoints', () => {
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
  Swagger UI: ${API_BASE_URL}/api-docs
  OpenAPI Spec: ${API_BASE_URL}/api-docs/swagger.json

🐳 DOCKER:
  Start services: docker-compose -f docker-compose.employee-crm.yml up -d
  Stop services:  docker-compose -f docker-compose.employee-crm.yml down

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
});
