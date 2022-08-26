import React from 'react';
import { createRoot } from 'react-dom/client';

import { WalletProvider } from '@zcloak/react-wallet/WalletProvider';
import { BrowserStore } from '@zcloak/ui-store';

import Root from './Root';

const rootId = 'root';
const rootElement = document.getElementById(rootId);

if (!rootElement) {
  throw new Error(`Unable to find element with id '${rootId}'`);
}

const root = createRoot(rootElement);

const browserStore = new BrowserStore();

browserStore.all(console.log);
export const endpoints = [
  {
    chainId: 1287,
    name: 'Moonbase Alpha',
    rpc: 'https://rpc.api.moonbase.moonbeam.network',
    rpcs: ['https://rpc.api.moonbase.moonbeam.network'],
    currencySymbol: 'DEV',
    decimals: 18,
    explorer: 'https://moonbase.moonscan.io'
  }
];

root.render(
  <WalletProvider supportedChainId={endpoints.map(({ chainId }) => chainId)}>
    <Root />
  </WalletProvider>
);
