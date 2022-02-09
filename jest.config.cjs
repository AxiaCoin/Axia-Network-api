// Copyright 2017-2021 @axia-js/api authors & contributors
// SPDX-License-Identifier: Apache-2.0

const config = require('@axia-js/dev/config/jest.cjs');

module.exports = {
  ...config,
  moduleNameMapper: {
    '@axia-js/api-(contract|derive)(.*)$': '<rootDir>/packages/api-$1/src/$2',
    // eslint-disable-next-line sort-keys
    '@axia-js/api(.*)$': '<rootDir>/packages/api/src/$1',
    '@axia-js/metadata(.*)$': '<rootDir>/packages/metadata/src/$1',
    '@axia-js/rpc-(core|provider)(.*)$': '<rootDir>/packages/rpc-$1/src/$2',
    '@axia-js/typegen(.*)$': '<rootDir>/packages/typegen/src/$1',
    '@axia-js/types-(known|support)(.*)$': '<rootDir>/packages/types-$1/src/$2',
    // eslint-disable-next-line sort-keys
    '@axia-js/types(.*)$': '<rootDir>/packages/types/src/$1'
  },
  testTimeout: 30000
};
