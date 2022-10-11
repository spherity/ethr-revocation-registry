module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageReporters:
    process.env.CI === 'true'
      ? ['text-summary', 'cobertura']
      : ['lcov'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],
  coverageDirectory: 'coverage',
  transformIgnorePatterns: []
};
