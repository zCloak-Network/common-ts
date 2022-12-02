// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { JsonRpcProvider } from '@ethersproject/providers';

import { Web3Query } from './Web3Query';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('multicall', (): void => {
  let provider: JsonRpcProvider;
  let web3Query: Web3Query;

  beforeEach(() => {
    jest.setTimeout(30000);
    process.env.NODE_ENV = 'test';

    provider = new JsonRpcProvider('https://rpc.api.moonbase.moonbeam.network');
    web3Query = new Web3Query(provider);
  });

  afterEach(() => {
    web3Query.destroy();
  });

  // it('getCurrentBlockTimestamp', async () => {
  //   const result = await web3Query.all([await web3Query.getCurrentBlockTimestamp()]);

  //   console.log(result);
  // });

  it('getCurrentBlockTimestamp with listen', async () => {
    let results;
    const unsub = await web3Query.all([await web3Query.getCurrentBlockTimestamp()], (r) => {
      results = r;
    });

    await sleep(3000);

    console.log(results);

    unsub();
  });
});
