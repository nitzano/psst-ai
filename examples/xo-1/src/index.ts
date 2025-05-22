/**
 * Example of a TypeScript module using XO linting standards
 */

/**
 * Simple greeting function
 * @param name - The name to greet
 * @returns The greeting message
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * User interface
 */
export interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

/**
 * Status enum using snake_case as per coding standards
 */
export enum Status {
  active = 'active',
  inactive = 'inactive',
  pending = 'pending'
}

/**
 * Create a new user
 * @param name - User name
 * @param email - User email
 * @returns A new User object
 */
export function createUser(name: string, email: string): User {
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email,
    active: true
  };
}
