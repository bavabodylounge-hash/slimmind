/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.spec.ts', '**/tests/unit/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        module: 'CommonJS',
        moduleResolution: 'node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        types: ['node', '@types/jest'],
      },
    }],
  },
  moduleNameMapper: {
    // .js 확장자를 TypeScript 파일로 매핑 (ESM import 해결)
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: [],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/schemas/**/*.ts',
    'src/services/**/*.ts',
    'src/utils/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  verbose: true,
};
