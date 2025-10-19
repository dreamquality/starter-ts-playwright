# Architecture Documentation

This document describes the architecture and design patterns used in this Playwright test automation framework.

## Table of Contents

1. [Overview](#overview)
2. [Design Patterns](#design-patterns)
3. [Project Layers](#project-layers)
4. [API Testing Architecture](#api-testing-architecture)
5. [E2E Testing Architecture](#e2e-testing-architecture)
6. [Best Practices](#best-practices)

## Overview

This framework follows **Clean Architecture** principles and implements several design patterns to ensure:

- **Maintainability**: Easy to update and extend
- **Reusability**: Components can be reused across tests
- **Testability**: Components are easy to test in isolation
- **Scalability**: Can grow to support large test suites
- **Readability**: Clear and understandable code structure

## Design Patterns

### 1. Page Object Model (POM)

**Purpose**: Encapsulate page structure and behavior in reusable objects.

**Implementation**:
```typescript
// pages/playwright-home-page.ts
export class PlaywrightHomePage extends BasePage {
  private searchButton = this.page.locator('[aria-label="Search"]');
  
  async openSearch() {
    await this.searchButton.click();
  }
}
```

**Benefits**:
- Separation of test logic from page structure
- Reusable page methods
- Single point of change when UI updates

### 2. Page Factory Pattern

**Purpose**: Provide a factory for creating page components dynamically.

**Implementation**:
```typescript
// page-factory/button.ts
export class Button extends Component {
  async click() {
    await this.locator.click();
  }
}

// Usage
const submitButton = new Button(page, '#submit');
await submitButton.click();
```

**Benefits**:
- Consistent component creation
- Type-safe component usage
- Reusable UI components

### 3. API Client Pattern

**Purpose**: Centralize API request handling with a reusable client.

**Implementation**:
```typescript
// api/clients/api-client.ts
export class ApiClient {
  async get(endpoint: string): Promise<APIResponse> {
    return await this.context.get(endpoint);
  }
  
  async post(endpoint: string, data: any): Promise<APIResponse> {
    return await this.context.post(endpoint, { data });
  }
}
```

**Benefits**:
- Single point of configuration
- Consistent error handling
- Reusable across all API tests

### 4. Endpoint Pattern

**Purpose**: Encapsulate API endpoint logic in dedicated classes.

**Implementation**:
```typescript
// api/endpoints/users-endpoint.ts
export class UsersEndpoint {
  constructor(private apiClient: ApiClient) {}
  
  async getById(id: number): Promise<APIResponse> {
    return await this.apiClient.get(`/users/${id}`);
  }
}
```

**Benefits**:
- Organized endpoint methods
- Type-safe API calls
- Easy to mock for testing

### 5. Builder Pattern

**Purpose**: Provide a fluent interface for constructing complex test data.

**Implementation**:
```typescript
// api/helpers/data-builder.ts
export class UserBuilder {
  private user = {};
  
  withName(name: string): this {
    this.user.name = name;
    return this;
  }
  
  build() {
    return this.user;
  }
}

// Usage
const user = new UserBuilder()
  .withName('John')
  .withEmail('john@example.com')
  .build();
```

**Benefits**:
- Readable test data creation
- Flexible and composable
- Default values can be set

### 6. Fixture Pattern

**Purpose**: Provide reusable test setup and teardown.

**Implementation**:
```typescript
// fixtures/api-fixtures.ts
export const apiFixtures: Fixtures<ApiFixtures> = {
  apiClient: async ({}, use) => {
    const client = new ApiClient();
    await client.init();
    
    await use(client);
    
    await client.dispose();
  }
};
```

**Benefits**:
- Automatic setup and cleanup
- Dependency injection
- Composable fixtures

### 7. Strategy Pattern (for Mocking)

**Purpose**: Provide different strategies for mocking API responses.

**Implementation**:
```typescript
// api/mocks/mock-helper.ts
export class MockHelper {
  static async mockPageRoute(page, url, data, status) { }
  static async mockErrorResponse(page, url, error, status) { }
  static async mockNetworkFailure(page, url) { }
  static async mockDelayedResponse(page, url, data, delay) { }
}
```

**Benefits**:
- Multiple mocking strategies
- Easy to switch between strategies
- Consistent mocking interface

### 8. Validator Pattern

**Purpose**: Standardize response validation logic.

**Implementation**:
```typescript
// api/helpers/response-validator.ts
export class ResponseValidator {
  static async validateStatus(response, expectedStatus) { }
  static async validateSchema(response, schema) { }
  static async validateBodyFields(response, fields) { }
}
```

**Benefits**:
- Consistent validation
- Reusable across tests
- Clear validation intent

## Project Layers

### Layer 1: Core Infrastructure

**Components**:
- `api/clients/` - API clients
- `page-factory/` - Component factories
- `utils/` - Utility functions

**Responsibilities**:
- Low-level API interactions
- Component creation
- Common utilities

### Layer 2: Domain Logic

**Components**:
- `api/endpoints/` - API endpoints
- `pages/` - Page objects
- `components/` - UI components

**Responsibilities**:
- Domain-specific operations
- Page/API abstractions
- Business logic

### Layer 3: Test Support

**Components**:
- `api/helpers/` - Test helpers
- `api/schemas/` - Type definitions
- `api/mocks/` - Mock data
- `fixtures/` - Test fixtures

**Responsibilities**:
- Test data management
- Type safety
- Mock setup
- Fixture management

### Layer 4: Tests

**Components**:
- `tests/api/` - API tests
- `tests/` - E2E tests

**Responsibilities**:
- Test scenarios
- Assertions
- Test orchestration

## API Testing Architecture

```
┌─────────────────────────────────────────────┐
│              Test Layer                     │
│  ┌────────────────────────────────────┐    │
│  │    tests/api/*.api.spec.ts         │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Fixture Layer                     │
│  ┌────────────────────────────────────┐    │
│  │    fixtures/api-fixtures.ts        │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Endpoint Layer                     │
│  ┌────────────────┐  ┌──────────────────┐  │
│  │ UsersEndpoint  │  │  PostsEndpoint   │  │
│  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Client Layer                       │
│  ┌────────────────────────────────────┐    │
│  │         ApiClient                  │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Playwright APIRequestContext           │
└─────────────────────────────────────────────┘
```

### Data Flow

1. **Test** invokes endpoint method via fixture
2. **Endpoint** formats request and calls API client
3. **API Client** executes HTTP request via Playwright
4. **Response** flows back up through layers
5. **Validators** verify response at test level

### Key Principles

- **Single Responsibility**: Each class has one job
- **Open/Closed**: Open for extension, closed for modification
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Interface Segregation**: Small, focused interfaces

## E2E Testing Architecture

```
┌─────────────────────────────────────────────┐
│              Test Layer                     │
│  ┌────────────────────────────────────┐    │
│  │    tests/*.spec.ts                 │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Fixture Layer                     │
│  ┌────────────────┐  ┌──────────────────┐  │
│  │ ContextPages   │  │  PlaywrightPages │  │
│  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Page Object Layer                  │
│  ┌────────────────┐  ┌──────────────────┐  │
│  │   HomePage     │  │  LanguagesPage   │  │
│  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Component Layer                     │
│  ┌──────┐  ┌────────┐  ┌────────┐         │
│  │Button│  │  Input │  │  Link  │         │
│  └──────┘  └────────┘  └────────┘         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Playwright Page API                │
└─────────────────────────────────────────────┘
```

## Best Practices

### 1. Separation of Concerns

- **Tests** should only contain test logic
- **Page Objects** should only contain page interactions
- **Components** should only contain component logic
- **Helpers** should only contain reusable utilities

### 2. DRY (Don't Repeat Yourself)

- Extract common patterns into helpers
- Use fixtures for common setup
- Create reusable components

### 3. Single Source of Truth

- Locators defined in one place (page objects/components)
- API endpoints defined in endpoint classes
- Configuration in one place (.env, config files)

### 4. Type Safety

- Use TypeScript interfaces for data
- Define response schemas
- Type fixture dependencies

### 5. Error Handling

- Always handle potential errors
- Provide meaningful error messages
- Log errors for debugging

### 6. Test Independence

- Tests should not depend on each other
- Use fixtures for setup
- Clean up after tests

### 7. Readability

- Use descriptive names
- Add comments for complex logic
- Follow consistent coding style

### 8. Performance

- Run tests in parallel when possible
- Use appropriate timeouts
- Clean up resources properly

## Extending the Framework

### Adding a New API Endpoint

1. Create schema in `api/schemas/`
2. Create endpoint class in `api/endpoints/`
3. Add to fixtures in `fixtures/api-fixtures.ts`
4. Write tests in `tests/api/`

### Adding a New Page Object

1. Create page class in `pages/`
2. Extend `BasePage`
3. Add to fixtures in `fixtures/`
4. Write tests in `tests/`

### Adding a New Component

1. Create component class in `page-factory/`
2. Extend `Component`
3. Use in page objects
4. Write component tests if needed

## Conclusion

This architecture provides a solid foundation for scalable, maintainable test automation. By following these patterns and principles, the framework can grow to support complex testing requirements while remaining easy to understand and modify.

For questions or suggestions, please open an issue or submit a pull request.
