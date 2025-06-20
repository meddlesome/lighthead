import { jest } from '@jest/globals';

export const createMockPage = () => ({
  goto: jest.fn(),
  content: jest.fn(),
  textContent: jest.fn(),
  addInitScript: jest.fn(),
  setExtraHTTPHeaders: jest.fn(),
  waitForTimeout: jest.fn(),
  mouse: {
    move: jest.fn(),
  },
  evaluate: jest.fn(),
  on: jest.fn(),
});

export const createMockContext = () => ({
  newPage: jest.fn(),
  cookies: jest.fn(),
  addInitScript: jest.fn(),
});

export const createMockBrowser = () => ({
  newContext: jest.fn(),
  close: jest.fn(),
});

export const createMockResponse = (overrides: any = {}) => ({
  status: jest.fn().mockReturnValue(200),
  statusText: jest.fn().mockReturnValue('OK'),
  headers: jest.fn().mockReturnValue({ 'content-type': 'text/html' }),
  url: jest.fn().mockReturnValue('https://example.com'),
  body: jest.fn().mockResolvedValue('mock content'),
  ...overrides,
});