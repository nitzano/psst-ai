// Test file demonstrating Jest patterns
import { add, multiply, divide } from '../calculator';

describe('Calculator', () => {
  describe('add function', () => {
    test('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    test('should add negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
    });

    test('should handle zero', () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('multiply function', () => {
    test('should multiply two numbers', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    test('should handle zero multiplication', () => {
      expect(multiply(5, 0)).toBe(0);
    });
  });

  describe('divide function', () => {
    test('should divide two numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    test('should throw error on division by zero', () => {
      expect(() => divide(5, 0)).toThrow('Division by zero');
    });

    test('should handle negative division', () => {
      expect(divide(-10, 2)).toBe(-5);
    });
  });

  describe('async operations with timers', () => {
    test('should handle delayed operations', async () => {
      jest.useFakeTimers();
      
      const mockCallback = jest.fn();
      setTimeout(mockCallback, 1000);
      
      jest.advanceTimersByTime(1000);
      
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      jest.useRealTimers();
    });
  });
});
