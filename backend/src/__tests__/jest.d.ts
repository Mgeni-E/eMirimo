/// <reference types="jest" />
/// <reference types="node" />
/// <reference types="supertest" />

declare global {
  const jest: typeof import('jest');
  const describe: typeof jest.describe;
  const it: typeof jest.it;
  const expect: typeof jest.expect;
  const beforeAll: typeof jest.beforeAll;
  const afterAll: typeof jest.afterAll;
  const beforeEach: typeof jest.beforeEach;
  const afterEach: typeof jest.afterEach;
}

export {};

