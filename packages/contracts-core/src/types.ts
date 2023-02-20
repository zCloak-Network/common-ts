// Copyright 2021-2023 zcloak authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BigNumberish } from '@ethersproject/bignumber';
import type { BytesLike } from '@ethersproject/bytes';

export interface RequestDetails {
  cType: BytesLike;
  fieldNames: BigNumberish[];
  programHash: BytesLike;
  attester: BytesLike;
}
