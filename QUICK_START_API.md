# Quick Start Guide - API Testing

Get started with API testing in 5 minutes! 🚀

## Prerequisites

- Node.js 18+ installed
- Basic understanding of REST APIs
- Playwright installed (will be installed with `npm install`)

## Step 1: Installation (1 minute)

```bash
# Clone the repository (if not already done)
git clone https://github.com/dreamquality/starter-ts-playwright.git
cd starter-ts-playwright

# Install dependencies
npm install

# Install Playwright browsers
npm run reinstall
```

## Step 2: Configuration (1 minute)

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API configuration (optional)
# The default configuration works out of the box with JSONPlaceholder
```

Default `.env` values:
```env
API_BASE_URL=https://jsonplaceholder.typicode.com
```

## Step 3: Run Your First API Test (1 minute)

```bash
# Run all API tests
npm run test:api
```

You should see output like:
```
Running 9 tests using 1 worker

  ✓  GET /users - should return list of users (1s)
  ✓  GET /users/:id - should return a specific user (500ms)
  ✓  POST /users - should create a new user (700ms)
  ...

9 passed (5s)
```

## Step 4: View Test Reports (30 seconds)

```bash
# Generate and open Allure report
npm run open-report

# Or view Playwright HTML report
npm run play-report
```

## Step 5: Write Your First Custom Test (2 minutes)

Create a new file `tests/api/my-first-test.api.spec.ts`:

```typescript
import { test as base } from '@playwright/test';
import { apiFixtures, ApiFixtures } from '../../fixtures/api-fixtures';
import { ResponseValidator } from '../../api/helpers/response-validator';

const test = base.extend<ApiFixtures>(apiFixtures);

test.describe('My First API Tests', () => {
  
  test('Get all users', async ({ usersEndpoint }) => {
    const response = await usersEndpoint.getAll();
    
    await ResponseValidator.validateStatus(response, 200);
    await ResponseValidator.validateArrayResponse(response, 1);
    
    const users = await response.json();
    console.log(`Found ${users.length} users`);
  });
  
  test('Create a new user', async ({ usersEndpoint }) => {
    const newUser = {
      name: 'My Test User',
      username: 'testuser',
      email: 'test@example.com'
    };
    
    const response = await usersEndpoint.create(newUser);
    
    await ResponseValidator.validateStatus(response, 201);
    
    const createdUser = await response.json();
    console.log('Created user with ID:', createdUser.id);
  });
  
});
```

Run your test:
```bash
npx playwright test tests/api/my-first-test.api.spec.ts
```

## Common Commands

### Running Tests

```bash
# Run all API tests
npm run test:api

# Run specific test file
npx playwright test tests/api/users.api.spec.ts

# Run tests in headed mode (see browser)
npm run test:api-headed

# Run tests with specific tag
npx playwright test --grep @smoke

# Run single test by name
npx playwright test -g "should return list of users"
```

### Debugging

```bash
# Run tests in debug mode
npx playwright test --debug

# Run with UI mode
npx playwright test --ui

# Show detailed output
npx playwright test --reporter=list
```

### Reports

```bash
# Generate Allure report
npm run allure-report

# Open Allure report
npm run open-report

# Open Playwright HTML report
npm run play-report
```

## Next Steps

### 1. Explore Example Tests

Check out the example test files:
- `tests/api/users.api.spec.ts` - User API tests
- `tests/api/posts.api.spec.ts` - Post API tests
- `tests/api/advanced-examples.spec.ts` - Advanced patterns
- `tests/api/mocked-ui.spec.ts` - API mocking examples

### 2. Learn the Architecture

Read the architecture documentation:
```bash
# API Testing Guide
cat API_TESTING_GUIDE.md

# Architecture Documentation
cat ARCHITECTURE.md

