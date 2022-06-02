import type { AddEthereumChainParameter, Connector } from '@web3-react/types';

import { useCallback } from 'react';

export function useConnectCallback(connector: Connector) {
  return useCallback(
    (desiredChainIdOrChainParameters: number | AddEthereumChainParameter) => {
      return connector.activate(desiredChainIdOrChainParameters);
    },
    [connector]
  );
}
