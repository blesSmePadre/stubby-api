/* eslint-disable @typescript-eslint/no-var-requires */

const tsconfig = require('../tsconfig.json');
const { pathsToModuleNameMapper } = require('ts-jest/utils');

require('dotenv').config({ path: '.env.test' });

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  verbose: true,
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
      prefix: '<rootDir>/../',
    }),
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
