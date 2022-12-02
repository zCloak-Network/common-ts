// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { JsonRpcProvider } from '@ethersproject/providers';

import { getAddress } from '@ethersproject/address';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { AbstractWallet } from './AbstractWallet';
import { UnsupportedChainIdError } from './errors';
import { useDebounce } from './useDebounce';

export interface WalletData<T = JsonRpcProvider> {
  account?: string;
  chainId?: number;
  provider?: T;
}

export interface WalletState<T = JsonRpcProvider> extends WalletData<T> {
  error?: Error;
  wallet?: AbstractWallet;
  active: boolean;
  connect: (_wallet: AbstractWallet) => void;
  disconnect: () => void;
}

interface Props {
  supportedChainId?: number[];
}

const WalletContext = createContext<WalletState>({} as WalletState);

export const WalletProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  supportedChainId
}) => {
  const [state, setState] = useState<WalletData>({});

  const wallet = useRef<AbstractWallet>();

  const handleWalletData = useCallback(() => {
    const _wallet = wallet.current;

    if (!_wallet) return;

    setState((state) => ({
      ...state,
      account:
        _wallet.accounts && _wallet.accounts.length > 0
          ? getAddress(_wallet.accounts[0])
          : undefined,
      chainId: _wallet.chainId,
      provider: _wallet.provider
    }));
  }, []);

  const connect = useCallback(
    (_wallet: AbstractWallet) => {
      _wallet.on('account_change', handleWalletData);
      _wallet.on('chain_change', handleWalletData);
      wallet.current = _wallet;

      return _wallet.connect();
    },
    [handleWalletData]
  );

  const disconnect = useCallback(async () => {
    if (wallet.current) {
      await wallet.current.disconnect();
      wallet.current.off('account_change', handleWalletData);
      wallet.current.off('chain_change', handleWalletData);
    }
  }, [handleWalletData]);

  const error = useMemo(
    () =>
      supportedChainId && state.chainId && !supportedChainId.includes(state.chainId)
        ? new UnsupportedChainIdError(state.chainId)
        : undefined,
    [state.chainId, supportedChainId]
  );

  const value = useDebounce(
    useMemo(
      (): WalletState => ({
        ...(error ? {} : state),
        error,
        active: !error && !!state.account,
        wallet: wallet.current,
        connect,
        disconnect
      }),
      [connect, state, disconnect, error]
    ),
    100
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export function useWallet(): WalletState {
  return useContext(WalletContext);
}
