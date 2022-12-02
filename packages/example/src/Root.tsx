// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';

import { useEagerConnect } from '@zcloak/react-wallet';
import { MetaMaskWallet } from '@zcloak/react-wallet/MetaMaskWallet';
// import { WalletConnectWallet } from '@zcloak/react-wallet/WalletConnectWallet';
import { useWallet } from '@zcloak/react-wallet/WalletProvider';

import { endpoints } from '.';

const metaMaskWallet = new MetaMaskWallet();
// const walletConnectWallet = new WalletConnectWallet({
//   rpc: { 1287: 'https://rpc.api.moonbase.moonbeam.network' }
// });

const Root: React.FC = () => {
  const { account, chainId, connect, disconnect, error, provider, wallet } = useWallet();
  const [balance, setBalance] = useState<string>();

  useEffect(() => {
    if (account) {
      provider?.getBalance(account).then((balance) => setBalance(balance.toString()));
    }
  }, [account, provider]);

  useEffect(() => {
    console.log(account, chainId, provider, error);
  }, [account, chainId, error, provider]);

  useEagerConnect(metaMaskWallet);

  return (
    <>
      <p>account: {account}</p>
      <p>chainId: {chainId}</p>
      <p>balance: {balance}</p>
      <p>error: {error?.message}</p>
      <button
        onClick={() => {
          connect(metaMaskWallet);
        }}
      >
        connect
      </button>
      <button onClick={disconnect}>disconnect</button>
      <button
        onClick={() => {
          wallet?.switchNetwork(endpoints[0].chainId, {
            chainId: endpoints[0].chainId,
            chainName: endpoints[0].name,
            nativeCurrency: {
              name: endpoints[0].currencySymbol,
              symbol: endpoints[0].currencySymbol,
              decimals: endpoints[0].decimals
            },
            rpcUrls: endpoints[0].rpcs,
            blockExplorerUrls: [endpoints[0].explorer]
          });
        }}
      >
        switch
      </button>
    </>
  );
};

export default Root;
