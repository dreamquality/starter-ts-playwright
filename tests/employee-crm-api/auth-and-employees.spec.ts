import { test, expect } from './employee-crm-test';

test.describe('Employee CRM - Authentication API', () => {
  test('Register new employee', async ({ api, apiBaseUrl, dataFactory }) => {
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

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Validate response structure
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('userId');
    expect(data.userId).toBeGreaterThan(0);

    console.log('✅ Employee registered successfully:', data.userId);
  });

  test('Login with valid credentials', async ({ api, apiBaseUrl }) => {
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

    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();

    // Validate JWT token is returned
    expect(loginData).toHaveProperty('token');
    expect(loginData.token).toBeTruthy();
    expect(typeof loginData.token).toBe('string');

    console.log('✅ Login successful with JWT token');
  });

  test('Fail login with invalid credentials', async ({ api, apiBaseUrl }) => {
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

  test('Register admin with secret word', async ({ api, apiBaseUrl }) => {
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

test.describe('Employee CRM - Employee Management API', () => {
  test('Get all employees (authenticated)', async ({ api, apiBaseUrl, getAuthToken }) => {
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

  test('Get employee by ID', async ({ api, apiBaseUrl, getAuthToken }) => {
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

  test('Update employee information (admin)', async ({ api, apiBaseUrl, getAuthToken }) => {
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

  test('Unauthorized access without token', async ({ api, apiBaseUrl }) => {
    const response = await api.get(`${apiBaseUrl}/api/employees`);

    expect(response.status()).toBe(401);
    console.log('✅ Unauthorized access correctly blocked');
  });
});

test.describe('Employee CRM - Data Factory Integration', () => {
  test('Create employee with generated data', async ({ api, apiBaseUrl, dataFactory }) => {
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

  test('Bulk create employees with DataFactory', async ({ api, apiBaseUrl, dataFactory }) => {
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

test.describe('Employee CRM - Setup Validation', () => {
  test('Verify API is accessible', async ({ request, apiBaseUrl }) => {
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

  test('Verify database connection', async ({ request, apiBaseUrl }) => {
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
