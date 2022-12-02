// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamType } from '@ethersproject/abi';

export interface ContractCall {
  contract: {
    address: string;
  };
  name: string;
  inputs: ParamType[];
  outputs: ParamType[];
  params: any[];
}
