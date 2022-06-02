import type { Connector, Web3ReactStore } from '@web3-react/types';
import type { Endpoint } from './types';

import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import React, { createContext, useContext, useMemo } from 'react';

import { createConnectors } from './connectors';

interface Props {
  endpoints: Endpoint[];
}

interface State {
  connectors: [Connector, Web3ReactHooks, Web3ReactStore][];
}

const WalletContext = createContext<State>({} as State);

const WalletProvider: React.FC<React.PropsWithChildren<Props>> = ({ children, endpoints }) => {
  const allowedChainIds = useMemo(() => endpoints.map(({ chainId }) => chainId), [endpoints]);
  const rpcs = useMemo(
    () =>
      endpoints
        .map(({ chainId, rpcs }) => ({ [chainId]: rpcs }))
        .reduce((l, r) => ({ ...l, ...r })),
    [endpoints]
  );

  const connectors = useMemo(
    () => createConnectors(allowedChainIds, rpcs),
    [allowedChainIds, rpcs]
  );

  return (
    <WalletContext.Provider value={{ connectors }}>
      <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>
    </WalletContext.Provider>
  );
};

function useWallet() {
  return useWeb3React();
}

function useConnectors() {
  const { connectors } = useContext(WalletContext);

  return connectors;
}

export { WalletProvider, useWallet, useConnectors };
