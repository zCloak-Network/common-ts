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
