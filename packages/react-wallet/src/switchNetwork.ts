// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface AddEthereumChainParameter {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

export async function switchNetwork(
  externalProvider: any,
  chainId: number,
  params?: AddEthereumChainParameter
): Promise<boolean> {
  try {
    await externalProvider.request?.({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }]
    });

    return true;
  } catch (error: any) {
    if (params) {
      await addNetwork(externalProvider, params);

      return true;
    } else {
      return false;
    }
  }
}

export async function addNetwork(
  externalProvider: any,
  params: AddEthereumChainParameter
): Promise<void> {
  await externalProvider?.request?.({
    method: 'wallet_addEthereumChain',
    params: [
      {
        ...params,
        chainId: `0x${params.chainId.toString(16)}`
      }
    ]
  });
}
