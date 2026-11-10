module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest/styleMock.js',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
