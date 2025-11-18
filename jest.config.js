/* eslint-disable */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  preset: 'ts-jest',
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
      testEnvironment: 'node',
      moduleNameMapper: {
        // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
  ],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/tests/e2e'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!app/**/layout.tsx',
    '!app/**/page.tsx',
    '!app/**/loading.tsx',
    '!app/**/error.tsx',
    '!**/*.d.ts',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
