<h1 dir="auto"><a class="anchor" aria-hidden="true" href="https://playwright.dev/"><svg class="octicon octicon-link" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd"></path></svg></a><g-emoji class="g-emoji" alias="performing_arts" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f3ad.png">🎭</g-emoji> Playwright</h1>

# Boilerplate project for Web Test Automation - Playwright

### General requirements

- Install a git client such as [git bash](https://git-scm.com/downloads)

Download and install

- Latest version of [Node.js](https://nodejs.org/es/download/)
- Java Development Kit [(JDK)](https://www.oracle.com/java/technologies/downloads/)
  - Make sure you have the environment variable **JAVA_HOME** set to the path of the respective JDK. **(Required for Allure report generation)**.

### Installation of the testing framework

#### **Clone the repository:**

    git clone https://github.com/dreamquality/starter-ts-playwright.git

#### **Install dependencies.**

    npm install

#### **To run the tests go to the root of the project and run (headless mode)**

    npm run test

#### **To run the tests go to the root of the project and run (headed mode)**

    npm run test-head

#### **To run the tests only on Firefox**

    npm run firefox

#### **To run the tests only on Chromium**

    npm run chromium

#### **To run the tests only on Webkit**

    npm run webkit


#### **To open Playwright's unified Html report of test results**

    npm run play-report

#### **To create and open the Allure unified report of test results**

    npm run open-report

#### **IMPORTANT**

After each upgrade of **Playwright**, the project must be restarted locally with the command:

    npm run reinstall

To download the latest versions of the Browsers..


#### **Article with explanations**

<a href="https://habr.com/ru/post/712084/" alt="404">Page Object, Page Factory</a>

## 🔧 Playwright-Forge Integration

This project includes [playwright-forge](https://www.npmjs.com/package/playwright-forge), a powerful collection of reusable fixtures and utilities for enhanced Playwright testing.

## 🏢 Employee Management CRM - Real-World Example

This repository includes comprehensive E2E tests for the [Employee Management CRM](https://github.com/dreamquality/employee-management-crm) application, demonstrating real-world usage of playwright-forge with a production-like API.

### Quick Start with Employee CRM Tests

1. **Start the application with Docker:**
   ```bash
   docker-compose -f docker-compose.employee-crm.yml up -d
   ```

2. **Wait for services to initialize (30-60 seconds)**

3. **Run the tests:**
   ```bash
   npx playwright test tests/employee-crm-api/
   ```

4. **View Swagger API documentation:**
   - Local: http://localhost:3000/api-docs
   - Online: https://dreamquality.github.io/employee-management-crm/

### What's Tested

The Employee CRM tests demonstrate:
- ✅ **Authentication**: Registration, login, JWT tokens, admin/employee roles
- ✅ **Employee Management**: CRUD operations with proper authorization
- ✅ **Data Generation**: Using `DataFactory` for realistic test data
- ✅ **Schema Validation**: Validating API responses with `validateJsonSchema`
- ✅ **OpenAPI Integration**: Testing against Swagger documentation
- ✅ **Docker Compose**: Running real application stack in CI/CD

See [tests/employee-crm-api/README.md](tests/employee-crm-api/README.md) for detailed documentation.

## 📚 Playwright-Forge Features

### Available Fixtures

#### API Fixture
Test REST APIs with configured request context:
```typescript
import { apiFixture } from 'playwright-forge';

apiFixture('API test', async ({ api }) => {
  const response = await api.get('http://localhost:3000/api/employees');
  expect(response.ok()).toBeTruthy();
});
```

#### Cleanup Fixture
Manage resource cleanup after tests:
```typescript
import { cleanupFixture } from 'playwright-forge';

cleanupFixture('Test with cleanup', async ({ cleanup }) => {
  cleanup.addTask(async () => {
    // Cleanup code runs after test
  });
});
```

#### Diagnostics Fixture
Capture screenshots, traces, and page content for debugging:
```typescript
import { diagnosticsFixture } from 'playwright-forge';
const test = diagnosticsFixture;

test('Test with diagnostics', async ({ diagnostics, page }) => {
  await diagnostics.captureScreenshot('step-1');
  await diagnostics.startTrace();
  // ... test actions ...
  await diagnostics.stopTrace('test-trace');
});
```

#### Network Fixture
Provides network mocking and monitoring capabilities:
```typescript
import { networkFixture } from 'playwright-forge';
const test = networkFixture;

test('Mock API', async ({ network, page }) => {
  await network.mockRoute('**/api/data', {
    status: 200,
    body: JSON.stringify({ mocked: true })
  });
});
```

### Available Utilities

#### DataFactory
Generate realistic test data:
```typescript
import { DataFactory } from 'playwright-forge';

const user = DataFactory.user();
const email = DataFactory.email();
const phone = DataFactory.phoneNumber();
```

#### JSON Schema Validation
Validate API responses against JSON schemas:
```typescript
import { validateJsonSchema } from 'playwright-forge';

const schema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' }
  },
  required: ['id', 'name']
};

validateJsonSchema(data, schema);
```

#### PageGuard
Ensure pages are fully loaded before interactions:
```typescript
import { createPageGuard } from 'playwright-forge';

const guard = createPageGuard(page, { debug: true });
await guard.waitForReady();
await guard.click('#button');
```

#### Stable Action Helpers
Reliable UI interactions with automatic retries:
```typescript
import { stableClick, stableFill, stableSelect } from 'playwright-forge';

await stableClick(page, '#submit-button');
await stableFill(page, '#email', 'user@example.com');
await stableSelect(page, '#country', 'US');
```

#### Soft Assertions
Collect multiple assertions and verify at once:
```typescript
import { softAssertions } from 'playwright-forge';

const soft = softAssertions();
await soft.assert(() => expect(data.id).toBeTruthy());
await soft.assert(() => expect(data.name).toBeTruthy());
soft.verify(); // Throws if any assertion failed
```

#### File Assertions
Assert file existence and content:
```typescript
import { FileAssertions } from 'playwright-forge';

FileAssertions.exists('path/to/file.txt');
FileAssertions.contentContains('file.txt', 'expected text');
FileAssertions.sizeGreaterThan('file.txt', 1000);
```

#### Polling Utility
Poll until a condition is met:
```typescript
import { poll, pollUntilValue } from 'playwright-forge';

// Poll until condition returns true
const result = await poll(
  async () => await condition(),
  { timeout: 5000, interval: 100 }
);

// Poll and return the value
const value = await pollUntilValue(
  async () => await getValue(),
  { timeout: 5000, interval: 100 }
);
```

#### Download Helpers
Handle file downloads:
```

### Learn More

- [Employee CRM API Tests Documentation](tests/employee-crm-api/README.md)
- [playwright-forge on npm](https://www.npmjs.com/package/playwright-forge)
- [Playwright Documentation](https://playwright.dev)


