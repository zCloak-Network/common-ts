// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddEthereumChainParameter } from './switchNetwork';

import { JsonRpcProvider } from '@ethersproject/providers';

import { Events } from './Events';

export abstract class AbstractWallet extends Events {
  #accountChange = (accounts?: string[]) => {
    this.accounts = accounts;
  };

  #chainIdChange = (chainId?: string | number) => {
    if (typeof chainId === 'string') {
      this.chainId = Number(chainId);
    } else {
      this.chainId = chainId;
    }
  };

  constructor() {
    super();
    this.on('account_change', this.#accountChange);
    this.on('chain_change', this.#chainIdChange);
  }

  public chainId?: number;
  public provider?: JsonRpcProvider;
  public accounts?: string[];

  public abstract connect(): Promise<void>;

  public abstract disconnect(): Promise<void>;

  public abstract switchNetwork(
    chainId: number,
    params?: AddEthereumChainParameter
  ): Promise<boolean>;
}
