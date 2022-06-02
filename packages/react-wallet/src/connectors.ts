import type { Web3ReactStore } from '@web3-react/types';

import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { Connector } from '@web3-react/types';
import { WalletConnect } from '@web3-react/walletconnect';

export function createMetaMaskConnector(allowedChainIds: number[]) {
  return initializeConnector<MetaMask>((actions) => new MetaMask(actions, true), allowedChainIds);
}

export function createWalletConnectConnector(
  allowedChainIds: number[],
  rpcs: Record<number, string | string[]>
) {
  console.log(rpcs);

  return initializeConnector<WalletConnect>(
    (actions) =>
      new WalletConnect(
        actions,
        {
          rpc: rpcs,
          qrcode: true
        },
        true
      ),
    allowedChainIds
  );
}

export function createConnectors(
  allowedChainIds: number[],
  rpcs: Record<number, string | string[]>
): [Connector, Web3ReactHooks, Web3ReactStore][] {
  return [
    createMetaMaskConnector(allowedChainIds),
    createWalletConnectConnector(allowedChainIds, rpcs)
  ];
}
