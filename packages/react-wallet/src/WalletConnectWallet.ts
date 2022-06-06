import type { IWCEthRpcConnectionOptions } from '@walletconnect/types';
import type { AddEthereumChainParameter } from './switchNetwork';

import { Web3Provider } from '@ethersproject/providers';
import WalletConnectProvider from '@walletconnect/ethereum-provider';

import { AbstractWallet } from './AbstractWallet';
import { switchNetwork } from './switchNetwork';

type WalletConnectOptions = Omit<IWCEthRpcConnectionOptions, 'rpc' | 'infuraId' | 'chainId'> & {
  rpc: { [chainId: number]: string };
};

export class WalletConnectWallet extends AbstractWallet {
  #walletConnectProvider?: WalletConnectProvider;
  #options: WalletConnectOptions;

  private handleDisconnect = () => {
    this.emit('account_change', undefined);
    this.emit('chain_change', undefined);
    this.provider = undefined;
  };

  private handleAccounts = (accounts: string[]) => this.emit('account_change', accounts);
  private handleChain = (chainId: string) => {
    if (this.#walletConnectProvider) {
      this.provider = new Web3Provider(this.#walletConnectProvider);
    }

    this.emit('chain_change', chainId);
  };

  constructor(options: WalletConnectOptions) {
    super();
    this.#options = options;
  }

  public async connect(): Promise<void> {
    this.#walletConnectProvider = new WalletConnectProvider(this.#options);
    this.#walletConnectProvider.on('disconnect', this.handleDisconnect);
    this.#walletConnectProvider.on('chainChanged', this.handleChain);
    this.#walletConnectProvider.on('accountsChanged', this.handleAccounts);

    this.provider = new Web3Provider(this.#walletConnectProvider);

    const [accounts, chainId] = await Promise.all([
      this.#walletConnectProvider.request<string[]>({ method: 'eth_requestAccounts' }),
      this.#walletConnectProvider.request<string>({ method: 'eth_chainId' })
    ]);

    this.emit('account_change', accounts);
    this.emit('chain_change', chainId);
  }

  public async disconnect(): Promise<void> {
    this.emit('account_change', undefined);
    this.emit('chain_change', undefined);
    this.provider = undefined;

    if (this.#walletConnectProvider) {
      this.#walletConnectProvider.removeListener('disconnect', this.handleDisconnect);
      this.#walletConnectProvider.removeListener('chainChanged', this.handleChain);
      this.#walletConnectProvider.removeListener('accountsChanged', this.handleAccounts);
      await this.#walletConnectProvider.disconnect();
    }
  }

  public switchNetwork(chainId: number, params?: AddEthereumChainParameter): Promise<boolean> {
    return switchNetwork(this.#walletConnectProvider, chainId, params);
  }
}
