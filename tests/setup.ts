import { jest } from '@jest/globals';

// Mock playwright-core
jest.mock('playwright-core', () => ({
  chromium: {
    launch: jest.fn(),
  },
}));

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});