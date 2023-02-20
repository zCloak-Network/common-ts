// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddEthereumChainParameter } from './switchNetwork';

import { Web3Provider } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';

import { AbstractWallet } from './AbstractWallet';
import { switchNetwork } from './switchNetwork';

interface Ethereum {
  isMetaMask?: true;
  request: (...args: any[]) => Promise<any>;
  on: (...args: any[]) => void;
  removeListener: (...args: any[]) => void;
  autoRefreshOnNetworkChange?: boolean;
  chainId: string;
}

export class MetaMaskWallet extends AbstractWallet {
  #ethereum?: Ethereum;

  private handleConnect = async () => {
    if (!this.#ethereum) return;

    const [accounts, chainId] = await Promise.all([
      this.#ethereum.request({ method: 'eth_requestAccounts' }) as Promise<string[]>,
      this.#ethereum.request({ method: 'eth_chainId' }) as Promise<string>
    ]);

    this.emit('account_change', accounts);
    this.emit('chain_change', chainId);
    this.provider = new Web3Provider(this.#ethereum);
  };

  private handleDisconnect = () => {
    this.emit('account_change', undefined);
    this.emit('chain_change', undefined);
    this.provider = undefined;
  };

  private handleAccounts = (accounts: string[]) => this.emit('account_change', accounts);
  private handleChain = (chainId: string) => {
    if (this.#ethereum) {
      this.provider = new Web3Provider(this.#ethereum);
    }

    this.emit('chain_change', chainId);
  };

  public connect(): Promise<void> {
    return detectEthereumProvider().then(async (ethereum: any) => {
      this.#ethereum = ethereum as Ethereum | undefined;

      if (this.#ethereum) {
        await this.handleConnect();
        this.#ethereum.on('connect', this.handleConnect);
        this.#ethereum.on('disconnect', () => this.handleDisconnect);
        this.#ethereum.on('chainChanged', this.handleChain);
        this.#ethereum.on('accountsChanged', this.handleAccounts);

        if (ethereum.isMetaMask) {
          ethereum.autoRefreshOnNetworkChange = false;
        }
      }
    });
  }

  public disconnect(): Promise<void> {
    this.emit('account_change', undefined);
    this.emit('chain_change', undefined);
    this.provider = undefined;

    if (this.#ethereum) {
      this.#ethereum.removeListener('connect', this.handleConnect);
      this.#ethereum.removeListener('disconnect', this.handleDisconnect);
      this.#ethereum.removeListener('chainChanged', this.handleChain);
      this.#ethereum.removeListener('accountsChanged', this.handleAccounts);
    }

    return Promise.resolve();
  }

  public switchNetwork(chainId: number, params?: AddEthereumChainParameter): Promise<boolean> {
    return switchNetwork(this.#ethereum, chainId, params);
  }
}
