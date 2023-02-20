// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';

import { AbstractWallet } from './AbstractWallet';
import { useWallet } from './WalletProvider';

export function useEagerConnect(wallet: AbstractWallet) {
  const { connect, disconnect } = useWallet();

  useEffect(() => {
    connect(wallet);

    return () => disconnect();
  }, [connect, disconnect, wallet]);
}
