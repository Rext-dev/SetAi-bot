/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/bot'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.jest.json' }
    ],
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 70,
      statements: 70,
      functions: 70,
      branches: 50,
    },
  },
  collectCoverageFrom: ['bot/src/**/*.ts', '!bot/src/**/*.d.ts'],
  coverageDirectory: 'coverage',
};
