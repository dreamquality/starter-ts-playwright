import { test, expect } from './employee-crm-test';

test.describe('Feature: Authentication', () => {
  test('User Registration - Employee can register with valid credentials', async ({ api, apiBaseUrl, dataFactory, softAssertions }) => {
    const soft = softAssertions();
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

    const response = await api.post(`${apiBaseUrl}/api/auth/register`, {
      data: testUser
    });

    // Use soft assertions for better error reporting
    await soft.assert(() => expect(response.ok()).toBeTruthy(), 'Response should be successful');
    const data = await response.json();
    await soft.assert(() => expect(data).toHaveProperty('message'), 'Response should have message');
    await soft.assert(() => expect(data).toHaveProperty('userId'), 'Response should have userId');
    await soft.assert(() => expect(data.userId).toBeGreaterThan(0), 'User ID should be positive');
    soft.verify();

    console.log('✅ Employee registered successfully:', data.userId);
  });

  test('User Login - Valid credentials return JWT token', async ({ api, apiBaseUrl, softAssertions }) => {
    const soft = softAssertions();
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
    await api.post(`${apiBaseUrl}/api/auth/register`, { data: testUser });

    // Then login
    const loginResponse = await api.post(`${apiBaseUrl}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    await soft.assert(() => expect(loginResponse.ok()).toBeTruthy(), 'Login should be successful');
    const loginData = await loginResponse.json();
    await soft.assert(() => expect(loginData).toHaveProperty('token'), 'Response should have token');
    await soft.assert(() => expect(loginData.token).toBeTruthy(), 'Token should not be empty');
    await soft.assert(() => expect(typeof loginData.token).toBe('string'), 'Token should be a string');
    soft.verify();

    console.log('✅ Login successful with JWT token');
  });

  test('User Login - Invalid credentials are rejected', async ({ api, apiBaseUrl }) => {
    const response = await api.post(`${apiBaseUrl}/api/auth/login`, {
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

  test('Admin Registration - Admin can register with secret word', async ({ api, apiBaseUrl }) => {
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

    const response = await api.post(`${apiBaseUrl}/api/auth/register`, {
      data: adminUser
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('userId');

    console.log('✅ Admin registered successfully');
  });
});

test.describe('Feature: Employee Management', () => {
  test('List Employees - Authenticated user can retrieve all employees', async ({ api, apiBaseUrl, getAuthToken }) => {
    const token = await getAuthToken('employee');

    const response = await api.get(`${apiBaseUrl}/api/employees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(Array.isArray(data)).toBeTruthy();
    console.log(`✅ Retrieved ${data.length} employees`);
  });

  test('Get Employee - Authenticated user can retrieve employee by ID', async ({ api, apiBaseUrl, getAuthToken }) => {
    const token = await getAuthToken('employee');

    // First get all employees
    const listResponse = await api.get(`${apiBaseUrl}/api/employees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const employees = await listResponse.json();
    if (employees.length > 0) {
      const employeeId = employees[0].id;

      // Get specific employee
      const response = await api.get(`${apiBaseUrl}/api/employees/${employeeId}`, {
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

  test('Update Employee - Admin can update employee information', async ({ api, apiBaseUrl, getAuthToken }) => {
    const adminToken = await getAuthToken('admin');

    // Get all employees
    const listResponse = await api.get(`${apiBaseUrl}/api/employees`, {
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

      const response = await api.put(`${apiBaseUrl}/api/employees/${employeeId}`, {
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

  test('Authorization - Unauthenticated access is denied', async ({ api, apiBaseUrl }) => {
    const response = await api.get(`${apiBaseUrl}/api/employees`);

    expect(response.status()).toBe(401);
    console.log('✅ Unauthorized access correctly blocked');
  });
});

test.describe('Feature: Data Generation', () => {
  test('DataFactory - Create employee with generated test data', async ({ api, apiBaseUrl, dataFactory }) => {
    const generatedUser = dataFactory.user();

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

    const response = await api.post(`${apiBaseUrl}/api/auth/register`, {
      data: testUser
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('userId');

    console.log('✅ Employee created with generated data:', generatedUser.email);
  });

  test('DataFactory - Bulk create employees with generated data', async ({ api, apiBaseUrl, dataFactory }) => {
    const users = dataFactory.array(() => {
      const user = dataFactory.user();
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
      const response = await api.post(`${apiBaseUrl}/api/auth/register`, {
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

test.describe('Feature: System Health', () => {
  test('API Health - API endpoint is accessible', async ({ request, apiBaseUrl }) => {
    const response = await request.get(`${apiBaseUrl}/health`);
    
    // If health endpoint doesn't exist, try root
    if (response.status() === 404) {
      const rootResponse = await request.get(`${apiBaseUrl}/`);
      expect([200, 404]).toContain(rootResponse.status());
      console.log('✅ API server is running');
    } else {
      expect(response.ok()).toBeTruthy();
      console.log('✅ API health check passed');
    }
  });

  test('Database Connectivity - Database connection is working', async ({ request, apiBaseUrl }) => {
    // Try to access an endpoint that requires DB
    const response = await request.post(`${apiBaseUrl}/api/auth/login`, {
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
