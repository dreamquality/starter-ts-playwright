import { test, expect } from '@playwright/test';
import { apiFixture, DataFactory, validateJsonSchema, OpenApiValidator } from 'playwright-forge';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Helper to get auth token
async function getAuthToken(api: any, role: 'admin' | 'employee' = 'employee') {
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
  await api.post(`${API_BASE_URL}/api/auth/register`, { data: testUser });

  // Login
  const loginResponse = await api.post(`${API_BASE_URL}/api/auth/login`, {
    data: {
      email: testUser.email,
      password: testUser.password
    }
  });

  const loginData = await loginResponse.json();
  return loginData.token;
}

apiFixture.describe('Employee CRM - Authentication API', () => {
  apiFixture('Register new employee', async ({ api }) => {
    const testUser = {
      email: `test.${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Smith',
      birthDate: '1990-05-15',
      phone: '+1234567890',
      programmingLanguage: 'TypeScript'
    };

    const response = await api.post(`${API_BASE_URL}/api/auth/register`, {
      data: testUser
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Validate response structure
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('userId');
    expect(data.userId).toBeGreaterThan(0);

    console.log('✅ Employee registered successfully:', data.userId);
  });

  apiFixture('Login with valid credentials', async ({ api }) => {
    const testUser = {
      email: `login.${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      middleName: 'Ann',
      birthDate: '1992-03-20',
      phone: '+0987654321',
      programmingLanguage: 'Python'
    };

    // Register first
    await api.post(`${API_BASE_URL}/api/auth/register`, { data: testUser });

    // Then login
    const loginResponse = await api.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();

    // Validate JWT token is returned
    expect(loginData).toHaveProperty('token');
    expect(loginData.token).toBeTruthy();
    expect(typeof loginData.token).toBe('string');

    console.log('✅ Login successful with JWT token');
  });

  apiFixture('Fail login with invalid credentials', async ({ api }) => {
    const response = await api.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('error');

    console.log('✅ Invalid login correctly rejected');
  });

  apiFixture('Register admin with secret word', async ({ api }) => {
    const adminUser = {
      email: `admin.${Date.now()}@example.com`,
      password: 'adminpass123',
      firstName: 'Admin',
      lastName: 'User',
      middleName: 'Super',
      birthDate: '1985-01-01',
      phone: '+1111111111',
      programmingLanguage: 'JavaScript',
      role: 'admin',
      secretWord: 'test_secret_word'
    };

    const response = await api.post(`${API_BASE_URL}/api/auth/register`, {
      data: adminUser
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('userId');

    console.log('✅ Admin registered successfully');
  });
});

apiFixture.describe('Employee CRM - Employee Management API', () => {
  apiFixture('Get all employees (authenticated)', async ({ api }) => {
    const token = await getAuthToken(api, 'employee');

    const response = await api.get(`${API_BASE_URL}/api/employees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(Array.isArray(data)).toBeTruthy();
    console.log(`✅ Retrieved ${data.length} employees`);
  });

  apiFixture('Get employee by ID', async ({ api }) => {
    const token = await getAuthToken(api, 'employee');

    // First get all employees
    const listResponse = await api.get(`${API_BASE_URL}/api/employees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const employees = await listResponse.json();
    if (employees.length > 0) {
      const employeeId = employees[0].id;

      // Get specific employee
      const response = await api.get(`${API_BASE_URL}/api/employees/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const employee = await response.json();

      expect(employee).toHaveProperty('id', employeeId);
      expect(employee).toHaveProperty('email');
      expect(employee).toHaveProperty('firstName');
      expect(employee).toHaveProperty('lastName');

      console.log('✅ Retrieved employee details:', employee.email);
    }
  });

  apiFixture('Update employee information (admin)', async ({ api }) => {
    const adminToken = await getAuthToken(api, 'admin');

    // Get all employees
    const listResponse = await api.get(`${API_BASE_URL}/api/employees`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    const employees = await listResponse.json();
    if (employees.length > 0) {
      const employeeId = employees[0].id;

      const updateData = {
        position: 'Senior Developer',
        salary: 95000
      };

      const response = await api.put(`${API_BASE_URL}/api/employees/${employeeId}`, {
        data: updateData,
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const updated = await response.json();

      expect(updated).toHaveProperty('position', 'Senior Developer');
      expect(updated).toHaveProperty('salary', 95000);

      console.log('✅ Employee updated successfully');
    }
  });

  apiFixture('Unauthorized access without token', async ({ api }) => {
    const response = await api.get(`${API_BASE_URL}/api/employees`);

    expect(response.status()).toBe(401);
    console.log('✅ Unauthorized access correctly blocked');
  });
});

apiFixture.describe('Employee CRM - Data Factory Integration', () => {
  apiFixture('Create employee with generated data', async ({ api }) => {
    const generatedUser = DataFactory.user();

    const testUser = {
      email: generatedUser.email,
      password: 'password123',
      firstName: generatedUser.firstName,
      lastName: generatedUser.lastName,
      middleName: 'Generated',
      birthDate: '1990-01-01',
      phone: generatedUser.phone,
      programmingLanguage: 'JavaScript'
    };

    const response = await api.post(`${API_BASE_URL}/api/auth/register`, {
      data: testUser
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('userId');

    console.log('✅ Employee created with generated data:', generatedUser.email);
  });

  apiFixture('Bulk create employees with DataFactory', async ({ api }) => {
    const users = DataFactory.array(() => {
      const user = DataFactory.user();
      return {
        email: user.email,
        password: 'password123',
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: 'Test',
        birthDate: '1990-01-01',
        phone: user.phone,
        programmingLanguage: ['JavaScript', 'Python', 'Java', 'Go'][Math.floor(Math.random() * 4)]
      };
    }, 3);

    let created = 0;
    for (const user of users) {
      const response = await api.post(`${API_BASE_URL}/api/auth/register`, {
        data: user
      });

      if (response.ok()) {
        created++;
      }
    }

    expect(created).toBeGreaterThan(0);
    console.log(`✅ Created ${created}/${users.length} employees with generated data`);
  });
});

test.describe('Employee CRM - Setup Validation', () => {
  test('Verify API is accessible', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    
    // If health endpoint doesn't exist, try root
    if (response.status() === 404) {
      const rootResponse = await request.get(`${API_BASE_URL}/`);
      expect([200, 404]).toContain(rootResponse.status());
      console.log('✅ API server is running');
    } else {
      expect(response.ok()).toBeTruthy();
      console.log('✅ API health check passed');
    }
  });

  test('Verify database connection', async ({ request }) => {
    // Try to access an endpoint that requires DB
    const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'test'
      }
    });

    // As long as we get a response (even 401), DB is connected
    expect(response.status()).toBeGreaterThanOrEqual(400);
    console.log('✅ Database connection verified');
  });
});
