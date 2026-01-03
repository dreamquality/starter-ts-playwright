import { test, expect } from '@playwright/test';
import { DataFactory } from 'playwright-forge';

test.describe('DataFactory Utility Examples', () => {
  test('Generate random user data', () => {
    const user = DataFactory.user();
    
    console.log('Generated user:', user);
    
    expect(user).toHaveProperty('firstName');
    expect(user).toHaveProperty('lastName');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('password');
    
    expect(typeof user.firstName).toBe('string');
    expect(typeof user.lastName).toBe('string');
    expect(user.email).toContain('@');
  });

  test('Generate multiple users', () => {
    const users = Array.from({ length: 5 }, () => DataFactory.user());
    
    console.log('Generated users:', users.length);
    
    expect(users).toHaveLength(5);
    
    // Verify all users are unique
    const emails = users.map(u => u.email);
    const uniqueEmails = new Set(emails);
    expect(uniqueEmails.size).toBe(5);
  });

  test('Generate random string', () => {
    const randomString = DataFactory.randomString(10);
    
    console.log('Generated string:', randomString);
    
    expect(randomString).toHaveLength(10);
    expect(typeof randomString).toBe('string');
  });

  test('Generate random number', () => {
    const randomNumber = DataFactory.randomNumber(1, 100);
    
    console.log('Generated number:', randomNumber);
    
    expect(randomNumber).toBeGreaterThanOrEqual(1);
    expect(randomNumber).toBeLessThanOrEqual(100);
    expect(typeof randomNumber).toBe('number');
  });

  test('Generate random email', () => {
    const email = DataFactory.email();
    
    console.log('Generated email:', email);
    
    expect(email).toContain('@');
    expect(email).toContain('.');
    expect(typeof email).toBe('string');
  });

  test('Generate random phone number', () => {
    const phone = DataFactory.phoneNumber();
    
    console.log('Generated phone:', phone);
    
    expect(typeof phone).toBe('string');
    expect(phone.length).toBeGreaterThan(0);
  });

  test('Generate random address', () => {
    const address = DataFactory.address();
    
    console.log('Generated address:', address);
    
    expect(address).toHaveProperty('street');
    expect(address).toHaveProperty('city');
    expect(address).toHaveProperty('country');
    expect(typeof address.street).toBe('string');
  });

  test('Generate test data for form filling', () => {
    const formData = {
      firstName: DataFactory.firstName(),
      lastName: DataFactory.lastName(),
      email: DataFactory.email(),
      phone: DataFactory.phoneNumber(),
      address: DataFactory.address(),
      company: DataFactory.company(),
      jobTitle: DataFactory.jobTitle()
    };
    
    console.log('Generated form data:', formData);
    
    expect(formData.firstName).toBeTruthy();
    expect(formData.lastName).toBeTruthy();
    expect(formData.email).toContain('@');
    expect(formData.company).toBeTruthy();
  });

  test('Generate random boolean', () => {
    const bool = DataFactory.boolean();
    
    console.log('Generated boolean:', bool);
    
    expect(typeof bool).toBe('boolean');
  });

  test('Generate random date', () => {
    const date = DataFactory.date();
    
    console.log('Generated date:', date);
    
    expect(date instanceof Date).toBeTruthy();
  });

  test('Use generated data in test scenario', async ({ page }) => {
    const testUser = DataFactory.user();
    
    console.log('Using test user:', testUser.email);
    
    // Example: Navigate to a page (not actually submitting data)
    await page.goto('https://playwright.dev');
    
    // In a real scenario, you would fill a form with this data
    expect(testUser.email).toBeTruthy();
    expect(testUser.firstName).toBeTruthy();
  });
});
