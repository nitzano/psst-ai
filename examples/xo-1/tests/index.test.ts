import {describe, expect, it} from 'vitest';
import {greet, createUser, Status} from '../src/index.js';
import {UserService} from '../src/user-service.js';

describe('User Management', () => {
  it('should greet a user correctly', () => {
    expect(greet('John')).toBe('Hello, John!');
  });

  it('should create a user with correct properties', () => {
    const user = createUser('Jane', 'jane@example.com');
    
    expect(user.name).toBe('Jane');
    expect(user.email).toBe('jane@example.com');
    expect(user.active).toBe(true);
    expect(typeof user.id).toBe('number');
  });

  it('should manage users through UserService', () => {
    const service = new UserService();
    const user = createUser('Bob', 'bob@example.com');
    
    service.addUser(user);
    
    expect(service.getAllUsers()).toHaveLength(1);
    expect(service.getUserById(user.id)).toEqual(user);
    
    service.setUserStatus(user.id, false);
    expect(service.getUserById(user.id)?.active).toBe(false);
  });

  it('should define Status enum with snake_case values', () => {
    expect(Status.active).toBe('active');
    expect(Status.inactive).toBe('inactive');
    expect(Status.pending).toBe('pending');
  });
});
