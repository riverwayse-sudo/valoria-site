// Jest-only configuration. Deliberately NOT a babel.config.js at the repo
// root: Next.js reads that file and would then skip SWC for the real build.
// Keeping the Babel options inline here means the app build is untouched.
//
// The transform exists so a test can import an app-route handler directly
// (src/app/api/**/route.js are ES modules that also use the '@/' alias).
// Tests that require() the CommonJS lib modules are unaffected.
module.exports = {
  // Covers src/__tests__/* and src/lib/journey-state.test.js (the pre-existing
  // layout), so no existing suite is dropped.
  testMatch: ['<rootDir>/src/**/*.test.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(js|jsx|mjs)$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        babelrc: false,
        configFile: false,
      },
    ],
  },
}
