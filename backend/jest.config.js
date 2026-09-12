export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  testTimeout: 30000,
  setupFiles: ['<rootDir>/tests/setup-env.js'],
};