# CI/CD Integration
cat CI_CD_INTEGRATION.md
```

### 3. Customize for Your API

1. **Update Base URL**:
   Edit `.env` and set `API_BASE_URL` to your API

2. **Add Authentication**:
   ```typescript
   apiClient.setAuthToken(process.env.API_AUTH_TOKEN);
   ```

3. **Create Schemas**:
   Add your API types in `api/schemas/`

4. **Create Endpoints**:
   Add endpoint wrappers in `api/endpoints/`

5. **Write Tests**:
   Add test files in `tests/api/`

### 4. Example: Testing Your Own API

```typescript
// api/schemas/product-schema.ts
export interface Product {
  id: number;
  name: string;
  price: number;
}

// api/endpoints/products-endpoint.ts
import { ApiClient } from '../clients/api-client';

export class ProductsEndpoint {
  constructor(private apiClient: ApiClient) {}
  
  async getAll() {
    return await this.apiClient.get('/products');
  }
  
  async getById(id: number) {
    return await this.apiClient.get(`/products/${id}`);
  }
  
  async create(product: Partial<Product>) {
    return await this.apiClient.post('/products', product);
  }
}

// fixtures/api-fixtures.ts (add to existing fixtures)
productsEndpoint: async ({ apiClient }, use) => {
  const endpoint = new ProductsEndpoint(apiClient);
  await use(endpoint);
}

// tests/api/products.api.spec.ts
test('Get all products', async ({ productsEndpoint }) => {
  const response = await productsEndpoint.getAll();
  await ResponseValidator.validateStatus(response, 200);
});
```

## Troubleshooting

### Tests fail with "API context not initialized"

Make sure you're using the fixtures:
```typescript
const test = base.extend<ApiFixtures>(apiFixtures);
```

### Cannot connect to API

Check your `.env` file and ensure `API_BASE_URL` is correct:
```bash
cat .env | grep API_BASE_URL
```

### Browser installation fails

Try installing manually:
```bash
npx playwright install --with-deps chromium
```

### Tests timeout

Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 seconds
```

## Tips and Tricks

### 1. Use Data Builders

Instead of:
```typescript
const user = {
  name: 'John',
  email: 'john@example.com',
  username: 'john'
};
```

Use:
```typescript
const user = new UserBuilder()
  .withName('John')
  .withEmail('john@example.com')
  .withUsername('john')
  .build();
```

### 2. Validate Schemas

```typescript
await ResponseValidator.validateSchema(response, userSchema);
```

### 3. Measure Performance

```typescript
const startTime = Date.now();
const response = await apiClient.get('/endpoint');
ResponseValidator.validateResponseTime(startTime, 1000); // Max 1 second
```

### 4. Run Tests in Parallel

```typescript
const responses = await Promise.all([
  usersEndpoint.getById(1),
  usersEndpoint.getById(2),
  usersEndpoint.getById(3)
]);
```

### 5. Mock APIs in UI Tests

```typescript
await MockHelper.mockPageRoute(page, '**/api/users', mockData, 200);
await page.goto('/users');
// Page will receive mocked data
```

## Resources

- 📚 [Full API Testing Guide](./API_TESTING_GUIDE.md)
- 🏗️ [Architecture Documentation](./ARCHITECTURE.md)
- 🚀 [CI/CD Integration Guide](./CI_CD_INTEGRATION.md)
- 🎭 [Playwright Documentation](https://playwright.dev)
- 🔗 [JSONPlaceholder API](https://jsonplaceholder.typicode.com)

## Getting Help

- Check the [API Testing Guide](./API_TESTING_GUIDE.md) for detailed documentation
- Review example tests in `tests/api/`
- Open an issue on GitHub
- Read Playwright's [API Testing docs](https://playwright.dev/docs/api-testing)

## What's Next?

✅ You've completed the quick start!

Now you can:
- [ ] Write tests for your own API
- [ ] Integrate with CI/CD (see `CI_CD_INTEGRATION.md`)
- [ ] Add API mocking to E2E tests
- [ ] Set up test data management
- [ ] Configure authentication
- [ ] Add custom validators
- [ ] Create reusable test helpers

Happy Testing! 🎭
