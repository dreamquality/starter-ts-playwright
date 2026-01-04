# Employee Management CRM - E2E Tests with Playwright-Forge

This directory contains end-to-end tests for the [Employee Management CRM](https://github.com/dreamquality/employee-management-crm) application using Playwright and playwright-forge utilities.

## Overview

The tests demonstrate real-world usage of playwright-forge fixtures and utilities against a production-like API, including:

- **API Testing** with `apiFixture` for REST endpoints
- **Data Generation** with `DataFactory` for realistic test data
- **Schema Validation** with `validateJsonSchema` for API response validation
- **Authentication** flow testing (register, login, JWT tokens)
- **CRUD Operations** for employee management
- **OpenAPI Documentation** verification

## Prerequisites

### 1. Docker & Docker Compose

The employee-management-crm application runs in Docker containers. Make sure you have:
- Docker Engine 20.10+
- Docker Compose 2.0+

### 2. Start the Application

From the repository root:

```bash
# Build and start the Employee CRM application
# Note: First run will take longer as it builds from source
docker-compose -f docker-compose.employee-crm.yml up -d --build

# Wait for services to be ready (build, database migrations, seed data)
# First run usually takes 2-3 minutes, subsequent runs take 30-60 seconds

# Check if services are running
docker-compose -f docker-compose.employee-crm.yml ps
```

**Note**: The application is built from the [employee-management-crm](https://github.com/dreamquality/employee-management-crm) GitHub repository on first run.

The application will be available at:
- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api-docs

### 3. Verify Application is Running

```bash
# Test API health
curl http://localhost:3000/

# Check Swagger documentation
curl http://localhost:3000/api-docs/
```

## Running the Tests

### Run all Employee CRM tests

```bash
npx playwright test tests/employee-crm-api/
```

### Run specific test files

```bash
# Authentication and employee management tests
npx playwright test tests/employee-crm-api/auth-and-employees.spec.ts

# OpenAPI validation tests
npx playwright test tests/employee-crm-api/openapi-validation.spec.ts
```

### Run with UI mode (interactive)

```bash
npx playwright test tests/employee-crm-api/ --ui
```

### Run with specific browser

```bash
npx playwright test tests/employee-crm-api/ --project=chromium
```

## Test Structure

### `auth-and-employees.spec.ts`

Tests for core API functionality:

- **Authentication**
  - Employee registration
  - Admin registration with secret word
  - Login with JWT token generation
  - Invalid credentials handling
  
- **Employee Management**
  - List all employees (authenticated)
  - Get employee by ID
  - Update employee information (admin only)
  - Unauthorized access protection
  
- **Data Factory Integration**
  - Create employees with generated data
  - Bulk employee creation

- **Setup Validation**
  - API accessibility check
  - Database connection verification

### `openapi-validation.spec.ts`

Tests for API documentation and schema validation:

- **OpenAPI Documentation**
  - Swagger UI accessibility
  - OpenAPI spec retrieval
  
- **Schema Validation**
  - Registration response validation
  - Login response validation
  - Employee list response validation
  - Error response validation

## Playwright-Forge Features Demonstrated

### Fixtures

```typescript
import { apiFixture } from 'playwright-forge';

apiFixture('Test name', async ({ api }) => {
  const response = await api.get('/api/employees');
  expect(response.ok()).toBeTruthy();
});
```

### Data Generation

```typescript
import { DataFactory } from 'playwright-forge';

const user = DataFactory.user();
const users = DataFactory.array(() => DataFactory.user(), 5);
```

### Schema Validation

```typescript
import { validateJsonSchema } from 'playwright-forge';

const schema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    email: { type: 'string' }
  },
  required: ['id', 'email']
};

validateJsonSchema(responseData, schema);
```

## Environment Variables

You can customize the API URL:

```bash
# Use a different API URL
API_BASE_URL=http://your-api:3000 npx playwright test tests/employee-crm-api/
```

## Stopping the Application

```bash
# Stop and remove containers
docker-compose -f docker-compose.employee-crm.yml down

# Stop and remove containers + volumes (clean state)
docker-compose -f docker-compose.employee-crm.yml down -v
```

## Troubleshooting

### First build takes a long time

The first time you run `docker-compose up`, it builds the application from source which can take 2-3 minutes. This is normal. Subsequent runs will be much faster as Docker caches the build layers.

### Tests fail with connection errors

1. Verify the application is running:
   ```bash
   docker-compose -f docker-compose.employee-crm.yml ps
   ```

2. Check application logs:
   ```bash
   docker-compose -f docker-compose.employee-crm.yml logs app
   ```

3. Check database logs:
   ```bash
   docker-compose -f docker-compose.employee-crm.yml logs db
   ```

4. Restart services:
   ```bash
   docker-compose -f docker-compose.employee-crm.yml restart
   ```

### Database not ready

The application needs time to build, run migrations, and seed data. 
- First run: Wait 2-3 minutes after starting docker-compose
- Subsequent runs: Wait 30-60 seconds

### Build failures

If the build fails, try rebuilding from scratch:
```bash
docker-compose -f docker-compose.employee-crm.yml down -v
docker-compose -f docker-compose.employee-crm.yml build --no-cache
docker-compose -f docker-compose.employee-crm.yml up -d
```

### Port already in use

If port 3000 or 5432 is already in use:
```bash
# Change ports in docker-compose.employee-crm.yml
ports:
  - "3001:3000"  # Change from 3000 to 3001
```

Then update `API_BASE_URL`:
```bash
API_BASE_URL=http://localhost:3001 npx playwright test tests/employee-crm-api/
```

## API Documentation

Full API documentation is available at: https://dreamquality.github.io/employee-management-crm/

Or locally when the application is running: http://localhost:3000/api-docs

## Related Resources

- [Employee Management CRM Repository](https://github.com/dreamquality/employee-management-crm)
- [Playwright-Forge Package](https://www.npmjs.com/package/playwright-forge)
- [Playwright Documentation](https://playwright.dev)
