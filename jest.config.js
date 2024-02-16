module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/protocols/**',
    '!<rootDir>/src/**/*protocols.ts',
    '!<rootDir>/src/app/server/index.ts',
    '!<rootDir>/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  transform: {
    '.+\\.ts$': 'ts-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js']
};