# API Testing Guide

This guide provides comprehensive documentation for API testing capabilities in this Playwright project.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Writing API Tests](#writing-api-tests)
5. [API Mocking](#api-mocking)
6. [Best Practices](#best-practices)
7. [CI/CD Integration](#cicd-integration)
8. [Examples](#examples)

## Architecture Overview

The API testing architecture follows clean architecture patterns and design principles:

- **API Client Pattern**: Centralized API client for reusable HTTP methods
- **Endpoint Pattern**: Organized API endpoints with dedicated classes
- **Data Builder Pattern**: Fluent interfaces for building test data
- **Fixture Pattern**: Reusable test fixtures for dependency injection
- **Response Validator Pattern**: Standardized response validation methods

### Key Components

```
api/
├── clients/         # Reusable API clients
├── endpoints/       # API endpoint wrappers
├── schemas/         # TypeScript types and schemas
├── helpers/         # Utility functions (validators, builders)
└── mocks/           # Mock data and helpers
    └── data/        # JSON mock data files
```

## Project Structure

```
starter-ts-playwright/
├── api/
│   ├── clients/
│   │   └── api-client.ts              # Base API client using Playwright APIRequestContext
│   ├── endpoints/
│   │   ├── users-endpoint.ts          # Users API wrapper
│   │   └── posts-endpoint.ts          # Posts API wrapper
│   ├── schemas/
│   │   ├── user-schema.ts             # User types and schemas
│   │   └── post-schema.ts             # Post types and schemas
│   ├── helpers/
│   │   ├── response-validator.ts      # Response validation utilities
│   │   └── data-builder.ts            # Data builder patterns
│   └── mocks/
│       ├── mock-helper.ts             # API mocking utilities
│       └── data/
│           ├── users.json             # Mock user data
│           └── posts.json             # Mock post data
├── fixtures/
│   └── api-fixtures.ts                # API test fixtures
├── tests/
│   └── api/
│       ├── users.api.spec.ts          # User API tests
│       ├── posts.api.spec.ts          # Post API tests
│       └── mocked-ui.spec.ts          # Example UI tests with mocked APIs
├── .env.example                       # Environment configuration template
└── playwright.config.ts               # Playwright configuration
```

## Getting Started

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API configuration:
   ```env
   API_BASE_URL=https://jsonplaceholder.typicode.com
   API_AUTH_TOKEN=your_token_here
   ```

3. **Install Playwright browsers** (if not already installed):
   ```bash
   npm run reinstall
   ```

### Running Tests

#### Run all tests:
```bash
npm test
```

#### Run only API tests:
```bash
npm run test:api
```

#### Run only E2E tests:
```bash
npm run test:e2e
```

#### Run API tests in headed mode:
```bash
npm run test:api-headed
```

#### Run specific test file:
```bash
npx playwright test tests/api/users.api.spec.ts
```

#### Run tests with specific tag:
```bash
npx playwright test --grep @api
```

## Writing API Tests

### Basic API Test Structure

```typescript
import { test as base } from '@playwright/test';
import { apiFixtures, ApiFixtures } from '../../fixtures/api-fixtures';
import { ResponseValidator } from '../../api/helpers/response-validator';

const test = base.extend<ApiFixtures>(apiFixtures);

test.describe('My API Tests', () => {
  
  test('GET request example', async ({ apiClient }) => {
    const response = await apiClient.get('/endpoint');
    
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateBodyFields(response, ['id', 'name']);
  });
  
});
```

### Using Endpoint Wrappers

```typescript
test('Using endpoint wrapper', async ({ usersEndpoint }) => {
  const response = await usersEndpoint.getById(1);
  
  await ResponseValidator.validateStatus(response, 200);
  
  const user = await response.json();
  console.log('User:', user.name);
});
```

### Using Data Builders

```typescript
import { UserBuilder } from '../../api/helpers/data-builder';

test('POST with data builder', async ({ usersEndpoint }) => {
  const newUser = new UserBuilder()
    .withName('John Doe')
    .withEmail('john@example.com')
    .withUsername('johndoe')
    .build();
  
  const response = await usersEndpoint.create(newUser);
  
  await ResponseValidator.validateStatus(response, 201);
});
```

### Response Validation

```typescript
// Validate status code
await ResponseValidator.validateStatus(response, 200);

// Validate headers
await ResponseValidator.validateHeaders(response, {
  'content-type': /application\/json/
});

// Validate body fields exist
await ResponseValidator.validateBodyFields(response, ['id', 'name', 'email']);

// Validate schema
await ResponseValidator.validateSchema(response, userSchema);

// Validate response time
const startTime = Date.now();
const response = await apiClient.get('/endpoint');
ResponseValidator.validateResponseTime(startTime, 5000); // Max 5 seconds

// Validate body contains subset
await ResponseValidator.validateBodyContains(response, {
  name: 'Expected Name',
  email: 'expected@email.com'
});

// Validate array response
await ResponseValidator.validateArrayResponse(response, 1, 100); // Min 1, Max 100 items
```

### Authentication

```typescript
test('API with authentication', async ({ apiClient }) => {
  // Set bearer token
  apiClient.setAuthToken(process.env.API_AUTH_TOKEN!);
  
  const response = await apiClient.get('/protected-endpoint');
  await ResponseValidator.validateStatus(response, 200);
});

test('API with custom headers', async ({ apiClient }) => {
  apiClient.setHeader('X-Custom-Header', 'custom-value');
  
  const response = await apiClient.get('/endpoint');
  await ResponseValidator.validateStatus(response, 200);
});
```

## API Mocking

### Page-Level Mocking

Mock API responses in UI tests to simulate specific backend states:

```typescript
import { MockHelper } from '../../api/mocks/mock-helper';

test('Mock API response', async ({ page }) => {
  const mockData = [
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' }
  ];
  
  await MockHelper.mockPageRoute(
    page,
    '**/api/users',
    mockData,
    200
  );
  
  // Now navigate to your page
  await page.goto('/users');
  // The page will receive mocked data
});
```

### Load Mock Data from JSON

```typescript
test('Load mock from file', async ({ page }) => {
  const mockUsers = MockHelper.loadMockData('users.json');
  
  await MockHelper.mockPageRoute(page, '**/api/users', mockUsers, 200);
});
```

### Mock Error Responses

```typescript
test('Mock error response', async ({ page }) => {
  await MockHelper.mockErrorResponse(
    page,
    '**/api/users',
    'Internal Server Error',
    500
  );
  
  // Test error handling in UI
});
```

### Mock Network Failure

```typescript
test('Mock network failure', async ({ page }) => {
  await MockHelper.mockNetworkFailure(page, '**/api/users');
  
  // Test offline behavior
});
```

### Mock Delayed Response

```typescript
test('Mock delayed response', async ({ page }) => {
  await MockHelper.mockDelayedResponse(
    page,
    '**/api/users',
    mockData,
    3000, // 3 second delay
    200
  );
  
  // Test loading states
});
```

### Dynamic Mock Data

```typescript
test('Dynamic mock data', async ({ page }) => {
  await MockHelper.mockWithGenerator(
    page,
    '**/api/users',
    () => ({
      id: Math.floor(Math.random() * 1000),
      name: `User ${Date.now()}`,
      timestamp: new Date().toISOString()
    }),
    200
  );
});
```

### Context-Level Mocking

Mock at context level to affect all pages:

```typescript
test('Context-level mock', async ({ context, page }) => {
  await MockHelper.mockContextRoute(
    context,
    '**/api/users',
    mockData,
    200
  );
  
  // All pages in this context will use the mock
  const page2 = await context.newPage();
});
```

## Best Practices

### 1. Organize Tests by Domain

Group related API tests together:

```typescript
test.describe('User Management', () => {
  test.describe('User CRUD Operations', () => {
    // CRUD tests
  });
  
  test.describe('User Validation', () => {
    // Validation tests
  });
});
```

### 2. Use Test Data Builders

Always use data builders for complex test data:

```typescript
const user = new UserBuilder()
  .withName('John Doe')
  .withEmail('john@example.com')
  .build();
```

### 3. Reuse Fixtures

Leverage fixtures for common setup:

```typescript
const test = base.extend<ApiFixtures>(apiFixtures);
```

### 4. Validate Responses Consistently

Use response validators for consistency:

```typescript
await ResponseValidator.validateStatus(response, 200);
await ResponseValidator.validateSchema(response, schema);
```

### 5. Handle Secrets Securely

Never commit secrets to version control:

```typescript
// Use environment variables
const token = process.env.API_AUTH_TOKEN;

// Or use .env file (add .env to .gitignore)
```

### 6. Test Data Management

- Use mock data files for static data
- Use data builders for dynamic data
- Clean up test data after tests if testing against real APIs

### 7. Parallel Execution

API tests can run in parallel:

```typescript
// playwright.config.ts
workers: process.env.CI ? 4 : undefined
```

### 8. Error Handling

Always test error scenarios:

```typescript
test('Handle 404 error', async ({ apiClient }) => {
  const response = await apiClient.get('/nonexistent');
  await ResponseValidator.validateStatus(response, 404);
});
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/api-tests.yml`:

```yaml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        
      - name: Run API tests
        run: npm run test:api
        env:
          API_BASE_URL: ${{ secrets.API_BASE_URL }}
          API_AUTH_TOKEN: ${{ secrets.API_AUTH_TOKEN }}
          CI: true
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: api-test-results
          path: |
            playwright-report/
            allure-results/
            test-results/
          retention-days: 30
          
      - name: Generate Allure Report
        if: always()
        run: npm run allure-report
        
      - name: Upload Allure Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: allure-report
          path: allure-report/
          retention-days: 30
```

### Environment Variables in CI

Set these secrets in your CI/CD platform:

- `API_BASE_URL`: Base URL for API
- `API_AUTH_TOKEN`: Authentication token
- `API_USERNAME`: Username (if needed)
- `API_PASSWORD`: Password (if needed)

### Separate E2E and API Tests

Run different test suites independently:

```yaml
jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:api
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e
```

## Examples

### Complete API Test Example

```typescript
import { test as base } from '@playwright/test';
import { apiFixtures, ApiFixtures } from '../../fixtures/api-fixtures';
import { ResponseValidator } from '../../api/helpers/response-validator';
import { UserBuilder } from '../../api/helpers/data-builder';

const test = base.extend<ApiFixtures>(apiFixtures);

test.describe('User API - Complete Example', () => {
  
  test('Complete user workflow', async ({ usersEndpoint }) => {
    // 1. Create a user
    const newUser = new UserBuilder()
      .withName('Test User')
      .withUsername('testuser')
      .withEmail('test@example.com')
      .build();
    
    const createResponse = await usersEndpoint.create(newUser);
    await ResponseValidator.validateStatus(createResponse, 201);
    
    const createdUser = await createResponse.json();
    const userId = createdUser.id;
    
    // 2. Get the created user
    const getResponse = await usersEndpoint.getById(userId);
    await ResponseValidator.validateStatus(getResponse, 200);
    await ResponseValidator.validateBodyContains(getResponse, {
      name: newUser.name,
      email: newUser.email
    });
    
    // 3. Update the user
    const updateResponse = await usersEndpoint.partialUpdate(userId, {
      name: 'Updated Name'
    });
    await ResponseValidator.validateStatus(updateResponse, 200);
    
    // 4. Delete the user
    const deleteResponse = await usersEndpoint.delete(userId);
    await ResponseValidator.validateStatus(deleteResponse, 200);
    
    // 5. Verify deletion
    const verifyResponse = await usersEndpoint.getById(userId);
    // Note: JSONPlaceholder doesn't actually delete, so this might still return 200
    // In real API, you'd expect 404
  });
});
```

### UI Test with Mocked API

```typescript
import { test } from '@playwright/test';
import { MockHelper } from '../../api/mocks/mock-helper';

test('User list page with mocked API', async ({ page }) => {
  // Load and mock user data
  const mockUsers = MockHelper.loadMockData('users.json');
  await MockHelper.mockPageRoute(page, '**/api/users', mockUsers, 200);
  
  // Navigate to the page
  await page.goto('/users');
  
  // Verify the page displays mocked users
  // ... your UI assertions here
});
```

## Additional Resources

- [Playwright API Testing Documentation](https://playwright.dev/docs/api-testing)
- [Playwright APIRequestContext API](https://playwright.dev/docs/api/class-apirequestcontext)
- [JSONPlaceholder - Free Fake API](https://jsonplaceholder.typicode.com/)

## Support

For questions or issues:
1. Check the [Playwright documentation](https://playwright.dev)
2. Review the example tests in `tests/api/`
3. Open an issue in the repository

---

**Happy Testing! 🎭**
