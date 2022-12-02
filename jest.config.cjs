// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

const config = require('@zcloak/dev/config/jest.cjs');

module.exports = Object.assign({}, config, {
  moduleNameMapper: {
    '@zcloak/contracts-core(.*)$': '<rootDir>/packages/contracts-core/src/$1',
    '@zcloak/credential-core(.*)$': '<rootDir>/packages/credential-core/src/$1',
    '@zcloak/did-keyring(.*)$': '<rootDir>/packages/did-keyring/src/$1',
    '@zcloak/extension-core(.*)$': '<rootDir>/packages/extension-core/src/$1',
    '@zcloak/react-wallet(.*)$': '<rootDir>/packages/react-wallet/src/$1',
    '@zcloak/service(.*)$': '<rootDir>/packages/service/src/$1',
    '@zcloak/ui-did-keyring(.*)$': '<rootDir>/packages/ui-did-keyring/src/$1',
    '@zcloak/ui-store(.*)$': '<rootDir>/packages/ui-store/src/$1',
    '@zcloak/web3-query(.*)$': '<rootDir>/packages/web3-query/src/$1'
  },
  testTimeout: 30000
});
