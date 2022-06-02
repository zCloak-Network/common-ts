import React from 'react';
import { createRoot } from 'react-dom/client';

import { WalletProvider } from '@zcloak/react-wallet';
import { Endpoint } from '@zcloak/react-wallet/types';

import Root from './Root';

const rootId = 'root';
const rootElement = document.getElementById(rootId);

if (!rootElement) {
  throw new Error(`Unable to find element with id '${rootId}'`);
}

const root = createRoot(rootElement);

export const endpoints: Endpoint[] = [
  {
    chainId: 1287,
    name: 'Moonbase Alpha',
    rpc: 'https://rpc.api.moonbase.moonbeam.network',
    rpcs: ['https://rpc.api.moonbase.moonbeam.network'],
    currencySymbol: 'GLMR',
    decimals: 18,
    explorer: 'https://moonbase.moonscan.io'
  }
];

root.render(
  <WalletProvider endpoints={endpoints}>
    <Root />
  </WalletProvider>
);
