// Test setup file for Jest configuration
import '@testing-library/jest-dom';

// Global test configuration
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

// Mock global functions if needed
global.fetch = jest.fn();
