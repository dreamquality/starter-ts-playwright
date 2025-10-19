<h1 dir="auto"><a class="anchor" aria-hidden="true" href="https://playwright.dev/"><svg class="octicon octicon-link" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd"></path></svg></a><g-emoji class="g-emoji" alias="performing_arts" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f3ad.png">🎭</g-emoji> Playwright</h1>

# Boilerplate project for Web Test Automation - Playwright

## 🎯 Features

- ✅ **E2E Testing** - Complete end-to-end UI test automation
- 🔌 **API Testing** - Comprehensive API testing framework with clean architecture
- 🎭 **Page Object Model** - Organized page objects and components
- 🔄 **API Mocking** - Mock API responses for UI tests
- 📊 **Allure Reports** - Beautiful test reports with detailed insights
- 🔐 **Secure Configuration** - Environment-based configuration management
- 🚀 **CI/CD Ready** - Pre-configured for GitHub Actions, GitLab, Jenkins, and more

### General requirements

- Install a git client such as [git bash](https://git-scm.com/downloads)

Download and install

- Latest version of [Node.js](https://nodejs.org/es/download/)
- Java Development Kit [(JDK)](https://www.oracle.com/java/technologies/downloads/)
  - Make sure you have the environment variable **JAVA_HOME** set to the path of the respective JDK. **(Required for Allure report generation)**.

### Installation of the testing framework

#### **Clone the repository:**

    git clone https://github.com/charlyautomatiza/starter-playwright.git

#### **Install dependencies.**

    npm install

#### **Running Tests**

**E2E Tests:**
```bash
npm run test          # Run E2E tests (headless)
npm run test-head     # Run E2E tests (headed mode)
npm run test:e2e      # Run only E2E tests
```

**API Tests:**
```bash
npm run test:api       # Run API tests
npm run test:api-headed # Run API tests (headed mode)
```

**All Tests:**
```bash
npm run test:all       # Run both E2E and API tests
```

**Browser-Specific Tests:**
```bash
npm run firefox        # Run on Firefox only
npm run chromium       # Run on Chromium only
npm run webkit         # Run on Webkit only
```


#### **To open Playwright's unified Html report of test results**

    npm run play-report

#### **To create and open the Allure unified report of test results**

    npm run open-report

#### **IMPORTANT**

After each upgrade of **Playwright**, the project must be restarted locally with the command:

    npm run reinstall

To download the latest versions of the Browsers..


## 📚 Documentation

- **[API Testing Guide](./API_TESTING_GUIDE.md)** - Complete guide for API testing capabilities
- **[CI/CD Integration Guide](./CI_CD_INTEGRATION.md)** - Setup instructions for various CI/CD platforms
- **[Page Object, Page Factory Article](https://habr.com/ru/post/712084/)** - Implementation details

## 🏗️ Project Structure

```
starter-ts-playwright/
├── api/                      # API testing framework
│   ├── clients/              # API clients (ApiClient)
│   ├── endpoints/            # API endpoint wrappers
│   ├── schemas/              # TypeScript types and schemas
│   ├── helpers/              # Validators and data builders
│   └── mocks/                # Mock data and helpers
├── fixtures/                 # Test fixtures
│   ├── api-fixtures.ts       # API test fixtures
│   ├── context-pages.ts      # Page context fixtures
│   └── playwright-pages.ts   # Page object fixtures
├── tests/
│   ├── api/                  # API test files
│   │   ├── users.api.spec.ts
│   │   ├── posts.api.spec.ts
│   │   └── mocked-ui.spec.ts
│   └── test-*.spec.ts        # E2E test files
├── pages/                    # Page objects
├── components/               # Reusable components
├── page-factory/             # Page factory patterns
└── utils/                    # Utility functions
```

## 🚀 Quick Start - API Testing

### 1. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
API_BASE_URL=https://jsonplaceholder.typicode.com
API_AUTH_TOKEN=your_token_here
```

### 2. Run API Tests

```bash
npm run test:api
```

### 3. View Reports

```bash
npm run open-report  # Open Allure report
npm run play-report  # Open Playwright report
```

## 🔧 API Testing Features

### ✅ API Client Pattern
Centralized, reusable API client with support for all HTTP methods:
```typescript
const apiClient = new ApiClient();
await apiClient.init();
const response = await apiClient.get('/users/1');
```

### ✅ Endpoint Wrappers
Organized API endpoints with type-safe methods:
```typescript
const usersEndpoint = new UsersEndpoint(apiClient);
const response = await usersEndpoint.getById(1);
```

### ✅ Response Validation
Comprehensive validation helpers:
```typescript
await ResponseValidator.validateStatus(response, 200);
await ResponseValidator.validateSchema(response, userSchema);
```

### ✅ Data Builders
Fluent interface for building test data:
```typescript
const user = new UserBuilder()
  .withName('John Doe')
  .withEmail('john@example.com')
  .build();
```

### ✅ API Mocking
Mock API responses in UI tests:
```typescript
await MockHelper.mockPageRoute(page, '**/api/users', mockData, 200);
```

## 🧪 Example API Test

```typescript
import { test as base } from '@playwright/test';
import { apiFixtures, ApiFixtures } from '../../fixtures/api-fixtures';
import { ResponseValidator } from '../../api/helpers/response-validator';

const test = base.extend<ApiFixtures>(apiFixtures);

test('GET /users - should return list of users', async ({ usersEndpoint }) => {
  const response = await usersEndpoint.getAll();
  
  await ResponseValidator.validateStatus(response, 200);
  await ResponseValidator.validateArrayResponse(response, 1);
});
```

## 🔐 Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ `.env` file excluded from version control
- ✅ Secure token management
- ✅ CI/CD secrets integration

## 📊 Reporting

This project includes multiple reporting options:

- **Playwright HTML Report** - Built-in Playwright reporter
- **Allure Report** - Beautiful, detailed test reports
- **JUnit XML** - For CI/CD integration
- **Video/Screenshot capture** - For failed tests



