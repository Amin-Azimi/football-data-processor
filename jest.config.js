module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/cdk','<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
