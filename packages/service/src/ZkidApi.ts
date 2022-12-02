// Copyright 2021-2022 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Activity, Config, MintPoap, Proof, ProofProcess, ServerResponse } from './types';

import { combineConfig, Request } from './request';

function combineChainId(params: Record<string, any>, chainId: number) {
  return {
    ...params,
    chainId
  };
}

export class ZkidApi extends Request {
  public chainId: number;

  constructor(endpoint: string, config: Config = {}, chainId: number) {
    super(
      endpoint,
      combineConfig(config, {
        mode: 'cors'
      })
    );
    this.chainId = chainId;
  }

  getMintPoap(params: { who: string }) {
    return this.get<ServerResponse<MintPoap | null>>('/mint-poap', {
      params: combineChainId(params, this.chainId)
    });
  }

  proofProcess(params: { dataOwner: string; requestHash: string }) {
    return this.get<ServerResponse<ProofProcess>>('/proof/process', {
      params: combineChainId(params, this.chainId)
    });
  }

  userProof(params: { dataOwner: string }) {
    return this.get<ServerResponse<Proof[]>>('/user/proof', {
      params: combineChainId(params, this.chainId)
    });
  }

  userActivities(params: { dataOwner: string }) {
    return this.get<ServerResponse<Activity[]>>('/user/activies', {
      params: combineChainId(params, this.chainId)
    });
  }

  rootHashUser(rootHash: string) {
    return this.get<ServerResponse<{ address: string | null }>>(`/credential/${rootHash}/user`, {
      params: combineChainId({}, this.chainId)
    });
  }
}
