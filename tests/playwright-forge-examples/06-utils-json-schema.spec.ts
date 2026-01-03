import { test, expect } from '@playwright/test';
import { validateJsonSchema } from 'playwright-forge';

test.describe('JSON Schema Validation Examples', () => {
  test('Validate simple object schema', () => {
    const data = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };

    const schema = {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string' }
      },
      required: ['id', 'name', 'email']
    };

    // This will throw if validation fails
    expect(() => validateJsonSchema(data, schema)).not.toThrow();
    console.log('Schema validation passed');
  });

  test('Validate array schema', () => {
    const data = [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' }
    ];

    const schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          title: { type: 'string' }
        },
        required: ['id', 'title']
      }
    };

    expect(() => validateJsonSchema(data, schema)).not.toThrow();
    console.log('Array schema validation passed');
  });

  test('Validate nested object schema', () => {
    const data = {
      user: {
        id: 1,
        profile: {
          name: 'John Doe',
          age: 30
        }
      }
    };

    const schema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            profile: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' }
              },
              required: ['name', 'age']
            }
          },
          required: ['id', 'profile']
        }
      },
      required: ['user']
    };

    expect(() => validateJsonSchema(data, schema)).not.toThrow();
    console.log('Nested schema validation passed');
  });

  test('Validate with constraints', () => {
    const data = {
      username: 'testuser',
      age: 25,
      email: 'test@example.com'
    };

    const schema = {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          minLength: 3,
          maxLength: 20
        },
        age: {
          type: 'number',
          minimum: 18,
          maximum: 100
        },
        email: {
          type: 'string',
          format: 'email'
        }
      },
      required: ['username', 'age', 'email']
    };

    expect(() => validateJsonSchema(data, schema)).not.toThrow();
    console.log('Schema with constraints validation passed');
  });

  test('Validate API response structure', async ({ request }) => {
    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();

    const schema = {
      type: 'object',
      properties: {
        userId: { type: 'number' },
        id: { type: 'number' },
        title: { type: 'string' },
        body: { type: 'string' }
      },
      required: ['userId', 'id', 'title', 'body']
    };

    expect(() => validateJsonSchema(data, schema)).not.toThrow();
    console.log('API response schema validation passed');
  });

  test('Validate enum values', () => {
    const data = {
      status: 'active',
      role: 'admin'
    };

    const schema = {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'pending']
        },
        role: {
          type: 'string',
          enum: ['admin', 'user', 'guest']
        }
      },
      required: ['status', 'role']
    };

    expect(() => validateJsonSchema(data, schema)).not.toThrow();
    console.log('Enum validation passed');
  });

  test('Detect schema validation failure', () => {
    const invalidData = {
      id: 'should-be-number',  // Wrong type
      name: 'Test'
    };

    const schema = {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' }
      },
      required: ['id', 'name']
    };

    // This should throw an error
    expect(() => validateJsonSchema(invalidData, schema)).toThrow();
    console.log('Invalid schema correctly detected');
  });

  test('Validate optional fields', () => {
    const data = {
      id: 1,
      name: 'Test'
      // email is optional
    };

    const schema = {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string' }  // Not in required
      },
      required: ['id', 'name']
    };

    expect(() => validateJsonSchema(data, schema)).not.toThrow();
    console.log('Optional fields validation passed');
  });
});
