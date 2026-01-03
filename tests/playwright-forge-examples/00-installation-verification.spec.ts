import { test, expect } from '@playwright/test';
import { DataFactory, faker } from 'playwright-forge';

test.describe('Playwright-Forge Installation Verification', () => {
  test('DataFactory is available and working', () => {
    // Generate a user
    const user = DataFactory.user();
    
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('firstName');
    expect(user).toHaveProperty('lastName');
    expect(user).toHaveProperty('email');
    expect(user.email).toContain('@');
    
    console.log('✅ DataFactory.user() works');
  });

  test('DataFactory methods are available', () => {
    // Test various methods
    const address = DataFactory.address();
    expect(address).toHaveProperty('street');
    expect(address).toHaveProperty('city');
    console.log('✅ DataFactory.address() works');
    
    const company = DataFactory.company();
    expect(company).toHaveProperty('name');
    console.log('✅ DataFactory.company() works');
    
    const product = DataFactory.product();
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    console.log('✅ DataFactory.product() works');
    
    const text = DataFactory.text(2);
    expect(text.length).toBeGreaterThan(0);
    console.log('✅ DataFactory.text() works');
    
    const pastDate = DataFactory.pastDate();
    expect(pastDate instanceof Date).toBeTruthy();
    console.log('✅ DataFactory.pastDate() works');
    
    const futureDate = DataFactory.futureDate();
    expect(futureDate instanceof Date).toBeTruthy();
    console.log('✅ DataFactory.futureDate() works');
    
    const num = DataFactory.number(1, 100);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(100);
    console.log('✅ DataFactory.number() works');
    
    const bool = DataFactory.boolean();
    expect(typeof bool).toBe('boolean');
    console.log('✅ DataFactory.boolean() works');
    
    const array = DataFactory.array(() => DataFactory.user(), 3);
    expect(array.length).toBe(3);
    console.log('✅ DataFactory.array() works');
  });

  test('Faker is available', () => {
    const firstName = faker.person.firstName();
    const email = faker.internet.email();
    
    expect(firstName.length).toBeGreaterThan(0);
    expect(email).toContain('@');
    
    console.log('✅ Faker library is accessible');
  });

  test('DataFactory can be seeded for reproducible data', () => {
    DataFactory.seed(12345);
    const user1 = DataFactory.user();
    
    DataFactory.seed(12345);
    const user2 = DataFactory.user();
    
    expect(user1.firstName).toBe(user2.firstName);
    expect(user1.email).toBe(user2.email);
    
    console.log('✅ DataFactory seeding works for reproducible data');
  });
});

test.describe('Playwright-Forge Utilities Available', () => {
  test('Check all utilities can be imported', async () => {
    // Test that we can import all utilities
    const { 
      validateJsonSchema,
      createPageGuard,
      stableClick,
      stableFill,
      stableSelect,
      softAssertions,
      FileAssertions,
      poll,
      pollUntilValue
    } = await import('playwright-forge');
    
    expect(validateJsonSchema).toBeDefined();
    expect(createPageGuard).toBeDefined();
    expect(stableClick).toBeDefined();
    expect(stableFill).toBeDefined();
    expect(stableSelect).toBeDefined();
    expect(softAssertions).toBeDefined();
    expect(FileAssertions).toBeDefined();
    expect(poll).toBeDefined();
    expect(pollUntilValue).toBeDefined();
    
    console.log('✅ All utilities are importable');
  });

  test('Check all fixtures can be imported', async () => {
    const {
      apiFixture,
      cleanupFixture,
      diagnosticsFixture,
      networkFixture
    } = await import('playwright-forge');
    
    expect(apiFixture).toBeDefined();
    expect(cleanupFixture).toBeDefined();
    expect(diagnosticsFixture).toBeDefined();
    expect(networkFixture).toBeDefined();
    
    console.log('✅ All fixtures are importable');
  });
});

test.describe('Package Installation Summary', () => {
  test('Display playwright-forge features', () => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎭 Playwright-Forge Successfully Integrated!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 FIXTURES AVAILABLE:
  ✓ apiFixture         - API testing with request context
  ✓ cleanupFixture     - Resource cleanup after tests
  ✓ diagnosticsFixture - Screenshots, traces, page content
  ✓ networkFixture     - Network mocking and monitoring

🛠️  UTILITIES AVAILABLE:
  ✓ DataFactory        - Generate realistic test data
  ✓ validateJsonSchema - Validate JSON against schemas
  ✓ createPageGuard    - Ensure page readiness
  ✓ stableClick        - Reliable click actions
  ✓ stableFill         - Reliable fill actions
  ✓ stableSelect       - Reliable select actions
  ✓ softAssertions     - Collect and verify assertions
  ✓ FileAssertions     - File testing utilities
  ✓ pollUntilValue     - Polling with result return
  ✓ faker              - Direct access to Faker library

📝 NOTE:
  Some example tests require external network access (jsonplaceholder API,
  playwright.dev) and may not run in restricted CI environments. The core
  functionality is verified by the installation tests which don't require
  network access.

📚 EXAMPLE TESTS:
  Check tests/playwright-forge-examples/ for comprehensive
  examples of all features and utilities.

📖 DOCUMENTATION:
  See README.md for detailed usage instructions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
});
