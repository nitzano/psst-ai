/**
 * Example UserService class using XO linting standards
 */
import {User, Status} from './index.js';

/**
 * User service for managing users
 */
export class UserService {
  private users: User[] = [];

  /**
   * Add a user to the system
   * @param user - The user to add
   */
  public addUser(user: User): void {
    this.users.push(user);
  }

  /**
   * Get a user by ID
   * @param id - The user ID
   * @returns The user or undefined if not found
   */
  public getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  /**
   * Get all users
   * @returns Array of all users
   */
  public getAllUsers(): User[] {
    return [...this.users];
  }

  /**
   * Set user status
   * @param id - The user ID
   * @param active - Whether user should be active
   * @returns Whether the update was successful
   */
  public setUserStatus(id: number, active: boolean): boolean {
    const user = this.getUserById(id);
    if (!user) {
      return false;
    }

    user.active = active;
    return true;
  }
}
