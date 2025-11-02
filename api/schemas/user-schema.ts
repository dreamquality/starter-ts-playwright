/**
 * Type definitions for User API
 */

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: {
    lat: string;
    lng: string;
  };
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
}

export interface UpdateUserRequest {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  website?: string;
}

/**
 * Schema validator for User
 */
export const userSchema = {
  id: 'number',
  name: 'string',
  username: 'string',
  email: 'string',
  phone: 'string',
  website: 'string',
  address: {
    street: 'string',
    suite: 'string',
    city: 'string',
    zipcode: 'string',
    geo: {
      lat: 'string',
      lng: 'string'
    }
  },
  company: {
    name: 'string',
    catchPhrase: 'string',
    bs: 'string'
  }
};
