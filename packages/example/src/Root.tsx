import type { Connector } from '@web3-react/types';

import { useWeb3React } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import React, { useEffect } from 'react';

import { useConnectCallback, useConnectors } from '@zcloak/react-wallet';

import { endpoints } from '.';

const Button: React.FC<{ connector: Connector }> = ({ connector }) => {
  const connect = useConnectCallback(connector);

  return (
    <button
      onClick={() => {
        connect(
          connector instanceof WalletConnect
            ? endpoints[0].chainId
            : {
                chainId: endpoints[0].chainId,
                chainName: endpoints[0].name,
                nativeCurrency: {
                  name: endpoints[0].currencySymbol,
                  symbol: endpoints[0].currencySymbol,
                  decimals: endpoints[0].decimals
                },
                rpcUrls: endpoints[0].rpcs,
                blockExplorerUrls: [endpoints[0].explorer]
              }
        );
      }}
    >
      {connector instanceof MetaMask
        ? 'MetaMask'
        : connector instanceof WalletConnect
        ? 'Wallet Connect'
        : 'unknown'}
    </button>
  );
};

const Root: React.FC = () => {
  const connectors = useConnectors();
  const { account, accounts, chainId, error, provider } = useWeb3React();

  console.log(provider);
  console.log('error', error);

  useEffect(() => {
    if (account && provider) {
      provider.getBalance(account).then(console.log);
    }
  }, [account, provider]);

  return (
    <>
      <p>chainId: {chainId}</p>
      <p>account: {account}</p>
      <p>accounts: {accounts}</p>
      <p>error: {error?.message}</p>
      {connectors.map(([connector], index) => (
        <Button connector={connector} key={index} />
      ))}
    </>
  );
};

export default Root;
